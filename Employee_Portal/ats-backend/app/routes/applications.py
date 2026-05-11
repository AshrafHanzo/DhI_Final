# app/routes/applications.py

from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional
from app.schemas.application import ApplicationCreate, ApplicationOut
from app.db import fetch_one, fetch_all, execute
from pydantic import BaseModel

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
# RPA SYNC ENDPOINTS (Must be before dynamic routes)
# ------------------------------------------------

@router.get("/pending-sync", tags=["RPA Integration"])
async def get_pending_sync_applications():
    """
    Get all applications that have changed status and need syncing to External Portal.
    """
    sql = """
    SELECT 
        a.id, a.candidate_id, a.status, a.screening_status, 
        a.interview_status, a.joined_status, a.updated_at,
        c.full_name AS candidate_name, c.phone_number, c.email_address,
        j.job_title, j.company_name
    FROM applications a
    LEFT JOIN candidates c ON a.candidate_id = c.id
    LEFT JOIN jobs j ON a.job_id = j.id
    WHERE a.sync_needed = 1
    ORDER BY a.updated_at ASC
    LIMIT 100;
    """
    return await fetch_all(sql)


class SyncAck(BaseModel):
    application_ids: List[int]

@router.post("/ack-sync", tags=["RPA Integration"])
async def acknowledge_sync(data: SyncAck):
    """
    RPA acknowledges that it has synced these IDs.
    Sets sync_needed = 0.
    """
    if not data.application_ids:
        return {"message": "No IDs provided", "count": 0}
        
    # Convert list of IDs to tuple for SQL IN clause
    ids_tuple = tuple(data.application_ids)
    
    # Handle single item tuple syntax (1,)
    if len(ids_tuple) == 1:
         sql = "UPDATE applications SET sync_needed = 0 WHERE id = %s"
         await execute(sql, [ids_tuple[0]])
    else:
        sql = f"UPDATE applications SET sync_needed = 0 WHERE id IN {ids_tuple}"
        await execute(sql)
        
    return {"message": "Sync acknowledged", "count": len(data.application_ids)}


# ------------------------------------------------
# CREATE APPLICATION
# ------------------------------------------------
@router.post("/", response_model=ApplicationOut)
async def create_application(data: ApplicationCreate):

    # sync_needed defaults to 1 (True) for new applications so RPA picks them up
    sql = """
    INSERT INTO applications (
        candidate_id, job_id, candidate_name, job_title, company,
        status, sourced_by, sourced_from, assigned_to, applied_on, comments,
        sync_needed
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
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
    try:
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
    except Exception as e:
        print(f"Error fetching applications: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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

    # Update status AND set sync_needed = 1
    sql = """
    UPDATE applications
    SET status = %s, updated_at = NOW(), sync_needed = 1
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
    
    # Check if a status field is being updated to trigger sync
    status_changed = False
    
    for key, value in updates.items():
        if key in allowed_fields:
            set_clauses.append(f"{key} = %s")
            params.append(value)
            
            if key in ["status", "screening_status", "interview_status", "joined_status"]:
                status_changed = True
    
    if not set_clauses:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    set_clauses.append("updated_at = NOW()")
    
    # Only set sync_needed if a status field was changed
    if status_changed:
        set_clauses.append("sync_needed = 1")
        
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
