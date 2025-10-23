import sys
import os
from typing import Optional

# Add the chatbot directory to the Python path
chatbot_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'chatbot')
sys.path.append(chatbot_dir)

class ChatbotService:
    def __init__(self):
        self._chatbot_backend = None
        self._initialize_chatbot()
    
    def _initialize_chatbot(self):
        """Initialize the chatbot backend with proper error handling"""
        try:
            # Try the advanced LangChain backend first
            from backend import get_response
            self._chatbot_backend = get_response
            print("✅ Advanced LangChain chatbot initialized successfully")
        except Exception as e:
            print(f"⚠️ Could not import advanced chatbot: {e}")
            try:
                # Fallback to simplified backend
                from simple_backend import get_response
                self._chatbot_backend = get_response
                print("✅ Simplified HR chatbot initialized successfully")
            except Exception as e2:
                print(f"⚠️ Could not import simplified chatbot: {e2}")
                print("Using basic fallback implementation")
                self._chatbot_backend = None
    
    def get_response(self, message: str) -> str:
        """Get a response from the chatbot"""
        if self._chatbot_backend:
            try:
                return self._chatbot_backend(message)
            except Exception as e:
                print(f"Error in advanced chatbot: {e}")
                return self._fallback_response(message)
        else:
            return self._fallback_response(message)
    
    def _fallback_response(self, message: str) -> str:
        """Fallback response when advanced chatbot is not available"""
        message_lower = message.lower()
        
        # Basic HR-related responses
        if any(word in message_lower for word in ['vacation', 'leave', 'time off', 'holiday']):
            return "For vacation and leave policies, please refer to the HR policy document or contact your HR representative. I'm currently in basic mode - the advanced chatbot features are being configured."
        
        elif any(word in message_lower for word in ['policy', 'policies', 'procedure', 'procedures']):
            return "For detailed policy information, please check the HR policy document or contact your HR department. The advanced chatbot with policy search is currently being set up."
        
        elif any(word in message_lower for word in ['employee', 'staff', 'personnel']):
            return "For employee-related inquiries, please contact your HR representative. The advanced employee data features are being configured."
        
        elif any(word in message_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            return "Hello! I'm your HR Assistant. I can help you with HR policies, vacation requests, employee information, and other HR-related questions. Note: Advanced features are currently being configured."
        
        elif any(word in message_lower for word in ['help', 'what can you do', 'capabilities']):
            return "I can help you with:\n• HR policies and procedures\n• Vacation and leave information\n• Employee data queries\n• Timekeeping questions\n• General HR assistance\n\nNote: Advanced AI features are being set up for more detailed responses."
        
        else:
            return f"I understand you're asking about: '{message}'. As an HR assistant, I can help with HR policies, employee information, vacation requests, and other HR matters. The advanced chatbot features are currently being configured. Please contact your HR representative for immediate assistance."
    
    def is_available(self) -> bool:
        """Check if the advanced chatbot is available"""
        return self._chatbot_backend is not None
    
    def get_status(self) -> dict:
        """Get the current status of the chatbot service"""
        return {
            "advanced_chatbot_available": self.is_available(),
            "mode": "advanced" if self.is_available() else "fallback",
            "message": "Advanced LangChain chatbot ready" if self.is_available() else "Using basic fallback responses"
        }

# Create a singleton instance
chatbot_service = ChatbotService()