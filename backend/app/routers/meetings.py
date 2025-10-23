from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from app.models.meeting import Meeting
from app.schemas.meeting import MeetingCreate, MeetingOut
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=MeetingOut, status_code=status.HTTP_201_CREATED)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = Meeting(**meeting.dict())
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.get("/", response_model=List[MeetingOut])
def get_meetings(db: Session = Depends(get_db)):
    return db.query(Meeting).all()

@router.get("/{meeting_id}", response_model=MeetingOut)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.put("/{meeting_id}", response_model=MeetingOut)
def update_meeting(meeting_id: int, meeting: MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    for key, value in meeting.dict(exclude_unset=True).items():
        setattr(db_meeting, key, value)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(db_meeting)
    db.commit()
    return None
