# app/schemas/application.py

from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


# -----------------------------
# CREATE APPLICATION
# -----------------------------
class ApplicationCreate(BaseModel):
    candidate_id: Optional[int] = None
    job_id: Optional[int] = None

    candidate_name: str
    job_title: str
    company: Optional[str] = None

    status: Optional[str] = "Applied"
    sourced_by: Optional[str] = None
    sourced_from: Optional[str] = None
    assigned_to: Optional[str] = None
    applied_on: Optional[date] = None
    comments: Optional[str] = None
    screening_status: Optional[str] = None
    interview_status: Optional[str] = None
    interview_date: Optional[date] = None
    joined_status: Optional[str] = None
    joining_date: Optional[date] = None


# -----------------------------
# RETURN APPLICATION (JOIN DATA INCLUDED)
# -----------------------------
class ApplicationOut(ApplicationCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    # Additional fields returned from JOIN
    candidate_phone: Optional[str] = None
    candidate_city: Optional[str] = None
    candidate_gender: Optional[str] = None

    job_location: Optional[str] = None
    job_salary: Optional[str] = None
    job_commission: Optional[int] = None
    job_tenure: Optional[str] = None
