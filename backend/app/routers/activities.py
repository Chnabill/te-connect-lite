from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from app.models.activity import Activity
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.auth.jwt import get_current_user

router = APIRouter(tags=["Activities"])

@router.post("/", response_model=ActivityResponse)
def create_activity(
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new activity log"""
    # Verify the user exists
    user = db.query(User).filter(User.id == activity.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_activity = Activity(
        user_id=activity.user_id,
        action=activity.action,
        description=activity.description,
        activity_type=activity.activity_type,
        status=activity.status
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    
    # Return with user name
    return ActivityResponse(
        id=db_activity.id,
        user_id=db_activity.user_id,
        action=db_activity.action,
        description=db_activity.description,
        activity_type=db_activity.activity_type,
        status=db_activity.status,
        created_at=db_activity.created_at,
        user_name=user.full_name
    )

@router.get("/", response_model=List[ActivityResponse])
def get_activities(
    activity_type: str = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all activities with optional filtering"""
    query = db.query(Activity).join(User).order_by(Activity.created_at.desc())
    
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    
    activities = query.limit(limit).all()
    
    # Convert to response format with user names
    result = []
    for activity in activities:
        result.append(ActivityResponse(
            id=activity.id,
            user_id=activity.user_id,
            action=activity.action,
            description=activity.description,
            activity_type=activity.activity_type,
            status=activity.status,
            created_at=activity.created_at,
            user_name=activity.user.full_name
        ))
    
    return result

@router.get("/overview", response_model=List[ActivityResponse])
def get_activity_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get recent activities for overview (last 20)"""
    activities = db.query(Activity).join(User).order_by(Activity.created_at.desc()).limit(20).all()
    
    result = []
    for activity in activities:
        result.append(ActivityResponse(
            id=activity.id,
            user_id=activity.user_id,
            action=activity.action,
            description=activity.description,
            activity_type=activity.activity_type,
            status=activity.status,
            created_at=activity.created_at,
            user_name=activity.user.full_name
        ))
    
    return result 