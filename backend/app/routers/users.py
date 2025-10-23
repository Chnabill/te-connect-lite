from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.activity import Activity
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserCreateWithFace
from database import get_db
from passlib.context import CryptContext
from app.auth.jwt import get_current_user
from app.services.face_recognition_service import SimpleFaceRecognitionService
import requests
import json

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
face_service = SimpleFaceRecognitionService()
SECRET_KEY = "your_secret_key"

@router.get("/")
async def read_users(department: str = None, name: str = None, db: Session = Depends(get_db)):
    query = db.query(User)
    if department:
        query = query.filter(User.department == department)
    if name:
        query = query.filter(User.full_name.ilike(f"%{name}%"))
    users = query.all()
    user_list = [
        {
            "id": str(user.id),
            "teId": user.teId,
            "full_name": user.full_name,
            "user_image": user.user_image,
            "email": user.email,
            "department": user.department,
            "phone": user.phone,
            "position": user.position,
            "joining_date": user.joining_date,
            "skills": user.skills,
            "role": user.role  # <-- Added role field
        }
        for user in users
    ]
    return {"users": user_list}

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = pwd_context.hash(user.password)
    print("Here")
    
    # Generate unique username
    base_username = user.full_name.replace(" ", "").lower()
    username = base_username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    # Ensure unique teId
    def generate_unique_teid():
        base = "TE"
        counter = 1
        while db.query(User).filter(User.teId == f"{base}{counter:03d}").first():
            counter += 1
        return f"{base}{counter:03d}"

    if user.teId:
        # If teId is provided, check uniqueness
        if db.query(User).filter(User.teId == user.teId).first():
            raise HTTPException(status_code=400, detail="teId already exists")
        teid = user.teId
    else:
        teid = generate_unique_teid()

    db_user = User(
        email=user.email, 
        username=username,  # Use generated unique username
        full_name=user.full_name, 
        hashed_password=hashed_password, 
        role=user.role,
        teId=teid,
        department=user.department
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Log the activity (only if you want to log for self-registration, you can skip or adjust this part)
    # If you want to log, you could create a generic activity or skip this block entirely for unauthenticated registration
    # Example: Commenting out the activity logging for now
    # creator_user = None
    # if current_user and current_user.get("user_id"):
    #     creator_user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    # elif current_user and current_user.get("sub"):
    #     creator_user = db.query(User).filter(User.email == current_user.get("sub")).first()
    #
    # if creator_user:
    #     activity = Activity(
    #         user_id=creator_user.id,
    #         action=f"Created new user: {db_user.full_name}",
    #         description=f"User {db_user.full_name} ({db_user.email}) was registered with role {db_user.role} in department {db_user.department}",
    #         activity_type="user",
    #         status="completed"
    #     )
    #     db.add(activity)
    #     db.commit()
    
    return db_user

@router.post("/register-with-face", response_model=UserResponse)
def register_with_face(user: UserCreateWithFace, db: Session = Depends(get_db)):
    """Register a new user with optional face enrollment"""
    print('Received user registration payload:', user.dict())
    hashed_password = pwd_context.hash(user.password)
    
    # Generate unique username
    base_username = user.full_name.replace(" ", "").lower()
    username = base_username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    # Ensure unique teId
    def generate_unique_teid():
        base = "TE"
        counter = 1
        while db.query(User).filter(User.teId == f"{base}{counter:03d}").first():
            counter += 1
        return f"{base}{counter:03d}"

    if user.teId:
        # If teId is provided, check uniqueness
        if db.query(User).filter(User.teId == user.teId).first():
            raise HTTPException(status_code=400, detail="teId already exists")
        teid = user.teId
    else:
        teid = generate_unique_teid()

    # Create user
    db_user = User(
        email=user.email, 
        username=username,
        full_name=user.full_name, 
        hashed_password=hashed_password, 
        role=user.role,
        teId=teid,
        department=user.department,
        skills=user.skills,
        user_image=user.user_image
    )
    
    # Handle face enrollment if provided
    if user.face_image and user.enable_face_recognition:
        try:
            # Check if face is detected
            if not face_service.detect_liveness(user.face_image):
                raise HTTPException(status_code=400, detail="No face detected in the provided image")
            
            # Encode the face
            face_encoding = face_service.encode_face_from_image(user.face_image)
            if face_encoding is None:
                raise HTTPException(status_code=400, detail="Could not process face from the provided image")
            
            # Store face encoding
            db_user.face_encoding = json.dumps(face_encoding.tolist())
            db_user.face_recognition_enabled = True
            db_user.user_image = user.face_image  # Use face image as user image
            
        except Exception as e:
            print(f"Face enrollment error: {e}")
            # Continue without face enrollment if there's an error
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/enroll-face/{user_id}")
async def enroll_face_for_user(
    user_id: int,
    face_image: str,  # Base64 encoded image
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Enroll face for an existing user"""
    # Check if current user is authorized
    if not current_user.get("user_id") == user_id and current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to enroll face for this user")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Check if face is detected
        if not face_service.detect_liveness(face_image):
            raise HTTPException(status_code=400, detail="No face detected in the provided image")
        
        # Encode the face
        face_encoding = face_service.encode_face_from_image(face_image)
        if face_encoding is None:
            raise HTTPException(status_code=400, detail="Could not process face from the provided image")
        
        # Store face encoding and update user
        user.face_encoding = json.dumps(face_encoding.tolist())
        user.face_recognition_enabled = True
        user.user_image = face_image
        
        db.commit()
        
        return {
            "message": "Face enrolled successfully",
            "user_id": user_id,
            "face_recognition_enabled": True
        }
        
    except Exception as e:
        print(f"Face enrollment error: {e}")
        raise HTTPException(status_code=500, detail=f"Face enrollment failed: {str(e)}")

@router.get("/face-status/{user_id}")
async def get_user_face_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get face recognition status for a user"""
    # Check if current user is authorized
    if not current_user.get("user_id") == user_id and current_user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to view this user's face status")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "face_recognition_enabled": user.face_recognition_enabled,
        "has_face_encoding": user.face_encoding is not None,
        "last_face_login": user.last_face_login.isoformat() if user.last_face_login else None
    }

@router.get("/by-email/{email}", response_model=UserResponse)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id),  # Ensure UUID is string
        "teId": user.teId,
        "full_name": user.full_name,
        "user_image": user.user_image,
        "email": user.email,
        "department": user.department,
        "role": user.role,
        "skills": user.skills
    }

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update only the fields that are provided
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.department is not None:
        user.department = user_update.department
    if user_update.user_image is not None:
        user.user_image = user_update.user_image
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}

@router.get("/search/")
def search_users_by_name(q: str, db: Session = Depends(get_db)):
    users = db.query(User).filter(User.full_name.ilike(f"%{q}%")).all()
    return [
        {
            "id": str(user.id),  # Ensure UUID is string
            "full_name": user.full_name,
            "email": user.email,
            "user_image": user.user_image,
            "role": user.role
        }
        for user in users
    ]

# Autres routes ici

