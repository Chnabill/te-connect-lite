from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageBase(BaseModel):
    sender_id: int
    receiver_id: int
    content: str

class MessageCreate(MessageBase):
    pass

class MessageUpdate(BaseModel):
    seen: Optional[bool] = None

class MessageResponse(MessageBase):
    id: int
    timestamp: datetime
    seen: bool
    class Config:
        from_attributes = True 