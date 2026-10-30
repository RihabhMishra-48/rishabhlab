import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { Project } from '../models/Project';
import { Roadmap } from '../models/Roadmap';

const router = Router();

import mongoose from 'mongoose';
import { supabase } from '../config/supabase';

// GET /api/profile - current authenticated user profile
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const isMongoReady = mongoose.connection.readyState === 1;

    let profile: any = null;
    let actualProjectsCount = 0;
    let completedProjectsCount = 0;
    let progressPct = 0;

    if (isMongoReady) {
      try {
        profile = await StudentProfile.findOne({ userId: user._id });
        if (!profile) {
          profile = await StudentProfile.create({
            userId: user._id,
            currentTrack: (user as any).targetGoal || 'Personalized Path',
            level: 'Beginner',
            progressPercent: 0,
            streakDays: user.streakDays || 0,
            totalPoints: user.totalPoints || 0,
            skillsCompleted: 0,
            projectsCompleted: 0,
            totalProjects: 0,
            nextMilestone: 'Complete Day 1 Mission',
          });
        }

        const roadmap = await Roadmap.findOne({ userId: user._id });
        const completedNodes = roadmap ? (roadmap.completedNodes || 0) : 0;
        const totalNodes = roadmap?.nodes?.length || 0;
        progressPct = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

        actualProjectsCount = await Project.countDocuments({ userId: user._id });
        completedProjectsCount = await Project.countDocuments({ userId: user._id, status: 'Completed' });

        if (profile.progressPercent !== progressPct || profile.totalProjects !== actualProjectsCount || profile.projectsCompleted !== completedProjectsCount) {
          profile.progressPercent = progressPct;
          profile.totalProjects = actualProjectsCount;
          profile.projectsCompleted = completedProjectsCount;
          await profile.save();
        }
      } catch (e) {
        console.warn('Mongo error in profile:', e);
      }
    }

    const streakCount = user.streakDays ?? profile?.streakDays ?? 0;
    const userSkills = (profile?.verifiedSkills || []).map((s: string) => ({
      name: s,
      category: 'Core',
      level: 'Verified',
      verified: true,
    }));

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        college: user.college || '',
        degree: user.degree || '',
        year: user.year || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        githubUsername: user.githubUsername,
      },
      stats: {
        roadmapProgress: progressPct,
        projectsCount: actualProjectsCount > 0 ? `${completedProjectsCount} / ${actualProjectsCount}` : '0',
        streakDays: `${streakCount} days`,
        status: streakCount > 0 ? 'Active' : 'Getting Started',
        totalPoints: user.totalPoints ?? profile?.totalPoints ?? 0,
      },
      skills: userSkills,
      projects: [],
      githubStats: {
        connected: Boolean(user.githubUsername),
        username: user.githubUsername || 'Not connected',
        totalCommits: 0,
        reposCount: 0,
        recentActivities: [],
      },
      achievements: [
        {
          title: 'Day 1 Explorer',
          icon: 'Sparkles',
          date: 'Active',
          desc: 'Registered on Rishabh Labs and set learning trajectory.',
        },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/profile/public/:username - public Proof of Work profile
router.get('/public/:username', async (req, res) => {
  try {
    const { username } = req.params;
    let user = await User.findOne({
      $or: [
        { githubUsername: username },
        { name: new RegExp(`^${username.replace(/-/g, ' ')}$`, 'i') },
        { email: new RegExp(`^${username}@`, 'i') },
      ],
    });

    if (!user && username.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(username);
    }

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const profile = await StudentProfile.findOne({ userId: user._id });
    const verifiedProjects = await Project.find({
      $or: [{ userId: user._id }, { status: 'Completed' }],
    }).limit(6);

    const userStreak = user.streakDays ?? profile?.streakDays ?? 0;
    const progressPct = profile?.progressPercent ?? 0;
    const projectsDone = profile?.projectsCompleted ?? (verifiedProjects.length || 0);

    res.json({
      user: {
        name: user.name,
        college: user.college || '',
        degree: user.degree || '',
        year: user.year || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        githubUsername: user.githubUsername || '',
        role: user.role,
        targetGoal: user.targetGoal || 'Software Engineering',
      },
      stats: {
        roadmapProgress: progressPct,
        projectsCompleted: projectsDone,
        streakDays: userStreak,
        totalPoints: user.totalPoints ?? profile?.totalPoints ?? 0,
        status: userStreak > 0 ? 'Active Verified Builder' : 'Learner',
      },
      skills: profile?.verifiedSkills || [],
      verifiedProjects,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/profile - edit profile
router.patch('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { name, bio, college, degree, year, githubUsername, avatar, targetGoal, phone } = req.body;

    const resolvedAvatar = avatar !== undefined ? (avatar || user.avatar || '') : user.avatar;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (degree !== undefined) user.degree = degree;
    if (year !== undefined) user.year = year;
    if (githubUsername !== undefined) user.githubUsername = githubUsername;
    if (resolvedAvatar !== undefined) user.avatar = resolvedAvatar;
    if (targetGoal !== undefined) (user as any).targetGoal = targetGoal;
    if (phone !== undefined) user.phone = phone;

    // 1. Sync directly to Supabase profiles & auth metadata
    if (supabase && (user._id || user.email)) {
      try {
        const sbUpdate: any = {};
        if (name) sbUpdate.full_name = name;
        if (bio !== undefined) sbUpdate.bio = bio;
        if (college !== undefined) sbUpdate.college_name = college;
        if (degree !== undefined) sbUpdate.degree = degree;
        if (year !== undefined) sbUpdate.year_of_study = year;
        if (githubUsername !== undefined) sbUpdate.github_username = githubUsername;
        if (avatar) sbUpdate.avatar_url = avatar;
        if (targetGoal) sbUpdate.target_goal = targetGoal;

        if (Object.keys(sbUpdate).length > 0) {
          if (user.email) {
            await supabase.from('profiles').update(sbUpdate).eq('email', user.email.toLowerCase());
          } else if (user._id) {
            await supabase.from('profiles').update(sbUpdate).eq('id', user._id.toString());
          }
        }

        if (phone !== undefined && user._id) {
          await supabase.auth.admin.updateUserById(user._id.toString(), {
            user_metadata: { phone }
          }).catch(() => {});
        }
      } catch (sbErr) {
        console.warn('Supabase profile update warning:', sbErr);
      }
    }

    // 2. Sync to MongoDB if connected
    if (mongoose.connection.readyState === 1 && user._id) {
      try {
        if (typeof (user as any).save === 'function') {
          await (user as any).save();
        } else {
          await User.findByIdAndUpdate(user._id, {
            name: user.name,
            bio: user.bio,
            college: user.college,
            degree: user.degree,
            year: user.year,
            phone: user.phone,
            githubUsername: user.githubUsername,
            avatar: user.avatar,
            targetGoal: (user as any).targetGoal,
          });
        }
      } catch (mErr) {
        console.warn('Mongo update profile warning:', mErr);
      }
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
