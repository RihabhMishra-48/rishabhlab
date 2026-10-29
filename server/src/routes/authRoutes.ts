import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { User } from '../models/User';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth';
import { StudentProfile } from '../models/StudentProfile';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { generate8DigitOtp, saveOtp, verifyOtp, canRequestOtp } from '../services/otpService';
import { sendOtpEmail } from '../services/emailService';

const router = Router();

// ==========================================
// 8-DIGIT OTP EMAIL VERIFICATION ROUTES
// ==========================================

// 1. Send / Resend 8-digit OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email, type = 'signup', name, password, role = 'student', college } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email format.' });
    }

    // Rate-limit check (minimum 30s cooldown between code dispatches)
    const rateCheck = canRequestOtp(cleanEmail);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        message: `Please wait ${rateCheck.waitSeconds}s before requesting a new verification code.`,
        waitSeconds: rateCheck.waitSeconds,
      });
    }

    if (type === 'signup') {
      if (!name || !password) {
        return res.status(400).json({ message: 'Full name and password are required for signup verification.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      }

      // Check if user already exists in MongoDB
      if (mongoose.connection.readyState === 1) {
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
          return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
        }
      }

      // Check if user already exists in Supabase
      if (isSupabaseConfigured() && supabase) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingProfile) {
          return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const otp = generate8DigitOtp();

      await saveOtp(cleanEmail, otp, 'signup', {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role,
        college: college ? college.trim() : '',
      });

      // Send email via Resend / SMTP before finishing response
      await sendOtpEmail(cleanEmail, otp, 'signup').catch((err) => {
        console.error('Email send error:', err.message);
      });

      return res.status(200).json({
        success: true,
        message: `An 8-digit verification code has been sent to ${cleanEmail}.`,
        email: cleanEmail,
      });
    } else if (type === 'login') {
      // Check that account exists
      let userFound = false;
      if (mongoose.connection.readyState === 1) {
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) userFound = true;
      }
      if (!userFound && isSupabaseConfigured() && supabase) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (existingProfile) userFound = true;
      }

      if (!userFound) {
        return res.status(404).json({ message: 'No account registered with this email. Please sign up first.' });
      }

      const otp = generate8DigitOtp();
      await saveOtp(cleanEmail, otp, 'login');

      await sendOtpEmail(cleanEmail, otp, 'login').catch((err) => {
        console.error('Email send error:', err.message);
      });

      return res.status(200).json({
        success: true,
        message: `An 8-digit login code has been sent to ${cleanEmail}.`,
        email: cleanEmail,
      });
    }

    return res.status(400).json({ message: 'Invalid OTP request type.' });
  } catch (err: any) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send verification code: ' + (err.message || 'Server error') });
  }
});

