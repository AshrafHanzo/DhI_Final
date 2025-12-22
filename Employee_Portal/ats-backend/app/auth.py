# app/auth.py

import time
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from app.db import fetch_one

SECRET_KEY = "supersecretkey123"  # change later
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 3600 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")


# --------------------------
# CREATE JWT TOKEN
# --------------------------
def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = time.time() + ACCESS_TOKEN_EXPIRE_SECONDS
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# --------------------------
# DECODE JWT TOKEN
# --------------------------
def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# --------------------------
# GET CURRENT USER
# --------------------------
async def get_current_user(token: str = Depends(oauth2_scheme)):

    payload = decode_token(token)

    user_id: Optional[int] = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    sql = """SELECT id, name, email, role, is_active 
             FROM users WHERE id = $1"""

    user = await fetch_one(sql, [user_id])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
