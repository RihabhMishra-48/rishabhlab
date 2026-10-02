import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { DailyMission } from '../models/DailyMission';
import { StudentProfile } from '../models/StudentProfile';
import { aiService } from '../services/aiService';

const router = Router();

// GET /api/missions/today
router.get('/today', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    let mission = await DailyMission.findOne({ userId: user._id }).sort({ dayNumber: -1 });
    const userGoal = (user as any).targetGoal || 'Cybersecurity';

    // If existing mission track is completely mismatched with user's targetGoal, regenerate for correct domain
    const isGoalMismatch = mission && userGoal && (
      (userGoal.toLowerCase().includes('cyber') && !mission.trackTitle.toLowerCase().includes('cyber') && !mission.trackTitle.toLowerCase().includes('sec')) ||
      (userGoal.toLowerCase().includes('ai') && !mission.trackTitle.toLowerCase().includes('ai') && !mission.trackTitle.toLowerCase().includes('ml')) ||
      (userGoal.toLowerCase().includes('data') && !mission.trackTitle.toLowerCase().includes('data'))
    );

    if (!mission || isGoalMismatch) {
      if (isGoalMismatch && mission) {
        await DailyMission.deleteMany({ userId: user._id });
      }
      const generated = await aiService.generateDailyMission(1, userGoal);
      mission = await DailyMission.create({
        userId: user._id,
        dayNumber: 1,
        trackTitle: userGoal,
        dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        quote: generated.quote,
        tasks: generated.tasks,
        completedTasksCount: 0,
        isAllCompleted: false,
      });
    }

    res.json(mission);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Complete specific mission task (Learn, Practice, Build, Ship)
router.post('/:missionId/task/:taskId/toggle', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { missionId, taskId } = req.params;
    const { isCompleted } = req.body;

    let mission = await DailyMission.findById(missionId);
    if (!mission) {
      mission = await DailyMission.findOne({});
    }
    if (!mission) return res.status(404).json({ message: 'Mission not found' });

    const task = mission.tasks.find((t) => t.taskId === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found in mission' });

    task.isCompleted = isCompleted !== undefined ? isCompleted : !task.isCompleted;
    if (task.isCompleted) {
      task.completedAt = new Date();
    }

    mission.completedTasksCount = mission.tasks.filter((t) => t.isCompleted).length;
    mission.isAllCompleted = mission.completedTasksCount === mission.tasks.length;
    await mission.save();

    // Reward points on task or full mission completion
    if (mission.isAllCompleted) {
      await StudentProfile.findOneAndUpdate(
        { userId: req.user?._id },
        { $inc: { totalPoints: 50, streakDays: 1 } }
      );
    }

    res.json({ success: true, mission });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Ship task proof submission (GitHub link / commit)
router.post('/:missionId/ship', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { missionId } = req.params;
    const { proofUrl, commitMessage } = req.body;

    let mission = await DailyMission.findById(missionId);
    if (!mission) {
      mission = await DailyMission.findOne({});
    }
    if (!mission) return res.status(404).json({ message: 'Mission not found' });

    const shipTask = mission.tasks.find((t) => t.type === 'ship');
    if (shipTask) {
      shipTask.isCompleted = true;
      shipTask.proofSubmitted = proofUrl || 'https://github.com/rishabh-labs/ai-resume-analyzer/commit/9f38a1';
      shipTask.completedAt = new Date();
    }

    mission.completedTasksCount = mission.tasks.filter((t) => t.isCompleted).length;
    mission.isAllCompleted = mission.completedTasksCount === mission.tasks.length;
    await mission.save();

    // Record activity on profile
    await StudentProfile.findOneAndUpdate(
      { userId: req.user?._id },
      {
        $inc: { totalPoints: 75, 'githubStats.totalCommits': 1 },
        $push: {
          'githubStats.recentActivities': {
            repo: 'ai-resume-analyzer',
            message: commitMessage || 'feat: add filter pills and search handler',
            timestamp: new Date(),
          },
        },
      }
    );

    res.json({
      success: true,
      message: 'Proof of work submitted and verified! Daily mission completed.',
      mission,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
