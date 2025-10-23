from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityBase(BaseModel):
    action: str
    description: Optional[str] = None
    activity_type: str  # 'user', 'announcement', 'task'
    status: str = 'completed'

class ActivityCreate(ActivityBase):
    user_id: int

class ActivityResponse(ActivityBase):
    id: int
    user_id: int
    created_at: datetime
    user_name: Optional[str] = None  # Will be populated with user's full_name
    
    class Config:
        from_attributes = True 