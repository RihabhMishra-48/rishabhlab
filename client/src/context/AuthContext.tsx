import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getAuthToken } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { pycodeService } from '../services/pycodeService';
import { pycodeCache } from '../services/pycodeCache';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDarkMode: boolean;
  isSupabaseLive: boolean;
  toggleDarkMode: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  sendOtp: (data: { email: string; type?: 'signup' | 'login'; name?: string; password?: string; role?: string; college?: string }) => Promise<{ success: boolean; message: string; email: string }>;
  verifyOtpAndLogin: (data: { email: string; otp: string; type?: 'signup' | 'login' }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('rishabhlabs_theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rishabhlabs_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rishabhlabs_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Sync Supabase Auth listener if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        localStorage.removeItem('rishabhlabs_token');
        setUser(null);
        return;
      }

      if (session?.user) {
        // ALWAYS store access_token first so synchronous queries immediately have authorization
        if (session.access_token) {
          localStorage.setItem('rishabhlabs_token', session.access_token);
        }

        // Fetch or create profile in Supabase profiles
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const userOnboardedKey = `rishabhlabs_onboarded_${session.user.id}`;
          const userGoalKey = `rishabhlabs_goal_${session.user.id}`;
          const localOnboarded = localStorage.getItem(userOnboardedKey) === 'true';
          const localGoal = localStorage.getItem(userGoalKey) || localStorage.getItem('rishabhlabs_goal') || undefined;

          if (profile) {
            const isMishraSuperAdmin = session.user.email?.toLowerCase() === 'mishrarishabh2006@gmail.com';
            const role = isMishraSuperAdmin ? 'super_admin' : (profile.role || 'student');
            const isAdmin = role === 'super_admin' || role === 'admin' || isMishraSuperAdmin;
            const goal = profile.field_of_interest || profile.target_goal || localGoal;
            // Admins, mentors, and college admins are never blocked by onboarding
            const isUserOnboarded = isAdmin || role === 'mentor' || role === 'college_admin' ? true : Boolean(profile.is_onboarded || localOnboarded);
            const metaAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
            const isStockAvatar = profile.avatar_url && (profile.avatar_url.includes('unsplash.com') || profile.avatar_url.includes('rishabh.webp'));
            const userAvatar = (profile.avatar_url && !isStockAvatar) ? profile.avatar_url : (metaAvatar || '');

            // Auto-heal avatar_url and is_onboarded in profiles
            if (metaAvatar && (!profile.avatar_url || isStockAvatar)) {
              supabase.from('profiles').update({ avatar_url: metaAvatar }).eq('id', profile.id).then(() => {}, () => {});
            }
            if (isMishraSuperAdmin && profile.role !== 'super_admin') {
              supabase.from('profiles').update({ role: 'super_admin', is_onboarded: true }).eq('id', profile.id).then(() => {}, () => {});
            } else if (isAdmin && !profile.is_onboarded) {
              supabase.from('profiles').update({ is_onboarded: true }).eq('id', profile.id).then(() => {}, () => {});
            }

            setUser({
              id: profile.id,
              name: profile.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: profile.email || session.user.email || '',
              role,
              college: profile.college_name || '',
              degree: profile.degree || '',
              year: profile.year_of_study || '',
              avatar: userAvatar,
              bio: profile.bio || '',
              githubUsername: profile.github_username || '',
              targetGoal: goal,
              fieldOfInterest: goal,
              verificationStatus: profile.verification_status || (role === 'mentor' ? 'pending' : 'approved'),
              mentorOrganization: profile.mentor_organization,
              mentorExperienceYears: profile.mentor_experience_years,
              mentorLinkedin: profile.mentor_linkedin,
              mentorExpertise: profile.mentor_expertise,
              isOnboarded: isUserOnboarded,
            });
          } else {
            const metaAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '';
            const isMishraSuperAdmin = session.user.email?.toLowerCase() === 'mishrarishabh2006@gmail.com';
            const userRole = isMishraSuperAdmin ? 'super_admin' : (session.user.user_metadata?.role || 'student');
            const isAdmin = userRole === 'super_admin' || userRole === 'admin' || isMishraSuperAdmin;
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: userRole,
              college: '',
              degree: '',
              year: '',
              avatar: metaAvatar,
              bio: '',
              githubUsername: '',
              targetGoal: localGoal,
              fieldOfInterest: localGoal,
              verificationStatus: 'approved',
              isOnboarded: isAdmin ? true : localOnboarded,
            });
          }

          // Auto-redirect to dashboard/admin/onboarding if returning from OAuth or on landing/auth pages
          const isOAuthCallback = window.location.hash.includes('access_token');
          const isAuthOrLandingPage = window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/';

          if (isOAuthCallback || (event === 'SIGNED_IN' && isAuthOrLandingPage)) {
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            const isMishraSuperAdmin = session.user.email?.toLowerCase() === 'mishrarishabh2006@gmail.com';
            const activeRole = isMishraSuperAdmin ? 'super_admin' : (profile?.role || session.user.user_metadata?.role || 'student');
            const isAdmin = activeRole === 'super_admin' || activeRole === 'admin' || isMishraSuperAdmin;
            const isUserOnboarded = isAdmin || activeRole === 'mentor' || activeRole === 'college_admin'
              ? true
              : (profile ? Boolean(profile.is_onboarded || localOnboarded) : localOnboarded);
            
            // Standard login always lands on daily dashboard; only dedicated portal routes navigate to their portals
            let targetPath = isUserOnboarded ? '/dashboard' : '/onboarding';
            const currentPath = window.location.pathname;
            if (currentPath === '/admin/login' && isAdmin) {
              targetPath = '/admin';
            } else if (currentPath === '/mentor/login' && activeRole === 'mentor') {
              targetPath = '/mentor/sessions';
            } else if (currentPath === '/college/login' && activeRole === 'college_admin') {
              targetPath = '/college';
            }

            if (window.location.pathname !== targetPath) {
              window.location.href = targetPath;
            }
          }
        } catch (e) {
          console.error('Error syncing Supabase user profile:', e);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen for unauthorized 401 events from API layer to cleanly drop dead sessions
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('rishabhlabs_token');
      api.invalidateCache();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);

      // 1. Check local backend REST API auth first (instant <50ms)
      const token = getAuthToken();
      if (token) {
        try {
          const data = await api.getMe();
          if (data && data.id) {
            const userOnboardedKey = `rishabhlabs_onboarded_${data.id}`;
            const userGoalKey = `rishabhlabs_goal_${data.id}`;
            const localOnboarded = localStorage.getItem(userOnboardedKey) === 'true' || localStorage.getItem('rishabhlabs_onboarded') === 'true';
            const localGoal = localStorage.getItem(userGoalKey) || localStorage.getItem('rishabhlabs_goal') || undefined;
            const effectiveGoal = data.fieldOfInterest || data.targetGoal || localGoal;
            let cleanAvatar = data.avatar && !data.avatar.includes('rishabh.webp') && !data.avatar.includes('unsplash.com') ? data.avatar : (data.avatar || '');

            // Fallback avatar lookup in Supabase profiles if cleanAvatar is empty
            if (!cleanAvatar && isSupabaseConfigured && data.email) {
              try {
                const { data: prof } = await supabase
                  .from('profiles')
                  .select('avatar_url')
                  .eq('email', data.email.toLowerCase())
                  .maybeSingle();
                if (prof?.avatar_url && !prof.avatar_url.includes('rishabh.webp') && !prof.avatar_url.includes('unsplash.com')) {
                  cleanAvatar = prof.avatar_url;
                }
              } catch {}
            }

            const isAdmin = data.role === 'super_admin' || data.role === 'admin';
            const effectiveOnboarded = isAdmin || data.role === 'mentor' || data.role === 'college_admin'
              ? true
              : Boolean(data.isOnboarded || localOnboarded);

            if (effectiveOnboarded) {
              localStorage.setItem(userOnboardedKey, 'true');
            }

            setUser({
              ...data,
              avatar: cleanAvatar,
              targetGoal: effectiveGoal,
              fieldOfInterest: effectiveGoal,
              verificationStatus: data.verificationStatus || (data.role === 'mentor' ? 'pending' : 'approved'),
              isOnboarded: effectiveOnboarded,
            });
            setLoading(false);
            return;
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('rishabhlabs_token');
          api.invalidateCache();
        }
      }

      // 2. Try Supabase Auth
      if (isSupabaseConfigured) {
        try {
          let { data: { session } } = await supabase.auth.getSession();

          // Proactively refresh if token is expired or within 60 seconds of expiring
          if (session?.expires_at && session.expires_at * 1000 - Date.now() < 60000) {
            try {
              const refreshed = await supabase.auth.refreshSession();
              if (refreshed.data?.session) {
                session = refreshed.data.session;
              }
            } catch {
              // Ignore refresh error
            }
          }

          if (session?.user && session?.access_token) {
            // ALWAYS store access token first
            localStorage.setItem('rishabhlabs_token', session.access_token);

            let { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            // Resilient lookup by email if id didn't match directly
            if (!profile && session.user.email) {
              const { data: profByEmail } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', session.user.email.toLowerCase())
                .maybeSingle();
              profile = profByEmail;
            }

            const userOnboardedKey = `rishabhlabs_onboarded_${session.user.id}`;
            const userGoalKey = `rishabhlabs_goal_${session.user.id}`;
            const localOnboarded = localStorage.getItem(userOnboardedKey) === 'true';
            const localGoal = localStorage.getItem(userGoalKey) || localStorage.getItem('rishabhlabs_goal') || undefined;

            if (profile) {
              const cleanUserEmail = (profile.email || session.user.email || '').toLowerCase();
              let role = profile.role || 'student';
              if (cleanUserEmail === 'mishrarishabh2006@gmail.com') {
                role = 'super_admin';
              }
              const isAdmin = role === 'super_admin' || role === 'admin';
              const goal = profile.field_of_interest || profile.target_goal || localGoal;
              const isUserOnboarded = isAdmin || role === 'mentor' || role === 'college_admin'
                ? true
                : Boolean(profile.is_onboarded || localOnboarded);
              const metaAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
              const isStockAvatar = profile.avatar_url && (profile.avatar_url.includes('unsplash.com') || profile.avatar_url.includes('rishabh.webp'));
              const userAvatar = (profile.avatar_url && !isStockAvatar) ? profile.avatar_url : (metaAvatar || '');

              if (isUserOnboarded) {
                localStorage.setItem(userOnboardedKey, 'true');
              }

              setUser({
                id: profile.id,
                name: profile.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: cleanUserEmail,
                role,
                college: profile.college_name || '',
                degree: profile.degree || '',
                year: profile.year_of_study || '',
                avatar: userAvatar,
                bio: profile.bio || '',
                githubUsername: profile.github_username || '',
                targetGoal: goal,
                fieldOfInterest: goal,
                verificationStatus: profile.verification_status || (role === 'mentor' ? 'pending' : 'approved'),
                mentorOrganization: profile.mentor_organization,
                mentorExperienceYears: profile.mentor_experience_years,
                mentorLinkedin: profile.mentor_linkedin,
                mentorExpertise: profile.mentor_expertise,
                isOnboarded: isUserOnboarded,
              });
              setLoading(false);
              return;
            } else {
              const cleanUserEmail = (session.user.email || '').toLowerCase();
              const metaAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '';
              let userRole = session.user.user_metadata?.role || 'student';
              if (cleanUserEmail === 'mishrarishabh2006@gmail.com') {
                userRole = 'super_admin';
              }
              const isAdmin = userRole === 'super_admin' || userRole === 'admin';
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: cleanUserEmail,
                role: userRole,
                college: '',
                degree: '',
                year: '',
                avatar: metaAvatar,
                bio: '',
                githubUsername: '',
                targetGoal: localGoal,
                fieldOfInterest: localGoal,
                verificationStatus: 'approved',
                isOnboarded: isAdmin ? true : localOnboarded,
              });
              setLoading(false);
              return;
            }
          }
        } catch (sbErr) {
          // Skip if network/DNS latency
        }
      }

      setUser(null);
    } catch (err) {
      localStorage.removeItem('rishabhlabs_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Sync profile avatar from PyCode if student has an existing PyCode account
  useEffect(() => {
    if (user?.email) {
      // 1. Instant cache check: if cached avatar exists, set it immediately!
      const cachedAvatar = pycodeCache.getAvatar(user.email);
      if (cachedAvatar && (!user.avatar || user.avatar.includes('unsplash.com') || user.avatar.includes('rishabh.webp'))) {
        setUser((prev) => (prev ? { ...prev, avatar: cachedAvatar } : prev));
      }

      // 2. Network revalidation: Fetch fresh user data (which updates avatar, name, files in cache, while position remains live)
      if (!user.avatar || user.avatar.includes('unsplash.com') || user.avatar.includes('rishabh.webp')) {
        pycodeService.fetchUserData(user.email).then((data) => {
          if (data?.user?.avatar_url) {
            setUser((prev) => (prev ? { ...prev, avatar: data.user.avatar_url || undefined } : prev));
          }
        }).catch(() => { });
      }
    }
  }, [user?.email]);

  const login = async (credentials: { email: string; password: string }) => {
    let supabaseLoggedIn = false;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (!error && data.session?.access_token) {
          localStorage.setItem('rishabhlabs_token', data.session.access_token);
          await fetchCurrentUser();
          supabaseLoggedIn = true;
          return;
        }
      } catch {
        // Fall back to backend database
      }
    }

    if (!supabaseLoggedIn) {
      const res = await api.login(credentials);
      localStorage.setItem('rishabhlabs_token', res.token);
      const userOnboardedKey = `rishabhlabs_onboarded_${res.user.id}`;
      const userGoalKey = `rishabhlabs_goal_${res.user.id}`;
      const localOnboarded = localStorage.getItem(userOnboardedKey) === 'true' || localStorage.getItem('rishabhlabs_onboarded') === 'true';
      const localGoal = localStorage.getItem(userGoalKey) || localStorage.getItem('rishabhlabs_goal') || undefined;
      const isAdmin = res.user.role === 'super_admin' || res.user.role === 'admin';
      const effectiveOnboarded = isAdmin || res.user.role === 'mentor' || res.user.role === 'college_admin'
        ? true
        : Boolean(res.user.isOnboarded || localOnboarded);
      const cleanAvatar = res.user.avatar && !res.user.avatar.includes('rishabh.webp') && !res.user.avatar.includes('unsplash.com') ? res.user.avatar : (res.user.avatar || '');

      if (effectiveOnboarded) {
        localStorage.setItem(userOnboardedKey, 'true');
        localStorage.setItem('rishabhlabs_onboarded', 'true');
      }

      setUser({
        ...res.user,
        avatar: cleanAvatar,
        targetGoal: res.user.targetGoal || localGoal,
        isOnboarded: effectiveOnboarded,
      });
      await fetchCurrentUser();
    }
  };

  const register = async (userData: any) => {
    localStorage.removeItem('rishabhlabs_onboarded');
    localStorage.removeItem('rishabhlabs_goal');
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              full_name: userData.name,
              role: userData.role || 'student',
            },
          },
        });
        if (error) {
          if (
            error.message?.toLowerCase().includes('already') ||
            (error as any).status === 422
          ) {
            throw new Error('An account with this email already exists. Please sign in.');
          }
        } else if (data.session?.access_token) {
          localStorage.setItem('rishabhlabs_token', data.session.access_token);
          await fetchCurrentUser();
          return;
        }
      } catch (sbErr: any) {
        if (sbErr?.message?.toLowerCase().includes('already')) {
          throw sbErr;
        }
        console.warn('Supabase auth signup fallback:', sbErr);
      }
    }

    const res = await api.register(userData);
    localStorage.setItem('rishabhlabs_token', res.token);
    setUser(res.user);
  };

  const sendOtp = async (data: { email: string; type?: 'signup' | 'login'; name?: string; password?: string; role?: string; college?: string }) => {
    return api.sendOtp(data);
  };

  const verifyOtpAndLogin = async (data: { email: string; otp: string; type?: 'signup' | 'login' }) => {
    const res = await api.verifyOtp(data);
    if (res.token) {
      localStorage.setItem('rishabhlabs_token', res.token);

      // If backend provided a Supabase magiclink token hash, establish client-side Supabase session
      if (res.supabaseTokenHash && isSupabaseConfigured) {
        try {
          await supabase.auth.verifyOtp({
            token_hash: res.supabaseTokenHash,
            type: 'magiclink',
          });
        } catch (sbErr) {
          console.warn('Supabase session exchange note:', sbErr);
        }
      }

      api.invalidateCache();

      const userOnboardedKey = `rishabhlabs_onboarded_${res.user.id}`;
      const userGoalKey = `rishabhlabs_goal_${res.user.id}`;
      const localGoal = localStorage.getItem(userGoalKey) || localStorage.getItem('rishabhlabs_goal') || undefined;
      const isAdmin = res.user.role === 'super_admin' || res.user.role === 'admin';
      const effectiveOnboarded = isAdmin || res.user.role === 'mentor' || res.user.role === 'college_admin'
        ? true
        : Boolean(res.user.isOnboarded || localStorage.getItem(userOnboardedKey) === 'true' || localStorage.getItem('rishabhlabs_onboarded') === 'true');

      if (effectiveOnboarded) {
        localStorage.setItem(userOnboardedKey, 'true');
        localStorage.setItem('rishabhlabs_onboarded', 'true');
      }

      const cleanAvatar = res.user.avatar && !res.user.avatar.includes('rishabh.webp') && !res.user.avatar.includes('unsplash.com') ? res.user.avatar : (res.user.avatar || '');

      setUser({
        ...res.user,
        avatar: cleanAvatar,
        targetGoal: res.user.targetGoal || localGoal,
        isOnboarded: effectiveOnboarded,
      });

      await fetchCurrentUser();
    }
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        if (
          error.message?.includes('provider is not enabled') ||
          (error as any).code === 'validation_failed' ||
          (error as any).error_code === 'validation_failed'
        ) {
          throw new Error(
            'Google OAuth provider is not enabled in your Supabase Dashboard yet. You can sign in instantly using Email & Password or 1-Click Demo Login, or enable Google under: Supabase Dashboard > Authentication > Providers > Google.'
          );
        }
        throw error;
      }
    } else {
      throw new Error(
        'Supabase is not configured yet. Please verify your Supabase Project URL (https://<project-ref>.supabase.co) and Anon Key in your environment variables.'
      );
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('rishabhlabs_token');
    localStorage.removeItem('rishabhlabs_onboarded');
    localStorage.removeItem('rishabhlabs_goal');
    api.invalidateCache();
    setUser(null);
  };

  const switchRole = async (_role: string) => {
    console.warn('Demo role switching is disabled. Manage user roles directly in database.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDarkMode,
        isSupabaseLive: isSupabaseConfigured,
        toggleDarkMode,
        login,
        register,
        sendOtp,
        verifyOtpAndLogin,
        loginWithGoogle,
        logout,
        switchRole,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
