# task.py
from sqlalchemy import Column, Integer, String, Date, Enum
from database import Base
import enum

class TaskStatusEnum(str, enum.Enum):
    pending = 'pending'
    completed = 'completed'

class TaskPriorityEnum(str, enum.Enum):
    high = 'high'
    medium = 'medium'
    low = 'low'

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(Enum(TaskStatusEnum), default=TaskStatusEnum.pending, nullable=False)
    priority = Column(Enum(TaskPriorityEnum), default=TaskPriorityEnum.medium, nullable=False)
    due_date = Column(Date, nullable=True)
    assigned_by = Column(String, nullable=True)
    user_id = Column(Integer, nullable=False, index=True)
