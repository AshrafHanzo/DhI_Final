from fastapi import APIRouter
from app.db import fetch_one, fetch_all

router = APIRouter(tags=["Dashboard"])

@router.get("/")
async def dashboard():
    try:
        # Exclude applications from 2025-11-28
        exclude_date = "2025-11-28"
        sql = f"""
        SELECT
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM companies) AS total_companies,
            (SELECT COUNT(*) FROM jobs) AS total_jobs,
            (SELECT COUNT(*) FROM candidates) AS total_candidates,
            (SELECT COUNT(*) FROM applications WHERE applied_on IS NULL OR applied_on != '{exclude_date}') AS total_applications,
            (SELECT COUNT(*) FROM jobs WHERE status = 'open') AS jobs_open,
            (SELECT COUNT(*) FROM jobs WHERE status = 'closed') AS jobs_closed,
            (SELECT COUNT(*) FROM jobs WHERE status = 'on_hold') AS jobs_on_hold,
            (SELECT COUNT(*) FROM applications WHERE DATE(created_at) = CURRENT_DATE AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS applications_today,
            (SELECT COUNT(*) FROM applications WHERE DATE(created_at) = CURRENT_DATE - 1 AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS applications_yesterday,
            (SELECT COUNT(*) FROM candidates WHERE DATE(created_at) = CURRENT_DATE) AS candidates_today,
            (SELECT COUNT(*) FROM candidates WHERE DATE(created_at) = CURRENT_DATE - 1) AS candidates_yesterday,
            
            -- Screening Status Counts (excluding 2025-11-28)
            (SELECT COUNT(*) FROM applications WHERE (screening_status = 'Applied' OR screening_status IS NULL) AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS screening_applied,
            (SELECT COUNT(*) FROM applications WHERE screening_status = 'Call Back' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS screening_callback,
            (SELECT COUNT(*) FROM applications WHERE screening_status = 'Not Reachable' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS screening_not_reachable,
            (SELECT COUNT(*) FROM applications WHERE screening_status = 'Wrong Number' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS screening_wrong_number,
            (SELECT COUNT(*) FROM applications WHERE screening_status = 'Ringing No Response' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS screening_ringing,
            (SELECT COUNT(*) FROM applications WHERE screening_status = 'Ready To Interview' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS screening_ready,
            (SELECT COUNT(*) FROM applications WHERE screening_status = 'Not Fit' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS screening_not_fit,
            (SELECT COUNT(*) FROM applications WHERE screening_status = 'Not Interested' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS screening_not_interested,
            
            -- Interview Status Counts (excluding 2025-11-28 except for Selected)
            (SELECT COUNT(*) FROM applications WHERE interview_status = 'Scheduled' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS interview_scheduled,
            (SELECT COUNT(*) FROM applications WHERE interview_status = 'Attended' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS interview_attended,
            (SELECT COUNT(*) FROM applications WHERE interview_status = 'Not Attended' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS interview_not_attended,
            (SELECT COUNT(*) FROM applications WHERE interview_status = 'Selected') AS interview_selected,
            (SELECT COUNT(*) FROM applications WHERE interview_status = 'Rejected') AS interview_rejected,
            
            -- Joined Status Counts (no date exclusion - count all joined candidates)
            (SELECT COUNT(*) FROM applications WHERE joined_status = 'Joined') AS joined_count,
            (SELECT COUNT(*) FROM applications WHERE joined_status = 'Not Joined') AS not_joined_count,
            
            -- This week stats (excluding 2025-11-28)
            (SELECT COUNT(*) FROM applications WHERE DATE(created_at) >= CURRENT_DATE - 7 AND (applied_on IS NULL OR applied_on != '{exclude_date}')) AS applications_this_week,
            (SELECT COUNT(*) FROM candidates WHERE DATE(created_at) >= CURRENT_DATE - 7) AS candidates_this_week;
        """

        row = await fetch_one(sql)
        
        if row:
            return row
        
        # Return default values if no data
        return {
            "total_users": 0, "total_companies": 0, "total_jobs": 0, "total_candidates": 0, "total_applications": 0,
            "jobs_open": 0, "jobs_closed": 0, "jobs_on_hold": 0,
            "applications_today": 0, "applications_yesterday": 0, "candidates_today": 0, "candidates_yesterday": 0,
            "screening_applied": 0, "screening_callback": 0, "screening_not_reachable": 0, "screening_wrong_number": 0,
            "screening_ringing": 0, "screening_ready": 0, "screening_not_fit": 0, "screening_not_interested": 0,
            "interview_scheduled": 0, "interview_attended": 0, "interview_not_attended": 0, "interview_selected": 0, "interview_rejected": 0,
            "joined_count": 0, "not_joined_count": 0, "applications_this_week": 0, "candidates_this_week": 0
        }
    except Exception as e:
        print(f"Dashboard error: {e}")
        return {
            "total_users": 0, "total_companies": 0, "total_jobs": 0, "total_candidates": 0, "total_applications": 0,
            "jobs_open": 0, "jobs_closed": 0, "jobs_on_hold": 0,
            "applications_today": 0, "applications_yesterday": 0, "candidates_today": 0, "candidates_yesterday": 0,
            "screening_applied": 0, "screening_callback": 0, "screening_not_reachable": 0, "screening_wrong_number": 0,
            "screening_ringing": 0, "screening_ready": 0, "screening_not_fit": 0, "screening_not_interested": 0,
            "interview_scheduled": 0, "interview_attended": 0, "interview_not_attended": 0, "interview_selected": 0, "interview_rejected": 0,
            "joined_count": 0, "not_joined_count": 0, "applications_this_week": 0, "candidates_this_week": 0,
            "error": str(e)
        }


@router.get("/recruiter-stats")
async def recruiter_stats(period: str = "all"):
    """Get application counts per recruiter with optional time period filter"""
    try:
        # Exclude applications from 2025-11-28
        exclude_date = "2025-11-28"
        
        # Build date filter based on period
        date_filter = ""
        if period == "today":
            date_filter = "AND DATE(applied_on) = CURRENT_DATE"
        elif period == "week":
            date_filter = "AND applied_on >= CURRENT_DATE - INTERVAL '7 days'"
        elif period == "month":
            date_filter = "AND applied_on >= DATE_TRUNC('month', CURRENT_DATE)"
        elif period == "year":
            date_filter = "AND applied_on >= DATE_TRUNC('year', CURRENT_DATE)"
        # 'all' means no date filter for period, but still exclude 2025-11-28
        
        sql = f"""
        SELECT 
            sourced_by as recruiter,
            COUNT(*) FILTER (WHERE applied_on IS NULL OR applied_on != '{exclude_date}') as total_applications,
            COUNT(*) FILTER (WHERE screening_status = 'Ready To Interview' AND (applied_on IS NULL OR applied_on != '{exclude_date}')) as ready_to_interview,
            COUNT(*) FILTER (WHERE interview_status = 'Selected') as selected,
            COUNT(*) FILTER (WHERE joined_status = 'Joined') as joined
        FROM applications
        WHERE sourced_by IS NOT NULL AND sourced_by != ''
        {date_filter}
        GROUP BY sourced_by
        ORDER BY total_applications DESC;
        """
        result = await fetch_all(sql)
        return result if result else []
    except Exception as e:
        print(f"Recruiter stats error: {e}")
        return []


@router.get("/weekly-trend")
async def weekly_trend():
    """Get daily application counts for the last 7 days"""
    sql = """
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
    FROM applications
    WHERE DATE(created_at) >= CURRENT_DATE - 7
    GROUP BY DATE(created_at)
    ORDER BY date;
    """
    return await fetch_all(sql)
