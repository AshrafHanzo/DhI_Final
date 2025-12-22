# app/routes/candidate.py

import os
import re
import time
from typing import List, Optional

import aiofiles
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.schemas.candidate import CandidateOut
from app.db import fetch_one, fetch_all, execute

router = APIRouter(tags=["Candidates"])

# Resume upload directory - save directly to uploads folder
UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# -------------------------
# HELPERS
# -------------------------
def sanitize_filename(s: str) -> str:
    s = s.strip().replace(" ", "_")
    return re.sub(r"[^\w\-.]", "", s)


# =====================================================
# CREATE CANDIDATE + APPLICATION
# =====================================================
@router.post("/", response_model=CandidateOut)
async def create_candidate(
    full_name: str = Form(...),
    phone_number: str = Form(...),
    email_address: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    city: str = Form(...),

    job_id: Optional[int] = Form(None),
    sourced_from: Optional[str] = Form(None),

    resume: Optional[UploadFile] = File(None),
    resume_url_input: Optional[str] = Form(None, alias="resume_url")
):
    # -----------------------------
    # SAVE RESUME (IF PROVIDED)
    # -----------------------------
    resume_url = resume_url_input
    if resume:
        ext = os.path.splitext(resume.filename)[1] or ".pdf"
        # Use timestamp-based filename like existing uploads
        timestamp = int(time.time())
        filename = f"{timestamp}_{sanitize_filename(resume.filename)}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(await resume.read())

        # URL should point to the uploads endpoint
        resume_url = f"/uploads/{filename}"

    # -----------------------------
    # INSERT CANDIDATE
    # -----------------------------
    sql_cand = """
        INSERT INTO candidates (
            full_name, phone_number, email_address, gender, city, resume_url
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING
            id, full_name, fathers_name, email_address, phone_number, date_of_birth,
            gender, aadhaar_number, street_address, area_locality, city, pincode,
            COALESCE(array_to_string(select_languages, ','), '') as select_languages, 
            educational_quality, 
            COALESCE(work_experience::text, '') as work_experience, 
            COALESCE(additional_months::text, '') as additional_months,
            technical_professional_skills, preferred_industries_categories,
            COALESCE(array_to_string(preferred_employment_types, ','), '') as preferred_employment_types, 
            preferred_work_types, 
            COALESCE(status, 'new') as status, 
            resume_url,
            created_at, updated_at;
    """

    candidate = await fetch_one(sql_cand, [
        full_name,
        phone_number,
        email_address,
        gender,
        city,
        resume_url
    ])

    if not candidate:
        raise HTTPException(status_code=500, detail="Failed to create candidate")

    candidate_id = candidate["id"]

    # -----------------------------
    # INSERT APPLICATION (IF JOB PROVIDED)
    # -----------------------------
    if job_id:
        # fetch job + company name
        job_row = await fetch_one("""
            SELECT 
                j.id AS job_id,
                j.job_title,
                COALESCE(j.company_name, c.name) AS company_name
            FROM jobs j
            LEFT JOIN companies c ON c.id = j.company_id
            WHERE j.id = %s
            LIMIT 1;
        """, [job_id])

        if not job_row:
            raise HTTPException(status_code=404, detail="Job not found")

        sql_app = """
            INSERT INTO applications (
                candidate_id,
                job_id,
                candidate_name,
                job_title,
                company,
                status,
                sourced_from,
                applied_on
            )
            VALUES (%s, %s, %s, %s, %s, 'Applied', %s, %s)
            RETURNING id;
        """

        await fetch_one(sql_app, [
            candidate_id,
            job_id,
            full_name,
            job_row["job_title"],
            job_row["company_name"],
            sourced_from,
            candidate["created_at"]  # Use candidate's created_at as applied_on
        ])

    return candidate


