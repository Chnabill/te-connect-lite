from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    receiver_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    seen = Column(Boolean, default=False, nullable=False)

    sender = relationship('User', foreign_keys=[sender_id])
    receiver = relationship('User', foreign_keys=[receiver_id]) 