from sqlalchemy import Column, Integer, String, Date, Text, DateTime, CheckConstraint
from sqlalchemy.sql import func
from database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String(255), nullable=False, index=True)
    position = Column(String(100))
    department = Column(String(100), index=True)
    score = Column(Integer, CheckConstraint('score >= 0 AND score <= 100'))
    date = Column(Date, default=func.current_date())
    comments = Column(Text)
    status = Column(String(50), default='pending', index=True)
    performance_level = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
