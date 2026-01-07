#!/bin/bash

# LinkVesta Professional Setup Script
# This script sets up the entire development environment

set -e

echo "🚀 LinkVesta Professional Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    echo ""
    echo "Please create a .env file with the following variables:"
    echo ""
    echo "POSTGRES_USER=postgres"
    echo "POSTGRES_PASSWORD=your_secure_password"
    echo "POSTGRES_DB=linkvesta"
    echo "POSTGRES_PORT=5432"
    echo "FRONTEND_PORT=3000"
    echo "API_PORT=3001"
    echo "AUTH_PORT=3002"
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001"
    echo "NEXT_PUBLIC_AUTH_URL=http://localhost:3002"
    echo "AWS_ACCESS_KEY_ID=your_key"
    echo "AWS_SECRET_ACCESS_KEY=your_secret"
    echo "AWS_REGION=us-east-1"
    echo "AWS_S3_BUCKET_NAME=linkvesta-storage"
    echo "JWT_SECRET=$(openssl rand -base64 32)"
    echo "JWT_EXPIRES_IN=7d"
    echo ""
    read -p "Press enter to continue after creating .env file..."
fi

echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend service dependencies
echo "Installing API service dependencies..."
cd backend/services/api
npm install
cd ../../..

echo "Installing Auth service dependencies..."
cd backend/services/auth
npm install
cd ../../..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Ensure PostgreSQL is running (or use Docker Compose)"
echo "2. Run database migrations:"
echo "   docker-compose up -d postgres"
echo "   # Wait for database to be ready, then:"
echo "   docker exec -i linkvesta-postgres psql -U postgres -d linkvesta < backend/database/migrations/001_initial_schema.sql"
echo "   docker exec -i linkvesta-postgres psql -U postgres -d linkvesta < backend/database/migrations/002_businesses_and_waitlist.sql"
echo "   docker exec -i linkvesta-postgres psql -U postgres -d linkvesta < backend/database/migrations/003_add_user_roles.sql"
echo ""
echo "3. Start all services:"
echo "   npm run dev"
echo ""
echo "   OR with Docker:"
echo "   docker-compose up -d"
echo ""
echo "4. Verify services are running:"
echo "   - Frontend: http://localhost:3000"
echo "   - API: http://localhost:3001/health"
echo "   - Auth: http://localhost:3002/health"
echo ""
echo "✨ Setup complete!"
