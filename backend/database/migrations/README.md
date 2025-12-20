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

