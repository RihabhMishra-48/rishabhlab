import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Roadmap } from '../models/Roadmap';
import { StudentProfile } from '../models/StudentProfile';
import { aiService } from '../services/aiService';

const router = Router();

// GET /api/roadmap
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const profile = await StudentProfile.findOne({ userId: user._id });
    const userGoal = (req.query.track as string) || profile?.targetGoal || (user as any).targetGoal || 'AI / Machine Learning';

    let roadmap = await Roadmap.findOne({ userId: user._id });
    const shouldRegenerate = req.query.regenerate === 'true' || 
      (req.query.track && roadmap && !roadmap.title.toLowerCase().includes((req.query.track as string).toLowerCase().slice(0, 4)));

    if (!roadmap || shouldRegenerate) {
      const generated = await aiService.generateRoadmap({
        goal: userGoal,
        currentLevel: profile?.level || 'Beginner',
        availableTime: '2 hr/day',
        desiredOutcome: 'High-impact projects & placement',
        targetDate: '90 days',
      });

      if (roadmap) {
        roadmap.title = generated.title;
        roadmap.slug = generated.slug;
        roadmap.category = generated.category;
        roadmap.nodes = generated.nodes as any;
        roadmap.totalNodes = generated.totalNodes;
        roadmap.completedNodes = 0;
        await roadmap.save();
      } else {
        roadmap = await Roadmap.create({
          ...generated,
          userId: user._id,
        });
      }
    }

    const currentActiveNode = roadmap.nodes.find((n) => n.status === 'in_progress') || roadmap.nodes[0];

    res.json({
      roadmap,
      currentActiveNode,
      summary: {
        title: roadmap.title,
        trackInfo: `${roadmap.category} • ${roadmap.targetLevel} • ${roadmap.estimatedDailyTime} • ${roadmap.totalDurationDays} days`,
        completedCount: roadmap.nodes.filter((n) => n.status === 'completed').length,
        totalCount: roadmap.nodes.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/roadmap/generate - explicitly request Gemini to regenerate for a track
router.post('/generate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { goal, currentLevel, availableTime } = req.body;
    const selectedGoal = goal || (user as any).targetGoal || 'AI / Machine Learning';

    const generated = await aiService.generateRoadmap({
      goal: selectedGoal,
      currentLevel: currentLevel || 'Beginner',
      availableTime: availableTime || '2 hr/day',
      desiredOutcome: 'Mastery and live projects',
      targetDate: '90 days',
    });

    let roadmap = await Roadmap.findOne({ userId: user._id });
    if (roadmap) {
      roadmap.title = generated.title;
      roadmap.slug = generated.slug;
      roadmap.category = generated.category;
      roadmap.nodes = generated.nodes as any;
      roadmap.totalNodes = generated.totalNodes;
      roadmap.completedNodes = 0;
      await roadmap.save();
    } else {
      roadmap = await Roadmap.create({
        ...generated,
        userId: user._id,
      });
    }

    res.json({ success: true, roadmap });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update node status
router.post('/node/:nodeId/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { nodeId } = req.params;
    const { status } = req.body; // 'completed' | 'in_progress' | 'locked'

    const roadmap = await Roadmap.findOne({});
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    const node = roadmap.nodes.find((n) => n.nodeId === nodeId);
    if (!node) return res.status(404).json({ message: 'Node not found' });

    node.status = status;
    // Recalculate completed count
    roadmap.completedNodes = roadmap.nodes.filter((n) => n.status === 'completed').length;
    await roadmap.save();

    // Update student profile progress
    const progressPercent = Math.round((roadmap.completedNodes / roadmap.nodes.length) * 100);
    await StudentProfile.findOneAndUpdate(
      { userId: req.user?._id },
      { progressPercent, skillsCompleted: roadmap.completedNodes * 3 }
    );

    res.json({ success: true, roadmap });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
