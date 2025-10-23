from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Log(BaseModel):
    id: Optional[str]
    user_id: str
    action: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    description: Optional[str]
