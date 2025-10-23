from pydantic import BaseModel
from typing import List, Optional

class Role(BaseModel):
    id: Optional[str]
    name: str
    permissions: List[str]
