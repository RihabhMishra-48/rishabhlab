import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { pycodeService } from '../services/pycodeService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDarkMode: boolean;
  isSupabaseLive: boolean;
  toggleDarkMode: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
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
      if (session?.user) {
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
            const goal = profile.field_of_interest || profile.target_goal || localGoal;
            const hasChosenGoal = Boolean(
              (goal && goal.trim() !== '' && goal !== 'Not Set') ||
              localOnboarded ||
              profile.is_onboarded
            );
            const metaAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
            const isStockAvatar = profile.avatar_url && profile.avatar_url.includes('unsplash.com');
            const userAvatar = (profile.avatar_url && !isStockAvatar) ? profile.avatar_url : (metaAvatar || profile.avatar_url || '');

            setUser({
              id: profile.id,
              name: profile.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: profile.email || session.user.email || '',
              role: profile.role || 'student',
              college: profile.college_name || '',
              degree: profile.degree || '',
              year: profile.year_of_study || '',
              avatar: userAvatar,
              bio: profile.bio || '',
              githubUsername: profile.github_username || '',
              targetGoal: goal,
              fieldOfInterest: goal,
              verificationStatus: profile.verification_status || (profile.role === 'mentor' ? 'pending' : 'approved'),
              mentorOrganization: profile.mentor_organization,
              mentorExperienceYears: profile.mentor_experience_years,
              mentorLinkedin: profile.mentor_linkedin,
              mentorExpertise: profile.mentor_expertise,
              isOnboarded: hasChosenGoal,
            });
          } else {
            const metaAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '';
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: 'student',
              college: '',
              degree: '',
              year: '',
              avatar: metaAvatar,
              bio: '',
              githubUsername: '',
              targetGoal: localGoal,
              fieldOfInterest: localGoal,
              verificationStatus: 'approved',
              isOnboarded: localOnboarded,
            });
          }
          if (session.access_token) {
            localStorage.setItem('rishabhlabs_token', session.access_token);
          }

          // Auto-redirect to dashboard/onboarding if returning from OAuth or on landing/auth pages
          const isOAuthCallback = window.location.hash.includes('access_token');
          const isAuthOrLandingPage = window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/';

          if (isOAuthCallback || (event === 'SIGNED_IN' && isAuthOrLandingPage)) {
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            const hasChosenGoal = profile
              ? Boolean((profile.target_goal && profile.target_goal.trim() !== '' && profile.target_goal !== 'Not Set') || localOnboarded)
              : localOnboarded;
            const targetPath = hasChosenGoal ? '/dashboard' : '/onboarding';
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

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);

      // 1. Check local backend REST API auth first (instant <50ms)
      const token = localStorage.getItem('rishabhlabs_token');
      if (token) {
        try {
          const data = await api.getMe();
          if (data && data.id) {
            const userOnboardedKey = `rishabhlabs_onboarded_${data.id}`;
            const userGoalKey = `rishabhlabs_goal_${data.id}`;
            const localOnboarded = localStorage.getItem(userOnboardedKey) === 'true' || localStorage.getItem('rishabhlabs_onboarded') === 'true';
            const localGoal = localStorage.getItem(userGoalKey) || localStorage.getItem('rishabhlabs_goal') || undefined;
            const effectiveGoal = data.fieldOfInterest || data.targetGoal || localGoal;
            setUser({
              ...data,
              targetGoal: effectiveGoal,
              fieldOfInterest: effectiveGoal,
              verificationStatus: data.verificationStatus || (data.role === 'mentor' ? 'pending' : 'approved'),
              isOnboarded: Boolean(data.isOnboarded || localOnboarded),
            });
            setLoading(false);
            return;
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('rishabhlabs_token');
        }
      }

      // 2. Try Supabase Auth with a fast 1-second timeout race
      if (isSupabaseConfigured) {
        try {
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise<{ data: { session: any } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 1000)
          );
          const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
          if (session?.user) {
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
              const goal = profile.field_of_interest || profile.target_goal || localGoal;
              const hasChosenGoal = Boolean(
                (goal && goal.trim() !== '' && goal !== 'Not Set') ||
                localOnboarded ||
                profile.is_onboarded
              );
              const metaAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
              const isStockAvatar = profile.avatar_url && profile.avatar_url.includes('unsplash.com');
              const userAvatar = (profile.avatar_url && !isStockAvatar) ? profile.avatar_url : (metaAvatar || profile.avatar_url || '');

              setUser({
                id: profile.id,
                name: profile.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: profile.email || session.user.email || '',
                role: profile.role || 'student',
                college: profile.college_name || '',
                degree: profile.degree || '',
                year: profile.year_of_study || '',
                avatar: userAvatar,
                bio: profile.bio || '',
                githubUsername: profile.github_username || '',
                targetGoal: goal,
                fieldOfInterest: goal,
                verificationStatus: profile.verification_status || (profile.role === 'mentor' ? 'pending' : 'approved'),
                mentorOrganization: profile.mentor_organization,
                mentorExperienceYears: profile.mentor_experience_years,
                mentorLinkedin: profile.mentor_linkedin,
                mentorExpertise: profile.mentor_expertise,
                isOnboarded: hasChosenGoal,
              });
              setLoading(false);
              return;
            } else {
              const metaAvatar = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '';
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: 'student',
                college: '',
                degree: '',
                year: '',
                avatar: metaAvatar,
                bio: '',
                githubUsername: '',
                targetGoal: localGoal,
                isOnboarded: localOnboarded,
              });
              setLoading(false);
              return;
            }
          }
        } catch (sbErr) {
          // Skip if network/DNS latency
        }
      }

      // 3. Fallback: Query backend for active session or demo user
      try {
        const data = await api.getMe();
        if (data && data.id) {
          setUser(data);
          return;
        }
      } catch {
        // Unauthenticated
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
    if (user?.email && (!user.avatar || user.avatar.includes('unsplash.com') || user.avatar.includes('rishabh.webp'))) {
      pycodeService.fetchUserData(user.email).then((data) => {
        if (data?.user?.avatar_url) {
          setUser((prev) => (prev ? { ...prev, avatar: data.user.avatar_url || undefined } : prev));
        }
      }).catch(() => {});
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
      setUser({
        ...res.user,
        targetGoal: res.user.targetGoal || localGoal,
        isOnboarded: Boolean(res.user.isOnboarded || localOnboarded),
      });
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
        if (!error && data.session?.access_token) {
          localStorage.setItem('rishabhlabs_token', data.session.access_token);
          await fetchCurrentUser();
          return;
        }
      } catch (sbErr) {
        console.warn('Supabase auth signup fallback:', sbErr);
      }
    }

    const res = await api.register(userData);
    localStorage.setItem('rishabhlabs_token', res.token);
    setUser(res.user);
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
    setUser(null);
  };

  const switchRole = async (role: string) => {
    setLoading(true);
    try {
      const res = await api.switchDemoRole(role);
      localStorage.setItem('rishabhlabs_token', res.token);
      setUser(res.user);
    } catch (err: any) {
      console.error('Role switch failed:', err);
    } finally {
      setLoading(false);
    }
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
