from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import DateTime as SQLAlchemyDateTime
from database import Base
from datetime import datetime

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    departments = Column(String, nullable=False)  # Comma-separated department names
    priority = Column(String, nullable=False, default="medium")
    tags = Column(String, nullable=True)  # Comma-separated tags
    expiry_date = Column(SQLAlchemyDateTime, nullable=True)

    creator = relationship("User")