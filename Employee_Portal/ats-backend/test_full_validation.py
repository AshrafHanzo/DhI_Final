import sys
sys.path.insert(0, '.')

import psycopg
from psycopg.rows import dict_row
from app.schemas.application import ApplicationOut

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
    ORDER BY a.id DESC;
""")

rows = cur.fetchall()
print(f"Found {len(rows)} total rows")

# Try to validate each row
for i, row in enumerate(rows):
    try:
        model = ApplicationOut(**row)
    except Exception as e:
        print(f"\n=== ERROR at row {i} (ID: {row['id']}) ===")
        print(f"Error: {e}")
        print(f"Row data: {dict(row)}")
        break
else:
    print("All rows validated successfully!")

conn.close()
