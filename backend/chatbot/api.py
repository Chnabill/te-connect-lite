from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ...chatbot.backend import get_response
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/api/chatbot/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Get response from the chatbot
        response = get_response(request.message)
        
        # Ensure response is a string
        if isinstance(response, dict):
            response = json.dumps(response)
        elif not isinstance(response, str):
            response = str(response)
            
        return ChatResponse(response=response)
    except Exception as e:
        # Log the error for debugging
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request. Please try again later."
        )

@app.get("/api/chatbot/health")
async def health_check():
    """Health check endpoint to verify the API is running"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app) 