// 2. Verify 8-digit OTP & Confirm Signup
const handleVerifyOtp = async (req: any, res: any) => {
  try {
    const { email, otp, type = 'signup' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 8-digit OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    if (cleanOtp.length !== 8) {
      return res.status(400).json({ message: 'Please enter a valid 8-digit verification code.' });
    }

    const result = await verifyOtp(cleanEmail, cleanOtp, type);
    if (!result.valid) {
      return res.status(400).json({ message: result.message || 'Invalid or expired verification code.' });
    }

    // OTP is verified! Handle account completion
    if (type === 'signup') {
      const payload = result.payload;
      const name = payload?.name || cleanEmail.split('@')[0];
      const passwordHash = payload?.passwordHash || (await bcrypt.hash('default123456', 10));
      const role = payload?.role || 'student';
      const college = payload?.college || '';

      // 1. If MongoDB is connected, create user in Mongo
      if (mongoose.connection.readyState === 1) {
        let user = await User.findOne({ email: cleanEmail });
        if (!user) {
          user = await User.create({
            name,
            email: cleanEmail,
            password: passwordHash,
            role,
            college,
            isEmailVerified: true,
            isOnboarded: false,
          });

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
        } else {
          user.isEmailVerified = true;
          await user.save();
        }

        const token = generateToken(user._id.toString(), user.role, user.email);
        return res.status(201).json({
          success: true,
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
            isEmailVerified: true,
          },
        });
      }

      // 2. Supabase-first persistence
      let userId: string = crypto.randomUUID();
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: sbUser } = await supabase.auth.admin.createUser({
            email: cleanEmail,
            password: 'verified_email_signup_' + crypto.randomBytes(8).toString('hex'),
            email_confirm: true,
            user_metadata: { full_name: name, role, is_email_verified: true },
          });
          if (sbUser?.user?.id) userId = sbUser.user.id;
        } catch (sbErr: any) {
          console.warn('Supabase auth.admin notice:', sbErr.message);
        }

        try {
          await supabase.from('profiles').upsert({
            id: userId,
            email: cleanEmail,
            full_name: name,
            role,
            college_name: college,
            is_onboarded: false,
            verification_status: 'approved',
          });
        } catch {
          // Ignore
        }
      }

      const token = generateToken(userId, role, cleanEmail);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: userId,
          name,
          email: cleanEmail,
          role,
          college,
          isOnboarded: false,
          targetGoal: 'Web Development',
          fieldOfInterest: 'Web Development',
          verificationStatus: 'approved',
          isEmailVerified: true,
        },
      });
    } else if (type === 'login') {
      // OTP Login successful - prioritize Supabase cloud data with Mongo sync
      let profile: any = null;
      let sbUser: any = null;
      let supabaseTokenHash: string | undefined;

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();
          profile = prof;

          if (profile?.id) {
            const { data: uData } = await supabase.auth.admin.getUserById(profile.id);
            sbUser = uData?.user;
          }

          // Generate magiclink token hash so the client can automatically establish a Supabase session
          const { data: linkData } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: cleanEmail,
          });
          if (linkData?.properties?.hashed_token) {
            supabaseTokenHash = linkData.properties.hashed_token;
          }
        } catch (sbLookupErr: any) {
          console.warn('Supabase lookup in OTP login notice:', sbLookupErr?.message || sbLookupErr);
        }
      }

      let mongoUser: any = null;
      if (mongoose.connection.readyState === 1) {
        mongoUser = await User.findOne({ email: cleanEmail });
      }

      // Resolve user ID
      const userId = profile?.id || (mongoUser ? mongoUser._id.toString() : crypto.randomUUID());

      // Resolve roles - respect admin / super_admin hierarchy
      let role = 'student';
      if (profile?.role === 'super_admin' || mongoUser?.role === 'super_admin') {
        role = 'super_admin';
      } else if (profile?.role === 'admin' || mongoUser?.role === 'admin') {
        role = 'admin';
      } else if (profile?.role === 'mentor' || mongoUser?.role === 'mentor') {
        role = 'mentor';
      } else if (profile?.role === 'college_admin' || mongoUser?.role === 'college_admin') {
        role = 'college_admin';
      } else {
        role = profile?.role || mongoUser?.role || 'student';
      }

      const isAdmin = role === 'super_admin' || role === 'admin';

      // Resolve name
      const name = profile?.full_name || sbUser?.user_metadata?.full_name || mongoUser?.name || cleanEmail.split('@')[0];

      // Resolve avatar: check profile.avatar_url, auth metadata picture/avatar_url, and mongoUser.avatar
      const metaAvatar = sbUser?.user_metadata?.avatar_url || sbUser?.user_metadata?.picture;
      const isStockAvatar = (url?: string) => !url || url.includes('unsplash.com') || url.includes('rishabh.webp');
      let avatar = '';
      if (profile?.avatar_url && !isStockAvatar(profile.avatar_url)) {
        avatar = profile.avatar_url;
      } else if (metaAvatar && !isStockAvatar(metaAvatar)) {
        avatar = metaAvatar;
      } else if (mongoUser?.avatar && !isStockAvatar(mongoUser.avatar)) {
        avatar = mongoUser.avatar;
      } else {
        avatar = profile?.avatar_url || metaAvatar || mongoUser?.avatar || '';
      }

      const college = profile?.college_name || mongoUser?.college || '';
      const degree = profile?.degree || mongoUser?.degree || '';
      const year = profile?.year_of_study || mongoUser?.year || '';
      const targetGoal = profile?.target_goal || profile?.field_of_interest || mongoUser?.targetGoal || '';
      const fieldOfInterest = profile?.field_of_interest || profile?.target_goal || mongoUser?.fieldOfInterest || '';
      const verificationStatus = profile?.verification_status || mongoUser?.verificationStatus || (role === 'mentor' ? 'pending' : 'approved');

      // Admins and mentors are never forced to student onboarding!
      const isOnboarded = isAdmin || role === 'mentor' || role === 'college_admin'
        ? true
        : Boolean(profile?.is_onboarded || mongoUser?.isOnboarded || (targetGoal && targetGoal.trim() !== ''));

      // Auto-heal Supabase profiles if avatar or onboarded state can be updated
      if (isSupabaseConfigured() && supabase && profile?.id) {
        const updatesToProfile: any = {};
        if (isAdmin && !profile.is_onboarded) {
          updatesToProfile.is_onboarded = true;
        }
        if (avatar && (!profile.avatar_url || isStockAvatar(profile.avatar_url))) {
          updatesToProfile.avatar_url = avatar;
        }
        if (role && role !== profile.role && isAdmin) {
          updatesToProfile.role = role;
        }
        if (Object.keys(updatesToProfile).length > 0) {
          supabase.from('profiles').update(updatesToProfile).eq('id', profile.id).then(() => {}, () => {});
        }
      }

      // Auto-heal Mongo user if connected
      if (mongoUser) {
        mongoUser.role = role;
        if (avatar) mongoUser.avatar = avatar;
        mongoUser.isOnboarded = isOnboarded;
        if (college) mongoUser.college = college;
        mongoUser.save().catch(() => {});
      }

      const token = generateToken(userId, role, cleanEmail);
      return res.json({
        success: true,
        token,
        supabaseTokenHash,
        user: {
          id: userId,
          name,
          email: cleanEmail,
          role,
          college,
          degree,
          year,
          avatar,
          isOnboarded,
          targetGoal,
          fieldOfInterest,
          verificationStatus,
          isEmailVerified: true,
        },
      });
    }
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Verification failed: ' + (err.message || 'Server error') });
  }
};

