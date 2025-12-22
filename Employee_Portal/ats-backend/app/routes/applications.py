# app/routes/applications.py

from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.application import ApplicationCreate, ApplicationOut
from app.db import fetch_one, fetch_all, execute

router = APIRouter(tags=["Applications"])


# ------------------------------------------------
# VALID STATUS FLOW (Pipeline)
# ------------------------------------------------
STATUS_FLOW = {
    "Applied": ["Shortlisted"],
    "Shortlisted": ["Interview"],
    "Interview": ["Selected"],
    "Selected": ["Joined"],
    "Joined": ["Tenure Completed"],
    "Tenure Completed": []
}


# ------------------------------------------------
# CREATE APPLICATION
# ------------------------------------------------
@router.post("/", response_model=ApplicationOut)
async def create_application(data: ApplicationCreate):

    sql = """
    INSERT INTO applications (
        candidate_id, job_id, candidate_name, job_title, company,
        status, sourced_by, sourced_from, assigned_to, applied_on, comments
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING
        id, candidate_id, job_id, candidate_name, job_title, company,
        status, sourced_by, sourced_from, assigned_to, applied_on, comments,
        screening_status, created_at, updated_at;
    """

    params = [
        data.candidate_id, data.job_id, data.candidate_name, data.job_title,
        data.company, data.status, data.sourced_by, data.sourced_from,
        data.assigned_to, data.applied_on, data.comments
    ]

    row = await fetch_one(sql, params)
    return row


# ------------------------------------------------
# LIST ALL APPLICATIONS (WITH JOIN)
# ------------------------------------------------
@router.get("/", response_model=List[ApplicationOut])
async def list_applications():

    sql = """
    SELECT
        a.id,
        a.candidate_id,
        a.job_id,
        a.candidate_name,
        a.job_title,
        a.company,
        a.status,
        a.sourced_by,
        a.sourced_from,
        a.assigned_to,
        a.applied_on,
        a.comments,
        a.screening_status,
        a.interview_status,
        a.interview_date,
        a.joined_status,
        a.joining_date,
        a.created_at,
        a.updated_at,

        -- Candidate info
        c.phone_number AS candidate_phone,
        c.city AS candidate_city,
        c.gender AS candidate_gender,

        -- Job info
        j.address AS job_location,
        CONCAT('₹', j.salary_min::text, ' - ', '₹', j.salary_max::text) AS job_salary,
        j.commission AS job_commission,
        j.tenure AS job_tenure

    FROM applications a
    LEFT JOIN candidates c ON a.candidate_id = c.id
    LEFT JOIN jobs j ON a.job_id = j.id
    ORDER BY a.id DESC;
    """

    return await fetch_all(sql)


# ------------------------------------------------
# GET SINGLE APPLICATION
# ------------------------------------------------
@router.get("/{application_id}", response_model=ApplicationOut)
async def get_application(application_id: int):

    sql = """
    SELECT
        a.id,
        a.candidate_id,
        a.job_id,
        a.candidate_name,
        a.job_title,
        a.company,
        a.status,
        a.sourced_by,
        a.sourced_from,
        a.assigned_to,
        a.applied_on,
        a.comments,
        a.screening_status,
        a.interview_status,
        a.interview_date,
        a.joined_status,
        a.joining_date,
        a.created_at,
        a.updated_at,

        c.phone_number AS candidate_phone,
        c.city AS candidate_city,
        c.gender AS candidate_gender,

        j.address AS job_location,
        CONCAT('₹', j.salary_min::text, ' - ', '₹', j.salary_max::text) AS job_salary

    FROM applications a
    LEFT JOIN candidates c ON a.candidate_id = c.id
    LEFT JOIN jobs j ON a.job_id = j.id
    WHERE a.id = %s;
    """

    row = await fetch_one(sql, [application_id])

    if not row:
        raise HTTPException(status_code=404, detail="Application not found")

    return row


# ------------------------------------------------
# UPDATE APPLICATION STATUS (Pipeline Move)
# ------------------------------------------------
@router.put("/{application_id}/status", response_model=ApplicationOut)
async def update_application_status(application_id: int, new_status: str):

    # Fetch current status
    existing = await fetch_one(
        "SELECT id, status FROM applications WHERE id = %s",
        [application_id]
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")

    current_status = existing["status"]
    allowed_next = STATUS_FLOW.get(current_status, [])

    if new_status not in allowed_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition: '{current_status}' → '{new_status}'. Allowed: {allowed_next}"
        )

    sql = """
    UPDATE applications
    SET status = %s, updated_at = NOW()
    WHERE id = %s
    RETURNING
        id, candidate_id, job_id, candidate_name, job_title, company,
        status, sourced_by, sourced_from, assigned_to, applied_on, comments,
        created_at, updated_at;
    """

    row = await fetch_one(sql, [new_status, application_id])
    return row


# ------------------------------------------------
# UPDATE APPLICATION (Flexible - any field)
# ------------------------------------------------
@router.put("/{application_id}", response_model=ApplicationOut)
@router.put("/{application_id}/", response_model=ApplicationOut)
async def update_application(application_id: int, updates: dict):
    # Check if application exists
    existing = await fetch_one(
        "SELECT id FROM applications WHERE id = %s",
        [application_id]
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")

    # Build dynamic UPDATE query
    allowed_fields = [
        "status", "sourced_by", "sourced_from", "assigned_to", 
        "applied_on", "comments", "candidate_name", "job_title", "company",
        "screening_status", "interview_status", "interview_date",
        "joined_status", "joining_date"
    ]
    
    set_clauses = []
    params = []
    
    for key, value in updates.items():
        if key in allowed_fields:
            set_clauses.append(f"{key} = %s")
            params.append(value)
    
    if not set_clauses:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    set_clauses.append("updated_at = NOW()")
    params.append(application_id)
    
    sql = f"""
    UPDATE applications
    SET {', '.join(set_clauses)}
    WHERE id = %s
    RETURNING
        id, candidate_id, job_id, candidate_name, job_title, company,
        status, sourced_by, sourced_from, assigned_to, applied_on, comments,
        screening_status, created_at, updated_at;
    """
    
    row = await fetch_one(sql, params)
    return row


# ------------------------------------------------
# DELETE APPLICATION
# ------------------------------------------------
@router.delete("/{application_id}")
@router.delete("/{application_id}/")
async def delete_application(application_id: int):
    try:
        # First check if application exists
        check_sql = "SELECT id FROM applications WHERE id = %s"
        existing = await fetch_one(check_sql, [application_id])
        
        if not existing:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Delete the application
        delete_sql = "DELETE FROM applications WHERE id = %s"
        await execute(delete_sql, [application_id])
        
        return {"message": "Application deleted successfully", "id": application_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting application: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")
