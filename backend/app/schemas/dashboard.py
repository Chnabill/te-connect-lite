from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_users: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    completion_rate: float
    total_leaves: int
    upcoming_meetings: int
    # ajoute ce dont tu as besoin

    class Config:
        from_attributes = True
