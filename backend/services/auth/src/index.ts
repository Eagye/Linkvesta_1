import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { pool } from './config/database';
import { sendVerificationEmail, sendPasswordResetEmail } from './services/email';
import { isDisposableEmail, getDisposableEmailMessage } from './utils/disposableEmail';
import { configureSecurityHeaders, errorSanitizer } from './middleware/security';
import { 
  generalLimiter, 
  authLimiter, 
  registrationLimiter, 
  passwordResetLimiter,
  emailResendLimiter 
} from './middleware/rateLimiter';
import { validatePassword } from './utils/passwordValidator';

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
// Also try loading from current directory as fallback
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET: string = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// Create uploads directory if it doesn't exist
// Use process.cwd() to get project root, then navigate to uploads folder
const uploadsDir = path.join(process.cwd(), 'backend', 'services', 'auth', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'business-reg-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Trust proxy for accurate IP detection (important for rate limiting behind load balancers)
if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware - must be applied early
app.use(configureSecurityHeaders());

// CORS configuration - restrict origins properly
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'healthy',
      service: 'auth',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      service: 'auth',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Auth Routes
app.get('/api/auth', (req: Request, res: Response) => {
  res.json({ message: 'LinkVesta Auth Service' });
});

// Helper function to generate JWT token
function generateToken(userId: number, email: string, role: string): string {
  // @ts-ignore - TypeScript strict mode issue with jsonwebtoken types
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Helper function to log security events
async function logSecurityEvent(
  userId: number | null,
  eventType: string,
  ipAddress: string | undefined,
  userAgent: string | undefined,
  details?: any
) {
  try {
    await pool.query(
      `INSERT INTO security_events (user_id, event_type, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, eventType, ipAddress || null, userAgent || null, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error('Error logging security event:', error);
    // Don't throw - logging failures shouldn't break the application
  }
}

// Helper function to check and handle account lockout
async function checkAccountLockout(userId: number): Promise<{ locked: boolean; unlockTime?: Date }> {
  const result = await pool.query(
    'SELECT account_locked_until FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return { locked: false };
  }

  const lockedUntil = result.rows[0].account_locked_until;
  if (!lockedUntil) {
    return { locked: false };
  }

  const now = new Date();
  if (new Date(lockedUntil) > now) {
    return { locked: true, unlockTime: new Date(lockedUntil) };
  }

  // Lock has expired, clear it
  await pool.query(
    'UPDATE users SET account_locked_until = NULL, failed_login_attempts = 0 WHERE id = $1',
    [userId]
  );

  return { locked: false };
}

// Helper function to increment failed login attempts and lock account if needed
async function handleFailedLogin(userId: number): Promise<void> {
  const maxAttempts = 5;
  const lockoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

  const result = await pool.query(
    'SELECT failed_login_attempts FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) return;

  const currentAttempts = (result.rows[0].failed_login_attempts || 0) + 1;
  const lockUntil = currentAttempts >= maxAttempts 
    ? new Date(Date.now() + lockoutDuration)
    : null;

  await pool.query(
    `UPDATE users 
     SET failed_login_attempts = $1, 
         account_locked_until = $2 
     WHERE id = $3`,
    [currentAttempts, lockUntil, userId]
  );
}

// Helper function to reset failed login attempts on successful login
async function resetFailedLoginAttempts(userId: number, ipAddress: string | undefined): Promise<void> {
  await pool.query(
    `UPDATE users 
     SET failed_login_attempts = 0, 
         account_locked_until = NULL,
         last_login_at = CURRENT_TIMESTAMP,
         last_login_ip = $1
     WHERE id = $2`,
    [ipAddress || null, userId]
  );
}

// Middleware to verify JWT token and check admin role
function authenticateAdmin(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    (req as any).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
}

// Regular User Registration
app.post('/api/auth/register', registrationLimiter, upload.single('businessRegistrationDocument'), async (req: Request, res: Response) => {
  try {
    const { email, password, name, phoneNumber, country, accountType, tin } = req.body;
    const businessRegistrationDocument = req.file;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Please provide both your email address and password to create your account.' 
      });
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Password does not meet security requirements.',
        details: passwordValidation.errors,
        strength: passwordValidation.strength
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'An account with this email address already exists. Please use a different email or try logging in instead.' 
      });
    }

    // Check for disposable/temporary email addresses
    if (isDisposableEmail(email)) {
      return res.status(400).json({ 
        error: getDisposableEmailMessage()
      });
    }

    // For startup/SME accounts, TIN and business registration document are required
    if (accountType === 'startup') {
      if (!tin || !tin.trim()) {
        return res.status(400).json({ 
          error: 'To complete your business registration, please provide your Tax Identification Number (TIN).' 
        });
      }

      if (!businessRegistrationDocument) {
        return res.status(400).json({ 
          error: 'To complete your business registration, please upload your business registration document in PDF format.' 
        });
      }
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // 24 hours from now

    // Handle business registration document file path
    let businessDocPath = null;
    if (businessRegistrationDocument) {
      businessDocPath = `/uploads/${businessRegistrationDocument.filename}`;
    }

    let user;
    let result;

    // If registering as investor, create record in investors table (requires admin approval)
    if (accountType === 'investor') {
      // Create a minimal user record first (for authentication purposes)
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, name, phone_number, country, account_type, role, verification_token, verification_token_expires_at, email_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, 'user', $7, $8, false) 
         RETURNING id`,
        [
          email.toLowerCase().trim(), 
          passwordHash, 
          name || null,
          phoneNumber || null,
          country || null,
          accountType,
          verificationToken,
          verificationTokenExpires
        ]
      );

      const userId = userResult.rows[0].id;

      // Create investor record (not approved by default)
      result = await pool.query(
        `INSERT INTO investors (user_id, email, password_hash, name, phone_number, country, approved) 
         VALUES ($1, $2, $3, $4, $5, $6, false) 
         RETURNING id, email, name, phone_number, country, approved, created_at`,
        [
          userId,
          email.toLowerCase().trim(),
          passwordHash,
          name || null,
          phoneNumber || null,
          country || null
        ]
      );

      user = {
        id: userId,
        email: result.rows[0].email,
        name: result.rows[0].name,
        phone_number: result.rows[0].phone_number,
        country: result.rows[0].country,
        account_type: accountType,
        role: 'user',
        tin: null,
        business_registration_document: null,
        created_at: result.rows[0].created_at,
        email_verified: false,
        approved: false // Investor requires admin approval
      };

      console.log(`Investor registration created for: ${email} (pending admin approval)`);
    } else {
      // For non-investor accounts, create in users table as before
      result = await pool.query(
        `INSERT INTO users (email, password_hash, name, phone_number, country, account_type, role, tin, business_registration_document, verification_token, verification_token_expires_at, email_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, 'user', $7, $8, $9, $10, false) 
         RETURNING id, email, name, phone_number, country, account_type, role, tin, business_registration_document, created_at, email_verified`,
        [
          email.toLowerCase().trim(), 
          passwordHash, 
          name || null,
          phoneNumber || null,
          country || null,
          accountType || null,
          tin || null,
          businessDocPath,
          verificationToken,
          verificationTokenExpires
        ]
      );

      user = result.rows[0];
    }

    // Send verification email
    console.log(`Attempting to send verification email to: ${email}`);
    const emailSent = await sendVerificationEmail(email, verificationToken, name || undefined);
    if (!emailSent) {
      console.error(`Failed to send verification email to ${email}, but user was created.`);
      console.error('User can request resend later via the resend verification endpoint.');
      // Don't fail registration if email fails - user can request resend later
    } else {
      console.log(`Verification email sent successfully to: ${email}`);
    }

    // If user is registering as a startup/SME, create a business entry for admin approval
    // Description and category will be set by admin before approval
    if (accountType === 'startup' && name) {
      try {
        await pool.query(
          `INSERT INTO businesses (name, category, description, category_color, approved, created_at) 
           VALUES ($1, $2, $3, $4, false, CURRENT_TIMESTAMP)`,
          [
            name, // Business name (using user's name/company name)
            'Other', // Default category - admin must update before approval
            null, // Description must be set by admin before approval
            '#6b7280' // Default gray color
          ]
        );
        console.log(`Business entry created for startup user: ${email} - awaiting admin description and category`);
      } catch (businessError) {
        console.error('Error creating business entry:', businessError);
        // Don't fail registration if business creation fails - log it
      }
    }

    // Store password in history (for future password reuse prevention)
    await pool.query(
      'INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)',
      [user.id, passwordHash]
    );

    // Log successful registration
    await logSecurityEvent(
      user.id,
      'registration_success',
      req.ip || req.socket.remoteAddress,
      req.get('user-agent'),
      { email: user.email, accountType }
    );

    // Don't generate login token yet - user must verify email first
    // For investors, they also need admin approval after email verification
    let successMessage = 'Registration successful! Please check your email to verify your account before logging in.';
    if (accountType === 'investor') {
      successMessage = 'Registration successful! Please check your email to verify your account. After verification, your account will be reviewed by an administrator for approval.';
    }

    res.status(201).json({
      message: successMessage,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phone_number,
        country: user.country,
        accountType: user.account_type,
        tin: user.tin,
        role: user.role,
        emailVerified: user.email_verified,
        approved: accountType === 'investor' ? false : undefined
      },
      requiresVerification: true,
      requiresApproval: accountType === 'investor'
    });
  } catch (error) {
    // Clean up uploaded file if registration fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Regular User Login
app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, name, role, email_verified, account_type FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      // Log failed login attempt (user not found)
      await logSecurityEvent(
        null,
        'login_failure',
        req.ip || req.socket.remoteAddress,
        req.get('user-agent'),
        { reason: 'user_not_found', email: email.toLowerCase().trim() }
      );
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Check account lockout
    const lockoutStatus = await checkAccountLockout(user.id);
    if (lockoutStatus.locked) {
      await logSecurityEvent(
        user.id,
        'login_failure',
        req.ip || req.socket.remoteAddress,
        req.get('user-agent'),
        { reason: 'account_locked', unlockTime: lockoutStatus.unlockTime }
      );
      return res.status(423).json({ 
        error: `Account is temporarily locked due to too many failed login attempts. Please try again after ${lockoutStatus.unlockTime?.toLocaleString()}.`,
        locked: true,
        unlockTime: lockoutStatus.unlockTime
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      await logSecurityEvent(
        user.id,
        'login_failure',
        req.ip || req.socket.remoteAddress,
        req.get('user-agent'),
        { reason: 'email_not_verified' }
      );
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in. Check your inbox for the verification email.',
        requiresVerification: true
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Increment failed login attempts
      await handleFailedLogin(user.id);
      await logSecurityEvent(
        user.id,
        'login_failure',
        req.ip || req.socket.remoteAddress,
        req.get('user-agent'),
        { reason: 'invalid_password' }
      );
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // If user is an investor, check if they're approved
    if (user.account_type === 'investor') {
      const investorResult = await pool.query(
        'SELECT approved, rejection_reason FROM investors WHERE user_id = $1',
        [user.id]
      );

      if (investorResult.rows.length === 0) {
        return res.status(403).json({ 
          error: 'Investor account not found. Please contact support.',
          requiresApproval: true
        });
      }

      const investor = investorResult.rows[0];

      if (!investor.approved) {
        return res.status(403).json({ 
          error: investor.rejection_reason 
            ? `Your investor account has been rejected: ${investor.rejection_reason}. Please contact support if you believe this is an error.`
            : 'Your investor account is pending admin approval. You will be notified once your account has been reviewed.',
          requiresApproval: true,
          pendingApproval: !investor.rejection_reason
        });
      }
    }

    // Reset failed login attempts on successful login
    await resetFailedLoginAttempts(user.id, req.ip || req.socket.remoteAddress);

    // Log successful login
    await logSecurityEvent(
      user.id,
      'login_success',
      req.ip || req.socket.remoteAddress,
      req.get('user-agent'),
      { email: user.email, role: user.role }
    );

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    // Return generic error to prevent information disclosure
    res.status(500).json({ 
      error: 'Invalid email or password'
    });
  }
});

// Admin Registration - Disabled (admins can only be created by existing admins via dashboard)
app.post('/api/auth/admin/register', async (req: Request, res: Response) => {
  res.status(403).json({ 
    error: 'Admin registration is disabled. Admins can only be created by existing admins.' 
  });
});

// Admin Login
app.post('/api/auth/admin/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find admin user
    const result = await pool.query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1 AND role = $2',
      [email.toLowerCase().trim(), 'admin']
    );

    if (result.rows.length === 0) {
      // Log failed admin login attempt
      await logSecurityEvent(
        null,
        'admin_login_failure',
        req.ip || req.socket.remoteAddress,
        req.get('user-agent'),
        { reason: 'user_not_found', email: email.toLowerCase().trim() }
      );
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Check account lockout for admin too
    const lockoutStatus = await checkAccountLockout(user.id);
    if (lockoutStatus.locked) {
      await logSecurityEvent(
        user.id,
        'admin_login_failure',
        req.ip || req.socket.remoteAddress,
        req.get('user-agent'),
        { reason: 'account_locked', unlockTime: lockoutStatus.unlockTime }
      );
      return res.status(423).json({ 
        error: `Account is temporarily locked due to too many failed login attempts. Please try again after ${lockoutStatus.unlockTime?.toLocaleString()}.`,
        locked: true,
        unlockTime: lockoutStatus.unlockTime
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Increment failed login attempts
      await handleFailedLogin(user.id);
      await logSecurityEvent(
        user.id,
        'admin_login_failure',
        req.ip || req.socket.remoteAddress,
        req.get('user-agent'),
        { reason: 'invalid_password' }
      );
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Reset failed login attempts on successful login
    await resetFailedLoginAttempts(user.id, req.ip || req.socket.remoteAddress);

    // Log successful admin login
    await logSecurityEvent(
      user.id,
      'admin_login_success',
      req.ip || req.socket.remoteAddress,
      req.get('user-agent'),
      { email: user.email }
    );

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      message: 'Admin login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    // Return generic error to prevent information disclosure
    res.status(500).json({ 
      error: 'Invalid email or password'
    });
  }
});

// Create Admin (authenticated endpoint - only existing admins can create new admins)
app.post('/api/auth/admin/create', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, 'admin') 
       RETURNING id, email, name, role, created_at`,
      [email.toLowerCase().trim(), passwordHash, name || null]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Admin account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Token verification endpoint (optional, for frontend to verify tokens)
app.post('/api/auth/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };

    // Get fresh user data
    const result = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        valid: false,
        error: 'Invalid or expired token' 
      });
    }

    res.json({
      valid: true,
      user: result.rows[0]
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        valid: false,
        error: 'Invalid or expired token' 
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Email Verification Endpoint
app.get('/api/auth/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        error: 'Verification token is required' 
      });
    }

    // Find user with this verification token
    const result = await pool.query(
      'SELECT id, email, name, email_verified, verification_token_expires_at FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired verification token. Please request a new verification email.' 
      });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(200).json({ 
        message: 'Your email has already been verified. You can now log in.',
        alreadyVerified: true
      });
    }

    // Check if token has expired
    if (user.verification_token_expires_at && new Date(user.verification_token_expires_at) < new Date()) {
      return res.status(400).json({ 
        error: 'This verification link has expired. Please request a new verification email.',
        expired: true
      });
    }

    // Verify the email
    await pool.query(
      'UPDATE users SET email_verified = true, verification_token = NULL, verification_token_expires_at = NULL WHERE id = $1',
      [user.id]
    );

    res.status(200).json({ 
      message: 'Email verified successfully! You can now log in to your account.',
      verified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      error: 'Email verification failed. Please try again.',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resend Verification Email Endpoint
app.post('/api/auth/resend-verification', emailResendLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email address is required' 
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, name, email_verified FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(200).json({ 
        message: 'If an account exists with this email, a verification email has been sent.' 
      });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(200).json({ 
        message: 'Your email is already verified. You can log in to your account.' 
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    // Update user with new token
    await pool.query(
      'UPDATE users SET verification_token = $1, verification_token_expires_at = $2 WHERE id = $3',
      [verificationToken, verificationTokenExpires, user.id]
    );

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, verificationToken, user.name || undefined);
    
    if (emailSent) {
      res.status(200).json({ 
        message: 'Verification email has been sent. Please check your inbox.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send verification email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again.',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all investors (for admin dashboard)
app.get('/api/auth/investors', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.user_id, i.email, i.name, i.phone_number, i.country, i.approved, 
              i.approved_at, i.approved_by, i.rejection_reason, i.created_at,
              u.email_verified
       FROM investors i
       LEFT JOIN users u ON i.user_id = u.id
       ORDER BY i.created_at DESC`
    );

    res.json({
      investors: result.rows.map(investor => ({
        id: investor.id,
        userId: investor.user_id,
        email: investor.email,
        name: investor.name,
        phoneNumber: investor.phone_number,
        country: investor.country,
        approved: investor.approved,
        approvedAt: investor.approved_at,
        approvedBy: investor.approved_by,
        rejectionReason: investor.rejection_reason,
        createdAt: investor.created_at,
        emailVerified: investor.email_verified
      }))
    });
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Approve investor
app.post('/api/auth/investors/:id/approve', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const investorId = parseInt(req.params.id);
    const adminUser = (req as any).user;

    if (isNaN(investorId)) {
      return res.status(400).json({ error: 'Invalid investor ID' });
    }

    // Update investor approval status
    const result = await pool.query(
      `UPDATE investors 
       SET approved = true, 
           approved_at = CURRENT_TIMESTAMP, 
           approved_by = $1,
           rejection_reason = NULL
       WHERE id = $2
       RETURNING id, email, name, approved`,
      [adminUser.userId, investorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    res.json({
      message: 'Investor approved successfully',
      investor: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving investor:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Reject investor
app.post('/api/auth/investors/:id/reject', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const investorId = parseInt(req.params.id);
    const { reason } = req.body;
    const adminUser = (req as any).user;

    if (isNaN(investorId)) {
      return res.status(400).json({ error: 'Invalid investor ID' });
    }

    // Update investor rejection status
    const result = await pool.query(
      `UPDATE investors 
       SET approved = false, 
           approved_at = NULL, 
           approved_by = $1,
           rejection_reason = $2
       WHERE id = $3
       RETURNING id, email, name, approved, rejection_reason`,
      [adminUser.userId, reason || 'Account rejected by administrator', investorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    res.json({
      message: 'Investor rejected successfully',
      investor: result.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting investor:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Password Reset Request Endpoint
app.post('/api/auth/password-reset-request', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email address is required' 
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    // Don't reveal if email exists or not (security best practice)
    if (result.rows.length === 0) {
      // Still return success to prevent email enumeration
      return res.status(200).json({ 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    const user = result.rows[0];

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour expiry

    // Store reset token in database
    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_token_expires_at = $2 WHERE id = $3',
      [resetToken, resetTokenExpires, user.id]
    );

    // Log password reset request
    await logSecurityEvent(
      user.id,
      'password_reset_requested',
      req.ip || req.socket.remoteAddress,
      req.get('user-agent'),
      { email: user.email }
    );

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken, user.name || undefined);
    if (!emailSent) {
      console.error(`Failed to send password reset email to ${user.email}, but token was generated.`);
      console.error('User can try requesting again later.');
      // Don't fail the request - token is still valid, user can try again
    } else {
      console.log(`Password reset email sent successfully to: ${user.email}`);
    }

    res.status(200).json({ 
      message: 'If an account exists with this email, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again.',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Password Reset Endpoint (with token)
app.post('/api/auth/password-reset', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Reset token and new password are required' 
      });
    }

    // Find user with this reset token
    const result = await pool.query(
      'SELECT id, email, password_reset_token_expires_at FROM users WHERE password_reset_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    const user = result.rows[0];

    // Check if token has expired
    if (user.password_reset_token_expires_at && new Date(user.password_reset_token_expires_at) < new Date()) {
      return res.status(400).json({ 
        error: 'This reset token has expired. Please request a new password reset.',
        expired: true
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'New password does not meet security requirements.',
        details: passwordValidation.errors,
        strength: passwordValidation.strength
      });
    }

    // Check password history (prevent reuse of last 5 passwords)
    const historyResult = await pool.query(
      'SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [user.id]
    );

    for (const oldHash of historyResult.rows) {
      const isReused = await bcrypt.compare(newPassword, oldHash.password_hash);
      if (isReused) {
        return res.status(400).json({ 
          error: 'You cannot reuse a recently used password. Please choose a different password.' 
        });
      }
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, 
           password_reset_token = NULL, 
           password_reset_token_expires_at = NULL,
           password_reset_at = CURRENT_TIMESTAMP,
           failed_login_attempts = 0,
           account_locked_until = NULL
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    // Store new password in history
    await pool.query(
      'INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)',
      [user.id, passwordHash]
    );

    // Log password reset
    await logSecurityEvent(
      user.id,
      'password_reset_success',
      req.ip || req.socket.remoteAddress,
      req.get('user-agent'),
      { email: user.email }
    );

    res.status(200).json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      error: 'Password reset failed. Please try again.',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware (must be last)
app.use(errorSanitizer);

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
  console.log(`JWT Secret configured: ${JWT_SECRET ? 'Yes' : 'No (using default - CHANGE IN PRODUCTION!)'}`);
  console.log(`Security features: Rate limiting, Account lockout, Password validation, Security headers enabled`);
  
  // Log email configuration status
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`Email service: Configured (${process.env.SMTP_USER})`);
  } else {
    console.log('Email service: Not configured - Email verification will not work until SMTP credentials are set');
    console.log('  Set SMTP_USER and SMTP_PASS in your .env file to enable email verification');
  }
});