router.post('/verify-otp', handleVerifyOtp);

// Alias for confirm-signup
router.post('/confirm-signup', (req, res) => {
  req.body.type = 'signup';
  return handleVerifyOtp(req, res);
});

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
            message: 'This account was created with Google. Please click "Continue with Google" or use the "8-Digit Email OTP" tab to sign in.',
          });
        }

        if (user.password) {
          const match = await bcrypt.compare(password, user.password);
          if (match) {
            let role = user.role;
            let avatar = user.avatar || '';
            let isOnboarded = user.isOnboarded;

            if (isSupabaseConfigured() && supabase) {
              try {
                const { data: prof } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('email', cleanEmail)
                  .maybeSingle();
                if (prof) {
                  if (prof.role === 'super_admin' || prof.role === 'admin') {
                    role = prof.role;
                  }
                  if (prof.avatar_url && !avatar) {
                    avatar = prof.avatar_url;
                  }
                  if (prof.is_onboarded) {
                    isOnboarded = true;
                  }
                }
              } catch {}
            }

            if (role === 'super_admin' || role === 'admin') {
              isOnboarded = true;
            }

            const token = generateToken(user._id.toString(), role, user.email);
            return res.json({
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role,
                college: user.college,
                degree: user.degree,
                year: user.year,
                avatar,
                isOnboarded,
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

        const role = sbProfile?.role || 'student';
        const isAdmin = role === 'super_admin' || role === 'admin';
        const metaAvatar = sbAuth.user.user_metadata?.avatar_url || sbAuth.user.user_metadata?.picture;
        const avatar = sbProfile?.avatar_url || metaAvatar || '';
        const isOnboarded = isAdmin ? true : Boolean(sbProfile?.is_onboarded);

        const token = sbAuth.session?.access_token || generateToken(sbAuth.user.id, role, cleanEmail);
        return res.json({
          token,
          user: {
            id: sbAuth.user.id,
            name: sbProfile?.full_name || sbAuth.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role,
            college: sbProfile?.college_name || '',
            degree: sbProfile?.degree || '',
            year: sbProfile?.year_of_study || '',
            avatar,
            isOnboarded,
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
