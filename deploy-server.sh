#!/bin/bash
# DHI Creative Services - Server Deployment Script
# Run this script on your server after uploading files

echo "Starting DHI Creative Services deployment..."
echo "=============================================="

# Step 1: Move files to web directory
echo "Step 1: Setting up web directory..."
mkdir -p /var/www/dhi-consultancy
cp -r /root/DHI_CONSULTANCY/* /var/www/dhi-consultancy/
chmod -R 755 /var/www/dhi-consultancy
echo "✓ Files moved to /var/www/dhi-consultancy/"

# Step 2: Setup Nginx configuration
echo ""
echo "Step 2: Configuring Nginx..."
cp /root/dhi-consultancy.conf /etc/nginx/sites-available/dhi-consultancy.conf
ln -sf /etc/nginx/sites-available/dhi-consultancy.conf /etc/nginx/sites-enabled/dhi-consultancy.conf
echo "✓ Nginx configuration created"

# Step 3: Test Nginx configuration
echo ""
echo "Step 3: Testing Nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration has errors. Please fix them."
    exit 1
fi

# Step 4: Reload Nginx
echo ""
echo "Step 4: Reloading Nginx..."
systemctl reload nginx
echo "✓ Nginx reloaded"

# Step 5: Check all enabled sites
echo ""
echo "Step 5: Enabled sites:"
ls -1 /etc/nginx/sites-enabled/

echo ""
echo "=============================================="
echo "Deployment completed successfully!"
echo ""
echo "Your website is now live at:"
echo "  http://dhicreativeservices.com"
echo "  http://www.dhicreativeservices.com"
echo ""
echo "Optional: Add SSL certificate with:"
echo "  certbot --nginx -d dhicreativeservices.com -d www.dhicreativeservices.com"
echo "=============================================="
