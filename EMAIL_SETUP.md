# Email Verification Setup Guide

This guide will help you configure email verification for Linkvesta.

## Quick Setup (Gmail - Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Follow the prompts to enable 2-factor authentication

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "Linkvesta" as the name
5. Click **Generate**
6. Copy the 16-character password (you'll need this)

### Step 3: Configure Environment Variables

#### Option A: Using Docker Compose (Recommended)

Add these to your root `.env` file:

```env
# Email Configuration (Gmail)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
FRONTEND_URL=http://localhost:3000
```

#### Option B: Local Development (Without Docker)

Create or update `backend/services/auth/.env`:

```env
# Email Configuration (Gmail)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
FRONTEND_URL=http://localhost:3000
```

### Step 4: Restart Services

If using Docker:
```bash
docker-compose restart auth-service
```

If running locally:
```bash
# Stop the auth service (Ctrl+C)
# Then restart it
cd backend/services/auth
npm run dev
```

## Production Setup (Custom SMTP)

For production, use a professional email service like:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **Amazon SES** (Very affordable)
- **Your own SMTP server**

### Example: SendGrid Setup

1. Sign up at https://sendgrid.com
2. Create an API key
3. Configure in `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@linkvesta.com
FRONTEND_URL=https://yourdomain.com
```

### Example: Mailgun Setup

1. Sign up at https://www.mailgun.com
2. Get your SMTP credentials
3. Configure in `.env`:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
SMTP_FROM=noreply@linkvesta.com
FRONTEND_URL=https://yourdomain.com
```

## Testing Email Verification

1. **Register a new account** at `/register`
2. **Check your email** (and spam folder)
3. **Click the verification link** in the email
4. **Try logging in** - it should work after verification

## Troubleshooting

### Emails Not Sending

1. **Check environment variables** are set correctly
2. **Verify Gmail app password** is correct (16 characters, no spaces)
3. **Check logs** in the auth service:
   ```bash
   docker-compose logs auth-service
   ```
4. **Test SMTP connection** - check for error messages in logs

### Common Errors

- **"Invalid login"**: Check your Gmail app password
- **"Connection timeout"**: Check firewall/network settings
- **"Email not received"**: Check spam folder, verify SMTP credentials

### Development Mode (No Email)

If you want to test without sending emails, the system will still create users but won't send verification emails. Users will need to use the "Resend Verification Email" feature once email is configured.

## Security Notes

- **Never commit** `.env` files to git
- **Use app passwords** for Gmail, not your regular password
- **Rotate passwords** regularly in production
- **Use environment variables** in production, not hardcoded values

## Next Steps

After setting up email:
1. Test the registration flow
2. Verify emails are being sent
3. Test the verification link
4. Test the resend functionality

For production, consider:
- Setting up email templates
- Adding email analytics
- Implementing rate limiting
- Setting up email monitoring
