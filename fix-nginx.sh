#!/bin/bash
# Fix Nginx server names hash bucket size

echo "Fixing Nginx configuration..."

# Add server_names_hash_bucket_size to nginx.conf
if ! grep -q "server_names_hash_bucket_size" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \    server_names_hash_bucket_size 64;' /etc/nginx/nginx.conf
    echo "✓ Added server_names_hash_bucket_size to nginx.conf"
else
    echo "✓ server_names_hash_bucket_size already configured"
fi

# Test configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration is now valid"
    systemctl reload nginx
    echo "✓ Nginx reloaded successfully"
    echo ""
    echo "Your website is now live at:"
    echo "  http://dhicreativeservices.com"
    echo "  http://www.dhicreativeservices.com"
else
    echo "✗ Configuration still has errors"
    exit 1
fi
