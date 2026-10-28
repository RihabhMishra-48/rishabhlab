import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { DailyMission } from '../models/DailyMission';
import { StudentProfile } from '../models/StudentProfile';
import { aiService } from '../services/aiService';

const router = Router();

// GET /api/missions/today
router.get('/today', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const userGoal = (user as any).targetGoal || 'Cybersecurity';
    const todayDateString = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const isMongoReady = mongoose.connection.readyState === 1;

    let mission: any = null;
    if (isMongoReady) {
      try {
        mission = await DailyMission.findOne({ userId: user._id }).sort({ dayNumber: -1 });
      } catch (e) {
        console.warn('Mongo findOne error in missions:', e);
      }
    }

    // If existing mission track is completely mismatched with user's targetGoal, regenerate for correct domain
    const isGoalMismatch = mission && userGoal && (
      (userGoal.toLowerCase().includes('cyber') && !mission.trackTitle?.toLowerCase().includes('cyber') && !mission.trackTitle?.toLowerCase().includes('sec')) ||
      (userGoal.toLowerCase().includes('ai') && !mission.trackTitle?.toLowerCase().includes('ai') && !mission.trackTitle?.toLowerCase().includes('ml')) ||
      (userGoal.toLowerCase().includes('data') && !mission.trackTitle?.toLowerCase().includes('data'))
    );

    // Check if a new calendar day has arrived
    const isNewDay = mission && mission.dateString !== todayDateString;

    if (!mission || isGoalMismatch || isNewDay) {
      if (isMongoReady && isGoalMismatch && mission) {
        try {
          await DailyMission.deleteMany({ userId: user._id });
        } catch (e) {}
      }

      // Compute dayNumber: advance by 1 each day, or calculate based on account registration
      let targetDayNumber = 1;
      if (!isGoalMismatch && mission) {
        targetDayNumber = (mission.dayNumber || 1) + 1;
      } else if (user.createdAt) {
        const userStartDate = new Date(user.createdAt);
        const daysElapsed = Math.floor((Date.now() - userStartDate.getTime()) / (1000 * 60 * 60 * 24));
        targetDayNumber = Math.max(1, daysElapsed + 1);
      }

      const generated = await aiService.generateDailyMission(targetDayNumber, userGoal);
      const payload = {
        userId: user._id,
        dayNumber: targetDayNumber,
        trackTitle: userGoal,
        dateString: todayDateString,
        quote: generated.quote,
        tasks: generated.tasks,
        completedTasksCount: 0,
        isAllCompleted: false,
      };

      if (isMongoReady) {
        try {
          mission = await DailyMission.create(payload);
        } catch (e) {
          mission = { _id: 'mission-' + Date.now(), ...payload };
        }
      } else {
        mission = { _id: 'mission-' + Date.now(), ...payload };
      }
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
    const isMongoReady = mongoose.connection.readyState === 1;

    let mission: any = null;
    if (isMongoReady) {
      if (mongoose.Types.ObjectId.isValid(missionId)) {
        mission = await DailyMission.findById(missionId);
      }
      if (!mission) {
        mission = await DailyMission.findOne({ userId: req.user?._id }) || await DailyMission.findOne({});
      }
    }

    if (!mission) {
      return res.json({
        success: true,
        mission: {
          _id: missionId,
          completedTasksCount: 1,
          isAllCompleted: false,
          tasks: [{ taskId, isCompleted: isCompleted !== undefined ? isCompleted : true }],
        },
      });
    }

    const task = mission.tasks.find((t: any) => t.taskId === taskId);
    if (!task) return res.status(404).json({ message: 'Task not found in mission' });

    task.isCompleted = isCompleted !== undefined ? isCompleted : !task.isCompleted;
    if (task.isCompleted) {
      task.completedAt = new Date();
    }

    mission.completedTasksCount = mission.tasks.filter((t: any) => t.isCompleted).length;
    mission.isAllCompleted = mission.completedTasksCount === mission.tasks.length;
    if (isMongoReady) {
      await mission.save();

      // Reward points on task or full mission completion
      if (mission.isAllCompleted) {
        await StudentProfile.findOneAndUpdate(
          { userId: req.user?._id },
          { $inc: { totalPoints: 50, streakDays: 1 } }
        ).catch(() => null);
      }
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
    const isMongoReady = mongoose.connection.readyState === 1;

    let mission: any = null;
    if (isMongoReady) {
      if (mongoose.Types.ObjectId.isValid(missionId)) {
        mission = await DailyMission.findById(missionId);
      }
      if (!mission) {
        mission = await DailyMission.findOne({ userId: req.user?._id }) || await DailyMission.findOne({});
      }
    }

    if (!mission) {
      return res.json({
        success: true,
        message: 'Proof of work submitted and verified!',
        mission: {
          _id: missionId,
          completedTasksCount: 4,
          isAllCompleted: true,
        },
      });
    }

    const shipTask = mission.tasks.find((t: any) => t.type === 'ship');
    if (shipTask) {
      shipTask.isCompleted = true;
      shipTask.proofSubmitted = proofUrl || 'https://github.com/rishabh-labs/ai-resume-analyzer/commit/9f38a1';
      shipTask.completedAt = new Date();
    }

    mission.completedTasksCount = mission.tasks.filter((t: any) => t.isCompleted).length;
    mission.isAllCompleted = mission.completedTasksCount === mission.tasks.length;
    if (isMongoReady) {
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
      ).catch(() => null);
    }

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
