import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database';
import { storageService } from './services/storage';

dotenv.config();

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
      database: 'disconnected'
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
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Businesses endpoints
app.get('/api/businesses', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, category, description, category_color as "categoryColor", logo_url as "logoUrl" FROM businesses ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/businesses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, category, description, category_color as "categoryColor", logo_url as "logoUrl" FROM businesses WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`API Service running on port ${PORT}`);
});

