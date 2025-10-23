from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LogCreate(BaseModel):
    user_id: str
    action: str
    description: Optional[str]

class LogOut(LogCreate):
    id: str
    timestamp: datetime
