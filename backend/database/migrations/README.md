# Database Migrations

This directory contains PostgreSQL database migration files.

## Running Migrations

### Using psql
```bash
psql -U postgres -d linkvesta -f migrations/001_initial_schema.sql
```

### Using Docker
```bash
docker exec -i linkvesta-postgres psql -U postgres -d linkvesta < migrations/001_initial_schema.sql
```

## Migration Files

- `001_initial_schema.sql` - Initial database schema with users and files tables
- `002_businesses_and_waitlist.sql` - Businesses and waitlist tables
- `003_add_user_roles.sql` - Adds role column to users table for admin support
- `004_create_default_admin.sql` - Creates default admin user (admin@linkvesta.com / admin123)

## Default Admin Credentials

**IMPORTANT: Change these credentials after first login in production!**

- Email: `admin@linkvesta.com`
- Password: `admin123`

