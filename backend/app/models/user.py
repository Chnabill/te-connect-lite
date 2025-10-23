from sqlalchemy import Column, Integer, String, Date, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    teId = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)
    full_name = Column(String)
    department = Column(String)
    user_image = Column(String, nullable=True)  # Store image URL or base64 data
    phone = Column(String, nullable=True)
    position = Column(String, nullable=True)
    joining_date = Column(Date, nullable=True)
    skills = Column(Text, nullable=True)  # Store as comma-separated string
    
    # Face recognition fields
    face_encoding = Column(Text, nullable=True)  # Store face encoding as JSON string
    face_recognition_enabled = Column(Boolean, default=False)
    last_face_login = Column(DateTime, nullable=True)
    
    # Relationship to activities
    activities = relationship("Activity", back_populates="user")

# NOTE: If using Alembic, generate a migration for the new face recognition columns.
