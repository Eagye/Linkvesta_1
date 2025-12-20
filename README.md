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
   - Add your AWS credentials:
     ```
     AWS_ACCESS_KEY_ID=your_access_key
     AWS_SECRET_ACCESS_KEY=your_secret_key
     AWS_REGION=us-east-1
     AWS_S3_BUCKET_NAME=linkvesta-storage
     JWT_SECRET=your_jwt_secret
     ```

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
   - Copy `.env.example` files in each service directory
   - Update with your local configuration

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
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Environment Variables

### API Service
- `PORT` - Service port (default: 3001)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET_NAME` - S3 bucket name

### Auth Service
- `PORT` - Service port (default: 3002)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time

## License

MIT
