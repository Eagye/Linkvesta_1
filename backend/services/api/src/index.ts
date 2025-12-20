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

app.listen(PORT, () => {
  console.log(`API Service running on port ${PORT}`);
});

