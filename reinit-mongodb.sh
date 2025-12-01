#!/bin/bash

# Script to reinitialize MongoDB with the correct admin user
# This is useful when the password hashes have been updated

echo "=========================================="
echo "MongoDB Reinitialization Script"
echo "=========================================="
echo ""

# Check if MongoDB container is running
if ! docker ps | grep -q mongodb; then
  echo "❌ MongoDB container is not running!"
  echo "Please start your Docker containers first with: docker-compose up -d"
  exit 1
fi

echo "✓ MongoDB container is running"
echo ""

# Drop the employai database to start fresh
echo "Dropping existing 'employai' database..."
docker exec -i mongodb mongosh --authenticationDatabase admin -u admin -p admin123 --eval "use employai; db.dropDatabase();" 2>/dev/null

echo "✓ Database dropped"
echo ""

# Run the initialization script
echo "Running initialization script..."
docker exec -i mongodb mongosh --authenticationDatabase admin -u admin -p admin123 < init-mongo.js

echo ""
echo "=========================================="
echo "✓ MongoDB reinitialized successfully!"
echo "=========================================="
echo ""
echo "You can now login with:"
echo "  Email: admin@employai.com"
echo "  Password: Admin123!"
echo ""
