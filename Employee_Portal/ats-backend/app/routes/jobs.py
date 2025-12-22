# app/routes/jobs.py
from fastapi import APIRouter, HTTPException
from app.schemas.job import JobCreate, JobOut
from app.db import fetch_one, fetch_all

router = APIRouter(tags=["Jobs"])


# --------------------------
# CREATE JOB
# --------------------------
@router.post("/", response_model=JobOut)
async def create_job(data: JobCreate):
    sql = """
    INSERT INTO jobs (
        company_id, company_name, job_title, job_description, address, openings, type,
        work_mode, salary_min, salary_max, status, urgency, commission,
        tenure, shift, category, experience, age_min, age_max,
        required_skills, preferred_skills, nice_to_have,
        languages_required, seo_keywords, posted_by
    )
    VALUES (
        %s, %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s
    )
    RETURNING 
        id, company_id, company_name, job_title, job_description, address, openings, type,
        work_mode, salary_min, salary_max, status, urgency, commission,
        tenure, shift, category, experience, age_min, age_max,
        required_skills, preferred_skills, nice_to_have,
        languages_required, seo_keywords, posted_by,
        created_at, updated_at;
    """

    params = [
        data.company_id,
        data.company_name,
        data.job_title,
        data.job_description,
        data.address,
        data.openings,
        data.type,
        data.work_mode,
        data.salary_min,
        data.salary_max,
        data.status,
        data.urgency,
        data.commission,
        data.tenure,
        data.shift,
        data.category,
        data.experience,
        data.age_min,
        data.age_max,
        data.required_skills,
        data.preferred_skills,
        data.nice_to_have,
        data.languages_required,
        data.seo_keywords,
        data.posted_by,
    ]

    row = await fetch_one(sql, params)
    if not row:
        raise HTTPException(status_code=500, detail="Failed to create job")
    return row


# --------------------------
# LIST JOBS
# --------------------------
@router.get("/", response_model=list[JobOut])
async def list_jobs():
    sql = """
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
        j.salary_max,
        j.status,
        j.urgency,
        j.commission,
        j.tenure,
        j.shift,
        j.category,
        j.experience,
        j.age_min,
        j.age_max,
        j.required_skills,
        j.preferred_skills,
        j.nice_to_have,
        j.languages_required,
        j.seo_keywords,
        j.posted_by,
        j.created_at,
        j.updated_at
    FROM jobs j
    LEFT JOIN companies c ON c.id = j.company_id
    ORDER BY j.id DESC;
    """

    rows = await fetch_all(sql)
    return rows


# --------------------------
# GET SINGLE JOB DETAIL
# --------------------------
@router.get("/{job_id}", response_model=JobOut)
async def get_job_detail(job_id: int):
    sql = """
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
        j.salary_max,
        j.status,
        j.urgency,
        j.commission,
        j.tenure,
        j.shift,
        j.category,
        j.experience,
        j.age_min,
        j.age_max,
        j.required_skills,
        j.preferred_skills,
        j.nice_to_have,
        j.languages_required,
        j.seo_keywords,
        j.posted_by,
        j.created_at,
        j.updated_at
    FROM jobs j
    LEFT JOIN companies c ON c.id = j.company_id
    WHERE j.id = %s
    LIMIT 1;
    """

    row = await fetch_one(sql, [job_id])
    if not row:
        raise HTTPException(status_code=404, detail="Job not found")
    return row


# --------------------------
# UPDATE JOB (PARTIAL)
# --------------------------
@router.put("/{job_id}", response_model=JobOut)
async def update_job(job_id: int, data: dict):
    # Check if job exists
    existing = await fetch_one("SELECT id FROM jobs WHERE id = %s", [job_id])
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")

    # Build UPDATE query dynamically based on provided fields
    update_fields = []
    params = []
    
    for key, value in data.items():
        if key not in ['id', 'created_at', 'updated_at']:
            update_fields.append(f"{key} = %s")
            params.append(value)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(job_id)
    
    sql = f"""
    UPDATE jobs
    SET {', '.join(update_fields)}, updated_at = NOW()
    WHERE id = %s
    RETURNING 
        id, company_id, company_name, job_title, job_description, address, openings, type,
        work_mode, salary_min, salary_max, status, urgency, commission,
        tenure, shift, category, experience, age_min, age_max,
        required_skills, preferred_skills, nice_to_have,
        languages_required, seo_keywords, posted_by,
        created_at, updated_at;
    """
    
    row = await fetch_one(sql, params)
    return row
