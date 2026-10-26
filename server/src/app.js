import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'campusfind-api',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }));

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: 'An unexpected server error occurred.' });
});

export default app;
