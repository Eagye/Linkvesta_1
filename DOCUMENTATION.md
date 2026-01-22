# LinkVesta Documentation

This document describes the current LinkVesta system: architecture, features, services, APIs, database schema, configuration, and operational notes.

## Overview

LinkVesta is a full-stack web application with a Next.js frontend and a microservices backend (API + Auth). It uses PostgreSQL for data storage and AWS S3 for file storage. The system includes user registration, email verification, admin workflows for approving businesses and investors, and a public browse experience for approved businesses.

## System Architecture

### Services

- **Frontend**: Next.js (App Router), TypeScript
  - Default port: `3000`
- **API Service**: Express.js
  - Default port: `3001`
- **Auth Service**: Express.js
  - Default port: `3002`
- **Database**: PostgreSQL
- **Storage**: AWS S3 (via `storageService`)

### Service Responsibilities

- **Frontend**
  - Public browsing pages
  - User registration and login UI
  - Admin login and dashboard UI
- **API Service**
  - Public business data
  - Admin business management
  - Waitlist operations
  - S3 upload placeholder endpoint
- **Auth Service**
  - Registration, login, and verification
  - Email verification and password reset
  - Admin authentication and admin-only actions
  - Investor approval workflow

## Key Features

- User registration with support for multiple account types (user, startup, investor)
- Email verification via verification token links
- Password reset flow
- Admin management:
  - Approve/reject businesses and investors
  - Update business details and categories
  - Delete businesses with archival to reports
- Business browsing for approved businesses only
- Waitlist signup per business
- Security features:
  - Rate limiting
  - Account lockout
  - Security event logging
  - Password history tracking

## Frontend Routes (High-Level)

These routes are available based on the current `frontend/app` structure:

- Public: `/`, `/browse`, `/pricing`, `/faq`, `/how-it-works`, `/contact`, `/terms`
- Auth: `/login`, `/register`, `/register/form`, `/register/verify-instructions`, `/verify-email`
- Admin: `/admin/login`, `/admin/dashboard`

## API Service Endpoints (Port 3001)

### Health

- `GET /health` — Health check with database connectivity

### Public

- `GET /api` — Service info
- `GET /api/data` — Example database query
- `POST /api/upload` — Example S3 upload (placeholder)
- `GET /api/businesses` — List approved businesses
- `GET /api/businesses/:id` — Get approved business by ID
- `POST /api/waitlist` — Join a business waitlist
- `GET /api/waitlist/:businessId` — List waitlist entries per business

### Admin (Requires admin JWT)

- `GET /api/admin/businesses` — All businesses (approved and pending)
- `GET /api/admin/businesses/all` — Same as above (explicit)
- `PUT /api/admin/businesses/:id` — Update business category/description
- `POST /api/admin/businesses/:id/approve` — Approve business
- `POST /api/admin/businesses/:id/reject` — Reject business and delete associated user
- `DELETE /api/admin/businesses/:id` — Delete business (archives to reports)
- `GET /api/admin/users` — List users

## Auth Service Endpoints (Port 3002)

### Health

- `GET /health` — Health check with database connectivity

### Public/Auth

- `GET /api/auth` — Service info
- `POST /api/auth/register` — Register user/startup/investor (supports file upload)
- `POST /api/auth/login` — User login
- `POST /api/auth/logout` — Logout and clear cookie
- `POST /api/auth/verify` — Verify JWT token
- `GET /api/auth/verify-email` — Verify email token
- `POST /api/auth/resend-verification` — Resend verification email
- `POST /api/auth/password-reset-request` — Request reset email
- `POST /api/auth/password-reset` — Reset password with token

### Admin/Auth

- `POST /api/auth/admin/register` — Register admin
- `POST /api/auth/admin/login` — Admin login
- `POST /api/auth/admin/create` — Create admin (requires admin JWT)
- `GET /api/auth/investors` — List investors (admin-only)
- `POST /api/auth/investors/:id/approve` — Approve investor (admin-only)
- `POST /api/auth/investors/:id/reject` — Reject investor (admin-only)

## Email Verification & Password Reset

- Verification links are generated from:
  1. Request origin/referer (preferred)
  2. `EMAIL_FRONTEND_URL`
  3. `FRONTEND_URL`
  4. Default `http://localhost:3000`
- Password reset uses a token with expiry and logs security events.

## Database Schema (Summary)

### Core Tables

- `users`
  - Basic account info
  - Roles: `user` or `admin`
  - Account types: `user`, `startup`, `investor`
  - Email verification fields
  - Security and lockout fields
- `files`
  - Cloud storage references per user
- `businesses`
  - Name, category, description, category color, logo URL
  - `approved` flag
- `waitlist`
  - Business ID + email (unique per business)
- `investors`
  - Investor profile and admin approval state
- `business_reports`
  - Archive table for deleted businesses
- `security_events`
  - Security audit logs
- `password_history`
  - Password reuse prevention

## Environment Variables

### Root `.env` (Docker Compose)

Used by `docker compose` for all services.

- `FRONTEND_PORT`, `API_PORT`, `AUTH_PORT`
- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AUTH_URL`
- `FRONTEND_URL`, `EMAIL_FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `POSTGRES_*` variables
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `AWS_*` variables

### API Service (`backend/services/api/.env`)

See `backend/services/api/src/config/env.example.txt` for full list.

### Auth Service (`backend/services/auth/.env`)

See `backend/services/auth/src/config/env.example.txt` for full list.

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_AUTH_URL`

## Scripts and Commands

### Root Scripts

- `npm run dev` — Start all services with Docker
- `npm run dev:down` — Stop Docker services
- `npm run dev:check` — Healthcheck for services
- `npm run dev:local` — Run frontend and backend locally
- `npm run dev:frontend` — Run frontend only
- `npm run dev:backend` — Run backend (API + Auth)
- `npm run install:all` — Install dependencies for all workspaces
- `npm run create-admin` — Create default admin via script

### Admin Creation (Windows)

- PowerShell script: `create_default_admin.ps1`
  - Uses migration `004_create_default_admin.sql`
  - Default credentials: `admin@linkvesta.com` / `admin123`
  - Change credentials after first login

## Running on a Different Local Machine

If another machine should access the app over LAN:

1. Start services on the host with `npm run dev`.
2. Set the following to the host machine LAN IP:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_AUTH_URL`
   - `FRONTEND_URL`
   - `EMAIL_FRONTEND_URL` (recommended)
3. Open firewall ports `3000`, `3001`, `3002`.
4. Access `http://<HOST_LAN_IP>:3000` from the other machine.

## Troubleshooting (Common)

- **Verification link unreachable**: set `EMAIL_FRONTEND_URL` or `FRONTEND_URL` to the correct domain/IP.
- **CORS errors**: add the frontend origin to `ALLOWED_ORIGINS`.
- **DB connection errors**: ensure Postgres is running and `POSTGRES_*`/`DB_*` variables match.
- **Admin access denied**: verify JWT is issued with role `admin`.
- **File uploads**: ensure AWS credentials and bucket are valid.

## Files and Locations (Quick References)

- Frontend pages: `frontend/app/`
- API service: `backend/services/api/`
- Auth service: `backend/services/auth/`
- Database migrations: `backend/database/migrations/`
- Scripts: `scripts/` and `create_default_admin.ps1`
