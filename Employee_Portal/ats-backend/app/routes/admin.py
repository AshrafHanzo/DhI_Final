# app/routes/admin.py
"""
Admin-only routes for managing ATS settings like recruiters and screening statuses.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.db import get_async_pool

router = APIRouter()


# ==================== MODELS ====================

class RecruiterCreate(BaseModel):
    name: str

class RecruiterUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class ScreeningStatusCreate(BaseModel):
    name: str
    display_order: Optional[int] = 0

class ScreeningStatusUpdate(BaseModel):
    name: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


# ==================== DEFAULT DATA ====================

DEFAULT_RECRUITERS = [
    'Muni Divya',
    'Surya K',
    'Thameem Ansari',
    'Nandhini Kumaravel',
    'Dhivya V',
    'Gokulakrishna V',
    'Snehal Prakash',
    'Selvaraj Veilumuthu'
]

DEFAULT_SCREENING_STATUSES = [
    ('Applied', 1),
    ('Ready To Interview', 2),
    ('Call Back', 3),
    ('Not Reachable', 4),
    ('Wrong Number', 5),
    ('Ringing No Response', 6),
    ('Not Fit', 7),
    ('Not Interested', 8)
]

DEFAULT_SOURCED_FROM = [
    ('Linked-in', 1),
    ('Job hai', 2),
    ('Apna', 3),
    ('Meta', 4),
    ('EarlyJobs', 5),
    ('Others', 6)
]

DEFAULT_INTERVIEW_STATUSES = [
    ('Scheduled', 1),
    ('Hold', 2),
    ('Not Attended', 3),
    ('Attended', 4),
    ('Selected', 5),
    ('Rejected', 6)
]

DEFAULT_JOINED_STATUSES = [
    ('Joined', 1),
    ('Left', 2),
    ('Not Joined', 3)
]

DEFAULT_READY_TO_INTERVIEW_STATUSES = [
    ('Pending', 1),
    ('Scheduled', 2),
    ('Not Attended', 3),
    ('Rejected', 4)
]


# ==================== RECRUITERS ====================

@router.get("/recruiters", response_model=List[Dict[str, Any]])
async def get_recruiters():
    """Get all recruiters"""
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                # Check if table exists, create if not
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS recruiters (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await conn.commit()
                
                # Check if table is empty and seed default data
                await cur.execute("SELECT COUNT(*) FROM recruiters")
                count = (await cur.fetchone())[0]
                
                if count == 0:
                    # Seed default recruiters
                    for name in DEFAULT_RECRUITERS:
                        await cur.execute(
                            "INSERT INTO recruiters (name, is_active) VALUES (%s, TRUE)",
                            (name,)
                        )
                    await conn.commit()
                    print(f"✅ Seeded {len(DEFAULT_RECRUITERS)} default recruiters")
                
                await cur.execute("""
                    SELECT id, name, is_active, created_at
                    FROM recruiters
                    ORDER BY name
                """)
                rows = await cur.fetchall()
                return [
                    {
                        "id": r[0],
                        "name": r[1],
                        "is_active": r[2],
                        "created_at": r[3].isoformat() if r[3] else None
                    }
                    for r in rows
                ]
    except Exception as e:
        print(f"Error fetching recruiters: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recruiters", response_model=Dict[str, Any])
async def create_recruiter(data: RecruiterCreate):
    """Add a new recruiter"""
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO recruiters (name, is_active)
                    VALUES (%s, TRUE)
                    RETURNING id, name, is_active, created_at
                """, (data.name,))
                row = await cur.fetchone()
                await conn.commit()
                return {
                    "id": row[0],
                    "name": row[1],
                    "is_active": row[2],
                    "created_at": row[3].isoformat() if row[3] else None
                }
    except Exception as e:
        print(f"Error creating recruiter: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/recruiters/{recruiter_id}", response_model=Dict[str, Any])
