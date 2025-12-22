# app/schemas/candidate.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CandidateBase(BaseModel):
    full_name: str
    phone_number: str
    email_address: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    resume_url: Optional[str] = None
    status: Optional[str] = "new"

    # Extra fields (used for update / full profile)
    fathers_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    aadhaar_number: Optional[str] = None
    street_address: Optional[str] = None
    area_locality: Optional[str] = None
    pincode: Optional[str] = None
    select_languages: Optional[str] = None
    educational_quality: Optional[str] = None
    work_experience: Optional[str] = None
    additional_months: Optional[str] = None
    technical_professional_skills: Optional[str] = None
    preferred_industries_categories: Optional[str] = None
    preferred_employment_types: Optional[str] = None
    preferred_work_types: Optional[str] = None

class CandidateCreate(CandidateBase):
    """Used for quick-add create (minimal required fields must be provided by form)."""
    pass

class CandidateOut(CandidateBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
