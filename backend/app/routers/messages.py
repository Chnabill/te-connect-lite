from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse, MessageUpdate
from database import get_db
from app.auth.jwt import get_current_user
from typing import List, Dict
from datetime import datetime
from fastapi.encoders import jsonable_encoder

router = APIRouter(tags=["Messages"])

# In-memory connection manager for WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_personal_message(self, user_id: int, message: dict):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_json(message)

manager = ConnectionManager()

@router.post("/", response_model=MessageResponse)
async def send_message(message: MessageCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Only allow sending as self
    if message.sender_id != current_user.get("user_id"):
        raise HTTPException(status_code=403, detail="Cannot send as another user.")
    db_message = Message(
        sender_id=message.sender_id,
        receiver_id=message.receiver_id,
        content=message.content,
        timestamp=datetime.utcnow(),
        seen=False
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    # Try to send via WebSocket if receiver is connected
    await manager.send_personal_message(
        db_message.receiver_id,
        jsonable_encoder(MessageResponse.model_validate(db_message))
    )
    return db_message

@router.get("/conversation/{user_id}", response_model=List[MessageResponse])
def get_conversation(user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Get all messages between current user and user_id
    my_id = current_user.get("user_id")
    messages = db.query(Message).filter(
        ((Message.sender_id == my_id) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == my_id))
    ).order_by(Message.timestamp.asc()).all()
    return messages

@router.patch("/{message_id}", response_model=MessageResponse)
def update_message(message_id: int, update: MessageUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    # Only receiver can mark as seen
    if update.seen is not None and message.receiver_id == current_user.get("user_id"):
        message.seen = update.seen
        db.commit()
        db.refresh(message)
    return message

@router.websocket("/ws/messages/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()  # Optionally handle incoming
    except WebSocketDisconnect:
        manager.disconnect(user_id) 