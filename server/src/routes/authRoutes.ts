import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { User } from '../models/User';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth';
import { StudentProfile } from '../models/StudentProfile';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student', college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. If MongoDB is connected, use MongoDB
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        role,
        college: college ? college.trim() : '',
        isOnboarded: false,
      });

      // Create initial profile
      await StudentProfile.create({
        userId: user._id,
        targetGoal: 'Web Development',
        streakDays: 0,
        totalPoints: 0,
        progressPercent: 0,
        skillsCompleted: 0,
        totalSkills: 0,
        projectsCompleted: 0,
        totalProjects: 0,
      });

      const token = generateToken(user._id.toString(), user.role, user.email);
      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          degree: user.degree,
          year: user.year,
          avatar: user.avatar,
          isOnboarded: user.isOnboarded,
          targetGoal: user.targetGoal,
          fieldOfInterest: user.fieldOfInterest,
          verificationStatus: user.verificationStatus,
        },
      });
    }

    // 2. Production Supabase-first registration when MongoDB is not active
    if (isSupabaseConfigured() && supabase) {
      // Check existing profile in Supabase
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProfile) {
        return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
      }

      try {
        // Attempt admin sign up with email pre-confirmed
        const { data: sbAuthUser, error: sbAuthErr } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: { full_name: name, role },
        });

        if (sbAuthErr) {
          console.warn('Supabase admin.createUser notice:', sbAuthErr.message);
          if (
            sbAuthErr.message?.toLowerCase().includes('already') ||
            (sbAuthErr as any).status === 422
          ) {
            return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
          }
        }

        const userId = sbAuthUser?.user?.id || crypto.randomUUID();

        // Ensure profile row exists
        await supabase.from('profiles').upsert({
          id: userId,
          email: cleanEmail,
          full_name: name,
          role,
          college_name: college ? college.trim() : '',
          is_onboarded: false,
        });

        const token = generateToken(userId, role, cleanEmail);
        return res.status(201).json({
          token,
          user: {
            id: userId,
            name,
            email: cleanEmail,
            role,
            college: college ? college.trim() : '',
            isOnboarded: false,
            targetGoal: 'Web Development',
            fieldOfInterest: 'Web Development',
            verificationStatus: 'approved',
          },
        });
      } catch (adminErr: any) {
        console.warn('Supabase auth fallback:', adminErr?.message || adminErr);
        // Direct profile insert fallback
        const userId = crypto.randomUUID();
        await supabase.from('profiles').upsert({
          id: userId,
          email: cleanEmail,
          full_name: name,
          role,
          college_name: college ? college.trim() : '',
          is_onboarded: false,
        });

        const token = generateToken(userId, role, cleanEmail);
        return res.status(201).json({
          token,
          user: {
            id: userId,
            name,
            email: cleanEmail,
            role,
            college: college ? college.trim() : '',
            isOnboarded: false,
            targetGoal: 'Web Development',
            fieldOfInterest: 'Web Development',
            verificationStatus: 'approved',
          },
        });
      }
    }

    // 3. Fallback token generation
    const userId = crypto.randomUUID();
    const token = generateToken(userId, role, cleanEmail);
    return res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email: cleanEmail,
        role,
        college: college ? college.trim() : '',
        isOnboarded: false,
        targetGoal: 'Web Development',
        fieldOfInterest: 'Web Development',
        verificationStatus: 'approved',
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
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

    const cleanEmail = email.toLowerCase().trim();

    // 1. If MongoDB is connected, check MongoDB
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        if (user.password === 'supabase_oauth_managed') {
          return res.status(400).json({
            code: 'GOOGLE_AUTH_REQUIRED',
            message: 'This account was created with Google. Please click "Continue with Google" to sign in.',
          });
        }

        if (user.password) {
          const match = await bcrypt.compare(password, user.password);
          if (match) {
            const token = generateToken(user._id.toString(), user.role, user.email);
            return res.json({
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                college: user.college,
                degree: user.degree,
                year: user.year,
                avatar: user.avatar,
                isOnboarded: user.isOnboarded,
                targetGoal: user.targetGoal,
                fieldOfInterest: user.fieldOfInterest,
                verificationStatus: user.verificationStatus,
              },
            });
          }
        }
      }
    }

    // 2. Try Supabase Auth
    if (isSupabaseConfigured() && supabase) {
      const { data: sbAuth, error: sbErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!sbErr && sbAuth.user) {
        const { data: sbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sbAuth.user.id)
          .maybeSingle();

        const token = sbAuth.session?.access_token || generateToken(sbAuth.user.id, sbProfile?.role || 'student', cleanEmail);
        return res.json({
          token,
          user: {
            id: sbAuth.user.id,
            name: sbProfile?.full_name || sbAuth.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: sbProfile?.role || 'student',
            college: sbProfile?.college_name || '',
            degree: sbProfile?.degree || '',
            year: sbProfile?.year_of_study || '',
            avatar: sbProfile?.avatar_url || '',
            isOnboarded: Boolean(sbProfile?.is_onboarded),
            targetGoal: sbProfile?.target_goal || sbProfile?.field_of_interest || 'Web Development',
            fieldOfInterest: sbProfile?.field_of_interest || sbProfile?.target_goal || 'Web Development',
            verificationStatus: sbProfile?.verification_status || 'approved',
          },
        });
      }
    }

    return res.status(401).json({ message: 'Invalid email or password.' });
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
    targetGoal: req.user.targetGoal,
    fieldOfInterest: req.user.fieldOfInterest || req.user.targetGoal,
    verificationStatus: req.user.verificationStatus || 'approved',
    mentorExpertise: req.user.mentorExpertise || [],
    mentorOrganization: req.user.mentorOrganization || '',
    mentorExperienceYears: req.user.mentorExperienceYears || 0,
    mentorLinkedin: req.user.mentorLinkedin || '',
    isOnboarded: req.user.isOnboarded,
  });
});

export default router;
