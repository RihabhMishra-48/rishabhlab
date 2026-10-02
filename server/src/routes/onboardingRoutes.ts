import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Onboarding } from '../models/StudentProfile';
import { Roadmap } from '../models/Roadmap';
import { DailyMission } from '../models/DailyMission';
import { StudentProfile } from '../models/StudentProfile';
import { aiService } from '../services/aiService';

const router = Router();

// Submit student onboarding data
router.post('/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { goal, currentLevel, availableTime, desiredOutcome, targetDate, existingSkills, preferredLearningStyle } = req.body;

    const onboardingRecord = await Onboarding.create({
      userId: user._id,
      goal: goal || 'Web Development',
      currentLevel: currentLevel || 'Complete Beginner',
      availableTime: availableTime || '2 hours/day',
      desiredOutcome: desiredOutcome || 'Build projects',
      targetDate: targetDate || '90 days',
      existingSkills: existingSkills || [],
      preferredLearningStyle: preferredLearningStyle || 'Hands-on Building',
      status: 'completed',
    });

    const selectedGoal = goal || 'AI / ML';

    // Clear any previous roadmaps/missions for this user so the new track takes effect immediately
    await Roadmap.deleteMany({ userId: user._id });
    await DailyMission.deleteMany({ userId: user._id });

    // Generate tailored Roadmap via AIService
    const generatedRoadmapData = await aiService.generateRoadmap({
      goal: selectedGoal,
      currentLevel: currentLevel || 'Complete Beginner',
      availableTime: availableTime || '2 hours/day',
      desiredOutcome: desiredOutcome || 'Build projects',
      targetDate: targetDate || '90 days',
      existingSkills: existingSkills || [],
    });

    const roadmap = await Roadmap.create({
      ...generatedRoadmapData,
      userId: user._id,
    });

    // Generate initial Daily Mission
    const missionData = await aiService.generateDailyMission(1, selectedGoal);
    const mission = await DailyMission.create({
      userId: user._id,
      dayNumber: 1,
      trackTitle: selectedGoal,
      dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      quote: missionData.quote,
      tasks: missionData.tasks,
      completedTasksCount: 0,
      isAllCompleted: false,
    });

    // Update user profile in local MongoDB
    await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      {
        targetGoal: selectedGoal,
        activeRoadmapId: roadmap._id,
        progressPercent: 5,
        skillsCompleted: 0,
        streakDays: 1,
      },
      { upsert: true }
    );

    user.targetGoal = selectedGoal;
    user.isOnboarded = true;
    await user.save();

    // Sync to Supabase profiles if configured
    try {
      const { supabase, isSupabaseConfigured } = await import('../config/supabase');
      if (isSupabaseConfigured() && supabase) {
        await supabase
          .from('profiles')
          .update({
            target_goal: selectedGoal,
            current_level: currentLevel,
            available_time: availableTime,
            desired_outcome: desiredOutcome,
          })
          .eq('email', user.email);
      }
    } catch (e: any) {
      console.warn('Could not sync onboarding to Supabase:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Onboarding completed and personalized roadmap generated!',
      onboarding: onboardingRecord,
      roadmapId: roadmap._id,
      missionId: mission._id,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to complete onboarding: ' + err.message });
  }
});

// "Not Sure Yet" Assessment Evaluation
router.post('/not-sure-assessment', async (req, res) => {
  try {
    const { interests, currentSkills, comfortLevel, preferredWork, timeAvailability } = req.body;
    const result = await aiService.evaluateNotSurePath({
      interests: interests || [],
      currentSkills: currentSkills || [],
      comfortLevel: comfortLevel || 'Beginner',
      preferredWork: preferredWork || 'Visual & Interactive',
      timeAvailability: timeAvailability || '2 hours/day',
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
