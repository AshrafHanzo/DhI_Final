import psycopg

conn = psycopg.connect('host=103.14.123.44 port=30018 dbname=postgres user=dhi_admin password=dhi@123 sslmode=disable')
cur = conn.cursor()
cur.execute("SET search_path TO dhi, public;")

# Get table schema
cur.execute("""
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'dhi' AND table_name = 'applications'
    ORDER BY ordinal_position;
""")
print("Applications table schema:")
for row in cur.fetchall():
    print(row)

conn.close()
