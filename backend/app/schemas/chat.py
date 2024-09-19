from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ChatRequest(BaseModel):
    message: str = Field(..., example="Hello, how are you?")
    user_id: Optional[int] = Field(None, example=1)


class ChatResponse(BaseModel):
    reply: str = Field(..., example="I'm doing well, thank you!")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_id: Optional[int] = Field(None, example=101)
