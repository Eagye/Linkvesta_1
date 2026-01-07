# LinkVesta

A full-stack application built with React/Next.js frontend, microservices backend architecture, PostgreSQL database, and cloud storage integration.

## System Architecture

- **Frontend**: React/Next.js (TypeScript)
- **Backend**: Microservices Architecture
  - API Service (Port 3001)
  - Auth Service (Port 3002)
- **Database**: PostgreSQL
- **Storage**: AWS S3 (Cloud Storage)

## Project Structure

```
linkvesta/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js app directory
│   ├── package.json
│   └── ...
├── backend/              # Microservices backend
│   ├── services/
│   │   ├── api/         # API service
│   │   └── auth/        # Authentication service
│   └── database/
│       └── migrations/   # Database migration files
├── docker-compose.yml    # Docker orchestration
└── package.json          # Root package.json
```

## Prerequisites

- Node.js 20+ 
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)
- AWS Account (for S3 cloud storage)

## Getting Started

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eagye/Linkvesta.git
   cd linkvesta
   ```

2. **Set up environment variables**
   - Create `.env` file in the root directory
   - Copy the example below and update with your values:
     ```env
     # Database Configuration (optional - defaults shown)
     POSTGRES_USER=postgres
     POSTGRES_PASSWORD=postgres
     POSTGRES_DB=linkvesta
     POSTGRES_PORT=5432
     
     # Service Ports (optional - defaults shown)
     FRONTEND_PORT=3000
     API_PORT=3001
     AUTH_PORT=3002
     
     # Frontend API URLs
     # For local development: use http://localhost:PORT
     # For production: use your domain or server IP (e.g., http://yourdomain.com:3001)
     NEXT_PUBLIC_API_URL=http://localhost:3001
     NEXT_PUBLIC_AUTH_URL=http://localhost:3002
     
     # AWS S3 Configuration (Required)
     AWS_ACCESS_KEY_ID=your_access_key
     AWS_SECRET_ACCESS_KEY=your_secret_key
     AWS_REGION=us-east-1
     AWS_S3_BUCKET_NAME=linkvesta-storage
     
     # JWT Configuration (Required)
     JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
     JWT_EXPIRES_IN=7d
     ```
   
   **Important Notes:**
   - The `.env` file is git-ignored and will not be committed to the repository
   - For production deployments, set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AUTH_URL` to your actual domain or server IP
   - Change `JWT_SECRET` to a secure random string in production

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Service: http://localhost:3001
   - Auth Service: http://localhost:3002

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb linkvesta
   
   # Run migrations
   psql -U postgres -d linkvesta -f backend/database/migrations/001_initial_schema.sql
   ```

3. **Configure environment variables**
   - Create `.env` files in each service directory:
     - `backend/services/api/.env` (copy from `backend/services/api/src/config/env.example.txt`)
     - `backend/services/auth/.env` (copy from `backend/services/auth/src/config/env.example.txt`)
   - Update with your local configuration (database credentials, AWS keys, JWT secret)
   - For the frontend, create `.env.local` in the `frontend/` directory:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:3001
     NEXT_PUBLIC_AUTH_URL=http://localhost:3002
     ```

4. **Start services**

   **Start all services:**
   ```bash
   npm run dev
   ```

   **Or start individually:**
   ```bash
   # Frontend
   npm run dev:frontend

   # Backend services
   npm run dev:backend
   ```

## Services

### Frontend (Next.js)
- **Port**: 3000
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript

### API Service
- **Port**: 3001
- **Framework**: Express.js
- **Features**: 
  - RESTful API endpoints
  - PostgreSQL database integration
  - AWS S3 cloud storage integration

### Auth Service
- **Port**: 3002
- **Framework**: Express.js
- **Features**:
  - User authentication
  - JWT token management
  - User registration and login

## Database

PostgreSQL is used as the primary database. The schema includes:

- **users**: User accounts and authentication
- **files**: References to files stored in cloud storage

Migrations are located in `backend/database/migrations/`.

## Cloud Storage

AWS S3 is configured for cloud storage. The storage service provides:

- File upload
- File retrieval
- File deletion

Configure your AWS credentials in environment variables.

## Development

### Adding a New Microservice

1. Create a new directory in `backend/services/`
2. Set up `package.json` with Express.js dependencies
3. Create TypeScript configuration
4. Add service to `docker-compose.yml`
5. Update root `package.json` scripts

### Database Migrations

Add new migration files in `backend/database/migrations/` following the naming convention: `XXX_description.sql`

