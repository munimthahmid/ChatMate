from pydantic import BaseModel, Field


class TrainResponse(BaseModel):
    detail: str = Field(..., example="File uploaded and chatbot trained successfully!")
