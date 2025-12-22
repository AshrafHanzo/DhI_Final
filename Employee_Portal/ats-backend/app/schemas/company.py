from pydantic import BaseModel
from datetime import datetime

class CompanyCreate(BaseModel):
    name: str
    address: str
    city: str
    pincode: str


class CompanyOut(BaseModel):
    id: int
    name: str
    address: str
    city: str
    pincode: str
    created_at: datetime  # <-- FIX: accept datetime type

    model_config = {
        "from_attributes": True
    }
