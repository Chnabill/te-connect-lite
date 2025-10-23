from typing import Any
from sqlalchemy.orm import Session
from app.models.task import Task as TaskModel
from app.models.user import User
from app.models.leave import Leave
from app.models.meeting import Meeting
from datetime import date

def get_dashboard_stats(db: Session) -> dict:
    total_users = db.query(User).count()
    total_tasks = db.query(TaskModel).count()
    completed_tasks = db.query(TaskModel).filter(TaskModel.status == 'completed').count()
    pending_tasks = db.query(TaskModel).filter(TaskModel.status == 'pending').count()
    overdue_tasks = db.query(TaskModel).filter(TaskModel.status != 'completed', TaskModel.due_date != None, TaskModel.due_date < date.today()).count()
    completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    total_leaves = db.query(Leave).count()
    upcoming_meetings = db.query(Meeting).filter(Meeting.date >= date.today()).count()
    return {
        "total_users": total_users,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_tasks,
        "completion_rate": completion_rate,
        "total_leaves": total_leaves,
        "upcoming_meetings": upcoming_meetings,
    }