## API Endpoints

### API Service (Port 3001)
- `GET /health` - Health check
- `GET /api` - Service info
- `GET /api/data` - Example data endpoint
- `POST /api/upload` - Upload file to cloud storage

### Auth Service (Port 3002)
- `GET /health` - Health check
- `GET /api/auth` - Service info
- `POST /api/auth/register` - Regular user registration
- `POST /api/auth/login` - Regular user login
- `POST /api/auth/admin/register` - Admin registration
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token

## Environment Variables

### Root `.env` File (for Docker Compose)

All environment variables can be set in a root `.env` file for Docker Compose:

- **Database Configuration:**
  - `POSTGRES_USER` - PostgreSQL username (default: `postgres`)
  - `POSTGRES_PASSWORD` - PostgreSQL password (default: `postgres`)
  - `POSTGRES_DB` - Database name (default: `linkvesta`)
  - `POSTGRES_PORT` - PostgreSQL port (default: `5432`)

- **Service Ports:**
  - `FRONTEND_PORT` - Frontend port (default: `3000`)
  - `API_PORT` - API service port (default: `3001`)
  - `AUTH_PORT` - Auth service port (default: `3002`)

- **Frontend API URLs:**
  - `NEXT_PUBLIC_API_URL` - API service URL accessible from browser (default: `http://localhost:3001`)
  - `NEXT_PUBLIC_AUTH_URL` - Auth service URL accessible from browser (default: `http://localhost:3002`)
  
  **Important:** These URLs must be accessible from the user's browser. For local development, use `localhost`. For production, use your domain or server IP.

- **AWS S3 Configuration (Required):**
  - `AWS_ACCESS_KEY_ID` - AWS access key
  - `AWS_SECRET_ACCESS_KEY` - AWS secret key
  - `AWS_REGION` - AWS region (default: `us-east-1`)
  - `AWS_S3_BUCKET_NAME` - S3 bucket name (default: `linkvesta-storage`)

- **JWT Configuration (Required):**
  - `JWT_SECRET` - JWT secret key (change in production!)
  - `JWT_EXPIRES_IN` - JWT expiration time (default: `7d`)

### Service-Specific Environment Variables

#### API Service (`backend/services/api/.env`)
- `PORT` - Service port (default: `3001`)
- `DB_HOST` - PostgreSQL host (default: `localhost`)
- `DB_PORT` - PostgreSQL port (default: `5432`)
- `DB_NAME` - Database name (default: `linkvesta`)
- `DB_USER` - Database user (default: `postgres`)
- `DB_PASSWORD` - Database password (default: `postgres`)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET_NAME` - S3 bucket name

#### Auth Service (`backend/services/auth/.env`)
- `PORT` - Service port (default: `3002`)
- `DB_HOST` - PostgreSQL host (default: `localhost`)
- `DB_PORT` - PostgreSQL port (default: `5432`)
- `DB_NAME` - Database name (default: `linkvesta`)
- `DB_USER` - Database user (default: `postgres`)
- `DB_PASSWORD` - Database password (default: `postgres`)
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time

#### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` - API service URL (default: `http://localhost:3001`)
- `NEXT_PUBLIC_AUTH_URL` - Auth service URL (default: `http://localhost:3002`)

## Portability & Deployment

This application is designed to run on any machine. Here are key points for portability:

### ✅ What's Already Configured for Portability

1. **No Hardcoded Paths**: All file paths are relative, no absolute paths
2. **Environment Variables**: All configuration uses environment variables
3. **Docker Support**: Full Docker Compose setup for consistent deployment
4. **Default Values**: Sensible defaults for all configuration options

### 🚀 Running on Different Machines

**For Local Development:**
- Use `localhost` URLs in environment variables
- Default ports work out of the box

**For Remote Server/Production:**
- Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AUTH_URL` to your server's IP or domain
- Example: `NEXT_PUBLIC_API_URL=http://192.168.1.100:3001` or `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- Ensure firewall allows access to the configured ports

**For Different Operating Systems:**
- Works on Windows, macOS, and Linux
- Docker ensures consistent behavior across platforms
- Node.js handles OS-specific path differences automatically

### 📝 Quick Setup Checklist

- [ ] Clone the repository
- [ ] Create `.env` file in root directory with your configuration
- [ ] Set AWS credentials (if using S3 storage)
- [ ] Set JWT secret (use a secure random string)
- [ ] Update API URLs if deploying to a server
- [ ] Run `docker-compose up -d` or follow local development setup

## License

MIT
