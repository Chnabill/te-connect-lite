from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import des routeurs
from app.routers import (
    users,
    announcements,
    chatbot,
    task,
    dashboard,
    meetings,
    roles,
    documents,
    leave,  
    activities,
    messages,
    face_recognition
)

from app.auth.router import router as auth_router
from database import engine, Base
from app.models import user  # import all your models

# Create the database tables
user.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Middleware CORS pour autoriser les appels depuis le frontend Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Pour le développement uniquement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(announcements.router, prefix="/announcements", tags=["announcements"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
app.include_router(task.router, prefix="/tasks", tags=["tasks"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
app.include_router(roles.router, prefix="/roles", tags=["roles"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(leave.router, prefix="/leave", tags=["Leaves"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(face_recognition.router, prefix="/face-recognition", tags=["face-recognition"])

# Route d'accueil
@app.get("/")
def root():
    return {"message": "Welcome to TE Connect Lite backend!"}
