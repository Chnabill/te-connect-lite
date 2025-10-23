from fastapi import FastAPI
from app.routers import task

app = FastAPI()

app.include_router(task.router, prefix="/tasks", tags=["tasks"])
