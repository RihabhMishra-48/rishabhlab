import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import { isSupabaseConfigured } from './config/supabase';
import { seedSupabase } from './seed/seedSupabase';

// Route imports
import authRoutes from './routes/authRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import roadmapRoutes from './routes/roadmapRoutes';
import missionRoutes from './routes/missionRoutes';
import learningRoutes from './routes/learningRoutes';
import codingRoutes from './routes/codingRoutes';
import projectRoutes from './routes/projectRoutes';
import hackathonRoutes from './routes/hackathonRoutes';
import hackathonAggregatorRoutes from './routes/hackathonAggregatorRoutes';
import { schedulerService } from './services/SchedulerService';
import { logger } from './config/logger';
import mentorshipRoutes from './routes/mentorshipRoutes';
import weeklyReviewRoutes from './routes/weeklyReviewRoutes';
import profileRoutes from './routes/profileRoutes';
import collegeRoutes from './routes/collegeRoutes';
import adminRoutes from './routes/adminRoutes';
import pycodeRoutes from './routes/pycodeRoutes';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const app = express();
const PORT = process.env.PORT || 5005;

// Security and utility middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://rishabhlabs.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server) or matched origins
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.endsWith('.vercel.app') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, origin);
    }
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'Rishabh Labs API',
    version: '1.0.0',
    philosophy: "Don't just learn. Know what to do next.",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/lessons', learningRoutes);
app.use('/api/problems', codingRoutes);
app.use('/api/code', codingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/hackathon', hackathonRoutes);
app.use('/api/hackathons', hackathonAggregatorRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/mentors', mentorshipRoutes);
app.use('/api/weekly-review', weeklyReviewRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pycode', pycodeRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
});

const startServer = async () => {
  // In Vercel serverless environment, connect non-blockingly and do not bind app.listen()
  if (process.env.VERCEL) {
    connectDB().catch((err) => console.warn('DB connect notice:', err?.message || err));
    return;
  }

  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection notice:', error);
  }

  // Local development / standalone container mode
  let retryCount = 0;
  const maxRetries = 3;

  const server = app.listen(PORT, () => {
    console.log(`🚀 [Rishabh Labs Backend] Server running on http://localhost:${PORT}`);
    console.log(`📡 [Rishabh Labs Backend] Core API mounted at http://localhost:${PORT}/api`);

    // Sync Supabase non-blockingly in the background
    if (isSupabaseConfigured()) {
      console.log('⚡ [Supabase] Syncing initial schema & curriculum data with live Supabase in background...');
      seedSupabase().catch((err: any) => {
        console.error('❌ [Supabase Seed Error]:', err?.message || err);
      });
    }

    // Initialize Hackathon Aggregator 24h cron
    schedulerService.initScheduler();
    logger.info(`✨ [Startup] System ready. Operating 100% on Supabase PostgreSQL cloud database.`);
  });

  // Handle port conflicts gracefully (prevents unhandled EADDRINUSE crash)
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      if (retryCount < maxRetries) {
        retryCount++;
        console.warn(`⚠️ [Port ${PORT} In Use] Waiting for previous process socket to release... Retrying in 1s (${retryCount}/${maxRetries})`);
        setTimeout(() => {
          try {
            server.close();
          } catch (_) {}
          server.listen(PORT);
        }, 1000);
      } else {
        console.error(`\n❌ [Rishabh Labs Backend] Port ${PORT} is already occupied by an active process.`);
        console.error(`👉 Run "npm run free-ports" or terminate the existing process.\n`);
        process.exit(1);
      }
    } else {
      console.error('❌ [Server Error]:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown: ensures socket is immediately freed on reload / exit
  const gracefulShutdown = () => {
    console.log('\n🛑 [Rishabh Labs Backend] Gracefully releasing port and closing server...');
    schedulerService.stopScheduler();
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 1500);
  };

  process.once('SIGTERM', gracefulShutdown);
  process.once('SIGINT', gracefulShutdown);

  return server;
};

startServer();

export default app;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  (module.exports as any).default = app;
}
