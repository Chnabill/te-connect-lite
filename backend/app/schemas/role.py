from pydantic import BaseModel
from typing import List

class RoleCreate(BaseModel):
    name: str
    permissions: List[str]

class RoleOut(RoleCreate):
    id: str
