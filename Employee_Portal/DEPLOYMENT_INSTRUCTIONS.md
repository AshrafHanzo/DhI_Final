# ATS Deployment on dhicreativeservices.com

## Two Deployment Options

### Option 1: Subdomain (RECOMMENDED) ⭐
**URL**: `https://ats.dhicreativeservices.com`

**Advantages:**
- Clean URL structure
- No code changes needed
- Easy to manage
- Independent from main site

**Steps:**

1. **Configure DNS** (in your domain provider):
   ```
   Type: A Record
   Name: ats
   Value: [Your Server IP]
   TTL: 3600
   ```

2. **Copy nginx config**:
   ```bash
   sudo cp nginx-config-subdomain.conf /etc/nginx/sites-available/ats.dhicreativeservices.com
   sudo ln -s /etc/nginx/sites-available/ats.dhicreativeservices.com /etc/nginx/sites-enabled/
   ```

3. **Get SSL certificate**:
   ```bash
   sudo certbot --nginx -d ats.dhicreativeservices.com
   ```

4. **Update frontend .env**:
   ```bash
   VITE_API_URL=https://ats.dhicreativeservices.com
   ```

5. **Build and deploy**:
   ```bash
   cd /Users/sadam/Downloads/ATS
   ./deploy-production.sh
   # Enter: https://ats.dhicreativeservices.com
   ```

6. **Copy files to server**:
   ```bash
   # Copy frontend
   scp -r ats-frontend/dist/* user@server:/var/www/ats-frontend/dist/
   
   # Copy backend
   scp -r ats-backend/* user@server:/var/www/ats-backend/
   ```

7. **Start backend on server**:
   ```bash
   cd /var/www/ats-backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

8. **Restart nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

### Option 2: Subpath
**URL**: `https://dhicreativeservices.com/ats`

**Advantages:**
- Same domain
- No DNS changes

**Disadvantages:**
- Requires code changes
- More complex routing

**Steps:**

1. **Update vite.config.ts**:
   ```typescript
   export default defineConfig({
     base: '/ats/',
     // ... rest of config
   })
   ```

2. **Update main.tsx** (Add basename to Router):
   ```typescript
   <BrowserRouter basename="/ats">
     <App />
   </BrowserRouter>
   ```

3. **Update frontend .env**:
   ```bash
   VITE_API_URL=https://dhicreativeservices.com/ats
   ```

4. **Build**:
   ```bash
   cd ats-frontend
   npm run build
   ```

5. **Add to existing nginx config**:
   ```bash
   sudo nano /etc/nginx/sites-available/dhicreativeservices.com
   # Paste content from nginx-config-subpath.conf
   ```

6. **Copy files and restart**:
   ```bash
   scp -r ats-frontend/dist/* user@server:/var/www/ats-frontend/dist/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Port 8000 in Docker - No Conflict!

**Your concern**: Port 8000 is already used in Docker

**Answer**: No problem! Here's why:

```
Internet → Nginx (Port 443 HTTPS) → localhost:8000 (Docker - Internal Only)
```

- **Port 443/80** is what users access (handled by nginx)
- **Port 8000** stays internal on the server (localhost only)
- Docker container exposes port 8000 only to localhost, not to internet
- Multiple Docker containers can use same internal ports if mapped differently

**If you have Docker container already on port 8000:**

You can use a different port for ATS backend:

```bash
# Run ATS backend on port 8001 instead
uvicorn app.main:app --host 0.0.0.0 --port 8001

# Update nginx config:
location /api/ {
    proxy_pass http://localhost:8001;  # Changed from 8000 to 8001
}
```

---

## Testing After Deployment

1. **Check DNS** (if using subdomain):
   ```bash
   nslookup ats.dhicreativeservices.com
   ```

2. **Test backend API**:
   ```bash
   curl https://ats.dhicreativeservices.com/api/jobs/
   ```

3. **Test frontend**:
   - Open browser: `https://ats.dhicreativeservices.com`
   - Click login button
   - Verify login works

4. **Check nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/ats-access.log
   sudo tail -f /var/log/nginx/ats-error.log
   ```

---

## Recommended Choice

**Use Option 1 (Subdomain)** - It's cleaner and requires no code changes!

Just add DNS record and follow the steps above.
