#!/bin/bash
# This script runs migrations in order
# PostgreSQL will execute files in /docker-entrypoint-initdb.d in alphabetical order

set -e

echo "Running database migrations..."

# Wait for PostgreSQL to be ready
until psql -U postgres -c '\q' 2>/dev/null; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is ready - running migrations"

# Run migrations in order
psql -U postgres -d linkvesta -f /docker-entrypoint-initdb.d/001_initial_schema.sql
psql -U postgres -d linkvesta -f /docker-entrypoint-initdb.d/002_businesses_and_waitlist.sql
psql -U postgres -d linkvesta -f /docker-entrypoint-initdb.d/003_add_user_roles.sql
psql -U postgres -d linkvesta -f /docker-entrypoint-initdb.d/004_create_default_admin.sql
psql -U postgres -d linkvesta -f /docker-entrypoint-initdb.d/005_add_business_approval.sql
psql -U postgres -d linkvesta -f /docker-entrypoint-initdb.d/006_add_user_registration_fields.sql
psql -U postgres -d linkvesta -f /docker-entrypoint-initdb.d/007_add_sme_fields.sql

echo "Migrations completed successfully!"
