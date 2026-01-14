# Testing Email Verification

This guide will help you test the email verification system.

## Prerequisites

1. ✅ Database migration completed (`008_add_email_verification.sql`)
2. ✅ Nodemailer package installed
3. ⚠️ Email credentials configured in `.env`

## Step 1: Configure Email (If Not Done)

Add to your root `.env` file:

```env
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
FRONTEND_URL=http://localhost:3000
```

**To get Gmail app password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate app password for "Mail" → "Other" → "Linkvesta"
3. Copy the 16-character password

## Step 2: Start/Restart Services

### If using Docker:
```bash
docker-compose restart auth-service
```

### If running locally:
```bash
# Stop the auth service (Ctrl+C if running)
cd backend/services/auth
npm run dev
```

Check the console output - you should see:
```
Email service: Configured (your_email@gmail.com)
```

If you see "Email service: Not configured", check your `.env` file.

## Step 3: Test Registration Flow

1. **Go to registration page:**
   - Navigate to: http://localhost:3000/register
   - Select account type (Investor or Startup/SME)

2. **Fill out the registration form:**
   - Use a **real email address** (not disposable)
   - Complete all required fields
   - For Startup/SME: Upload PDF and provide TIN

3. **Submit the form:**
   - You should see: "Registration successful! Please check your email..."
   - You should be redirected to `/register/verify-instructions`

4. **Check your email:**
   - Look in your inbox (and spam folder)
   - You should receive an email from Linkvesta
   - The email should have a "Verify Email Address" button

5. **Click the verification link:**
   - You'll be redirected to `/verify-email?token=...`
   - Should see: "Email Verified!" message

6. **Test login:**
   - Try logging in with your credentials
   - Should work now that email is verified

## Step 4: Test Disposable Email Blocking

1. **Try registering with a disposable email:**
   - Use something like: `test@tempmail.com`
   - Should see error: "Please use a permanent email address..."

## Step 5: Test Resend Verification

1. **Go to:** http://localhost:3000/register/verify-instructions
2. **Enter your email address**
3. **Click "Resend Email"**
4. **Check your inbox** for a new verification email

## Troubleshooting

### Email Not Received

1. **Check spam folder**
2. **Verify SMTP credentials** in `.env`
3. **Check auth service logs:**
   ```bash
   docker-compose logs auth-service
   # or if running locally, check the console
   ```
4. **Look for errors** like:
   - "Invalid login" → Wrong app password
   - "Connection timeout" → Network/firewall issue
   - "Email transporter not configured" → Missing env vars

### Verification Link Not Working

1. **Check token expiration** (24 hours)
2. **Verify FRONTEND_URL** is correct in `.env`
3. **Check browser console** for errors
4. **Try resending** verification email

### Can't Login After Verification

1. **Verify email_verified = true** in database:
   ```sql
   SELECT email, email_verified FROM users WHERE email = 'your_email@example.com';
   ```
2. **Check login endpoint** is checking `email_verified`
3. **Clear browser cache/cookies** and try again

## Expected Behavior

✅ **Registration:**
- User creates account
- Receives verification email
- Account created but `email_verified = false`

✅ **Email Verification:**
- User clicks link in email
- `email_verified` set to `true`
- User can now log in

✅ **Login:**
- Unverified users: "Please verify your email..."
- Verified users: Login successful

✅ **Disposable Emails:**
- Blocked during registration
- Friendly error message shown

## Database Verification

Check the database to verify:

```sql
-- Check user verification status
SELECT 
  email, 
  email_verified, 
  verification_token IS NOT NULL as has_token,
  verification_token_expires_at
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

Expected:
- New users: `email_verified = false`, `has_token = true`
- Verified users: `email_verified = true`, `has_token = false`

## Success Indicators

✅ Email received within 1-2 minutes
✅ Verification link works
✅ Can log in after verification
✅ Disposable emails are blocked
✅ Resend functionality works

If all these work, your email verification system is fully operational! 🎉
