import { Router } from 'express';
import { College } from '../models/CollegeAndReview';
import { Project } from '../models/Project';

const router = Router();

// GET /api/college/overview
router.get('/overview', async (req, res) => {
  try {
    let college = await College.findOne({ code: 'GLA' });
    if (!college) {
      college = await College.create({
        name: 'GLA University',
        code: 'GLA',
        location: 'Mathura, Uttar Pradesh',
        logo: '/avatars/gla.png',
        totalStudents: 2450,
        activeStudents: 1980,
        averageExecutionRate: 64,
        skillDistribution: {
          webDev: 42,
          aiMl: 28,
          dataAnalytics: 18,
          cybersecurity: 12,
        },
        topProjectsCount: 142,
        activeHackathonTeamsCount: 18,
      });
    }

    const topProjects = await Project.find({ status: 'Completed' }).limit(5);

    res.json({
      college,
      topProjects,
      departmentStats: [
        { name: 'Computer Science & Engineering', students: 1280, executionRate: 72 },
        { name: 'Information Technology', students: 640, executionRate: 68 },
        { name: 'Data Science & AI', students: 530, executionRate: 81 },
      ],
      recentAchievements: [
        { title: 'Smart India Hackathon Finalists', team: 'Team Innovators (GLA)', date: 'Oct 2026' },
        { title: '840+ Daily Missions Completed this week', metric: 'Record Execution', date: 'This Week' },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
