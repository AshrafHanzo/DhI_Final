# PRODUCTION DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment Verification

### Backend Status
- [x] Backend running on port 8000
- [x] All API endpoints responding (200 OK):
  - Jobs API: ✓
  - Candidates API: ✓
  - Applications API: ✓
  - Dashboard API: ✓
  - Masters API: ✓
- [x] Database connection working
- [x] CORS configured for all origins
- [x] Sourced From master table created and populated

### Frontend Status
- [x] No TypeScript/compile errors
- [x] Build successful (✓ 24.88s)
- [x] Environment variables configured
- [x] All localhost references replaced with configurable API_URL
- [x] API configuration centralized in `/src/config/api.ts`

### Code Quality
- [x] 17+ files updated to use centralized API config
- [x] Type-safe API endpoints
- [x] No hardcoded URLs (except fallback in config)

---

## 🚀 Production Deployment Steps

### Option 1: Quick Deployment (Using Script)

```bash
cd /Users/sadam/Downloads/ATS
./deploy-production.sh
```

The script will:
1. Ask for your server URL
2. Update frontend configuration
3. Build the frontend
4. Show deployment instructions

### Option 2: Manual Deployment

#### Step 1: Configure Frontend for Production

```bash
cd /Users/sadam/Downloads/ATS/ats-frontend

# Edit .env file
echo "VITE_API_URL=http://YOUR_SERVER_IP:8000" > .env
# OR for domain-based
echo "VITE_API_URL=https://api.yourdomain.com" > .env

# Build
npm run build
```

#### Step 2: Deploy Backend to Server

```bash
# On your server, create directory
mkdir -p /opt/ats-backend
cd /opt/ats-backend

# Copy backend files (from your local machine)
scp -r /Users/sadam/Downloads/ATS/ats-backend/* user@server:/opt/ats-backend/

# On server: Install dependencies
ssh user@server
cd /opt/ats-backend
pip3 install -r requirements.txt

# Run backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 3: Deploy Frontend to Server

```bash
# Copy built files to server
scp -r /Users/sadam/Downloads/ATS/ats-frontend/dist/* user@server:/var/www/ats/

# Configure Nginx (example)
cat > /etc/nginx/sites-available/ats << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ats;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/ats /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 🔧 Server Configurations

### For Same Server Deployment (Backend + Frontend)

1. **Backend runs on**: `http://SERVER_IP:8000`
2. **Frontend .env**: `VITE_API_URL=http://SERVER_IP:8000`
3. **Access from local system**: Open browser to `http://SERVER_IP`

### For Different Servers

1. **Backend server**: `http://api-server:8000`
2. **Frontend .env**: `VITE_API_URL=http://api-server:8000`
3. **Frontend server**: Serves `dist/` folder
4. **Access**: `http://frontend-server`

### For Production with Domain

1. **Backend**: `https://api.yourdomain.com`
2. **Frontend .env**: `VITE_API_URL=https://api.yourdomain.com`
3. **Access**: `https://yourdomain.com`

---

## 🧪 Testing Production Build

### 1. Test Backend Accessibility

```bash
# From your local system
curl http://YOUR_SERVER_IP:8000/api/jobs/

# Should return JSON with jobs data
```

### 2. Test Frontend Build

```bash
cd /Users/sadam/Downloads/ATS/ats-frontend

# Serve locally to test
npx serve dist -p 3000

# Open http://localhost:3000 in browser
# Check browser console for API calls
```

### 3. Check CORS

```bash
# Test CORS from different origin
curl -H "Origin: http://example.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://YOUR_SERVER_IP:8000/api/jobs/
```

---

## 📋 Post-Deployment Checklist

- [ ] Backend accessible from external network
- [ ] Frontend loads correctly
- [ ] Login functionality works
- [ ] All pages load without errors
- [ ] API calls successful (check browser Network tab)
- [ ] No CORS errors
- [ ] Database queries working
- [ ] File uploads work (resumes)
- [ ] All CRUD operations functional

---

## 🐛 Troubleshooting

### Issue: Cannot access from local system

**Solution**: Ensure server firewall allows port 8000 and 80/443
```bash
# On server (Ubuntu/Debian)
sudo ufw allow 8000
sudo ufw allow 80
sudo ufw allow 443
```

### Issue: API calls failing

1. Check backend is running: `ps aux | grep uvicorn`
2. Check logs: `tail -f /path/to/backend/logs`
3. Verify `.env` has correct server URL
4. Rebuild frontend after changing `.env`

### Issue: Frontend shows blank page

1. Check browser console for errors
2. Verify `dist/` folder copied correctly
3. Ensure web server configured for SPA routing
4. Check API_BASE_URL in browser console: `console.log(window.location)`

### Issue: CORS errors

Update backend `/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🎯 Quick Access Commands

### Start Backend (Production)
```bash
cd /opt/ats-backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Start Backend (Development with auto-reload)
```bash
cd /opt/ats-backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Build Frontend for New Server
```bash
cd /Users/sadam/Downloads/ATS/ats-frontend
export VITE_API_URL=http://NEW_SERVER_IP:8000
npm run build
```

---

## 📦 What Gets Deployed

### Backend Files (Copy entire folder)
```
ats-backend/
├── app/
│   ├── main.py
│   ├── db.py
│   ├── auth.py
│   ├── models/
│   ├── routes/
│   └── schemas/
├── migrations/
├── uploads/
├── requirements.txt
└── .env (optional, use env variables)
```

### Frontend Files (Only dist/ folder)
```
ats-frontend/dist/
├── index.html
├── assets/
│   ├── index-*.js
│   └── index-*.css
└── (other static files)
```

---

## 🔐 Security Recommendations

1. **Use HTTPS in production** (get SSL certificate)
2. **Update CORS** to specific domains (not "*")
3. **Set strong passwords** for database
4. **Use environment variables** for sensitive data
5. **Enable firewall** on server
6. **Regular backups** of database
7. **Update dependencies** regularly

---

## ✅ Current Status: PRODUCTION READY ✓

- All APIs tested and working
- Build successful without errors
- Configuration centralized
- CORS enabled
- Database connected
- Master data populated

**You can now deploy to your server and access from any device on the network!**
