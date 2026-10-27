import { Router } from 'express';
import { College } from '../models/CollegeAndReview';
import { Project } from '../models/Project';

const router = Router();

// GET /api/college/overview
router.get('/overview', async (req, res) => {
  try {
    let college = await College.findOne({});
    if (!college) {
      college = await College.create({
        name: 'Partner Institution',
        code: 'CAMPUS',
        location: 'Campus Analytics Hub',
        logo: '',
        totalStudents: 0,
        activeStudents: 0,
        averageExecutionRate: 0,
        skillDistribution: {
          webDev: 0,
          aiMl: 0,
          dataAnalytics: 0,
          cybersecurity: 0,
        },
        topProjectsCount: 0,
        activeHackathonTeamsCount: 0,
      });
    }

    const topProjects = await Project.find({ status: 'Completed' }).limit(5);

    res.json({
      college,
      topProjects,
      departmentStats: [],
      recentAchievements: [],
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
