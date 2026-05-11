import psycopg

conn = psycopg.connect('host=103.14.123.44 port=30018 dbname=postgres user=dhi_admin password=dhi@123 sslmode=disable')
cur = conn.cursor()
cur.execute("SET search_path TO dhi, public;")

# Fix the bad date (20026-01-08 -> 2026-01-08)
cur.execute("UPDATE applications SET interview_date = '2026-01-08' WHERE id = 1538;")
conn.commit()

print(f"Fixed! Rows affected: {cur.rowcount}")

# Verify the fix
cur.execute("SELECT id, interview_date::text FROM applications WHERE id = 1538;")
row = cur.fetchone()
print(f"Verified - ID: {row[0]}, interview_date: {row[1]}")

conn.close()
