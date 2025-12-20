import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      database: 'disconnected'
    });
  }
});

// Auth Routes
app.get('/api/auth', (req: Request, res: Response) => {
  res.json({ message: 'LinkVesta Auth Service' });
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  // Placeholder for registration logic
  res.json({ message: 'Registration endpoint - implement logic here' });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  // Placeholder for login logic
  res.json({ message: 'Login endpoint - implement logic here' });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});

