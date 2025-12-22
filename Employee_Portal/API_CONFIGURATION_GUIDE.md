# API Configuration Guide

## Overview
The ATS application now uses centralized API configuration. All API calls are routed through `/src/config/api.ts`.

## Local Development

1. The default configuration in `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

2. The application will use `http://localhost:8000` as the API base URL.

## Production Deployment

### Option 1: Using Environment Variables (Recommended)

1. **On your server**, set the environment variable before building:
   ```bash
   export VITE_API_URL=https://your-domain.com
   # or
   export VITE_API_URL=http://your-server-ip:8000
   ```

2. **Build the frontend**:
   ```bash
   cd ats-frontend
   npm run build
   # or
   bun run build
   ```

3. The built files in `dist/` will use your production API URL.

### Option 2: Update .env File

1. Edit `/ats-frontend/.env`:
   ```env
   VITE_API_URL=https://your-api-domain.com
   ```

2. Build the application:
   ```bash
   npm run build
   ```

### Option 3: Runtime Configuration (For Docker/Cloud)

Create `.env.production` file:
```env
VITE_API_URL=https://api.yourcompany.com
```

Then build with:
```bash
npm run build --mode production
```

## Configuration Files

### `/ats-frontend/src/config/api.ts`
This is the central configuration file that exports:
- `API_BASE_URL`: The base URL for all API calls
- `API_ENDPOINTS`: Object containing all API endpoint paths
- `buildApiUrl()`: Helper function to build URLs with IDs

### How It Works

```typescript
// Old way (hardcoded):
fetch('http://localhost:8000/api/candidates/')

// New way (configurable):
import { API_ENDPOINTS } from '@/config/api';
fetch(API_ENDPOINTS.CANDIDATES)
```

## Deployment Scenarios

### Scenario 1: Same Server (Frontend + Backend)
```env
VITE_API_URL=http://localhost:8000
```

### Scenario 2: Different Servers
```env
# Frontend on: https://ats.yourcompany.com
# Backend on: https://api.yourcompany.com
VITE_API_URL=https://api.yourcompany.com
```

### Scenario 3: IP-based Deployment
```env
VITE_API_URL=http://192.168.1.100:8000
```

### Scenario 4: Cloud Deployment (AWS/Azure/GCP)
```env
VITE_API_URL=https://ats-api.us-east-1.elb.amazonaws.com
```

## Testing the Configuration

1. Build the app:
   ```bash
   npm run build
   ```

2. Check the built files:
   ```bash
   grep -r "localhost" dist/assets/*.js
   ```
   - Should show NO results if properly configured

3. Test API calls:
   - Open browser console
   - Check Network tab
   - All API calls should go to your configured URL

## Troubleshooting

### Issue: Still seeing localhost in production
**Solution**: Rebuild the application after changing `.env`:
```bash
rm -rf dist/
npm run build
```

### Issue: CORS errors in production
**Solution**: Update backend CORS settings in `/ats-backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Update this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Environment variable not working
**Solution**: Ensure variable starts with `VITE_`:
- ✅ `VITE_API_URL`
- ❌ `API_URL` (won't work with Vite)

## Quick Deployment Commands

```bash
# For local access from other devices on network
export VITE_API_URL=http://$(hostname -I | awk '{print $1}'):8000
npm run build

# For production server
export VITE_API_URL=https://api.production.com
npm run build

# For staging server  
export VITE_API_URL=https://api.staging.com
npm run build
```

## Files Modified

All `localhost:8000` references have been replaced in:
- `/src/contexts/DataContext.tsx`
- `/src/contexts/AuthContext.tsx`
- `/src/pages/AddCandidate.tsx`
- `/src/pages/AddApplication.tsx`
- `/src/pages/Applications.tsx`
- `/src/pages/Screening.tsx`
- `/src/pages/Interview.tsx`
- `/src/pages/ReadyToInterview.tsx`
- `/src/pages/SelectedCandidates.tsx`
- `/src/pages/Joined.tsx`
- `/src/pages/Candidates.tsx`
- `/src/pages/Jobs.tsx`
- `/src/pages/JobDetail.tsx`
- `/src/pages/ApplicationDetail.tsx`
- `/src/pages/CandidateDetail.tsx`

All files now import and use centralized API configuration.
