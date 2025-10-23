from sqlalchemy import Column, Integer, String, Date, Numeric, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    position = Column(String(100))
    department = Column(String(100), index=True)
    hire_date = Column(Date)
    salary = Column(Numeric(10, 2))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
