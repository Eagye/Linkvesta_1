import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { pool } from './config/database';
import { storageService } from './services/storage';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'healthy',
      service: 'api',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      service: 'api',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'LinkVesta API Service' });
});

// Example route with database
app.get('/api/data', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Data retrieved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Example route with cloud storage
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    // This is a placeholder - implement actual file upload logic
    const fileUrl = await storageService.uploadFile('example-file.txt', Buffer.from('example content'));
    res.json({ 
      message: 'File uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    console.error('Storage error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Businesses endpoints - Public: only approved businesses
app.get('/api/businesses', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, category, description, category_color as "categoryColor", logo_url as "logoUrl" FROM businesses WHERE approved = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/businesses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, category, description, category_color as "categoryColor", logo_url as "logoUrl" FROM businesses WHERE id = $1 AND approved = true',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Middleware to verify admin JWT token
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

// Admin endpoints - Get all businesses (including unapproved)
app.get('/api/admin/businesses', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, category, description, category_color as "categoryColor", logo_url as "logoUrl", approved, created_at as "createdAt" FROM businesses ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin endpoint - Approve business
app.post('/api/admin/businesses/:id/approve', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE businesses SET approved = true WHERE id = $1 RETURNING id, name, approved',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'We couldn\'t find the business you\'re trying to approve. It may have already been removed.' });
    }
    res.json({ message: `Great! "${result.rows[0].name}" has been approved and is now visible to investors on the platform.`, business: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin endpoint - Reject and delete business and associated user
app.post('/api/admin/businesses/:id/reject', authenticateAdmin, async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    
    // Get business details first
    const businessResult = await client.query(
      'SELECT id, name, description FROM businesses WHERE id = $1',
      [id]
    );
    
    if (businessResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'We couldn\'t find the business you\'re trying to reject. It may have already been removed.' });
    }
    
    const business = businessResult.rows[0];
    
    // Extract email from business description to find associated user
    let userEmail = null;
    if (business.description) {
      const emailMatch = business.description.match(/submitted by\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
      if (emailMatch && emailMatch[1]) {
        userEmail = emailMatch[1].toLowerCase().trim();
      }
    }
    
    // Find and delete the associated user if email found
    if (userEmail) {
      // Get user's business registration document path before deleting
      const userResult = await client.query(
        'SELECT id, business_registration_document FROM users WHERE email = $1 AND account_type = $2',
        [userEmail, 'startup']
      );
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        
        // Delete the uploaded file if it exists
        if (user.business_registration_document) {
          try {
            const filePath = path.join(process.cwd(), 'backend', 'services', 'auth', user.business_registration_document);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted file: ${filePath}`);
            }
          } catch (fileError) {
            console.error('Error deleting file:', fileError);
            // Continue with user deletion even if file deletion fails
          }
        }
        
        // Delete the user
        await client.query('DELETE FROM users WHERE id = $1', [user.id]);
        console.log(`Deleted user: ${userEmail}`);
      }
    }
    
    // Delete the business
    await client.query('DELETE FROM businesses WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    res.json({ 
      message: `The business registration for "${business.name}" has been rejected and removed from the system. The associated user account and documents have also been deleted.`,
      deletedBusinessId: id
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'We encountered an issue while processing the rejection. Please try again in a moment.',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    client.release();
  }
});

// Admin endpoint - Get all users
app.get('/api/admin/users', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        email, 
        name, 
        COALESCE(phone_number, '') as "phoneNumber", 
        COALESCE(country, '') as "country", 
        COALESCE(account_type, '') as "accountType", 
        COALESCE(tin, '') as "tin",
        COALESCE(business_registration_document, '') as "businessRegistrationDocument",
        role, 
        created_at as "createdAt"
       FROM users 
       WHERE role = 'user'
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Waitlist endpoints
app.post('/api/waitlist', async (req: Request, res: Response) => {
  try {
    const { businessId, email, name } = req.body;
    
    if (!businessId || !email) {
      return res.status(400).json({ error: 'Business ID and email are required' });
    }

    // Check if business exists
    const businessCheck = await pool.query('SELECT id FROM businesses WHERE id = $1', [businessId]);
    if (businessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Insert into waitlist (handles duplicate with ON CONFLICT)
    const result = await pool.query(
      `INSERT INTO waitlist (business_id, email, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (business_id, email) DO NOTHING
       RETURNING id, business_id as "businessId", email, name, created_at as "createdAt"`,
      [businessId, email, name || null]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Email already on waitlist for this business' });
    }

    res.status(201).json({
      message: 'Successfully joined waitlist',
      waitlist: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/waitlist/:businessId', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const result = await pool.query(
      'SELECT id, email, name, created_at as "createdAt" FROM waitlist WHERE business_id = $1 ORDER BY created_at DESC',
      [businessId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`API Service running on port ${PORT}`);
});

