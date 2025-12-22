# app/routes/users.py

from fastapi import APIRouter, HTTPException
from app.schemas.users import UserCreate, UserLogin, UserOut
from app.db import fetch_all, fetch_one, execute
from app.email_utils import send_password_reset_email

import hashlib
import secrets
from datetime import datetime, timedelta

router = APIRouter(tags=["Users"])

def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


# CREATE USER
@router.post("/", response_model=UserOut)
async def create_user(data: UserCreate):

    # Check if email exists
    exists = await fetch_one(
        "SELECT id FROM users WHERE email = %s LIMIT 1",
        [data.email]
    )
    if exists:
        raise HTTPException(status_code=400, detail="Email already exists")

    sql = """
        INSERT INTO users (name, email, password_hash, role, is_active)
        VALUES (%s, %s, %s, %s, TRUE)
        RETURNING id, name, email, role, is_active
    """

    hashed = hash_password(data.password)

    row = await fetch_one(sql, [data.name, data.email, hashed, data.role])
    return row


# LOGIN
@router.post("/login")
async def login(data: UserLogin):

    sql = """
        SELECT id, name, email, password_hash, role, is_active
        FROM users
        WHERE email = %s
        LIMIT 1
    """

    user = await fetch_one(sql, [data.email])

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if user["password_hash"] != hash_password(data.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }


# LIST USERS
@router.get("/", response_model=list[UserOut])
async def list_users():

    sql = """
        SELECT id, name, email, role, is_active
        FROM users
        ORDER BY id DESC
    """

    return await fetch_all(sql)


# FORGOT PASSWORD - Request password reset
@router.post("/forgot-password")
async def forgot_password(data: dict):
    email = data.get("email", "").strip().lower()
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # Check if user exists
    user = await fetch_one(
        "SELECT id, email FROM users WHERE LOWER(email) = %s LIMIT 1",
        [email]
    )
    
    if not user:
        # For security, don't reveal if email exists or not
        return {"message": "If this email exists, a password reset link has been sent."}
    
    # Generate a secure reset token
    reset_token = secrets.token_urlsafe(32)
    expiry_time = datetime.now() + timedelta(hours=1)
    
    # Store token in database
    await execute(
        """UPDATE users 
           SET reset_token = %s, reset_token_expiry = %s 
           WHERE id = %s""",
        [reset_token, expiry_time, user["id"]]
    )
    
    # Send reset email
    email_sent = send_password_reset_email(user["email"], reset_token)
    
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send reset email. Please try again.")
    
    return {"message": "If this email exists, a password reset link has been sent."}


# RESET PASSWORD - Set new password using token
@router.post("/reset-password")
async def reset_password(data: dict):
    token = data.get("token", "").strip()
    new_password = data.get("password", "").strip()
    
    if not token:
        raise HTTPException(status_code=400, detail="Reset token is required")
    
    if not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Find user with this token
    user = await fetch_one(
        """SELECT id, email, reset_token_expiry 
           FROM users 
           WHERE reset_token = %s 
           LIMIT 1""",
        [token]
    )
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token is expired
    if user["reset_token_expiry"] and user["reset_token_expiry"] < datetime.now():
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")
    
    # Update password and clear token
    hashed = hash_password(new_password)
    await execute(
        """UPDATE users 
           SET password_hash = %s, reset_token = NULL, reset_token_expiry = NULL 
           WHERE id = %s""",
        [hashed, user["id"]]
    )
    
    return {"message": "Password has been reset successfully. You can now login with your new password."}