# =====================================================
# LIST CANDIDATES
# =====================================================
@router.get("/", response_model=List[CandidateOut])
async def list_candidates():
    try:
        sql = """
            SELECT
                id, 
                full_name, 
                fathers_name,
                email_address, 
                phone_number, 
                date_of_birth,
                gender, 
                aadhaar_number,
                street_address,
                area_locality,
                city, 
                pincode,
                COALESCE(array_to_string(select_languages, ','), '') as select_languages,
                educational_quality,
                COALESCE(work_experience::text, '') as work_experience,
                COALESCE(additional_months::text, '') as additional_months,
                technical_professional_skills,
                preferred_industries_categories,
                COALESCE(array_to_string(preferred_employment_types, ','), '') as preferred_employment_types,
                preferred_work_types,
                COALESCE(status, 'new') as status,
                resume_url,
                created_at, 
                updated_at
            FROM candidates
            ORDER BY id DESC;
        """
        return await fetch_all(sql)
    except Exception as e:
        print(f"Error fetching candidates: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# =====================================================
# GET ONE CANDIDATE
# =====================================================
@router.get("/{candidate_id}", response_model=CandidateOut)
async def get_candidate(candidate_id: int):
    row = await fetch_one("""
        SELECT
            id, full_name, fathers_name, email_address, phone_number, date_of_birth,
            gender, aadhaar_number, street_address, area_locality, city, pincode,
            COALESCE(array_to_string(select_languages, ','), '') as select_languages,
            educational_quality,
            COALESCE(work_experience::text, '') as work_experience,
            COALESCE(additional_months::text, '') as additional_months,
            technical_professional_skills, preferred_industries_categories,
            COALESCE(array_to_string(preferred_employment_types, ','), '') as preferred_employment_types,
            preferred_work_types, status, resume_url,
            created_at, updated_at
        FROM candidates
        WHERE id = %s
        LIMIT 1;
    """, [candidate_id])

    if not row:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return row


# =====================================================
# UPDATE CANDIDATE
# =====================================================
@router.put("/{candidate_id}", response_model=CandidateOut)
async def update_candidate(
    candidate_id: int,
    full_name: str = Form(...),
    phone_number: str = Form(...),
    email_address: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    fathers_name: Optional[str] = Form(None),
    date_of_birth: Optional[str] = Form(None),
    aadhaar_number: Optional[str] = Form(None),
    street_address: Optional[str] = Form(None),
    area_locality: Optional[str] = Form(None),
    pincode: Optional[str] = Form(None),
    select_languages: Optional[str] = Form(None),
    educational_quality: Optional[str] = Form(None),
    work_experience: Optional[str] = Form(None),
    additional_months: Optional[str] = Form(None),
    technical_professional_skills: Optional[str] = Form(None),
    preferred_industries_categories: Optional[str] = Form(None),
    preferred_employment_types: Optional[str] = Form(None),
    preferred_work_types: Optional[str] = Form(None),
    status: Optional[str] = Form("new"),
    resume: Optional[UploadFile] = File(None)
):
    resume_url = None
    if resume:
        ext = os.path.splitext(resume.filename)[1] or ".pdf"
        # Use timestamp-based filename like existing uploads
        timestamp = int(time.time())
        filename = f"{timestamp}_{sanitize_filename(resume.filename)}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(await resume.read())

        # URL should point to the uploads endpoint
        resume_url = f"/uploads/{filename}"

    row = await fetch_one("""
        UPDATE candidates SET
            full_name = %s,
            fathers_name = %s,
            email_address = %s,
            phone_number = %s,
            date_of_birth = %s,
            gender = %s,
            aadhaar_number = %s,
            street_address = %s,
            area_locality = %s,
            city = %s,
            pincode = %s,
            select_languages = %s,
            educational_quality = %s,
            work_experience = %s,
            additional_months = %s,
            technical_professional_skills = %s,
            preferred_industries_categories = %s,
            preferred_employment_types = %s,
            preferred_work_types = %s,
            status = %s,
            resume_url = COALESCE(%s, resume_url),
            updated_at = NOW()
        WHERE id = %s
        RETURNING
            id, full_name, fathers_name, email_address, phone_number, date_of_birth,
            gender, aadhaar_number, street_address, area_locality, city, pincode,
            select_languages, educational_quality, work_experience, additional_months,
            technical_professional_skills, preferred_industries_categories,
            preferred_employment_types, preferred_work_types, status, resume_url,
            created_at, updated_at;
    """, [
        full_name, fathers_name, email_address, phone_number,
        date_of_birth, gender, aadhaar_number, street_address,
        area_locality, city, pincode, select_languages, educational_quality,
        work_experience, additional_months, technical_professional_skills,
        preferred_industries_categories, preferred_employment_types,
        preferred_work_types, status, resume_url, candidate_id
    ])

    if not row:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return row

# =====================================================
# PATCH CANDIDATE (Flexible JSON update for inline editing)
# =====================================================
@router.patch("/{candidate_id}", response_model=CandidateOut)
async def patch_candidate(candidate_id: int, updates: dict):
    # Check if candidate exists
    existing = await fetch_one(
        "SELECT id FROM candidates WHERE id = %s",
        [candidate_id]
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Build dynamic UPDATE query
    allowed_fields = [
        "full_name", "phone_number", "email_address", "gender", "city",
        "fathers_name", "date_of_birth", "aadhaar_number", "street_address",
        "area_locality", "pincode", "status", "select_languages", 
        "educational_quality", "work_experience", "additional_months",
        "technical_professional_skills", "preferred_industries_categories",
        "preferred_employment_types", "preferred_work_types"
    ]
    
    # Array fields that need special handling
    array_fields = ["select_languages", "preferred_employment_types"]
    
    set_clauses = []
    params = []
    # Integer fields that need special handling
    integer_fields = ["pincode", "work_experience", "additional_months"]
    
    for key, value in updates.items():
        if key in allowed_fields:
            # Handle array fields - convert comma-separated string to PostgreSQL array format
            if key in array_fields:
                if value == "" or value is None:
                    set_clauses.append(f"{key} = NULL")
                else:
                    # Convert "English,Hindi" to "{English,Hindi}" for PostgreSQL
                    if isinstance(value, str) and not value.startswith('{'):
                        value = '{' + value + '}'
                    set_clauses.append(f"{key} = %s")
                    params.append(value)
            # Handle integer fields - convert empty string to NULL
            elif key in integer_fields:
                if value == "" or value is None:
                    set_clauses.append(f"{key} = NULL")
                else:
                    set_clauses.append(f"{key} = %s")
                    params.append(value)
            else:
                set_clauses.append(f"{key} = %s")
                params.append(value)
    
    if not set_clauses:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    set_clauses.append("updated_at = NOW()")
    params.append(candidate_id)
    
    sql = f"""
    UPDATE candidates
    SET {', '.join(set_clauses)}
    WHERE id = %s
    RETURNING
        id, full_name, fathers_name, email_address, phone_number, date_of_birth,
        gender, aadhaar_number, street_address, area_locality, city, pincode,
        COALESCE(array_to_string(select_languages, ','), '') as select_languages,
        educational_quality, 
        COALESCE(work_experience::text, '') as work_experience,
        COALESCE(additional_months::text, '') as additional_months,
        technical_professional_skills, preferred_industries_categories,
        COALESCE(array_to_string(preferred_employment_types, ','), '') as preferred_employment_types,
        preferred_work_types, 
        COALESCE(status, 'new') as status, 
        resume_url,
        created_at, updated_at;
    """
    
    row = await fetch_one(sql, params)
    return row


# =====================================================
# LANDING PAGE SUBMISSION - SIMPLIFIED CANDIDATE + APPLICATION
# =====================================================
@router.post("/landing-page", response_model=dict)
async def create_landing_page_application(
    full_name: str = Form(...),
    phone: str = Form(...),
    email: Optional[str] = Form(None),
    city: str = Form(...),
    position: str = Form(...),
    source: str = Form("Meta"),
    job_id: Optional[str] = Form(None),
    company: Optional[str] = Form(None),
    resume: Optional[UploadFile] = File(None)
):
    """
    Simplified endpoint for landing page job applications from Meta/Facebook campaigns.
    Creates candidate, application, and screening entries with sourced_from = 'Meta'.
    Fetches complete job details from database.
    """
    
    # Fetch complete job details if job_id is provided
    job_details = None
    if job_id:
        sql_job = """
            SELECT 
                j.id,
                j.company_id,
                COALESCE(j.company_name, c.name) AS company_name,
                j.job_title,
                j.job_description,
                j.address,
                j.openings,
                j.type,
                j.work_mode,
                j.salary_min,
                j.salary_max
            FROM jobs j
            LEFT JOIN companies c ON c.id = j.company_id
            WHERE j.id = %s AND j.status = 'Active';
        """
        job_details = await fetch_one(sql_job, [int(job_id)])
    
    # Save resume if provided
    resume_url = None
    if resume:
        ext = os.path.splitext(resume.filename)[1] or ".pdf"
        filename = f"{sanitize_filename(full_name)}_{sanitize_filename(phone)}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(await resume.read())

        resume_url = f"/{UPLOAD_DIR}/{filename}"

    # Insert candidate
    sql_cand = """
        INSERT INTO candidates (
            full_name, phone_number, email_address, city, resume_url, status
        )
        VALUES (%s, %s, %s, %s, %s, 'new')
        RETURNING id, full_name, email_address, phone_number, city, resume_url, created_at;
    """

    candidate = await fetch_one(sql_cand, [
        full_name,
        phone,
        email or f"{phone}@meta.temp",  # Use temp email if not provided
        city,
        resume_url
    ])

    if not candidate:
        raise HTTPException(status_code=500, detail="Failed to create candidate")

    candidate_id = candidate["id"]

    # Use job details if available, otherwise use form data
    final_job_title = job_details["job_title"] if job_details else position
    final_company = job_details["company_name"] if job_details else (company or "Direct Application")
    final_job_location = job_details["address"] if job_details else city

    # Create application entry with Meta as source
    sql_app = """
        INSERT INTO applications (
            candidate_id,
            job_id,
            candidate_name,
            candidate_phone,
            candidate_email,
            job_title,
            job_location,
            company,
            status,
            sourced_from,
            screening_status,
            applied_on
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Applied', %s, 'Applied', %s)
        RETURNING id, candidate_id, job_id, candidate_name, job_title, company, status, sourced_from, screening_status, applied_on;
    """

    application = await fetch_one(sql_app, [
        candidate_id,
        int(job_id) if job_id else None,
        full_name,
        phone,
        email or f"{phone}@meta.temp",
        final_job_title,
        final_job_location,
        final_company,
        source,
        candidate["created_at"]
    ])

    return {
        "success": True,
        "message": "Application submitted successfully",
        "candidate_id": candidate_id,
        "application_id": application["id"] if application else None,
        "data": {
            "candidate": dict(candidate),
            "application": dict(application) if application else None
        }
    }


# DELETE CANDIDATE
# ------------------------------------------------
@router.delete("/{candidate_id}")
@router.delete("/{candidate_id}/")
async def delete_candidate(candidate_id: int):
    try:
        # First check if candidate exists
        check_sql = "SELECT id FROM candidates WHERE id = %s"
        existing = await fetch_one(check_sql, [candidate_id])
        
        if not existing:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Delete related applications first (due to foreign key constraint)
        delete_apps_sql = "DELETE FROM applications WHERE candidate_id = %s"
        await execute(delete_apps_sql, [candidate_id])
        
        # Delete the candidate
        delete_sql = "DELETE FROM candidates WHERE id = %s"
        await execute(delete_sql, [candidate_id])
        
        return {"message": "Candidate deleted successfully", "id": candidate_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting candidate: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete candidate: {str(e)}")
