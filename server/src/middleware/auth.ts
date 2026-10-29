import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { supabase } from '../config/supabase';

const resolveTeamAvatar = (rawAvatar?: string | null, name?: string | null, email?: string | null) => {
  const n = (name || '').toLowerCase();
  const e = (email || '').toLowerCase();
  const a = rawAvatar || '';
  if (a.startsWith('/avatars/')) return a;
  if (n.includes('arpit') || e.includes('arpit') || e.includes('officialcrikit') || a.includes('ACg8ocJ0KvIuzezERY')) {
    return '/avatars/arpit.webp';
  }
  if (n.includes('rishabh') || e.includes('rishabh') || e.includes('mishrarishabh2006')) {
    return '/avatars/rishabh.webp';
  }
  if (n.includes('harsh') || e.includes('harsh')) {
    return '/avatars/harsh.webp';
  }
  return rawAvatar || '';
};

export interface AuthRequest extends Request {
  user?: IUser;
}

export const JWT_SECRET = process.env.JWT_SECRET || 'rishabhlabs_super_secure_jwt_secret_2026';

export const generateToken = (userId: string, role: string, email?: string) => {
  return jwt.sign({ id: userId, role, email: email ? email.toLowerCase() : undefined }, JWT_SECRET, { expiresIn: '30d' });
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    // 1. Try local JWT first (instant <0.1ms, zero network delay)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; email?: string };
      let user: any = null;
      if (mongoose.connection.readyState === 1) {
        if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
          user = await User.findById(decoded.id);
        }
        if (!user && decoded.email) {
          user = await User.findOne({ email: decoded.email.toLowerCase() });
        }
      }

      // Check Supabase profiles for cloud sync
      let sbProfile: any = null;
      let sbUser: any = null;
      if (supabase && (decoded.email || decoded.id)) {
        try {
          const query = supabase.from('profiles').select('*');
          const { data } = decoded.email
            ? await query.eq('email', decoded.email.toLowerCase()).maybeSingle()
            : await query.eq('id', decoded.id).maybeSingle();
          sbProfile = data;
          if (sbProfile?.id) {
            const { data: uData } = await supabase.auth.admin.getUserById(sbProfile.id);
            sbUser = uData?.user;
          }
        } catch {}
      }

      // Resolve effective role (giving precedence to super_admin or admin from any source)
      let effectiveRole = decoded.role || 'student';
      if (sbProfile?.role === 'super_admin' || user?.role === 'super_admin') {
        effectiveRole = 'super_admin';
      } else if (sbProfile?.role === 'admin' || user?.role === 'admin') {
        effectiveRole = 'admin';
      } else if (sbProfile?.role) {
        effectiveRole = sbProfile.role;
      } else if (user?.role) {
        effectiveRole = user.role;
      }

      const isAdmin = effectiveRole === 'super_admin' || effectiveRole === 'admin';

      // Resolve avatar
      const metaAvatar = sbUser?.user_metadata?.avatar_url || sbUser?.user_metadata?.picture;
      const isStockAvatar = (url?: string) => !url || url.includes('unsplash.com') || url.includes('rishabh.webp');
      let effectiveAvatar = '';
      if (sbProfile?.avatar_url && !isStockAvatar(sbProfile.avatar_url)) {
        effectiveAvatar = sbProfile.avatar_url;
      } else if (metaAvatar && !isStockAvatar(metaAvatar)) {
        effectiveAvatar = metaAvatar;
      } else if (user?.avatar && !isStockAvatar(user.avatar)) {
        effectiveAvatar = user.avatar;
      } else {
        effectiveAvatar = sbProfile?.avatar_url || metaAvatar || user?.avatar || '';
      }
      effectiveAvatar = resolveTeamAvatar(effectiveAvatar, sbProfile?.full_name || user?.name, decoded.email || sbProfile?.email || user?.email);

      const effectiveOnboarded = isAdmin || effectiveRole === 'mentor' || effectiveRole === 'college_admin'
        ? true
        : Boolean(sbProfile?.is_onboarded || user?.isOnboarded || (sbProfile?.target_goal && sbProfile.target_goal.trim() !== ''));

      if (user) {
        user.role = effectiveRole;
        if (effectiveAvatar) user.avatar = effectiveAvatar;
        user.isOnboarded = effectiveOnboarded;
        if (sbProfile?.college_name && !user.college) user.college = sbProfile.college_name;
        req.user = user;
        return next();
      }

      if (sbProfile || decoded.id || decoded.email) {
        req.user = {
          _id: (sbProfile?.id || decoded.id) as any,
          id: sbProfile?.id || decoded.id,
          name: sbProfile?.full_name || sbUser?.user_metadata?.full_name || (decoded.email ? decoded.email.split('@')[0] : 'User'),
          email: sbProfile?.email || decoded.email || '',
          role: effectiveRole,
          avatar: effectiveAvatar,
          college: sbProfile?.college_name || '',
          degree: sbProfile?.degree || '',
          year: sbProfile?.year_of_study || '',
          targetGoal: sbProfile?.target_goal || sbProfile?.field_of_interest || '',
          fieldOfInterest: sbProfile?.field_of_interest || sbProfile?.target_goal || '',
          verificationStatus: sbProfile?.verification_status || 'approved',
          isOnboarded: effectiveOnboarded,
        } as any;
        return next();
      }
    } catch (jwtErr) {
      // Not a local JWT, will attempt Supabase or fallback
    }

    // 2. Try Supabase Auth token verification if local JWT didn't match
    if (supabase) {
      try {
        const { data: sbData, error: sbError } = await supabase.auth.getUser(token);
        if (sbData?.user && !sbError) {
          const sbUser = sbData.user;
          const userEmail = (sbUser.email || '').toLowerCase().trim();

          const { data: sbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sbUser.id)
            .maybeSingle();

          const effectiveRole = sbProfile?.role || sbUser.user_metadata?.role || 'student';
          const isAdmin = effectiveRole === 'super_admin' || effectiveRole === 'admin';
          const metaAvatar = sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture;
          const rawAvatar = sbProfile?.avatar_url || metaAvatar || '';
          const effectiveAvatar = resolveTeamAvatar(rawAvatar, sbProfile?.full_name || sbUser.user_metadata?.full_name, userEmail);
          const hasChosenGoal = Boolean(sbProfile?.target_goal && sbProfile.target_goal.trim() !== '' && sbProfile.target_goal !== 'Not Set');
          const effectiveOnboarded = isAdmin || effectiveRole === 'mentor' || effectiveRole === 'college_admin'
            ? true
            : Boolean(sbProfile?.is_onboarded || hasChosenGoal);

          let user = null;
          if (mongoose.connection.readyState === 1) {
            user = await User.findOne({ email: userEmail });
            if (!user && userEmail) {
              try {
                user = await User.create({
                  name: sbProfile?.full_name || sbUser.user_metadata?.full_name || userEmail.split('@')[0],
                  email: userEmail,
                  password: 'supabase_oauth_managed',
                  role: effectiveRole,
                  college: sbProfile?.college_name || '',
                  avatar: effectiveAvatar,
                  streakDays: sbProfile?.streak_days || 0,
                  totalPoints: sbProfile?.total_points || 0,
                  skillsCompleted: sbProfile?.skills_completed || 0,
                  targetGoal: sbProfile?.target_goal || undefined,
                  isOnboarded: effectiveOnboarded,
                });
              } catch {
                user = await User.findOne({ email: userEmail });
              }
            } else if (user) {
              user.role = effectiveRole;
              user.isOnboarded = effectiveOnboarded;
              if (effectiveAvatar) user.avatar = effectiveAvatar;
              if (sbProfile?.target_goal) (user as any).targetGoal = sbProfile.target_goal;
              if (typeof sbProfile?.streak_days === 'number') user.streakDays = sbProfile.streak_days;
              if (typeof sbProfile?.total_points === 'number') user.totalPoints = sbProfile.total_points;
              if (sbProfile?.full_name) user.name = sbProfile.full_name;
              await user.save();
            }
          }

          if (user) {
            req.user = user;
            return next();
          }

          // Supabase direct fallback if MongoDB is not connected
          req.user = {
            _id: sbUser.id as any,
            id: sbUser.id,
            name: sbProfile?.full_name || sbUser.user_metadata?.full_name || userEmail.split('@')[0],
            email: userEmail,
            role: effectiveRole,
            avatar: effectiveAvatar,
            college: sbProfile?.college_name || '',
            degree: sbProfile?.degree || '',
            year: sbProfile?.year_of_study || '',
            targetGoal: sbProfile?.target_goal || sbProfile?.field_of_interest || '',
            fieldOfInterest: sbProfile?.field_of_interest || sbProfile?.target_goal || '',
            verificationStatus: sbProfile?.verification_status || 'approved',
            isOnboarded: effectiveOnboarded,
          } as any;
          return next();
        }
      } catch (sbErr) {
        // Fall through to decoded token check
      }
    }

    // 3. Fallback: decode Supabase JWT directly if network or service role had a temporary hiccup
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.email && (!decoded.exp || decoded.exp * 1000 > Date.now())) {
        const userEmail = String(decoded.email).toLowerCase().trim();
        let user = null;
        if (mongoose.connection.readyState === 1) {
          user = await User.findOne({ email: userEmail });
        }
        const role = decoded.role || decoded.user_metadata?.role || 'student';
        const isAdmin = role === 'super_admin' || role === 'admin';
        if (user) {
          req.user = user;
          return next();
        }
        req.user = {
          _id: (decoded.sub || decoded.id) as any,
          id: decoded.sub || decoded.id,
          name: decoded.user_metadata?.full_name || userEmail.split('@')[0],
          email: userEmail,
          role,
          avatar: decoded.user_metadata?.avatar_url || decoded.user_metadata?.picture || '',
          isOnboarded: isAdmin ? true : false,
        } as any;
        return next();
      }
    } catch {}

    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  } catch (err: any) {
    return res.status(401).json({ message: 'Authentication failed.' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: insufficient permissions',
      });
    }
    next();
  };
};
