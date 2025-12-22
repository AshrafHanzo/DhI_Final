#!/bin/bash

# ATS Production Deployment Script
# This script prepares the application for production deployment

set -e  # Exit on error

echo "=========================================="
echo "ATS Production Deployment Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get server details
read -p "Enter your production server URL (e.g., http://192.168.1.100:8000 or https://api.yourdomain.com): " SERVER_URL

if [ -z "$SERVER_URL" ]; then
    echo -e "${RED}Error: Server URL cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Updating frontend configuration...${NC}"
cd "$(dirname "$0")/ats-frontend"

# Update .env file
cat > .env << EOF
# Backend API URL - Production
VITE_API_URL=${SERVER_URL}
EOF

echo -e "${GREEN}✓ Frontend .env updated with: ${SERVER_URL}${NC}"

echo ""
echo -e "${YELLOW}Step 2: Building frontend for production...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Verifying build...${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Build directory exists${NC}"
    echo "  Build size: $(du -sh dist | cut -f1)"
else
    echo -e "${RED}✗ Build directory not found${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Production Build Complete!${NC}"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. BACKEND DEPLOYMENT:"
echo "   - Copy 'ats-backend' folder to your server"
echo "   - Install Python dependencies: pip install -r requirements.txt"
echo "   - Update database credentials in environment variables"
echo "   - Run: uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo ""
echo "2. FRONTEND DEPLOYMENT:"
echo "   - Copy 'ats-frontend/dist' folder to your web server"
echo "   - Configure web server (nginx/apache) to serve the dist folder"
echo "   - Ensure all routes redirect to index.html (for SPA routing)"
echo ""
echo "3. DATABASE ACCESS:"
echo "   - Ensure server can access database at: 103.14.123.44:30018"
echo "   - Or update database credentials for production database"
echo ""
echo "4. TESTING:"
echo "   - Access frontend at your server URL"
echo "   - Test login functionality"
echo "   - Verify all API calls work correctly"
echo ""
echo "Configuration Details:"
echo "  API URL: ${SERVER_URL}"
echo "  Frontend Build: $(pwd)/dist"
echo "  Backend Path: $(dirname $(pwd))/ats-backend"
echo ""
echo "=========================================="
