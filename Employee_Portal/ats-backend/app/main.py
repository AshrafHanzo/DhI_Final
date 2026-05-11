#app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import ping, get_async_pool, close_async_pool

from app.routes.users import router as users_router
from app.routes.companies import router as companies_router
from app.routes.jobs import router as jobs_router
from app.routes.candidates import router as candidates_router
from app.routes.applications import router as applications_router
from app.routes.dashboard import router as dashboard_router
from app.routes.masters import router as masters_router
from app.routes.admin import router as admin_router
from fastapi.staticfiles import StaticFiles

from fastapi import Request
from fastapi.responses import JSONResponse


async def log_request(request: Request, call_next):
    try:
        # Read body (makes a copy)
        body = await request.body()
        print("\n===== Incoming Request =====")
        print(f"URL: {request.url}")
        print(f"Method: {request.method}")
        print(f"Headers: {request.headers}")
        print(f"Body: {body.decode('utf-8', errors='ignore')}")
        print("============================\n")
    except Exception as e:
        print("Error reading request body:", e)

    response = await call_next(request)
    return response




app = FastAPI(
    title="ATS Backend API",
    version="1.0.0",
    description="Recruitment ATS Backend by WorkBooster AI Solutions.",
    openapi_tags=[
        {"name": "Users", "description": "Manage users & login"},
        {"name": "Companies", "description": "Client companies"},
        {"name": "Jobs", "description": "Job postings"},
        {"name": "Candidates", "description": "Candidate database"},
        {"name": "Applications", "description": "Job applications & pipeline"},
        {"name": "Dashboard", "description": "ATS analytics & summary"},
        {"name": "Masters", "description": "Master data management"},
        {"name": "Admin", "description": "Admin settings & configuration"},
    ]
)

# ---------------------------
# CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dhicreativeservices.com",
        "https://www.dhicreativeservices.com",
        "https://portal.dhicreativeservices.com",
        "https://api.dhicreativeservices.com",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# ROUTERS
# ---------------------------
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(companies_router, prefix="/api/companies", tags=["Companies"])
app.include_router(jobs_router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(candidates_router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(applications_router, prefix="/api/applications", tags=["Applications"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(masters_router, prefix="/api/masters", tags=["Masters"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
# Mount the uploads directory from Employee_Portal/uploads - use absolute path
import os
UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Request logging middleware REMOVED - it was consuming the body stream
# and causing POST requests to hang. Do not add body reading middleware.

# ---------------------------
# STARTUP
# ---------------------------
@app.on_event("startup")
async def startup_event():
    pool = get_async_pool()
    if pool.closed:
        await pool.open()

    print("🚀 ATS Backend started successfully")


# ---------------------------
# SHUTDOWN
# ---------------------------
@app.on_event("shutdown")
async def shutdown_event():
    await close_async_pool()
    print("🛑 ATS Backend stopped")


# ---------------------------
# HEALTH CHECK
# ---------------------------
@app.get("/health", include_in_schema=False)
def health():
    return {"ok": ping()}


# ---------------------------
# ROOT
# ---------------------------
@app.get("/", include_in_schema=False)
def root():
    return {"service": "ATS Backend", "status": "running"}
