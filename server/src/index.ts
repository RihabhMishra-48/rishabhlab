import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import { seedDatabase } from './seed/seedData';
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
import mentorshipRoutes from './routes/mentorshipRoutes';
import weeklyReviewRoutes from './routes/weeklyReviewRoutes';
import profileRoutes from './routes/profileRoutes';
import collegeRoutes from './routes/collegeRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(cors({
  origin: '*',
  credentials: true,
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
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/mentors', mentorshipRoutes);
app.use('/api/weekly-review', weeklyReviewRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    if (isSupabaseConfigured()) {
      console.log('⚡ [Supabase] Syncing initial schema & curriculum data with live Supabase...');
      await seedSupabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 [Rishabh Labs Backend] Server running on http://localhost:${PORT}`);
      console.log(`📡 [Rishabh Labs Backend] Core API mounted at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
