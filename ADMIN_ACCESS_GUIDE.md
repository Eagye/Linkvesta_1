# 🔐 Admin Section Access Guide

## Quick Access

**http://localhost:3000/admin/login**

---

## Default Admin Credentials

**Email:** `admin@linkvesta.com`  
**Password:** `admin123`

⚠️ **IMPORTANT:** Change the password after first login!

---

## Step-by-Step Access

### 1. Make Sure Admin Account Exists

If you haven't created the admin account yet, run:

```powershell
# Option 1: Using the script (Recommended)
node scripts/create-default-admin.js

# Option 2: Using PowerShell script
.\create_default_admin.ps1

# Option 3: Using Docker
docker exec -i linkvesta-postgres psql -U postgres -d linkvesta -f /docker-entrypoint-initdb.d/004_create_default_admin.sql
```

### 2. Access Admin Login Page

Open your browser and go to:
- **http://localhost:3000/admin/login**

### 3. Login

Enter the credentials:
- **Email:** `admin@linkvesta.com`
- **Password:** `admin123`

### 4. Access Dashboard

After successful login, you'll be redirected to:
- **http://localhost:3000/admin/dashboard**

---

## What You Can Do in Admin Dashboard

- ✅ View all businesses (approved and pending)
- ✅ Approve/reject businesses
- ✅ Update business details (description, category)
- ✅ View all users
- ✅ View and approve/reject investors
- ✅ Create new admin accounts
- ✅ Manage platform content

---

## Troubleshooting

### "Invalid email or password" Error

1. **Check if admin account exists:**
   ```powershell
   docker exec -i linkvesta-postgres psql -U postgres -d linkvesta -c "SELECT email, role FROM users WHERE role = 'admin';"
   ```

2. **If no admin exists, create one:**
   ```powershell
   node scripts/create-default-admin.js
   ```

3. **Verify services are running:**
   - Frontend: http://localhost:3000
   - Auth Service: http://localhost:3002/health

### "Cannot connect to server" Error

- Make sure all services are running
- Check that Auth Service is accessible

### Forgot Password

Currently, admin password reset needs to be done via database. Contact your system administrator or:

1. Reset password hash in database
2. Or create a new admin account from existing admin dashboard

---

## Security Notes

- ⚠️ **Change default password immediately** after first login
- 🔒 Admin accounts have full access to the platform
- 📝 All admin actions are logged in `security_events` table
- 🚫 Never share admin credentials

---

## Direct Links

- **Admin Login:** http://localhost:3000/admin/login
- **Admin Dashboard:** http://localhost:3000/admin/dashboard
