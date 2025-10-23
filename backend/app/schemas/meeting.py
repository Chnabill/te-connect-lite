from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class MeetingCreate(BaseModel):
    title: str
    date: datetime
    participants: Optional[List[int]] = None
    organizer_id: int
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = 'scheduled'
    duration: Optional[int] = None

class MeetingOut(MeetingCreate):
    id: int
    created_at: datetime
    updated_at: datetime
