import psycopg
from datetime import date, datetime
from psycopg.rows import dict_row

# Test with dict_row like the application does
conn = psycopg.connect('host=103.14.123.44 port=30018 dbname=postgres user=dhi_admin password=dhi@123 sslmode=disable')
cur = conn.cursor(row_factory=dict_row)
cur.execute("SET search_path TO dhi, public;")

# Test the exact query that the API uses
cur.execute("""
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
    ORDER BY a.id DESC
    LIMIT 5;
""")

rows = cur.fetchall()
print(f"Found {len(rows)} rows")

for row in rows:
    print(f"\nRow ID: {row['id']}")
    print(f"  applied_on type: {type(row['applied_on'])} value: {row['applied_on']}")
    print(f"  interview_date type: {type(row['interview_date'])} value: {row['interview_date']}")
    print(f"  joining_date type: {type(row['joining_date'])} value: {row['joining_date']}")
    print(f"  created_at type: {type(row['created_at'])} value: {row['created_at']}")
    print(f"  updated_at type: {type(row['updated_at'])} value: {row['updated_at']}")

conn.close()

# Now test Pydantic validation
print("\n\n=== Testing Pydantic Validation ===")
from pydantic import BaseModel
from typing import Optional

class TestModel(BaseModel):
    id: int
    applied_on: Optional[date] = None
    created_at: datetime
    updated_at: datetime

# Test with a sample row
if rows:
    row = rows[0]
    try:
        test_data = {
            "id": row['id'],
            "applied_on": row['applied_on'],
            "created_at": row['created_at'],
            "updated_at": row['updated_at']
        }
        print(f"Test data: {test_data}")
        model = TestModel(**test_data)
        print(f"Pydantic validation passed: {model}")
    except Exception as e:
        print(f"Pydantic validation failed: {e}")
