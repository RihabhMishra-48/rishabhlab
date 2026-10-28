import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { DailyMission } from '../models/DailyMission';
import { StudentProfile } from '../models/StudentProfile';
import { Roadmap } from '../models/Roadmap';
import { Project } from '../models/Project';
import { aiService } from '../services/aiService';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const router = Router();

// GET /api/dashboard
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    let profile: any = null;
    let roadmap: any = null;
    let mission: any = null;
    let inProgressProjects: any[] = [];

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (isSupabaseConfigured() && supabase) {
      const { data: sbProf } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id || user._id)
        .maybeSingle();

      if (sbProf) {
        profile = {
          targetGoal: sbProf.target_goal || sbProf.field_of_interest || 'Web Development',
          progressPercent: Math.round(((sbProf.skills_completed || 0) / 12) * 100),
          skillsCompleted: sbProf.skills_completed || 0,
          totalSkills: 12,
          projectsCompleted: 0,
          totalProjects: 3,
          streakDays: sbProf.streak_days || 0,
          totalPoints: sbProf.total_points || 0,
        };
      }
    }

    const userGoal = profile?.targetGoal || (user as any).targetGoal || 'Web Development';

    if (isMongoConnected) {
      roadmap = await Roadmap.findOne({ userId: user._id });
      if (!roadmap) {
        try {
          const generated = await aiService.generateRoadmap({
            goal: userGoal,
            currentLevel: 'Beginner',
            availableTime: '2 hours/day',
            desiredOutcome: 'Build projects',
            targetDate: '90 days',
          });
          roadmap = await Roadmap.create({
            ...generated,
            userId: user._id,
          });
        } catch {
          // Fall back gracefully
        }
      }

      mission = await DailyMission.findOne({ userId: user._id }).sort({ dayNumber: -1 });
      inProgressProjects = await Project.find({ status: 'In Progress' }).limit(3);
    }

    const defaultDay1Mission = {
      dayNumber: 1,
      trackTitle: userGoal,
      dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      quote: 'Small steps every day lead to big results.',
      tasks: [
        {
          taskId: 'task-1-learn',
          type: 'learn',
          title: `Learn - Foundations of ${userGoal} (25 min)`,
          durationMinutes: 25,
          isCompleted: false,
          actionUrl: '/learn',
        },
        {
          taskId: 'task-1-practice',
          type: 'practice',
          title: 'Practice - Solve First Problem (20 min)',
          durationMinutes: 20,
          isCompleted: false,
          actionUrl: '/practice/filter-active-users',
        },
        {
          taskId: 'task-1-build',
          type: 'build',
          title: 'Build - Initialize Project Workspace (40 min)',
          durationMinutes: 40,
          isCompleted: false,
          actionUrl: '/projects',
        },
        {
          taskId: 'task-1-ship',
          type: 'ship',
          title: "Ship - Commit Day 1 Setup (10 min)",
          durationMinutes: 10,
          isCompleted: false,
          actionUrl: '/projects',
        },
      ],
      completedTasksCount: 0,
      isAllCompleted: false,
    };

    res.json({
      greeting: `Good Morning, ${user.name.split(' ')[0]}`,
      subGreeting: "Keep going. Every day of focused execution compounds!",
      todayMission: mission || defaultDay1Mission,
      stats: {
        progressPercent: profile?.progressPercent ?? 0,
        skillsCompleted: profile?.skillsCompleted ?? 0,
        totalSkills: profile?.totalSkills ?? 0,
        projectsCompleted: profile?.projectsCompleted ?? 0,
        totalProjects: profile?.totalProjects ?? inProgressProjects.length,
        streakDays: profile?.streakDays ?? 0,
        totalPoints: profile?.totalPoints ?? 0,
      },
      roadmapSummary: {
        id: roadmap?._id,
        title: roadmap?.title || `${userGoal} Track`,
        currentStep: roadmap?.nodes.find((n: any) => n.status === 'in_progress')?.title || 'Foundations',
        totalNodes: roadmap?.nodes.length || 6,
        completedNodes: roadmap?.nodes.filter((n: any) => n.status === 'completed').length || 0,
      },
      nextRecommendedAction: {
        title: 'Start Day 1 Foundations Mission',
        type: 'learn',
        category: 'Learning',
        durationText: '25 min',
        linkUrl: '/learn',
      },
      inProgressProjects,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error loading dashboard: ' + err.message });
  }
});

export default router;
