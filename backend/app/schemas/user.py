from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    teId: Optional[str] = None
    department: str
    user_image: Optional[str] = None
    skills: Optional[str] = None  # Comma-separated string of skills
    face_recognition_enabled: Optional[bool] = False
    last_face_login: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    password: str
    teId: Optional[str] = None
    department: str
    user_image: Optional[str] = None
    skills: Optional[str] = None  # Comma-separated string of skills

class UserCreateWithFace(BaseModel):
    """Enhanced user creation that optionally includes face enrollment"""
    email: EmailStr
    full_name: str
    role: str
    password: str
    teId: Optional[str] = None
    department: str
    user_image: Optional[str] = None
    skills: Optional[str] = None
    face_image: Optional[str] = None  # Base64 encoded face image
    enable_face_recognition: Optional[bool] = False

class UserResponse(UserBase):
    id: int
    teId: str
    class Config:
        from_attributes = True  # remplace orm_mode=True pour Pydantic v2

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    user_image: Optional[str] = None
    skills: Optional[str] = None  # Comma-separated string of skills
    face_recognition_enabled: Optional[bool] = None

class FaceEnrollmentRequest(BaseModel):
    user_id: int
    face_encoding: str  # Base64 encoded face data

class FaceVerificationRequest(BaseModel):
    face_encoding: str  # Base64 encoded face data
