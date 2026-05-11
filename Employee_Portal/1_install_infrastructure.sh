#!/bin/bash
echo "========================================="
echo " Installing Server Infrastructure "
echo "========================================="

# Update packages
echo "[*] Updating package lists..."
apt-get update && apt-get upgrade -y

# Install dependencies
echo "[*] Installing PostgreSQL, Nginx, Python3..."
apt-get install -y postgresql postgresql-contrib nginx python3 python3-venv python3-pip curl

# Configure PostgreSQL
echo "[*] Configuring PostgreSQL Database and User..."
# Create user and database, set password
sudo -u postgres psql -c "CREATE USER sql_developer WITH PASSWORD 'Dev@123';"
sudo -u postgres psql -c "CREATE DATABASE dhi OWNER sql_developer;"
sudo -u postgres psql -c "ALTER ROLE sql_developer SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE sql_developer SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE sql_developer SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE dhi TO sql_developer;"

echo "========================================="
echo " Infrastructure Installation Complete! "
echo " You can now restore your database backup."
echo "========================================="
