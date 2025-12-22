#!/bin/bash

# Start All Services Script for DHI Creative Services
# This script starts the main website, employee portal frontend, and backend

echo "==================================="
echo "DHI Creative Services - Starting All Services"
echo "==================================="

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Kill any existing processes on the ports
echo "Checking for existing processes..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null

sleep 2

# Start Main Website (Port 8080)
echo ""
echo "1. Starting Main Website on http://localhost:8080..."
cd "$(dirname "$0")"
npm run dev > logs/main-website.log 2>&1 &
MAIN_PID=$!
echo "Main Website PID: $MAIN_PID"

# Start Employee Portal Frontend (Port 8081)
echo ""
echo "2. Starting Employee Portal Frontend on http://localhost:8081..."
cd Employee_Portal/ats-frontend
npm run dev > ../../logs/employee-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Employee Portal Frontend PID: $FRONTEND_PID"

# Start Employee Portal Backend (Port 8000)
echo ""
echo "3. Starting Employee Portal Backend on http://localhost:8000..."
cd ../ats-backend
source venv/bin/activate 2>/dev/null || source env/bin/activate 2>/dev/null || echo "No virtual environment found, using system Python"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../../logs/employee-backend.log 2>&1 &
BACKEND_PID=$!
echo "Employee Portal Backend PID: $BACKEND_PID"

cd ../..

# Create logs directory if it doesn't exist
mkdir -p logs

# Save PIDs to file for later stopping
echo $MAIN_PID > logs/main.pid
echo $FRONTEND_PID > logs/frontend.pid
echo $BACKEND_PID > logs/backend.pid

echo ""
echo "==================================="
echo "All Services Started Successfully!"
echo "==================================="
echo ""
echo "Main Website:           http://localhost:8080"
echo "Employee Portal:        http://localhost:8081"
echo "Backend API:            http://localhost:8000"
echo "API Documentation:      http://localhost:8000/docs"
echo ""
echo "To stop all services, run: ./stop-all.sh"
echo "To view logs: tail -f logs/*.log"
echo ""
echo "Process IDs saved to logs/ directory"
echo "==================================="

# Wait for user input
echo ""
echo "Press Ctrl+C to stop all services..."
wait
