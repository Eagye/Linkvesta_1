import nodemailer from 'nodemailer';

// Email configuration - using Gmail SMTP (free)
// For production, you can use other SMTP services or services like SendGrid, Mailgun
const createTransporter = () => {
  // If SMTP credentials are provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Default: Use Gmail (requires app password)
  // For Gmail, you need to:
  // 1. Enable 2-factor authentication
  // 2. Generate an app password: https://myaccount.google.com/apppasswords
  // 3. Set SMTP_USER to your Gmail address
  // 4. Set SMTP_PASS to the app password
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development mode: Use Ethereal Email (creates a test account)
  // This is useful for testing without real email credentials
  console.warn('No SMTP credentials found. Email sending will be disabled. Set SMTP_USER and SMTP_PASS for production.');
  return null;
};

export const sendVerificationEmail = async (email: string, verificationToken: string, name?: string): Promise<boolean> => {
  console.log('Attempting to send verification email to:', email);
  console.log('SMTP Configuration check:', {
    SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Not set',
    SMTP_PASS: process.env.SMTP_PASS ? 'Set' : 'Not set',
    SMTP_HOST: process.env.SMTP_HOST || 'Not set (using Gmail)',
    FRONTEND_URL: process.env.FRONTEND_URL || 'Not set'
  });
  
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('Email transporter not configured. Cannot send verification email.');
    console.error('Please check SMTP_USER and SMTP_PASS environment variables.');
    return false;
  }
  
  console.log('Email transporter created successfully');

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@linkvesta.com',
    to: email,
    subject: 'Verify Your Linkvesta Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1a2332; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Linkvesta</h1>
        </div>
        <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a2332; margin-top: 0;">Welcome${name ? `, ${name}` : ''}!</h2>
          <p style="font-size: 16px; margin-bottom: 30px;">
            Thank you for registering with Linkvesta. To complete your registration and activate your account, please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #d4af37; color: #1a2332; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background-color: #f9fafb; padding: 10px; border-radius: 4px;">
            ${verificationUrl}
          </p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            This verification link will expire in 24 hours. If you didn't create an account with Linkvesta, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Linkvesta. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Accra, Ghana</p>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome${name ? `, ${name}` : ''}!

Thank you for registering with Linkvesta. To complete your registration and activate your account, please verify your email address by visiting this link:

${verificationUrl}

This verification link will expire in 24 hours. If you didn't create an account with Linkvesta, please ignore this email.

© ${new Date().getFullYear()} Linkvesta. All rights reserved.
Accra, Ghana
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', info.messageId);
    console.log('Email sent to:', email);
    return true;
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string, name?: string): Promise<boolean> => {
  console.log('Attempting to send password reset email to:', email);
  
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('Email transporter not configured. Cannot send password reset email.');
    console.error('Please check SMTP_USER and SMTP_PASS environment variables.');
    return false;
  }
  
  console.log('Email transporter created successfully');

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@linkvesta.com',
    to: email,
    subject: 'Reset Your Linkvesta Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1a2332; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Linkvesta</h1>
        </div>
        <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a2332; margin-top: 0;">Password Reset Request</h2>
          <p style="font-size: 16px; margin-bottom: 30px;">
            ${name ? `Hello ${name},` : 'Hello,'}
          </p>
          <p style="font-size: 16px; margin-bottom: 30px;">
            We received a request to reset your password for your Linkvesta account. Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background-color: #d4af37; color: #1a2332; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background-color: #f9fafb; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <strong>Important:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
          <p style="font-size: 14px; color: #ef4444; margin-top: 20px; padding: 15px; background-color: #fef2f2; border-radius: 4px; border-left: 4px solid #ef4444;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please contact our support team immediately.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Linkvesta. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Accra, Ghana</p>
        </div>
      </body>
      </html>
    `,
    text: `
Password Reset Request

${name ? `Hello ${name},` : 'Hello,'}

We received a request to reset your password for your Linkvesta account. Visit this link to reset your password:

${resetUrl}

Important: This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Security Notice: If you didn't request this password reset, please contact our support team immediately.

© ${new Date().getFullYear()} Linkvesta. All rights reserved.
Accra, Ghana
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    console.log('Email sent to:', email);
    return true;
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
};