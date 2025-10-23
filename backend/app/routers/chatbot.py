# app/routers/chatbot.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.chatbot_service import chatbot_service
import json

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Use the proper chatbot service
        response = chatbot_service.get_response(request.message)
        return ChatResponse(response=response)
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request. Please try again later."
        )

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/")
async def chatbot_info():
    status = chatbot_service.get_status()
    return {
        "message": "Chatbot service is running",
        "status": status,
        "endpoints": {
            "chat": "/chat - POST endpoint for chatbot conversations",
            "health": "/health - GET endpoint for health check",
            "info": "/info - GET endpoint for service information"
        }
    }
