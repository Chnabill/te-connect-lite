# auth/jwt.py
import os
from datetime import datetime, timedelta
import jwt as PyJWT
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-very-strong-secret-key-change-this-in-production") 
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(hours=8))
    to_encode.update({"exp": expire})
    encoded_jwt = PyJWT.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(days=30))
    to_encode.update({"exp": expire})
    encoded_jwt = PyJWT.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt  

def verify_token(token: str) -> dict | None:
    try:
        payload = PyJWT.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except PyJWT.PyJWTError:
        return None

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("is_active") is False:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


