from pydantic import BaseModel
from typing import Optional
from datetime import date

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = 'pending'
    priority: Optional[str] = 'medium'
    due_date: Optional[date] = None
    assigned_by: Optional[str] = None
    user_id: int

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    assigned_by: Optional[str] = None
    user_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    class Config:
        from_attributes = True
