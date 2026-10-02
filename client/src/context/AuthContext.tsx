import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabase';

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

          if (profile) {
            const hasChosenGoal = Boolean(profile.target_goal && profile.target_goal.trim() !== '' && profile.target_goal !== 'Not Set');
            setUser({
              id: profile.id,
              name: profile.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: profile.email || session.user.email || '',
              role: profile.role || 'student',
              college: profile.college_name || '',
              degree: profile.degree || 'Computer Science',
              year: profile.year_of_study || '3rd Year',
              avatar: profile.avatar_url || session.user.user_metadata?.avatar_url || '/avatars/rishabh.png',
              bio: profile.bio || 'Building scalable applications and mastering algorithmic problem solving.',
              githubUsername: profile.github_username,
              targetGoal: profile.target_goal || undefined,
              isOnboarded: hasChosenGoal,
            });
          } else {
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: 'student',
              college: '',
              degree: 'Computer Science',
              year: '3rd Year',
              avatar: session.user.user_metadata?.avatar_url || '/avatars/rishabh.png',
              bio: 'Building scalable applications and mastering algorithmic problem solving.',
              isOnboarded: false,
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
            const hasChosenGoal = profile ? Boolean(profile.target_goal && profile.target_goal.trim() !== '' && profile.target_goal !== 'Not Set') : false;
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
            setUser(data);
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

            if (profile) {
              const hasChosenGoal = Boolean(profile.target_goal && profile.target_goal.trim() !== '' && profile.target_goal !== 'Not Set');
              setUser({
                id: profile.id,
                name: profile.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: profile.email || session.user.email || '',
                role: profile.role || 'student',
                college: profile.college_name || '',
                degree: profile.degree || 'Computer Science',
                year: profile.year_of_study || '3rd Year',
                avatar: profile.avatar_url || session.user.user_metadata?.avatar_url || '/avatars/rishabh.png',
                bio: profile.bio || 'Building real-world software & mastering code execution.',
                githubUsername: profile.github_username,
                targetGoal: profile.target_goal || undefined,
                isOnboarded: hasChosenGoal,
              });
              setLoading(false);
              return;
            } else {
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: 'student',
                college: '',
                degree: 'Computer Science',
                year: '3rd Year',
                avatar: session.user.user_metadata?.avatar_url || '/avatars/rishabh.png',
                bio: 'Building scalable applications and mastering algorithmic problem solving.',
                isOnboarded: false,
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

  const login = async (credentials: { email: string; password: string }) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      if (data.session?.access_token) {
        localStorage.setItem('rishabhlabs_token', data.session.access_token);
      }
      await fetchCurrentUser();
      return;
    }

    const res = await api.login(credentials);
    localStorage.setItem('rishabhlabs_token', res.token);
    setUser(res.user);
  };

  const register = async (userData: any) => {
    if (isSupabaseConfigured) {
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
      if (error) throw error;
      if (data.session?.access_token) {
        localStorage.setItem('rishabhlabs_token', data.session.access_token);
      }
      await fetchCurrentUser();
      return;
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
      if (error) throw error;
    } else {
      alert('Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your client/.env file.');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('rishabhlabs_token');
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
