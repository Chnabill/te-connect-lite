from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from .user import User
from .announcement import Announcement

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    category = Column(String, nullable=True)
    type = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    version = Column(String, nullable=True)
    tags = Column(String, nullable=True)  # Comma-separated tags

    owner = relationship("User")
