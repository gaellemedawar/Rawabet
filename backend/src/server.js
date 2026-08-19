import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import http from 'node:http';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { attachSocket } from './socket.js';

import authRoutes from './routes/authRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import deckRoutes from './routes/deckRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import browseRoutes from './routes/browseRoutes.js';
import { LEBANON_REGIONS, BUSINESS_NICHES } from './config/constants.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/constants', (req, res) => res.json({ regions: LEBANON_REGIONS, niches: BUSINESS_NICHES }));

app.use('/api/auth', authRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/deck', deckRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/browse', browseRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
attachSocket(httpServer, allowedOrigins);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => console.log(`Rawabet API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
