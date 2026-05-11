import psycopg

# Connect without dict_row to avoid the error
conn = psycopg.connect('host=103.14.123.44 port=30018 dbname=postgres user=dhi_admin password=dhi@123 sslmode=disable')
cur = conn.cursor()
cur.execute("SET search_path TO dhi, public;")

# Find any dates in the year 20026
cur.execute("""
    SELECT id, 
           applied_on::text, 
           interview_date::text, 
           joining_date::text,
           created_at::text,
           updated_at::text
    FROM applications 
    WHERE applied_on::text LIKE '20026%' 
       OR interview_date::text LIKE '20026%' 
       OR joining_date::text LIKE '20026%';
""")

print("Bad dates found:")
for row in cur.fetchall():
    print(f"ID: {row[0]}")
    print(f"  applied_on: {row[1]}")
    print(f"  interview_date: {row[2]}")
    print(f"  joining_date: {row[3]}")
    print(f"  created_at: {row[4]}")
    print(f"  updated_at: {row[5]}")
    print()

conn.close()
