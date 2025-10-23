from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.leave import Leave
from app.schemas.leave import LeaveCreate, LeaveOut
from database import get_db
from datetime import date

router = APIRouter(tags=["Leaves"])

@router.post("/", response_model=LeaveOut)
def create_leave(leave: LeaveCreate, db: Session = Depends(get_db)):
    db_leave = Leave(**leave.dict())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.get("/", response_model=List[LeaveOut])
def get_leaves(employee_id: str = None, db: Session = Depends(get_db)):
    if employee_id:
        return db.query(Leave).filter(Leave.employee_id == employee_id).all()
    return db.query(Leave).all()

@router.patch("/{leave_id}", response_model=LeaveOut)
def update_leave(leave_id: int, update_data: dict, db: Session = Depends(get_db)):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    for key, value in update_data.items():
        if hasattr(leave, key):
            setattr(leave, key, value)
    db.commit()
    db.refresh(leave)
    return leave

@router.delete("/{leave_id}")
def delete_leave(leave_id: int, db: Session = Depends(get_db)):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    db.delete(leave)
    db.commit()
    return {"detail": "Leave request deleted"}