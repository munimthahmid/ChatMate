# app/routers/chat.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_db
from sqlalchemy.orm import Session
from app.schemas.chat import ChatRequest, ChatResponse
from app.dependencies import get_db, get_current_user
from app.schemas.user import User

from app import crud

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Implement your chatbot logic here
    # For demonstration, echo the user's message
    user_message = request.message
    bot_reply = f"You said: {user_message}"
    return ChatResponse(reply=bot_reply)
