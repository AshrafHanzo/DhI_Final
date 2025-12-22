# DHI Consultancy Website Deployment Instructions

## Files Successfully Transferred ✅
All files have been copied to: `/root/DHI_CONSULTANCY/` on server `103.14.123.44`

## Next Steps - Run These Commands on Your Linux Server

### 1. SSH into your server
```bash
ssh -p 2244 root@103.14.123.44
```

### 2. Move files to web directory
```bash
# Create web directory
mkdir -p /var/www/dhi-consultancy

# Move files from root to web directory
mv /root/DHI_CONSULTANCY/* /var/www/dhi-consultancy/

# Set proper permissions
chmod -R 755 /var/www/dhi-consultancy
```

### 3. Create Nginx configuration
```bash
nano /etc/nginx/sites-available/dhi-consultancy.conf
```

### 4. Add this configuration (paste into nano):
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;
    
    root /var/www/dhi-consultancy;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression for better performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```
**Replace `YOUR_DOMAIN.com` with your actual domain name**

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### 5. Enable the site
```bash
ln -s /etc/nginx/sites-available/dhi-consultancy.conf /etc/nginx/sites-enabled/
```

### 6. Test Nginx configuration
```bash
nginx -t
```

### 7. Reload Nginx
```bash
systemctl reload nginx
```

### 8. Check all enabled sites
```bash
ls -la /etc/nginx/sites-enabled/
```

You should now see:
- boostentry-api.conf
- boostentryai.com
- myapp
- dhi-consultancy.conf (NEW)

## Verify Deployment
Visit your domain: `http://YOUR_DOMAIN.com`

## Optional: Add SSL Certificate (HTTPS)
```bash
# Install Certbot if not already installed
apt update
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com
```

## Troubleshooting

### Check Nginx status
```bash
systemctl status nginx
```

### View Nginx error logs
```bash
tail -f /var/log/nginx/error.log
```

### Restart Nginx if needed
```bash
systemctl restart nginx
```

## Server Details
- Server IP: 103.14.123.44
- SSH Port: 2244
- Files Location: /var/www/dhi-consultancy/
- Nginx Config: /etc/nginx/sites-available/dhi-consultancy.conf