async def update_recruiter(recruiter_id: int, data: RecruiterUpdate):
    """Update a recruiter"""
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                updates = []
                values = []
                if data.name is not None:
                    updates.append("name = %s")
                    values.append(data.name)
                if data.is_active is not None:
                    updates.append("is_active = %s")
                    values.append(data.is_active)
                
                if not updates:
                    raise HTTPException(status_code=400, detail="No fields to update")
                
                values.append(recruiter_id)
                await cur.execute(f"""
                    UPDATE recruiters
                    SET {', '.join(updates)}
                    WHERE id = %s
                    RETURNING id, name, is_active, created_at
                """, values)
                row = await cur.fetchone()
                await conn.commit()
                
                if not row:
                    raise HTTPException(status_code=404, detail="Recruiter not found")
                
                return {
                    "id": row[0],
                    "name": row[1],
                    "is_active": row[2],
                    "created_at": row[3].isoformat() if row[3] else None
                }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating recruiter: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/recruiters/{recruiter_id}")
async def delete_recruiter(recruiter_id: int):
    """Delete a recruiter"""
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM recruiters WHERE id = %s", (recruiter_id,))
                await conn.commit()
                return {"success": True, "message": "Recruiter deleted"}
    except Exception as e:
        print(f"Error deleting recruiter: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SCREENING STATUSES ====================

@router.get("/screening-statuses", response_model=List[Dict[str, Any]])
async def get_screening_statuses():
    """Get all screening statuses"""
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                # Check if table exists, create if not
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS screening_statuses (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        display_order INT DEFAULT 0,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await conn.commit()
                
                # Check if table is empty and seed default data
                await cur.execute("SELECT COUNT(*) FROM screening_statuses")
                count = (await cur.fetchone())[0]
                
                if count == 0:
                    # Seed default screening statuses
                    for name, order in DEFAULT_SCREENING_STATUSES:
                        await cur.execute(
                            "INSERT INTO screening_statuses (name, display_order, is_active) VALUES (%s, %s, TRUE)",
                            (name, order)
                        )
                    await conn.commit()
                    print(f"✅ Seeded {len(DEFAULT_SCREENING_STATUSES)} default screening statuses")
                
                await cur.execute("""
                    SELECT id, name, display_order, is_active, created_at
                    FROM screening_statuses
                    ORDER BY display_order, name
                """)
                rows = await cur.fetchall()
                return [
                    {
                        "id": r[0],
                        "name": r[1],
                        "display_order": r[2],
                        "is_active": r[3],
                        "created_at": r[4].isoformat() if r[4] else None
                    }
                    for r in rows
                ]
    except Exception as e:
        print(f"Error fetching screening statuses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/screening-statuses", response_model=Dict[str, Any])
async def create_screening_status(data: ScreeningStatusCreate):
    """Add a new screening status"""
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO screening_statuses (name, display_order, is_active)
                    VALUES (%s, %s, TRUE)
                    RETURNING id, name, display_order, is_active, created_at
                """, (data.name, data.display_order or 0))
                row = await cur.fetchone()
                await conn.commit()
                return {
                    "id": row[0],
                    "name": row[1],
                    "display_order": row[2],
                    "is_active": row[3],
                    "created_at": row[4].isoformat() if row[4] else None
                }
    except Exception as e:
        print(f"Error creating screening status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/screening-statuses/{status_id}", response_model=Dict[str, Any])
async def update_screening_status(status_id: int, data: ScreeningStatusUpdate):
    """Update a screening status"""
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                updates = []
                values = []
                if data.name is not None:
                    updates.append("name = %s")
                    values.append(data.name)
                if data.display_order is not None:
                    updates.append("display_order = %s")
                    values.append(data.display_order)
                if data.is_active is not None:
                    updates.append("is_active = %s")
                    values.append(data.is_active)
                
                if not updates:
                    raise HTTPException(status_code=400, detail="No fields to update")
                
                values.append(status_id)
                await cur.execute(f"""
                    UPDATE screening_statuses
                    SET {', '.join(updates)}
                    WHERE id = %s
                    RETURNING id, name, display_order, is_active, created_at
                """, values)
                row = await cur.fetchone()
                await conn.commit()
                
                if not row:
                    raise HTTPException(status_code=404, detail="Status not found")
                
                return {
                    "id": row[0],
                    "name": row[1],
                    "display_order": row[2],
                    "is_active": row[3],
                    "created_at": row[4].isoformat() if row[4] else None
                }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating screening status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/screening-statuses/{status_id}")
async def delete_screening_status(status_id: int):
    """Delete a screening status"""
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM screening_statuses WHERE id = %s", (status_id,))
                await conn.commit()
                return {"success": True, "message": "Screening status deleted"}
    except Exception as e:
        print(f"Error deleting screening status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SOURCED FROM ====================

@router.get("/sourced-from", response_model=List[Dict[str, Any]])
async def get_sourced_from():
    """Get all sourced from options"""
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS sourced_from_options (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        display_order INT DEFAULT 0,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await conn.commit()
                
                await cur.execute("SELECT COUNT(*) FROM sourced_from_options")
                count = (await cur.fetchone())[0]
                
                if count == 0:
                    for name, order in DEFAULT_SOURCED_FROM:
                        await cur.execute(
                            "INSERT INTO sourced_from_options (name, display_order, is_active) VALUES (%s, %s, TRUE)",
                            (name, order)
                        )
                    await conn.commit()
                
                await cur.execute("""
                    SELECT id, name, display_order, is_active, created_at
                    FROM sourced_from_options
                    ORDER BY display_order, name
                """)
                rows = await cur.fetchall()
                return [{"id": r[0], "name": r[1], "display_order": r[2], "is_active": r[3], "created_at": r[4].isoformat() if r[4] else None} for r in rows]
    except Exception as e:
        print(f"Error fetching sourced from: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sourced-from", response_model=Dict[str, Any])
async def create_sourced_from(data: ScreeningStatusCreate):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO sourced_from_options (name, display_order, is_active) VALUES (%s, %s, TRUE)
                    RETURNING id, name, display_order, is_active, created_at
                """, (data.name, data.display_order or 0))
                row = await cur.fetchone()
                await conn.commit()
                return {"id": row[0], "name": row[1], "display_order": row[2], "is_active": row[3], "created_at": row[4].isoformat() if row[4] else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/sourced-from/{item_id}", response_model=Dict[str, Any])
async def update_sourced_from(item_id: int, data: ScreeningStatusUpdate):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                updates, values = [], []
                if data.name is not None: updates.append("name = %s"); values.append(data.name)
                if data.display_order is not None: updates.append("display_order = %s"); values.append(data.display_order)
                if data.is_active is not None: updates.append("is_active = %s"); values.append(data.is_active)
                if not updates: raise HTTPException(status_code=400, detail="No fields to update")
                values.append(item_id)
                await cur.execute(f"UPDATE sourced_from_options SET {', '.join(updates)} WHERE id = %s RETURNING id, name, display_order, is_active, created_at", values)
                row = await cur.fetchone()
                await conn.commit()
                if not row: raise HTTPException(status_code=404, detail="Not found")
                return {"id": row[0], "name": row[1], "display_order": row[2], "is_active": row[3], "created_at": row[4].isoformat() if row[4] else None}
    except HTTPException: raise
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.delete("/sourced-from/{item_id}")
async def delete_sourced_from(item_id: int):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM sourced_from_options WHERE id = %s", (item_id,))
                await conn.commit()
                return {"success": True}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


# ==================== INTERVIEW STATUSES ====================

@router.get("/interview-statuses", response_model=List[Dict[str, Any]])
async def get_interview_statuses():
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS interview_statuses (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        display_order INT DEFAULT 0,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await conn.commit()
                
                await cur.execute("SELECT COUNT(*) FROM interview_statuses")
                count = (await cur.fetchone())[0]
                
                if count == 0:
                    for name, order in DEFAULT_INTERVIEW_STATUSES:
                        await cur.execute("INSERT INTO interview_statuses (name, display_order, is_active) VALUES (%s, %s, TRUE)", (name, order))
                    await conn.commit()
                
                await cur.execute("SELECT id, name, display_order, is_active, created_at FROM interview_statuses ORDER BY display_order, name")
                rows = await cur.fetchall()
                return [{"id": r[0], "name": r[1], "display_order": r[2], "is_active": r[3], "created_at": r[4].isoformat() if r[4] else None} for r in rows]
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.post("/interview-statuses", response_model=Dict[str, Any])
async def create_interview_status(data: ScreeningStatusCreate):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("INSERT INTO interview_statuses (name, display_order, is_active) VALUES (%s, %s, TRUE) RETURNING id, name, display_order, is_active, created_at", (data.name, data.display_order or 0))
                row = await cur.fetchone()
                await conn.commit()
                return {"id": row[0], "name": row[1], "display_order": row[2], "is_active": row[3], "created_at": row[4].isoformat() if row[4] else None}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.put("/interview-statuses/{item_id}", response_model=Dict[str, Any])
async def update_interview_status(item_id: int, data: ScreeningStatusUpdate):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                updates, values = [], []
                if data.name is not None: updates.append("name = %s"); values.append(data.name)
                if data.display_order is not None: updates.append("display_order = %s"); values.append(data.display_order)
                if data.is_active is not None: updates.append("is_active = %s"); values.append(data.is_active)
                if not updates: raise HTTPException(status_code=400, detail="No fields to update")
                values.append(item_id)
                await cur.execute(f"UPDATE interview_statuses SET {', '.join(updates)} WHERE id = %s RETURNING id, name, display_order, is_active, created_at", values)
                row = await cur.fetchone()
                await conn.commit()
                if not row: raise HTTPException(status_code=404, detail="Not found")
                return {"id": row[0], "name": row[1], "display_order": row[2], "is_active": row[3], "created_at": row[4].isoformat() if row[4] else None}
    except HTTPException: raise
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.delete("/interview-statuses/{item_id}")
async def delete_interview_status(item_id: int):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM interview_statuses WHERE id = %s", (item_id,))
                await conn.commit()
                return {"success": True}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


# ==================== JOINED STATUSES ====================

@router.get("/joined-statuses", response_model=List[Dict[str, Any]])
async def get_joined_statuses():
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS joined_statuses (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        display_order INT DEFAULT 0,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await conn.commit()
                
                await cur.execute("SELECT COUNT(*) FROM joined_statuses")
                count = (await cur.fetchone())[0]
                
                if count == 0:
                    for name, order in DEFAULT_JOINED_STATUSES:
                        await cur.execute("INSERT INTO joined_statuses (name, display_order, is_active) VALUES (%s, %s, TRUE)", (name, order))
                    await conn.commit()
                
                await cur.execute("SELECT id, name, display_order, is_active, created_at FROM joined_statuses ORDER BY display_order, name")
                rows = await cur.fetchall()
                return [{"id": r[0], "name": r[1], "display_order": r[2], "is_active": r[3], "created_at": r[4].isoformat() if r[4] else None} for r in rows]
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.post("/joined-statuses", response_model=Dict[str, Any])
async def create_joined_status(data: ScreeningStatusCreate):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("INSERT INTO joined_statuses (name, display_order, is_active) VALUES (%s, %s, TRUE) RETURNING id, name, display_order, is_active, created_at", (data.name, data.display_order or 0))
                row = await cur.fetchone()
                await conn.commit()
                return {"id": row[0], "name": row[1], "display_order": row[2], "is_active": row[3], "created_at": row[4].isoformat() if row[4] else None}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.put("/joined-statuses/{item_id}", response_model=Dict[str, Any])
async def update_joined_status(item_id: int, data: ScreeningStatusUpdate):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                updates, values = [], []
                if data.name is not None: updates.append("name = %s"); values.append(data.name)
                if data.display_order is not None: updates.append("display_order = %s"); values.append(data.display_order)
                if data.is_active is not None: updates.append("is_active = %s"); values.append(data.is_active)
                if not updates: raise HTTPException(status_code=400, detail="No fields to update")
                values.append(item_id)
                await cur.execute(f"UPDATE joined_statuses SET {', '.join(updates)} WHERE id = %s RETURNING id, name, display_order, is_active, created_at", values)
                row = await cur.fetchone()
                await conn.commit()
                if not row: raise HTTPException(status_code=404, detail="Not found")
                return {"id": row[0], "name": row[1], "display_order": row[2], "is_active": row[3], "created_at": row[4].isoformat() if row[4] else None}
    except HTTPException: raise
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.delete("/joined-statuses/{item_id}")
async def delete_joined_status(item_id: int):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM joined_statuses WHERE id = %s", (item_id,))
                await conn.commit()
                return {"success": True}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


# ==================== READY TO INTERVIEW STATUSES ====================

@router.get("/ready-to-interview-statuses", response_model=List[Dict[str, Any]])
async def get_ready_to_interview_statuses():
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS ready_to_interview_statuses (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        display_order INT DEFAULT 0,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await conn.commit()
                
                await cur.execute("SELECT COUNT(*) FROM ready_to_interview_statuses")
                count = (await cur.fetchone())[0]
                
                if count == 0:
                    for name, order in DEFAULT_READY_TO_INTERVIEW_STATUSES:
                        await cur.execute("INSERT INTO ready_to_interview_statuses (name, display_order, is_active) VALUES (%s, %s, TRUE)", (name, order))
                    await conn.commit()
                
                await cur.execute("SELECT id, name, display_order, is_active, created_at FROM ready_to_interview_statuses ORDER BY display_order, name")
                rows = await cur.fetchall()
                return [{"id": r[0], "name": r[1], "display_order": r[2], "is_active": r[3], "created_at": r[4].isoformat() if r[4] else None} for r in rows]
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.post("/ready-to-interview-statuses", response_model=Dict[str, Any])
async def create_ready_to_interview_status(data: ScreeningStatusCreate):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("INSERT INTO ready_to_interview_statuses (name, display_order, is_active) VALUES (%s, %s, TRUE) RETURNING id, name, display_order, is_active, created_at", (data.name, data.display_order or 0))
                row = await cur.fetchone()
                await conn.commit()
                return {"id": row[0], "name": row[1], "display_order": row[2], "is_active": row[3], "created_at": row[4].isoformat() if row[4] else None}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.put("/ready-to-interview-statuses/{item_id}", response_model=Dict[str, Any])
async def update_ready_to_interview_status(item_id: int, data: ScreeningStatusUpdate):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                updates, values = [], []
                if data.name is not None: updates.append("name = %s"); values.append(data.name)
                if data.display_order is not None: updates.append("display_order = %s"); values.append(data.display_order)
                if data.is_active is not None: updates.append("is_active = %s"); values.append(data.is_active)
                if not updates: raise HTTPException(status_code=400, detail="No fields to update")
                values.append(item_id)
                await cur.execute(f"UPDATE ready_to_interview_statuses SET {', '.join(updates)} WHERE id = %s RETURNING id, name, display_order, is_active, created_at", values)
                row = await cur.fetchone()
                await conn.commit()
                if not row: raise HTTPException(status_code=404, detail="Not found")
                return {"id": row[0], "name": row[1], "display_order": row[2], "is_active": row[3], "created_at": row[4].isoformat() if row[4] else None}
    except HTTPException: raise
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))


@router.delete("/ready-to-interview-statuses/{item_id}")
async def delete_ready_to_interview_status(item_id: int):
    pool = get_async_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM ready_to_interview_statuses WHERE id = %s", (item_id,))
                await conn.commit()
                return {"success": True}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
