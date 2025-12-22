from fastapi import APIRouter, HTTPException
from app.schemas.company import CompanyCreate, CompanyOut
from app.db import fetch_all, fetch_one, execute

router = APIRouter(tags=["Companies"])


# --------------------------
# CREATE COMPANY
# --------------------------
@router.post("/", response_model=CompanyOut)
async def create_company(data: CompanyCreate):

    # Check duplicate
    exists = await fetch_one(
        "SELECT id FROM companies WHERE name = %s",
        [data.name]
    )

    if exists:
        raise HTTPException(status_code=400, detail="Company already exists")

    sql = """
        INSERT INTO companies (name, address, city, pincode)
        VALUES (%s, %s, %s, %s)
        RETURNING id, name, address, city, pincode, created_at
    """

    row = await fetch_one(sql, [
        data.name,
        data.address,
        data.city,
        data.pincode
    ])

    return row


# --------------------------
# LIST ALL COMPANIES
# --------------------------
@router.get("/", response_model=list[CompanyOut])
async def list_companies():

    sql = """
        SELECT id, name, address, city, pincode, created_at
        FROM companies
        ORDER BY id DESC
    """

    return await fetch_all(sql)


# --------------------------
# GET ONE COMPANY
# --------------------------
@router.get("/{company_id}", response_model=CompanyOut)
async def get_company(company_id: int):

    sql = """
        SELECT id, name, address, city, pincode, created_at
        FROM companies
        WHERE id = %s
    """

    row = await fetch_one(sql, [company_id])

    if not row:
        raise HTTPException(status_code=404, detail="Company not found")

    return row
