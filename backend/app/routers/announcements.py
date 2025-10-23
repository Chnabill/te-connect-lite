from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.announcement import Announcement
from app.models.activity import Activity
from app.schemas.announcement import AnnouncementCreate, AnnouncementResponse
from app.models.user import User
from database import get_db
from typing import List
from datetime import datetime
from app.auth.jwt import get_current_user

router = APIRouter(tags=["Announcements"])

@router.post("/", response_model=AnnouncementResponse)
def create_announcement(
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Only HR can create
    if current_user.get("role") != "HR":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get the actual user from database - handle both old and new JWT tokens
    user = None
    if current_user.get("user_id"):
        user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    elif current_user.get("sub"):  # email is stored in "sub" field
        user = db.query(User).filter(User.email == current_user.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_announcement = Announcement(
        title=announcement.title,
        content=announcement.content,
        created_by=user.id,
        departments=",".join(announcement.departments),
        priority=announcement.priority,
        tags=",".join(announcement.tags) if announcement.tags else None,
        expiry_date=announcement.expiry_date,
        created_at=datetime.utcnow()
    )
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    
    # Log the activity
    activity = Activity(
        user_id=user.id,
        action=f"Created announcement: {db_announcement.title}",
        description=f"Announcement '{db_announcement.title}' was created with priority {db_announcement.priority} for departments: {db_announcement.departments}",
        activity_type="announcement",
        status="completed"
    )
    db.add(activity)
    db.commit()
    
    return AnnouncementResponse(
        id=db_announcement.id,
        title=db_announcement.title,
        content=db_announcement.content,
        departments=db_announcement.departments.split(","),
        priority=db_announcement.priority,
        tags=db_announcement.tags.split(",") if db_announcement.tags else [],
        expiry_date=db_announcement.expiry_date,
        created_at=db_announcement.created_at,
        created_by=db_announcement.created_by
    )

@router.get("/", response_model=List[AnnouncementResponse])
def list_announcements(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Get the actual user from database - handle both old and new JWT tokens
    user = None
    if current_user.get("user_id"):
        user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    elif current_user.get("sub"):  # email is stored in "sub" field
        user = db.query(User).filter(User.email == current_user.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all announcements
    announcements = db.query(Announcement).all()
    
    # HR users can see all announcements, others see only their department
    if user.role == "HR":
        filtered = [
            AnnouncementResponse(
                id=a.id,
                title=a.title,
                content=a.content,
                departments=a.departments.split(","),
                priority=a.priority,
                tags=a.tags.split(",") if a.tags else [],
                expiry_date=a.expiry_date,
                created_at=a.created_at,
                created_by=a.created_by
            )
            for a in announcements
        ]
    else:
        # Show only announcements for user's department
        user_dept = user.department
        filtered = [
            AnnouncementResponse(
                id=a.id,
                title=a.title,
                content=a.content,
                departments=a.departments.split(","),
                priority=a.priority,
                tags=a.tags.split(",") if a.tags else [],
                expiry_date=a.expiry_date,
                created_at=a.created_at,
                created_by=a.created_by
            )
            for a in announcements if user_dept in a.departments.split(",")
        ]
    
    return filtered

@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Get the actual user from database - handle both old and new JWT tokens
    user = None
    if current_user.get("user_id"):
        user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    elif current_user.get("sub"):  # email is stored in "sub" field
        user = db.query(User).filter(User.email == current_user.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    a = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Announcement not found")
    # Only show if user's department is included
    if user.department not in a.departments.split(","):
        raise HTTPException(status_code=403, detail="Not authorized")
    return AnnouncementResponse(
        id=a.id,
        title=a.title,
        content=a.content,
        departments=a.departments.split(","),
        priority=a.priority,
        tags=a.tags.split(",") if a.tags else [],
        expiry_date=a.expiry_date,
        created_at=a.created_at,
        created_by=a.created_by
    )

@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Only HR can delete
    if current_user.get("role") != "HR":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get the actual user from database - handle both old and new JWT tokens
    user = None
    if current_user.get("user_id"):
        user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    elif current_user.get("sub"):  # email is stored in "sub" field
        user = db.query(User).filter(User.email == current_user.get("sub")).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the announcement
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Delete the announcement
    db.delete(announcement)
    db.commit()
    
    return {"message": "Announcement deleted successfully"}

@router.get("/debug/all", response_model=List[AnnouncementResponse])
def debug_all_announcements(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Only HR can access debug endpoint
    if current_user.get("role") != "HR":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get all announcements without any filtering
    announcements = db.query(Announcement).all()
    print(f"Debug: Found {len(announcements)} announcements in database")
    
    return [
        AnnouncementResponse(
            id=a.id,
            title=a.title,
            content=a.content,
            departments=a.departments.split(","),
            priority=a.priority,
            tags=a.tags.split(",") if a.tags else [],
            expiry_date=a.expiry_date,
            created_at=a.created_at,
            created_by=a.created_by
        )
        for a in announcements
    ]