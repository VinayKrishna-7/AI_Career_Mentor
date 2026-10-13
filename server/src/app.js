import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { testConnection } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import careersRoutes from './routes/careers.routes.js';
import roadmapsRoutes from './routes/roadmaps.routes.js';
import chatRoutes from './routes/chat.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import resourcesRoutes from './routes/resources.routes.js';
import applicationsRoutes from './routes/applications.routes.js';
import plannerRoutes from './routes/planner.routes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration supporting cookies
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus.inMemory ? 'in-memory' : (dbStatus.connected ? 'connected' : 'disconnected'),
    inMemoryFallback: !!dbStatus.inMemory,
    databaseError: dbStatus.error || null,
    uptime: process.uptime(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/roadmaps', roadmapsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api', resourcesRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
