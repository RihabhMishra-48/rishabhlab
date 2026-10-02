import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth';
import { StudentProfile } from '../models/StudentProfile';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student', college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      college: college || 'GLA University',
      isOnboarded: false,
    });

    // Create initial profile
    await StudentProfile.create({
      userId: user._id,
      targetGoal: 'Web Development',
      streakDays: 1,
      totalPoints: 100,
      progressPercent: 0,
      skillsCompleted: 0,
      totalSkills: 18,
      projectsCompleted: 0,
      totalProjects: 4,
    });

    const token = generateToken(user._id.toString(), user.role);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        avatar: user.avatar,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Registration failed: ' + err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password credentials.' });
    }

    if (user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password credentials.' });
      }
    }

    const token = generateToken(user._id.toString(), user.role);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        avatar: user.avatar,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Login failed: ' + err.message });
  }
});

// Get current user
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    college: req.user.college,
    degree: req.user.degree,
    year: req.user.year,
    avatar: req.user.avatar,
    bio: req.user.bio,
    githubUsername: req.user.githubUsername,
    isOnboarded: req.user.isOnboarded,
  });
});

// Demo Role Switcher (Allows instant preview of Student, Mentor, College Admin, Super Admin)
router.post('/switch-demo-role', async (req, res) => {
  try {
    const { role } = req.body;
    const targetEmail =
      role === 'mentor'
        ? 'mentor@rishabhlabs.com'
        : role === 'college_admin'
        ? 'admin@gla.ac.in'
        : role === 'super_admin'
        ? 'superadmin@rishabhlabs.com'
        : 'rishabh@rishabhlabs.com';

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      user = await User.findOne({ role: role || 'student' });
    }
    if (!user) {
      user = await User.findOne({});
    }

    if (!user) {
      return res.status(404).json({ message: 'No user found' });
    }

    const token = generateToken(user._id.toString(), user.role);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        avatar: user.avatar,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
