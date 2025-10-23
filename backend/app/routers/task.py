# app/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.task import Task as TaskModel
from app.models.activity import Activity
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from database import get_db
from typing import List, Optional
from datetime import date
from app.auth.jwt import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
def get_tasks(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(TaskModel)
    if user_id is not None:
        query = query.filter(TaskModel.user_id == user_id)
    return query.all()

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Get the current user who created this task
    creator_user = None
    if current_user.get("user_id"):
        creator_user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    elif current_user.get("sub"):
        creator_user = db.query(User).filter(User.email == current_user.get("sub")).first()
    
    # Get the assigned user
    assigned_user = db.query(User).filter(User.id == task.user_id).first()
    if not assigned_user:
        raise HTTPException(status_code=404, detail="Assigned user not found")
    
    db_task = TaskModel(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Log the activity
    if creator_user:
        activity = Activity(
            user_id=creator_user.id,
            action=f"Created task: {db_task.title}",
            description=f"Task '{db_task.title}' was created and assigned to {assigned_user.full_name} with priority {db_task.priority}",
            activity_type="task",
            status="completed"
        )
        db.add(activity)
        db.commit()
    
    return db_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"detail": "Task deleted"}

@router.get("/analytics")
def task_analytics(db: Session = Depends(get_db)):
    total_tasks = db.query(TaskModel).count()
    completed_tasks = db.query(TaskModel).filter(TaskModel.status == 'completed').count()
    pending_tasks = db.query(TaskModel).filter(TaskModel.status == 'pending').count()
    overdue_tasks = db.query(TaskModel).filter(TaskModel.status != 'completed', TaskModel.due_date != None, TaskModel.due_date < date.today()).count()
    by_priority = {
        'high': db.query(TaskModel).filter(TaskModel.priority == 'high').count(),
        'medium': db.query(TaskModel.priority == 'medium').count(),
        'low': db.query(TaskModel).filter(TaskModel.priority == 'low').count(),
    }
    completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    return {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'overdue_tasks': overdue_tasks,
        'by_priority': by_priority,
        'completion_rate': completion_rate
    }

# autres routes ici
