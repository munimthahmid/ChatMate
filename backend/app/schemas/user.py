from pydantic import BaseModel, EmailStr
from typing import Optional
class UserBase(BaseModel):
    username: str
    email: EmailStr
    team_id:int
    team_name: Optional[str]  # Add this field

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class Login(BaseModel):
    username:str
    password:str