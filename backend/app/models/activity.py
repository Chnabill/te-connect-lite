from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    activity_type = Column(String(50), nullable=False)  # 'user', 'announcement', 'task'
    status = Column(String(50), default='completed', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="activities") 