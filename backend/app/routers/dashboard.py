from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..schemas.dashboard import DashboardStats
from ..services.dashboard_service import get_dashboard_stats
from app.auth.jwt import get_current_user
from database import get_db
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/", response_model=DashboardStats)
def read_dashboard_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_dashboard_stats(db)

@router.get("/report")
def download_dashboard_report(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    stats = get_dashboard_stats(db)
    return JSONResponse(content=stats, headers={"Content-Disposition": "attachment; filename=dashboard_report.json"})
