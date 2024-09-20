# app/routers/chat.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.user import User

from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer, BartTokenizer

from sentence_transformers import SentenceTransformer
import faiss
import os
import pickle
import torch

import PyPDF2
import tempfile

import nltk
nltk.download('punkt')
from nltk.tokenize import sent_tokenize

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)
qa_pipeline = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

# Initialize embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize summarizer and its tokenizer
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
summarizer_tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')

def trim_to_last_full_stop(answer):
    # Find the last full stop
    last_full_stop_index = answer.rfind('.')
    
    # If there is a full stop, return the string up to that point (including the full stop)
    if last_full_stop_index != -1:
        return answer[:last_full_stop_index + 1]
    
    # If no full stop is found, return the original answer
    return answer

def summarize_text(text, max_length=130, min_length=30):
    """
    Summarizes the input text using the BART model, handling long texts by token-based chunking.
    """
    # Define the maximum number of tokens per chunk for BART
    # BART's max input tokens are 1024
    max_input_tokens = 1024
    # Leave some buffer for the summarizer's output
    buffer_tokens = 50
    chunk_size = max_input_tokens - buffer_tokens

    # Tokenize the entire text using the summarizer's tokenizer
    inputs = summarizer_tokenizer(text, return_tensors='pt', truncation=False)
    input_ids = inputs['input_ids'][0]
    total_tokens = input_ids.size(0)

    # Split the input_ids into manageable chunks
    chunks = []
    for i in range(0, total_tokens, chunk_size):
        chunk_ids = input_ids[i:i + chunk_size]
        chunk_text = summarizer_tokenizer.decode(chunk_ids, skip_special_tokens=True, clean_up_tokenization_spaces=True)
        chunks.append(chunk_text)

    summaries = []
    for idx, chunk in enumerate(chunks):
        try:
            # Skip empty chunks
            if not chunk.strip():
                print(f"Skipping empty chunk {idx}")
                continue

            # Log chunk length for debugging
            print(f"Processing chunk {idx}, token count: {len(summarizer_tokenizer(chunk)['input_ids'])}")

            # Ensure chunk is not too small
            if len(summarizer_tokenizer(chunk)['input_ids']) < min_length:
                print(f"Skipping chunk {idx} as it is too short for summarization.")
                continue

            # Summarize the chunk
            summary = summarizer(chunk, max_length=max_length, min_length=min_length, do_sample=False)

            if summary and len(summary) > 0:
                summaries.append(summary[0]['summary_text'])
            else:
                print(f"No summary returned for chunk {idx}")
        except Exception as e:
            print(f"Error summarizing chunk {idx}: {e}")
            raise HTTPException(status_code=500, detail=f"Summarization failed for chunk {idx}: {str(e)}")

    # Combine all summaries into one
    combined_summary = ' '.join(summaries)
    return combined_summary

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a PDF file.
    """
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

# Initialize the vector store
VECTOR_STORE_DIR = "vector_stores"
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)
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

# Initialize the LLM with GPT-2 Medium
LLM_MODEL_NAME = "distilgpt2"

tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(LLM_MODEL_NAME)

# Ensure the pad_token is set
tokenizer.pad_token = tokenizer.eos_token
model.config.pad_token_id = tokenizer.pad_token_id
model.config.eos_token_id = tokenizer.eos_token_id

# Move model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# def generate_answer(prompt, max_new_tokens=150):
#     print(f"Prompt: {prompt}")
    
#     # Encode inputs with truncation
#     inputs = tokenizer.encode(
#         prompt,
#         return_tensors="pt",
#         truncation=True,
#         max_length=model.config.max_position_embeddings - max_new_tokens
#     ).to(device)
    
#     # Calculate total maximum length
#     total_max_length = inputs.shape[1] + max_new_tokens
    
#     # Check input shape
#     print(f"Input shape: {inputs.shape}")
    
#     # Generate output using sampling
#     outputs = model.generate(
#         inputs,
#         max_length=total_max_length,
#         temperature=0.7,
#         top_p=0.9,
#         do_sample=True,
#         num_return_sequences=1,
#         pad_token_id=tokenizer.pad_token_id,
#         eos_token_id=tokenizer.eos_token_id,
#         early_stopping=True,
#         repetition_penalty=1.1,
#         no_repeat_ngram_size=3
#     )
    
#     # Check output shape
#     print(f"Generated output shape: {outputs.shape}")
    
#     # Decode generated tokens (only the new tokens)
#     generated_tokens = outputs[0][inputs.shape[1]:]
#     answer = tokenizer.decode(generated_tokens, skip_special_tokens=True)
    
#     # Check the length of the answer
#     print(f"Generated Answer: {answer}")
#     print(f"Length of Generated Answer: {len(answer)}")
    
#     return answer.strip()

def generate_answer(question, context):
    print(f"Question: {question}")
    print(f"Context: {context}")
    try:
        result = qa_pipeline(question=question, context=context)
        answer = result['answer']
        print(f"Generated Answer: {answer}")
        return answer
    except Exception as e:
        print(f"Error generating answer: {e}")
        raise e


def split_text_into_chunks(text, max_length=500):
    # Simple splitting by sentences
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_length:
            current_chunk += " " + sentence
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

@router.post("/upload", response_model=ChatResponse)
def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a PDF file, extract text, summarize it, and update the vector store.
    """
    print("Inside upload of backend")

    # Validate file type (PDF only for now)
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Save the uploaded file to a permanent location
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        print("Inside upload of backend 2")

        with open(file_location, "wb") as f:
            f.write(file.file.read())
        print("Inside upload of backend 3")

        # Extract text from the PDF
        extracted_text = extract_text_from_pdf(file_location)
        
        if not extracted_text:
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF.")

        # Summarize the extracted text
        summary = summarize_text(extracted_text)
        print("Printing Summary")
        print(summary)

        # Split text into chunks
        text_chunks = split_text_into_chunks(extracted_text)
        print(f"Number of chunks created: {len(text_chunks)}")

        # Load existing vector store and chunks
        index = load_global_vector_store()
        existing_chunks = load_global_chunks()

        # Compute embeddings and update index and chunks
        for idx, chunk in enumerate(text_chunks):
            embedding = embedding_model.encode([chunk])
            index.add(embedding)
            existing_chunks.append({'text': chunk})

        # Save the updated index and chunks
        faiss.write_index(index, GLOBAL_VECTOR_STORE_PATH)
        with open(GLOBAL_CHUNKS_PATH, 'wb') as f:
            pickle.dump(existing_chunks, f)

        return ChatResponse(
            reply=f"Summary: {summary}",
        )

    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process the PDF: {str(e)}")

