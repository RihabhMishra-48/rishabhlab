import { Router } from 'express';
import { College } from '../models/CollegeAndReview';
import { Project } from '../models/Project';

const router = Router();

import mongoose from 'mongoose';

// GET /api/college/overview
router.get('/overview', async (req, res) => {
  try {
    const isMongoReady = mongoose.connection.readyState === 1;
    let college: any = null;

    if (isMongoReady) {
      try {
        college = await College.findOne({});
      } catch (e) {
        console.warn('Mongo find college error:', e);
      }
    }

    if (!college) {
      const defaultCollege = {
        name: 'GLA University & Partner Engineering Hub',
        code: 'GLA',
        location: 'Mathura, Uttar Pradesh, India',
        logo: '',
        totalStudents: 340,
        activeStudents: 285,
        averageExecutionRate: 88,
        skillDistribution: {
          webDev: 145,
          aiMl: 92,
          dataAnalytics: 64,
          cybersecurity: 39,
        },
        topProjectsCount: 42,
        activeHackathonTeamsCount: 18,
      };

      if (isMongoReady) {
        try {
          college = await College.create(defaultCollege);
        } catch (e) {
          college = { _id: 'default-college', ...defaultCollege };
        }
      } else {
        college = { _id: 'default-college', ...defaultCollege };
      }
    }

    let topProjects: any[] = [];
    if (isMongoReady) {
      try {
        topProjects = await Project.find({ status: 'Completed' }).limit(5);
      } catch (e) {}
    }

    if (topProjects.length === 0) {
      const { getCleanProjects } = await import('../seed/seedData');
      topProjects = getCleanProjects().slice(0, 3);
    }

    res.json({
      college,
      topProjects,
      departmentStats: [
        { department: 'Computer Science & Engineering', students: 180, active: 162, avgRate: 91 },
        { department: 'AI & Data Science', students: 85, active: 78, avgRate: 87 },
        { department: 'Information Technology', students: 75, active: 45, avgRate: 79 },
      ],
      recentAchievements: [
        { title: 'Smart India Hackathon Finalist', student: 'Rishabh Mishra & Team', date: 'Oct 2026' },
        { title: 'Top Performer on PyCode Hub', student: 'Arpit Pandey (Rank #1)', date: 'Oct 2026' },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
