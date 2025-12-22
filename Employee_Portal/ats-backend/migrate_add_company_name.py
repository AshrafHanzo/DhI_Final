"""
Migration script to add company_name column to jobs table
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def migrate():
    # Database connection details
    PG_HOST = os.getenv("PGHOST", "localhost")
    PG_PORT = int(os.getenv("PGPORT", 5432))
    PG_DB = os.getenv("PGDATABASE", "postgres")
    PG_USER = os.getenv("PGUSER", "postgres")
    PG_PASSWORD = os.getenv("PGPASSWORD", "postgres")
    PG_SCHEMA = os.getenv("PGSCHEMA", "public")
    
    conn = await asyncpg.connect(
        host=PG_HOST,
        port=PG_PORT,
        database=PG_DB,
        user=PG_USER,
        password=PG_PASSWORD
    )
    
    # Set the schema
    await conn.execute(f"SET search_path TO {PG_SCHEMA};")
    
    try:
        # Add company_name column if it doesn't exist
        await conn.execute("""
            ALTER TABLE jobs 
            ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
        """)
        print("✅ Successfully added company_name column to jobs table")
        
        # Show the table structure
        columns = await conn.fetch("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'jobs' 
            ORDER BY ordinal_position;
        """)
        
        print("\n📋 Current jobs table structure:")
        for col in columns:
            print(f"  - {col['column_name']}: {col['data_type']}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
