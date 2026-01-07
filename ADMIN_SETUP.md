# Admin Account Setup

## Default Admin Credentials

**Email:** `admin@linkvesta.com`  
**Password:** `admin123`

⚠️ **IMPORTANT:** Change the password after first login!

## Creating the Default Admin Account

The default admin account needs to be created in the database before you can log in.

### Option 1: Using the Script (Recommended)

Run this command from the project root:

```bash
cd backend/services/auth
node ../../../scripts/create-default-admin.js
```

**Prerequisites:**
- PostgreSQL must be running
- Database must exist (named `linkvesta` by default)
- Migrations must be run first (001_initial_schema.sql and 003_add_user_roles.sql)

### Option 2: Manual SQL

If you have access to PostgreSQL, run this SQL:

```sql
-- Only creates admin if one doesn't exist
INSERT INTO users (email, password_hash, name, role)
SELECT 'admin@linkvesta.com', '$2b$10$NTFZz.hEjJidHB7Vv.yKouczN2YDOAtM/Vn6FYOXfNHDjaCVd3KmK', 'Default Admin', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'admin'
);
```

### Option 3: Using Docker (if using Docker Compose)

```bash
docker exec -i linkvesta-postgres psql -U postgres -d linkvesta < backend/database/migrations/004_create_default_admin.sql
```

## Troubleshooting

### "Login failed" Error

1. **Check if PostgreSQL is running:**
   - On Windows: Check Services or Task Manager
   - Make sure PostgreSQL is started

2. **Check database connection:**
   - Verify your `.env` file has correct database credentials
   - Test connection: `psql -U postgres -d linkvesta` (if psql is installed)

3. **Check if migrations have been run:**
   - Ensure `001_initial_schema.sql` has been executed
   - Ensure `003_add_user_roles.sql` has been executed
   - Then run `004_create_default_admin.sql` or use the script

4. **Check service logs:**
   - Look at the auth service console output for database connection errors
   - Make sure the auth service can connect to the database

### Database Connection Issues

If you see connection errors, check:
- Database host: Default is `localhost`
- Database port: Default is `5432`
- Database name: Default is `linkvesta`
- Database user: Default is `postgres`
- Database password: Check your `.env` file

### After Creating Admin

Once the admin account is created, you can:
1. Login at `http://localhost:3000/admin/login`
2. Use credentials: `admin@linkvesta.com` / `admin123`
3. Create additional admins from the dashboard
4. **Change your password immediately!**
