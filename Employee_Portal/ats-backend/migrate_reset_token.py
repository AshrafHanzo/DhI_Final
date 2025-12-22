# Run this script to add reset_token columns to users table
import psycopg

DSN = "host=103.14.123.44 port=30018 dbname=postgres user=dhi_admin password=dhi@123 sslmode=disable"

def migrate():
    try:
        with psycopg.connect(DSN) as conn:
            with conn.cursor() as cur:
                cur.execute("SET search_path TO dhi, public;")
                cur.execute("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
                """)
                cur.execute("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
                """)
                conn.commit()
                print("Migration successful! Added reset_token and reset_token_expiry columns.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
