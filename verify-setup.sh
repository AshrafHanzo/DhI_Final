#!/bin/bash

# Setup Verification Script for DHI Creative Services

echo "==================================="
echo "DHI Creative Services - Setup Verification"
echo "==================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $2 is missing"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $2 is missing"
        return 1
    fi
}

echo ""
echo "1. Checking Required Tools..."
echo "-----------------------------------"
check_command node
check_command npm
check_command python3
check_command pip3

echo ""
echo "2. Checking Main Website..."
echo "-----------------------------------"
check_directory "node_modules" "Main website node_modules"
check_file "package.json" "Main website package.json"
check_file "vite.config.ts" "Main website vite.config.ts"

echo ""
echo "3. Checking Employee Portal Frontend..."
echo "-----------------------------------"
check_directory "Employee_Portal/ats-frontend/node_modules" "Employee Portal node_modules"
check_file "Employee_Portal/ats-frontend/package.json" "Employee Portal package.json"
check_file "Employee_Portal/ats-frontend/vite.config.ts" "Employee Portal vite.config.ts"
check_file "Employee_Portal/ats-frontend/.env" "Employee Portal .env"

echo ""
echo "4. Checking Employee Portal Backend..."
echo "-----------------------------------"
check_directory "Employee_Portal/ats-backend/venv" "Python virtual environment"
check_file "Employee_Portal/ats-backend/requirements.txt" "Backend requirements.txt"
check_file "Employee_Portal/ats-backend/app/main.py" "Backend main.py"

echo ""
echo "5. Checking Port Availability..."
echo "-----------------------------------"

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}✗${NC} Port $1 is in use"
        echo "  Process: $(lsof -Pi :$1 -sTCP:LISTEN | tail -n 1)"
        return 1
    else
        echo -e "${GREEN}✓${NC} Port $1 is available"
        return 0
    fi
}

check_port 8080
check_port 8081
check_port 8000

echo ""
echo "6. Checking Startup Scripts..."
echo "-----------------------------------"
check_file "start-all.sh" "Start script"
check_file "stop-all.sh" "Stop script"

if [ -x "start-all.sh" ]; then
    echo -e "${GREEN}✓${NC} start-all.sh is executable"
else
    echo -e "${RED}✗${NC} start-all.sh is not executable"
    echo "  Run: chmod +x start-all.sh"
fi

if [ -x "stop-all.sh" ]; then
    echo -e "${GREEN}✓${NC} stop-all.sh is executable"
else
    echo -e "${RED}✗${NC} stop-all.sh is not executable"
    echo "  Run: chmod +x stop-all.sh"
fi

echo ""
echo "==================================="
echo "Verification Complete!"
echo "==================================="
echo ""
echo "If all checks passed, you can start all services with:"
echo "  ./start-all.sh"
echo ""
