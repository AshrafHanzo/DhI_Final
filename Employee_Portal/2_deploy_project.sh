#!/bin/bash
echo "========================================="
echo " Configuring Project (Using /root/ Paths) "
echo "========================================="

# Give Nginx permission to read your root folder
chmod -R 755 /root

# 1. Setup Backend
echo "[*] Setting up Python Virtual Environment..."
cd /root/dhi-website/Employee_Portal/ats-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Setup Systemd Service
echo "[*] Configuring Systemctl Service..."
cat <<EOF > /etc/systemd/system/ats-backend.service
[Unit]
Description=ATS FastAPI Backend
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/root/dhi-website/Employee_Portal/ats-backend
Environment="PATH=/root/dhi-website/Employee_Portal/ats-backend/venv/bin"
EnvironmentFile=/root/dhi-website/Employee_Portal/ats-backend/.env
ExecStart=/root/dhi-website/Employee_Portal/ats-backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8050

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl restart ats-backend
systemctl enable ats-backend

# 3. Setup Nginx
echo "[*] Configuring Nginx Domains..."

# Main Website
cat <<EOF > /etc/nginx/sites-available/dhi-website
server {
    listen 80;
    server_name dhicreativeservices.com www.dhicreativeservices.com;
    location / {
        root /root/dhi-website/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Portal Subdomain
cat <<EOF > /etc/nginx/sites-available/ats-portal
server {
    listen 80;
    server_name portal.dhicreativeservices.com;
    location / {
        root /root/dhi-website/Employee_Portal/ats-frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://localhost:8050;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    location /uploads/ {
        alias /root/dhi-website/Employee_Portal/uploads/;
        autoindex off;
    }
}
EOF

ln -sf /etc/nginx/sites-available/dhi-website /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/ats-portal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Restart Nginx
nginx -t && systemctl restart nginx

echo "========================================="
echo " DONE! Check your domains now. "
echo "========================================="
