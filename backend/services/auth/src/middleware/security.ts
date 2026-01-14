import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Configure Helmet with security headers
 */
export function configureSecurityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  });
}

/**
 * Middleware to prevent information disclosure in error messages
 */
export function errorSanitizer(err: any, req: Request, res: Response, next: NextFunction) {
  // Log the full error server-side
  console.error('Error:', err);

  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    // Return generic error messages
    if (err.status) {
      return res.status(err.status).json({
        error: err.message || 'An error occurred',
      });
    }
    return res.status(500).json({
      error: 'Internal server error',
    });
  }

  // In development, show more details
  next(err);
}
