#!/bin/bash

# Stop All Services Script for DHI Creative Services

echo "==================================="
echo "DHI Creative Services - Stopping All Services"
echo "==================================="

# Read PIDs from files and kill processes
if [ -f logs/main.pid ]; then
    MAIN_PID=$(cat logs/main.pid)
    echo "Stopping Main Website (PID: $MAIN_PID)..."
    kill -9 $MAIN_PID 2>/dev/null
    rm logs/main.pid
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    echo "Stopping Employee Portal Frontend (PID: $FRONTEND_PID)..."
    kill -9 $FRONTEND_PID 2>/dev/null
    rm logs/frontend.pid
fi

if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    echo "Stopping Employee Portal Backend (PID: $BACKEND_PID)..."
    kill -9 $BACKEND_PID 2>/dev/null
    rm logs/backend.pid
fi

# Kill any remaining processes on the ports
echo "Cleaning up ports..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null

echo ""
echo "==================================="
echo "All Services Stopped Successfully!"
echo "==================================="
