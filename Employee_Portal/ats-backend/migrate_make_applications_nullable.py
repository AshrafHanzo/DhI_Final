import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def migrate():
    # Database connection
    conn = await asyncpg.connect(
        host=os.getenv("DB_HOST", "103.14.123.44"),
        port=int(os.getenv("DB_PORT", "30018")),
        user=os.getenv("DB_USER", "dhi_admin"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "postgres")
    )
    
    print("🔗 Connected to database")
    
    try:
        # Set search path
        await conn.execute("SET search_path TO dhi;")
        print("✅ Set search path to dhi schema")
        
        # Make candidate_id and job_id nullable
        await conn.execute("""
            ALTER TABLE applications 
            ALTER COLUMN candidate_id DROP NOT NULL;
        """)
        print("✅ Made candidate_id nullable")
        
        await conn.execute("""
            ALTER TABLE applications 
            ALTER COLUMN job_id DROP NOT NULL;
        """)
        print("✅ Made job_id nullable")
        
        print("🎉 Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await conn.close()
        print("🔌 Database connection closed")

if __name__ == "__main__":
    asyncio.run(migrate())
