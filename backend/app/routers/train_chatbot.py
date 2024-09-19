# app/routers/train_chatbot.py

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.schemas.train_chatbot import TrainResponse
from app.schemas.user import User

from sentence_transformers import SentenceTransformer
import faiss
import os
import uuid
from pdfminer.high_level import extract_text
from langchain.text_splitter import CharacterTextSplitter
import pickle

router = APIRouter(
    prefix="/train-chatbot",
    tags=["Train Chatbot"],
)

# Initialize the embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Define the directory to store vector stores and chunks
VECTOR_STORE_DIR = "vector_stores"
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

# Define global vector store paths
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

def save_global_vector_store(index):
    faiss.write_index(index, GLOBAL_VECTOR_STORE_PATH)

def save_global_chunks(chunks):
    with open(GLOBAL_CHUNKS_PATH, 'wb') as f:
        pickle.dump(chunks, f)

@router.post("/", response_model=TrainResponse)
async def train_chatbot(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # Read PDF content
    try:
        pdf_bytes = await file.read()
        # Save the uploaded PDF temporarily
        temp_pdf_path = f"temp_{uuid.uuid4()}.pdf"
        with open(temp_pdf_path, 'wb') as temp_pdf:
            temp_pdf.write(pdf_bytes)
        text = extract_text(temp_pdf_path)
        os.remove(temp_pdf_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

    # Split text into chunks
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_text(text)

    if not chunks:
        raise HTTPException(status_code=400, detail="No text extracted from PDF.")

    # Load global vector store and chunks
    index = load_global_vector_store()
    global_chunks = load_global_chunks()

    # For metadata, get the filename
    pdf_filename = file.filename

    # Embed the chunks
    try:
        embeddings = embedding_model.encode(chunks, show_progress_bar=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to embed text: {str(e)}")

    # Add embeddings to index
    index.add(embeddings)

    # Append chunks with metadata
    for chunk in chunks:
        global_chunks.append({
            'text': chunk,
            'source': pdf_filename
        })

    # Save updated index and chunks
    save_global_vector_store(index)
    save_global_chunks(global_chunks)

    return TrainResponse(detail="File uploaded and chatbot trained successfully!")
