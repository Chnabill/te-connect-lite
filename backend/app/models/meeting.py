from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from database import Base

class Meeting(Base):
    __tablename__ = 'meetings'
    id = Column(Integer, primary_key=True, autoincrement=True, unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False)
    organizer_id = Column(Integer, nullable=False)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    participants = Column(JSONB, nullable=True)  # List of integers
    status = Column(String(50), nullable=False, default='scheduled')
    duration = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False)
