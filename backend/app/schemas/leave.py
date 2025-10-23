from pydantic import BaseModel
from datetime import date
from typing import Optional

class LeaveBase(BaseModel):
    employee_name: str
    employee_id: str
    leave_type: str
    start_date: date
    end_date: date
    status: str = "pending"
    reason: Optional[str] = None
    department: str
    submitted_date: date

class LeaveCreate(LeaveBase):
    pass

class LeaveOut(LeaveBase):
    id: int

    class Config:
        from_attributes = True