from fastapi import FastAPI
from app.database import engine, Base
from app.routers import users, auth,chat,train_chatbot
from fastapi.middleware.cors import CORSMiddleware

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI()
# Define the origins that should be allowed to make requests to the backend
origins = [
    "http://localhost:5173",  # React frontend
    # Add other origins if necessary, e.g., production domains
    # "https://yourdomain.com",
]

# Add CORS middleware to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specified origins
    allow_credentials=True,  # Allow cookies and other credentials
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(chat.router)
app.include_router(train_chatbot.router)
