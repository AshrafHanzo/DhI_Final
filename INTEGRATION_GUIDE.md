# DHI Creative Services - Integration Setup

## Services Configuration

### Main Website
- **Port**: 8080
- **URL**: http://localhost:8080
- **Technology**: React + Vite
- **Purpose**: Public-facing DHI Creative Services website

### Employee Portal (ATS System)
- **Frontend Port**: 8081
- **Backend Port**: 8000
- **Frontend URL**: http://localhost:8081
- **Backend URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Technology**: React + Vite (frontend), FastAPI (backend)
- **Purpose**: Internal Applicant Tracking System

## Quick Start

### Start All Services
```bash
./start-all.sh
```

This starts:
1. Main website on port 8080
2. Employee portal frontend on port 8081
3. Employee portal backend API on port 8000

### Stop All Services
```bash
./stop-all.sh
```

### View Logs
```bash
tail -f logs/*.log
```

## Employee Portal Access

Click the "Employee Login" button in the main website header to access the employee portal at http://localhost:8081.

## Backend Setup (First Time)

### 1. Create Python Virtual Environment
```bash
cd Employee_Portal/ats-backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup
```bash
# Run migrations
python run_migration.py
```

## Production Deployment

For production deployment with nginx, see:
- `Employee_Portal/DEPLOYMENT_INSTRUCTIONS.md`
- `Employee_Portal/nginx-config-subpath.conf` for /ats routing

## Environment Variables

### Employee Portal Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Employee Portal Backend
- Database configuration in `ats-backend/app/database.py`
- Upload paths in `ats-backend/app/config.py`

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on specific ports
lsof -ti:8080 | xargs kill -9
lsof -ti:8081 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Check Running Processes
```bash
lsof -i :8080
lsof -i :8081
lsof -i :8000
```

### Logs Not Showing
Logs are saved to `logs/` directory:
- `main-website.log`
- `employee-frontend.log`
- `employee-backend.log`
