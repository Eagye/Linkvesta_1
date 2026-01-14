import rateLimit from 'express-rate-limit';

// Get rate limit configuration from environment variables
const getRateLimitConfig = () => {
  return {
    // General API rate limiter - configurable via env
    generalMax: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '200'), // Increased from 100
    generalWindow: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS || '900000'), // 15 minutes
    
    // Auth rate limiter - configurable via env
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10'), // Increased from 5
    authWindow: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '900000'), // 15 minutes
    
    // Registration rate limiter
    registrationMax: parseInt(process.env.RATE_LIMIT_REGISTRATION_MAX || '5'), // Increased from 3
    registrationWindow: parseInt(process.env.RATE_LIMIT_REGISTRATION_WINDOW_MS || '3600000'), // 1 hour
    
    // Password reset rate limiter
    passwordResetMax: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_MAX || '5'), // Increased from 3
    passwordResetWindow: parseInt(process.env.RATE_LIMIT_PASSWORD_RESET_WINDOW_MS || '3600000'), // 1 hour
  };
};

const config = getRateLimitConfig();

// Helper to get user identifier for rate limiting (prefers user ID over IP)
const getUserIdentifier = (req: any): string => {
  // If user is authenticated, use user ID (allows multiple users from same IP)
  if (req.user?.userId) {
    return `user:${req.user.userId}`;
  }
  // For unauthenticated requests, use IP but with better handling
  // Check for X-Forwarded-For header (when behind proxy/load balancer)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // Take the first IP in the chain (original client IP)
    const clientIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim();
    return `ip:${clientIp}`;
  }
  return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
};

// General API rate limiter - More permissive for legitimate users
export const generalLimiter = rateLimit({
  windowMs: config.generalWindow,
  max: config.generalMax, // Increased to 200 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use better key generator for authenticated users
  keyGenerator: (req) => getUserIdentifier(req),
  // Skip successful requests to be more lenient
  skipSuccessfulRequests: false,
});

// Strict rate limiter for authentication endpoints
// More permissive than before - allows 10 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: config.authWindow,
  max: config.authMax, // Increased to 10 attempts per 15 minutes
  message: 'Too many login attempts. Please try again after a few minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => {
    // For login attempts, use email if available (more accurate than IP)
    // This allows multiple users from same IP to login
    const email = req.body?.email;
    if (email) {
      return `auth:${email.toLowerCase().trim()}`;
    }
    return getUserIdentifier(req);
  },
});

// Registration rate limiter - More permissive
export const registrationLimiter = rateLimit({
  windowMs: config.registrationWindow,
  max: config.registrationMax, // Increased to 5 per hour
  message: 'Too many registration attempts. Please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use email for registration (allows multiple users from same IP)
    const email = req.body?.email;
    if (email) {
      return `register:${email.toLowerCase().trim()}`;
    }
    return getUserIdentifier(req);
  },
});

// Password reset rate limiter - Per email, not per IP
export const passwordResetLimiter = rateLimit({
  windowMs: config.passwordResetWindow,
  max: config.passwordResetMax, // Increased to 5 per hour
  message: 'Too many password reset attempts. Please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Always use email for password reset (prevents abuse per email, not per IP)
    return req.body?.email 
      ? `reset:${req.body.email.toLowerCase().trim()}` 
      : getUserIdentifier(req);
  },
});

// Email verification resend limiter - Per email
export const emailResendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Increased to 5 per hour
  message: 'Too many verification email requests. Please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use email for resend (allows multiple users from same IP)
    return req.body?.email 
      ? `resend:${req.body.email.toLowerCase().trim()}` 
      : getUserIdentifier(req);
  },
});

// Trust proxy setting for accurate IP detection
// This should be set in your Express app if behind a proxy/load balancer
export const trustProxy = process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production';
