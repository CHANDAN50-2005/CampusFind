import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import matchRoutes from './routes/matches.js';
import claimRoutes from './routes/claims.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads'), {
  fallthrough: false,
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
}));

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'campusfind-api',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/matches', requireAuth, matchRoutes);
app.use('/api/claims', requireAuth, claimRoutes);
app.use('/api/notifications', requireAuth, notificationRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/admin', requireAuth, adminRoutes);

app.use((request, response) => {
  response.status(404).json({ message: 'The requested resource was not found.' });
});

app.use((error, _request, response, _next) => {
  if (response.headersSent) return;
  if (error?.name === 'CastError') return response.status(400).json({ message: 'Invalid identifier or value.' });
  if (error?.name === 'ValidationError') return response.status(400).json({ message: 'Please check the submitted details.' });
  console.error(error);
  response.status(500).json({ message: 'An unexpected server error occurred.' });
});

export default app;
