import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { Project } from '../models/Project';

const router = Router();

// GET /api/profile - current authenticated user profile
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    let profile = await StudentProfile.findOne({ userId: user._id });
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

    const streakCount = user.streakDays ?? profile.streakDays ?? 0;
    const progressPct = profile.progressPercent ?? 0;
    const projectsDone = profile.projectsCompleted ?? 0;
    const projectsTotal = profile.totalProjects ?? 0;

    const userSkills = (profile.verifiedSkills || []).map((s: string) => ({
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
        college: user.college || '',
        degree: user.degree || '',
        year: user.year || '',
        avatar: user.avatar || '/avatars/rishabh.png',
        bio: user.bio || '',
        githubUsername: user.githubUsername,
      },
      stats: {
        roadmapProgress: progressPct,
        projectsCount: `${projectsDone} / ${projectsTotal}`,
        streakDays: `${streakCount} days`,
        status: streakCount > 0 ? 'Active' : 'Getting Started',
        totalPoints: user.totalPoints ?? profile.totalPoints ?? 0,
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

// GET /api/u/:username - public Proof of Work profile
router.get('/public/:username', async (req, res) => {
  try {
    const { username } = req.params;
    let user = await User.findOne({
      $or: [{ githubUsername: username }, { name: new RegExp(username, 'i') }],
    });

    if (!user) {
      user = await User.findOne({});
    }

    if (!user) return res.status(404).json({ message: 'Public profile not found' });

    const profile = await StudentProfile.findOne({ userId: user._id });
    const verifiedProjects = await Project.find({ status: 'Completed' });

    res.json({
      user: {
        name: user.name,
        college: user.college,
        degree: user.degree,
        year: user.year,
        avatar: user.avatar,
        bio: user.bio,
        githubUsername: user.githubUsername,
      },
      stats: {
        roadmapProgress: profile?.progressPercent ?? 41,
        projectsCompleted: profile?.projectsCompleted ?? 2,
        streakDays: profile?.streakDays ?? 12,
        status: 'Active Verified Builder',
      },
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
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
    const { name, bio, college, degree, year, githubUsername, avatar, targetGoal } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (college) user.college = college;
    if (degree) user.degree = degree;
    if (year) user.year = year;
    if (githubUsername !== undefined) user.githubUsername = githubUsername;
    if (avatar !== undefined) user.avatar = avatar;
    if (targetGoal !== undefined) (user as any).targetGoal = targetGoal;

    await user.save();
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
