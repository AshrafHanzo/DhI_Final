# app/routes/masters.py
from fastapi import APIRouter, HTTPException
from app.db import fetch_all, execute
from typing import List, Dict, Any

router = APIRouter()

@router.get("/sourced-from")
async def get_sourced_from_options() -> List[Dict[str, Any]]:
    """Get all active sourced from options"""
    sql = """
        SELECT id, source_name, display_order
        FROM sourced_from_master
        WHERE is_active = TRUE
        ORDER BY display_order, source_name
    """
    try:
        rows = await fetch_all(sql)
        return rows
    except Exception as e:
        print(f"Error fetching sourced_from options: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sourced-from")
async def add_sourced_from_option(source_name: str) -> Dict[str, Any]:
    """Add a new sourced from option"""
    sql = """
        INSERT INTO sourced_from_master (source_name, display_order)
        VALUES (%s, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM sourced_from_master))
        RETURNING id, source_name, display_order
    """
    try:
        result = await fetch_all(sql, (source_name,))
        if result:
            return result[0]
        raise HTTPException(status_code=500, detail="Failed to add sourced from option")
    except Exception as e:
        print(f"Error adding sourced_from option: {e}")
        raise HTTPException(status_code=500, detail=str(e))
