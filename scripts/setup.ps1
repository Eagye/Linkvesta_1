# LinkVesta Professional Setup Script (PowerShell)
# This script sets up the entire development environment

Write-Host "🚀 LinkVesta Professional Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  No .env file found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create a .env file with the following variables:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "POSTGRES_USER=postgres"
    Write-Host "POSTGRES_PASSWORD=your_secure_password"
    Write-Host "POSTGRES_DB=linkvesta"
    Write-Host "POSTGRES_PORT=5432"
    Write-Host "FRONTEND_PORT=3000"
    Write-Host "API_PORT=3001"
    Write-Host "AUTH_PORT=3002"
    Write-Host "NEXT_PUBLIC_API_URL=http://localhost:3001"
    Write-Host "NEXT_PUBLIC_AUTH_URL=http://localhost:3002"
    Write-Host "AWS_ACCESS_KEY_ID=your_key"
    Write-Host "AWS_SECRET_ACCESS_KEY=your_secret"
    Write-Host "AWS_REGION=us-east-1"
    Write-Host "AWS_S3_BUCKET_NAME=linkvesta-storage"
    Write-Host "JWT_SECRET=your_jwt_secret_key"
    Write-Host "JWT_EXPIRES_IN=7d"
    Write-Host ""
    Read-Host "Press Enter to continue after creating .env file"
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Green
npm install

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Green
Set-Location frontend
npm install
Set-Location ..

# Install backend service dependencies
Write-Host "Installing API service dependencies..." -ForegroundColor Green
Set-Location backend/services/api
npm install
Set-Location ../../..

Write-Host "Installing Auth service dependencies..." -ForegroundColor Green
Set-Location backend/services/auth
npm install
Set-Location ../../..

Write-Host ""
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ensure PostgreSQL is running (or use Docker Compose)"
Write-Host "2. Run database migrations using Docker Compose or manually"
Write-Host "3. Start all services: npm run dev"
Write-Host "   OR with Docker: docker-compose up -d"
Write-Host ""
Write-Host "4. Verify services are running:"
Write-Host "   - Frontend: http://localhost:3000"
Write-Host "   - API: http://localhost:3001/health"
Write-Host "   - Auth: http://localhost:3002/health"
Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
