# app/routers/train_chatbot.py
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from app.dependencies import get_db
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.schemas.train_chatbot import TrainResponse
from app.schemas.user import User

router = APIRouter(
    prefix="/train-chatbot",
    tags=["Train Chatbot"],
)


@router.post("/", response_model=TrainResponse)
def train_chatbot(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # Implement your training logic here
    # For demonstration, assume training is successful
    # You would process the PDF and train your chatbot model accordingly

    return TrainResponse(detail="File uploaded and chatbot trained successfully!")
