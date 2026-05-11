# app/db.py
import os
import psycopg
from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row
from typing import Any, Dict, List, Optional, Union

# ---------- Environment ----------
PG_HOST = os.getenv("PGHOST", "103.14.123.44")
PG_PORT = os.getenv("PGPORT", "5432")
PG_DB   = os.getenv("PGDATABASE", "dhi")
PG_USER = os.getenv("PGUSER", "sql_developer")
PG_PASS = os.getenv("PGPASSWORD", "Dev@123")
PG_SCHEMA = os.getenv("PGSCHEMA", "dhi")
PG_SSLMODE = os.getenv("PGSSLMODE", "disable")

DSN = (
    f"host={PG_HOST} port={PG_PORT} dbname={PG_DB} "
    f"user={PG_USER} password={PG_PASS} sslmode={PG_SSLMODE} "
    f"connect_timeout=10"
)

print(f"[DB] host={PG_HOST} port={PG_PORT} db={PG_DB} user={PG_USER} schema={PG_SCHEMA}")

# ---------- Async Pool ----------
async_pool: Optional[AsyncConnectionPool] = None

def get_async_pool():
    global async_pool
    if async_pool is None:
        async_pool = AsyncConnectionPool(
            conninfo=DSN,
            min_size=2,
            max_size=20,
            timeout=30.0,
            max_waiting=10,
            open=True
        )
    return async_pool


async def close_async_pool():
    global async_pool
    if async_pool:
        await async_pool.close()
        async_pool = None


# ---------- Internal helper ----------
def schema_sql() -> str:
    return f"SET search_path TO {PG_SCHEMA}, public;"


# ---------- Core Async Query ----------
async def async_query(sql: str, params=None) -> List[Dict[str, Any]]:
    pool = get_async_pool()

    async with pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(schema_sql())
            if params:
                await cur.execute(sql, params)
            else:
                await cur.execute(sql)

            rows = await cur.fetchall()
            return rows


async def async_exec(sql: str, params=None) -> int:
    pool = get_async_pool()

    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute(schema_sql())
            if params:
                await cur.execute(sql, params)
            else:
                await cur.execute(sql)

            return cur.rowcount


# ---------- SIMPLE HELPERS USED BY ROUTES ----------
async def fetch_all(sql: str, params=None):
    return await async_query(sql, params)

async def execute(sql: str, params=None):
    return await async_exec(sql, params)

# ---------- GET ONE ROW ----------
async def fetch_one(sql: str, params=None):
    rows = await async_query(sql, params)
    if rows:
        return rows[0]
    return None


# ---------- Health Check ----------
def ping() -> bool:
    try:
        with psycopg.connect(DSN) as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute("SELECT 1 AS ok;")
                row = cur.fetchone()
                return bool(row and row.get("ok") == 1)
    except Exception:
        return False
