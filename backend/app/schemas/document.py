from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentCreate(BaseModel):
    title: str
    file_url: str
    owner_id: int
    category: Optional[str] = None
    type: Optional[str] = None
    size: Optional[int] = None
    version: Optional[str] = None
    tags: Optional[List[str]] = []

class DocumentOut(DocumentCreate):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
