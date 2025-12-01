# PowerShell script to reinitialize MongoDB with the correct admin user
# Run this with: .\reinit-mongodb.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MongoDB Reinitialization Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB container is running
$mongoContainer = docker ps --filter "name=mongodb" --format "{{.Names}}"
if (-not $mongoContainer) {
    Write-Host "❌ MongoDB container is not running!" -ForegroundColor Red
    Write-Host "Please start your Docker containers first with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ MongoDB container is running" -ForegroundColor Green
Write-Host ""

# Drop the employai database to start fresh
Write-Host "Dropping existing 'employai' database..." -ForegroundColor Yellow
docker exec mongodb mongosh --authenticationDatabase admin -u admin -p admin123 --eval "use employai; db.dropDatabase();" 2>$null

Write-Host "✓ Database dropped" -ForegroundColor Green
Write-Host ""

# Run the initialization script using Get-Content
Write-Host "Running initialization script..." -ForegroundColor Yellow
Get-Content .\init-mongo.js | docker exec -i mongodb mongosh --authenticationDatabase admin -u admin -p admin123

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ MongoDB reinitialized successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now login with:" -ForegroundColor White
Write-Host "  Email: admin@employai.com" -ForegroundColor Yellow
Write-Host "  Password: Admin123!" -ForegroundColor Yellow
Write-Host ""
