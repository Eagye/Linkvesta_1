# Email Verification Troubleshooting Guide

## Issue: Not Receiving Verification Emails

If you're not receiving verification emails, follow these steps:

### Step 1: Verify Environment Variables

Check that your `.env` file in the root directory has:
```env
SMTP_USER=linkvestagh@gmail.com
SMTP_PASS=ufszttjhhjipzpir
FRONTEND_URL=http://localhost:3000
```

### Step 2: Restart the Auth Service

The auth service needs to be restarted to load new environment variables:

1. **Stop the current dev server** (Ctrl+C in the terminal running `npm run dev`)
2. **Restart it:**
   ```bash
   npm run dev
   ```

3. **Check the console output** - you should see:
   ```
   Email service: Configured (linkvestagh@gmail.com)
   ```

If you see "Email service: Not configured", the environment variables aren't being loaded.

### Step 3: Check Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Verify your app password is correct (16 characters, no spaces)
3. The password should be: `ufszttjhhjipzpir` (no spaces)

### Step 4: Check Server Logs

When you register or resend verification, check the terminal/console for:
- `Attempting to send verification email to: [email]`
- `Email sent successfully` or error messages
- Any SMTP authentication errors

### Step 5: Common Gmail Issues

**Issue: "Invalid login" or "Authentication failed"**
- Verify the app password is correct
- Make sure 2-factor authentication is enabled
- Regenerate the app password if needed

**Issue: "Connection timeout"**
- Check your internet connection
- Verify firewall isn't blocking SMTP port 587
- Try using port 465 with `SMTP_SECURE=true` (if supported)

**Issue: Emails going to spam**
- Check the spam/junk folder
- Mark the email as "Not Spam" if found there

### Step 6: Test Email Configuration

You can test if email is working by:
1. Registering a new account
2. Checking the server logs for email sending attempts
3. Looking for error messages in the console

### Step 7: Verify Email Service is Running

Check that the auth service is running:
```bash
# Check if auth service is responding
curl http://localhost:3002/health
```

### Step 8: Manual Email Test

If emails still aren't working, you can manually verify the user in the database:

1. Connect to PostgreSQL:
   ```bash
   docker exec -it linkvesta-postgres psql -U postgres -d linkvesta
   ```

2. Find your user:
   ```sql
   SELECT id, email, email_verified, verification_token FROM users WHERE email = 'your-email@example.com';
   ```

3. Manually verify (if needed):
   ```sql
   UPDATE users SET email_verified = true WHERE email = 'your-email@example.com';
   ```

## Debugging Steps

1. **Check environment variables are loaded:**
   - Look for "Email service: Configured" in startup logs
   - If not configured, restart the service

2. **Check email sending logs:**
   - Look for "Attempting to send verification email" messages
   - Check for any error messages after that

3. **Verify Gmail settings:**
   - 2FA must be enabled
   - App password must be valid
   - Account must allow "Less secure app access" (if applicable)

4. **Check network/firewall:**
   - Ensure port 587 (SMTP) is not blocked
   - Check if antivirus is blocking SMTP connections

## Still Not Working?

If emails still aren't working after following these steps:

1. Check the server console for detailed error messages
2. Verify the Gmail app password is correct
3. Try regenerating the Gmail app password
4. Consider using a different email service (SendGrid, Mailgun) for testing
