from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from app.crud.user import authenticate_user
from app.dependencies import get_db
from app.schemas.user import Token
from fastapi.security import OAuth2PasswordRequestForm
from .. import models
from ..core.security import verify_password
from typing import Annotated

router = APIRouter(
    tags=["Authentication"],
)



@router.post("/login")
def login(request:Annotated[OAuth2PasswordRequestForm, Depends()],db:Session=Depends(get_db)):
    user=db.query(models.user.User).filter(models.user.User.username==request.username).first()
    print(user)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Invalid Credentials")
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"Incorrect Password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")
