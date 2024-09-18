from fastapi import FastAPI
from app.database import engine, Base
from app.routers import users, auth

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
