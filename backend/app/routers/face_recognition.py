from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from app.services.face_recognition_service import SimpleFaceRecognitionService
from app.models.user import User
from app.auth.jwt import get_current_user, create_access_token
import json
import numpy as np
import base64
from datetime import datetime

router = APIRouter()
face_service = SimpleFaceRecognitionService()

@router.post("/enroll-face/{user_id}")
async def enroll_user_face(
    user_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Enroll a user's face for recognition"""
    if not current_user.get("user_id") == user_id and current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Read and encode image
    image_data = await image.read()
    image_base64 = base64.b64encode(image_data).decode()
    
    # Check liveness
    if not face_service.detect_liveness(image_base64):
        raise HTTPException(status_code=400, detail="No face detected in image")
    
    face_encoding = face_service.encode_face_from_image(image_base64)
    if face_encoding is None:
        raise HTTPException(status_code=400, detail="No face detected in image")
    
    # Store face encoding and update user
    user.face_encoding = json.dumps(face_encoding.tolist())
    user.face_recognition_enabled = True
    user.user_image = f"data:image/jpeg;base64,{image_base64}"
    
    db.commit()
    return {"message": "Face enrolled successfully", "user_id": user_id}

@router.post("/verify-face")
async def verify_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Verify face against enrolled users"""
    image_data = await image.read()
    image_base64 = base64.b64encode(image_data).decode()
    
    # Check liveness
    if not face_service.detect_liveness(image_base64):
        raise HTTPException(status_code=400, detail="No face detected in image")
    
    captured_encoding = face_service.encode_face_from_image(image_base64)
    if captured_encoding is None:
        raise HTTPException(status_code=400, detail="No face detected in image")
    
    # Check against all enrolled users
    enrolled_users = db.query(User).filter(User.face_recognition_enabled == True).all()
    
    for user in enrolled_users:
        if user.face_encoding:
            try:
                stored_encoding = np.array(json.loads(user.face_encoding))
                if face_service.compare_faces(stored_encoding, captured_encoding):
                    return {
                        "verified": True,
                        "user_id": user.id,
                        "email": user.email,
                        "full_name": user.full_name,
                        "role": user.role
                    }
            except Exception as e:
                print(f"Error processing user {user.id}: {e}")
                continue
    
    return {"verified": False, "message": "Face not recognized"}

@router.post("/login-with-face")
async def login_with_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Login using face recognition"""
    verification_result = await verify_face(image, db)
    
    if verification_result.get("verified"):
        # Generate JWT token
        token_data = {
            "sub": verification_result["email"],
            "role": verification_result["role"],
            "user_id": verification_result["user_id"]
        }
        access_token = create_access_token(data=token_data)
        
        # Update last face login
        user = db.query(User).filter(User.id == verification_result["user_id"]).first()
        user.last_face_login = datetime.utcnow()
        db.commit()
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": verification_result["role"],
            "user_id": verification_result["user_id"],
            "email": verification_result["email"]
        }
    
    raise HTTPException(status_code=401, detail="Face not recognized")

@router.get("/status/{user_id}")
async def get_face_recognition_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get face recognition status for a user"""
    if not current_user.get("user_id") == user_id and current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user.id,
        "face_recognition_enabled": user.face_recognition_enabled,
        "has_face_encoding": user.face_encoding is not None,
        "last_face_login": user.last_face_login.isoformat() if user.last_face_login else None
    }

@router.delete("/enroll-face/{user_id}")
async def remove_face_enrollment(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Remove face enrollment for a user"""
    if not current_user.get("user_id") == user_id and current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.face_encoding = None
    user.face_recognition_enabled = False
    user.last_face_login = None
    
    db.commit()
    return {"message": "Face enrollment removed successfully"} 