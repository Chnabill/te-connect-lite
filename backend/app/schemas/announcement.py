from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AnnouncementBase(BaseModel):
    title: str
    content: str
    departments: List[str]
    priority: str
    tags: Optional[List[str]] = []
    expiry_date: Optional[datetime] = None

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementResponse(AnnouncementBase):
    id: int
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True