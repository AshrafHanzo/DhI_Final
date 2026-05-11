import psycopg

conn = psycopg.connect('host=103.14.123.44 port=30018 dbname=postgres user=dhi_admin password=dhi@123 sslmode=disable')
cur = conn.cursor()
cur.execute("SET search_path TO dhi, public;")

# Check all dates as text
cur.execute("SELECT id, applied_on::text, interview_date::text, joining_date::text FROM applications ORDER BY id DESC LIMIT 30;")
print("Recent applications dates:")
for row in cur.fetchall():
    print(row)

# Check for any future dates
cur.execute("SELECT id, applied_on::text FROM applications WHERE applied_on > CURRENT_DATE ORDER BY applied_on DESC LIMIT 30;")
print("\nFuture dates:")
for row in cur.fetchall():
    print(row)

conn.close()

