#!/usr/bin/env python3
import os
import psycopg

# Database connection parameters
PG_HOST = os.getenv("PGHOST", "103.14.123.44")
PG_PORT = os.getenv("PGPORT", "30018")
PG_DB   = os.getenv("PGDATABASE", "postgres")
PG_USER = os.getenv("PGUSER", "dhi_admin")
PG_PASS = os.getenv("PGPASSWORD", "dhi@123")
PG_SCHEMA = os.getenv("PGSCHEMA", "dhi")
PG_SSLMODE = os.getenv("PGSSLMODE", "disable")

DSN = (
    f"host={PG_HOST} port={PG_PORT} dbname={PG_DB} "
    f"user={PG_USER} password={PG_PASS} sslmode={PG_SSLMODE} "
    f"connect_timeout=10"
)

print(f"Connecting to: host={PG_HOST} port={PG_PORT} db={PG_DB} schema={PG_SCHEMA}")

# Read migration file
with open('migrations/001_create_sourced_from_master.sql', 'r') as f:
    migration_sql = f.read()

# Execute migration
try:
    with psycopg.connect(DSN) as conn:
        with conn.cursor() as cur:
            # Set schema
            cur.execute(f"SET search_path TO {PG_SCHEMA}, public;")
            
            # Execute migration
            cur.execute(migration_sql)
            
            conn.commit()
            print("✅ Migration completed successfully!")
            
            # Verify data
            cur.execute("SELECT source_name FROM sourced_from_master ORDER BY display_order;")
            rows = cur.fetchall()
            print(f"\n✅ Inserted {len(rows)} sourced_from options:")
            for row in rows:
                print(f"   - {row[0]}")
                
except Exception as e:
    print(f"❌ Migration failed: {e}")
    raise
