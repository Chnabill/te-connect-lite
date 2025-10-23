from sqlalchemy import Column, Integer, String, Date, Enum
from database import Base

class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String, nullable=False)
    employee_id = Column(String, nullable=False)
    leave_type = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, approved, rejected
    reason = Column(String, nullable=True)
    department = Column(String, nullable=False)
    submitted_date = Column(Date, nullable=False)