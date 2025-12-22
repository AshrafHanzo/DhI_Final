#!/bin/bash

# ATS System Test Script
echo "======================================"
echo "   ATS System Health Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo -n "Checking Backend (Port 8000)... "
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    BACKEND_STATUS=1
else
    echo -e "${RED}✗ Not Running${NC}"
    BACKEND_STATUS=0
fi

# Check if frontend is running
echo -n "Checking Frontend (Port 5173)... "
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    FRONTEND_STATUS=1
else
    echo -e "${RED}✗ Not Running${NC}"
    FRONTEND_STATUS=0
fi

echo ""
echo "======================================"
echo "   API Endpoints Test"
echo "======================================"
echo ""

if [ $BACKEND_STATUS -eq 1 ]; then
    # Test jobs endpoint
    echo -n "Testing /api/jobs/... "
    JOBS_RESPONSE=$(curl -s http://localhost:8000/api/jobs/)
    if [ $? -eq 0 ]; then
        JOBS_COUNT=$(echo $JOBS_RESPONSE | grep -o '"id"' | wc -l)
        echo -e "${GREEN}✓ OK (Found $JOBS_COUNT jobs)${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi

    # Test candidates endpoint
    echo -n "Testing /api/candidates/... "
    CANDIDATES_RESPONSE=$(curl -s http://localhost:8000/api/candidates/)
    if [ $? -eq 0 ]; then
        CANDIDATES_COUNT=$(echo $CANDIDATES_RESPONSE | grep -o '"id"' | wc -l)
        echo -e "${GREEN}✓ OK (Found $CANDIDATES_COUNT candidates)${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi

    # Test applications endpoint
    echo -n "Testing /api/applications/... "
    APPS_RESPONSE=$(curl -s http://localhost:8000/api/applications/)
    if [ $? -eq 0 ]; then
        APPS_COUNT=$(echo $APPS_RESPONSE | grep -o '"id"' | wc -l)
        echo -e "${GREEN}✓ OK (Found $APPS_COUNT applications)${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi

    # Test dashboard endpoint
    echo -n "Testing /api/dashboard/... "
    DASHBOARD_RESPONSE=$(curl -s http://localhost:8000/api/dashboard/)
    if echo $DASHBOARD_RESPONSE | grep -q "total_jobs"; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Backend not running. Start with: uvicorn app.main:app --reload${NC}"
fi

echo ""
echo "======================================"
echo "   Summary"
echo "======================================"
echo ""

if [ $BACKEND_STATUS -eq 1 ] && [ $FRONTEND_STATUS -eq 1 ]; then
    echo -e "${GREEN}✓ All systems operational!${NC}"
    echo ""
    echo "Access your ATS:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:8000/docs"
elif [ $BACKEND_STATUS -eq 1 ]; then
    echo -e "${YELLOW}⚠ Backend is running, but frontend is not.${NC}"
    echo ""
    echo "Start frontend with:"
    echo "  cd ats-frontend && npm run dev"
elif [ $FRONTEND_STATUS -eq 1 ]; then
    echo -e "${YELLOW}⚠ Frontend is running, but backend is not.${NC}"
    echo ""
    echo "Start backend with:"
    echo "  cd ats-backend && uvicorn app.main:app --reload"
else
    echo -e "${RED}✗ Both services are down.${NC}"
    echo ""
    echo "Start services:"
    echo "  Terminal 1: cd ats-backend && uvicorn app.main:app --reload"
    echo "  Terminal 2: cd ats-frontend && npm run dev"
fi

echo ""
