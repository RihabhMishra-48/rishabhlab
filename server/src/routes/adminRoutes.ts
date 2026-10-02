import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import { PricingPlan } from '../models/CollegeAndReview';
import { Lesson } from '../models/Lesson';
import { CodingProblem } from '../models/CodingProblem';
import { Project } from '../models/Project';

const router = Router();

// GET /api/admin/overview & /api/admin/metrics
router.get(['/overview', '/metrics'], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const mentorsCount = await User.countDocuments({ role: 'mentor' });
    const totalLessons = await Lesson.countDocuments();
    const totalProblems = await CodingProblem.countDocuments();
    const totalProjects = await Project.countDocuments();
    const pricingPlans = await PricingPlan.find({});

    res.json({
      metrics: {
        totalUsers: totalUsers || 2480,
        activeStudents: studentsCount || 1980,
        mentors: mentorsCount || 24,
        partnerColleges: 6,
        avgCompletionRate: '68%',
        dailyActiveLearners: 1420,
      },
      contentMetrics: {
        totalLessons,
        totalProblems,
        totalProjects,
      },
      pricingPlans,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/pricing (Public / Pricing Page)
router.get('/pricing', async (req, res) => {
  try {
    let plans = await PricingPlan.find({});
    if (plans.length === 0) {
      plans = await PricingPlan.create([
        {
          key: 'free',
          name: 'Free',
          priceMonthly: 0,
          priceAnnual: 0,
          currency: '₹',
          tagline: 'Foundations for every ambitious student.',
          features: [
            'Basic diagnostic assessment',
            'Personalized learning roadmap',
            'Daily missions & streak tracking',
            'Core learning curriculum',
            'Basic coding practice sandbox',
            'Community forum access',
          ],
        },
        {
          key: 'pro',
          name: 'Pro',
          priceMonthly: 799,
          priceAnnual: 6999,
          currency: '₹',
          tagline: 'Fast-track your skills, projects & hackathons.',
          isPopular: true,
          features: [
            'All Free features',
            'Advanced AI personalization engine',
            'Full project workspaces with GitHub push',
            'Hackathon Mode with 48h MVP planner',
            'LeetCode-style code editor & multi-language test suites',
            'Debugging lab challenges',
            'Progressive AI hints ("I\'m Stuck")',
            'Verified public Proof of Work portfolio',
          ],
        },
        {
          key: 'mentorship',
          name: 'Mentorship',
          priceMonthly: 2499,
          priceAnnual: 22999,
          currency: '₹',
          tagline: '1:1 guidance from industry engineers & leaders.',
          features: [
            'All Pro features',
            'Two 1:1 mentor sessions per month',
            'Codebase & architecture review',
            'Hackathon pitch & prototype teardown',
            'Direct resume & portfolio critique',
            'Internship & placement interview drills',
          ],
        },
      ]);
    }
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/pricing/:key - update pricing from admin panel
router.put('/pricing/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { priceMonthly, priceAnnual, tagline, features } = req.body;

    const plan = await PricingPlan.findOneAndUpdate(
      { key },
      { priceMonthly, priceAnnual, tagline, features },
      { new: true }
    );

    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
