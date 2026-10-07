import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import path from 'path';

import { runMigrations } from './db/migrate';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import startupsRoutes from './routes/startups';
import votingRoutes from './routes/voting';
import leaderboardRoutes from './routes/leaderboard';
import resultsRoutes from './routes/results';
import { errorHandler } from './middleware/errorHandler';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const server = http.createServer(app);

// Init Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow loading images
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

// Root Redirect
app.get('/', (req, res) => {
  res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/startups', startupsRoutes);
app.use('/api/votes', votingRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/results', resultsRoutes);

app.use(errorHandler);

// Socket Events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Run migrations and Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  try {
    runMigrations();
  } catch (e) {
    console.error('Migration failed:', e);
  }
});

export { io };