@router.post("/", response_model=ChatResponse)
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
    relevant_chunks = []
    for i in I[0]:
        if i < len(chunks):
            relevant_chunks.append(chunks[i]['text'])
        else:
            print(f"Skipping invalid index {i}, which is out of range.")

    if not relevant_chunks:
        raise HTTPException(status_code=400, detail="No relevant information found.")

    # Concatenate relevant chunks
    context = "\n\n".join(relevant_chunks)

    # Generate the answer using the QA pipeline
    try:
        answer = generate_answer(request.message, context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate answer: {str(e)}")

    return ChatResponse(reply=answer)

# def chat(
#     request: ChatRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     index = load_global_vector_store()
#     chunks = load_global_chunks()

#     if index.ntotal == 0 or not chunks:
#         raise HTTPException(status_code=400, detail="Chatbot is not trained yet. Please upload a PDF to train.")

#     # Embed the user's question
#     question_embedding = embedding_model.encode([request.message])

#     # Search for top 5 relevant chunks
#     k = 5
#     D, I = index.search(question_embedding, k)

#     # Get the top k chunks
#     relevant_chunks = []
#     for i in I[0]:
#         if i < len(chunks):
#             relevant_chunks.append(chunks[i]['text'])
#         else:
#             print(f"Skipping invalid index {i}, which is out of range.")

#     if not relevant_chunks:
#         raise HTTPException(status_code=400, detail="No relevant information found.")

#     # Create a context by concatenating relevant chunks
#     context = "\n\n".join(relevant_chunks)

#     # Formulate the prompt for the LLM
#     prompt = f"Context:\n{context}\n\nQuestion: {request.message}\nAnswer:"

#     # Generate the answer using the LLM
#     try:
#         answer = generate_answer(prompt)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to generate answer: {str(e)}")

#     return ChatResponse(reply=answer)

