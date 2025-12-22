# app/schemas/job.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobCreate(BaseModel):
    company_id: int
    company_name: Optional[str] = None
    job_title: str
    job_description: str
    address: str
    openings: Optional[int] = 1
    type: Optional[str] = None
    work_mode: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    status: Optional[str] = "open"
    urgency: Optional[str] = None
    commission: Optional[int] = None
    tenure: Optional[str] = None
    shift: Optional[str] = None
    category: Optional[str] = None
    experience: Optional[int] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    required_skills: Optional[str] = None
    preferred_skills: Optional[str] = None
    nice_to_have: Optional[str] = None
    languages_required: Optional[str] = None
    seo_keywords: Optional[str] = None
    posted_by: int

class JobOut(JobCreate):
    id: int
    company_name: Optional[str] = None 
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
