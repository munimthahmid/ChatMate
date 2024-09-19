# app/routers/chat.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.user import User

from sentence_transformers import SentenceTransformer
import faiss
import os
import pickle
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)

# Initialize embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize the vector store
VECTOR_STORE_DIR = "vector_stores"
GLOBAL_VECTOR_STORE_PATH = os.path.join(VECTOR_STORE_DIR, "global_faiss.index")
GLOBAL_CHUNKS_PATH = os.path.join(VECTOR_STORE_DIR, "global_chunks.pkl")

def load_global_vector_store():
    if os.path.exists(GLOBAL_VECTOR_STORE_PATH):
        index = faiss.read_index(GLOBAL_VECTOR_STORE_PATH)
    else:
        embedding_dim = embedding_model.get_sentence_embedding_dimension()
        index = faiss.IndexFlatL2(embedding_dim)
    return index

def load_global_chunks():
    if os.path.exists(GLOBAL_CHUNKS_PATH):
        with open(GLOBAL_CHUNKS_PATH, 'rb') as f:
            chunks = pickle.load(f)
    else:
        chunks = []
    return chunks

# Initialize the LLM with DistilGPT-2
LLM_MODEL_NAME = "distilgpt2"

tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(LLM_MODEL_NAME)

# Move model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

def generate_answer(prompt, max_new_tokens=150):
    inputs = tokenizer.encode(prompt, return_tensors="pt").to(device)
    outputs = model.generate(
        inputs,
        max_new_tokens=max_new_tokens,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id
    )
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Remove the prompt from the answer
    answer = answer[len(prompt):].strip()
    return answer

@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    index = load_global_vector_store()
    chunks = load_global_chunks()

    if index.ntotal == 0 or not chunks:
        raise HTTPException(status_code=400, detail="Chatbot is not trained yet. Please upload a PDF to train.")

    # Embed the user's question
    question_embedding = embedding_model.encode([request.message])

    # Search for top 5 relevant chunks
    k = 5
    D, I = index.search(question_embedding, k)

    # Get the top k chunks
    relevant_chunks = [chunks[i]['text'] for i in I[0] if i < len(chunks)]

    if not relevant_chunks:
        raise HTTPException(status_code=400, detail="No relevant information found.")

    # Create a context by concatenating relevant chunks
    context = "\n\n".join(relevant_chunks)

    # Formulate the prompt for the LLM
    prompt = f"Context:\n{context}\n\nQuestion: {request.message}\nAnswer:"

    # Generate the answer using the LLM
    try:
        answer = generate_answer(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate answer: {str(e)}")

    return ChatResponse(reply=answer)
