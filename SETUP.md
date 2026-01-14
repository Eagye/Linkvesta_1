# LinkVesta Professional Setup Guide

This guide will help you set up the LinkVesta system to run smoothly in a professional environment.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (recommended) OR PostgreSQL installed locally
- AWS Account (for S3 file storage)

## Quick Start (Docker - Recommended)

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=linkvesta
POSTGRES_PORT=5432

# Service Ports
FRONTEND_PORT=3000
API_PORT=3001
AUTH_PORT=3002

# Frontend API URLs (Must be accessible from browser)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=http://localhost:3002

# AWS S3 Configuration (Required for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=linkvesta-storage

# JWT Configuration (Required for authentication)
# Generate a secure secret: openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Email Configuration (Required for email verification)
# For Gmail: Enable 2FA and generate app password at https://myaccount.google.com/apppasswords
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
FRONTEND_URL=http://localhost:3000

# For custom SMTP (production):
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_FROM=noreply@linkvesta.com
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all service dependencies
npm run install:all
```

### 3. Start Services with Docker

```bash
# Start all services (database, API, auth, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The database migrations will run automatically when the PostgreSQL container starts.

## Manual Setup (Without Docker)

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb linkvesta

# Run migrations
psql -U postgres -d linkvesta -f backend/database/migrations/001_initial_schema.sql
psql -U postgres -d linkvesta -f backend/database/migrations/002_businesses_and_waitlist.sql
psql -U postgres -d linkvesta -f backend/database/migrations/003_add_user_roles.sql
```

### 2. Environment Files

Create `.env` files in each service directory:

**`backend/services/api/.env`**
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linkvesta
DB_USER=postgres
DB_PASSWORD=your_password
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=linkvesta-storage
```

**`backend/services/auth/.env`**
```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linkvesta
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=http://localhost:3002
```

### 3. Start Services

```bash
# Terminal 1: Start API service
cd backend/services/api
npm run dev

# Terminal 2: Start Auth service
cd backend/services/auth
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm run dev
```

Or use the root script:
```bash
npm run dev
```

## Verification

### Check Service Health

- **API Service**: http://localhost:3001/health
- **Auth Service**: http://localhost:3002/health
- **Frontend**: http://localhost:3000

### Test Admin Registration

1. Navigate to http://localhost:3000/admin/signup
2. Create an admin account
3. You should be redirected to `/admin/dashboard` (create this page if needed)

## Production Considerations

### Security

1. **Change JWT Secret**: Use a strong, randomly generated secret:
   ```bash
   openssl rand -base64 32
   ```

2. **Use Strong Database Passwords**: Never use default passwords in production

3. **Environment Variables**: Never commit `.env` files to version control

4. **HTTPS**: Use HTTPS in production. Update `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AUTH_URL` to use `https://`

5. **CORS**: Configure CORS properly for your production domain

### AWS S3 Setup

1. Create an S3 bucket in your AWS account
2. Create an IAM user with S3 read/write permissions
3. Use the access key and secret key in your environment variables

### Database

- Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.) in production
- Enable SSL connections
- Set up automated backups
- Use connection pooling

## Troubleshooting

### Database Connection Errors

- Ensure PostgreSQL is running
- Check database credentials in `.env` files
- Verify database exists: `psql -U postgres -l`

### Port Already in Use

- Change ports in `.env` files
- Kill process using port: `lsof -ti:3001 | xargs kill` (Mac/Linux)

### Module Not Found Errors

- Run `npm run install:all` to install all dependencies
- Delete `node_modules` and reinstall if issues persist

### Auth Endpoints Not Working

- Verify auth service is running on port 3002
- Check JWT_SECRET is set
- Ensure database has `role` column in users table (run migration 003)

## API Endpoints

### Auth Service (Port 3002)

- `POST /api/auth/register` - Regular user registration
- `POST /api/auth/login` - Regular user login
- `POST /api/auth/admin/register` - Admin registration
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token

### API Service (Port 3001)

- `GET /api/businesses` - List all businesses
- `GET /api/businesses/:id` - Get business by ID
- `POST /api/waitlist` - Join waitlist
- `GET /api/waitlist/:businessId` - Get waitlist for business

## Support

For issues or questions, check the logs:
- Docker: `docker-compose logs [service-name]`
- Manual: Check terminal output for each service
