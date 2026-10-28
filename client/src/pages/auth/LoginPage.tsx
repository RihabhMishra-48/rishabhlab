import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, GraduationCap, Video, Building2, ShieldAlert } from 'lucide-react';

export type PortalType = 'student' | 'mentor' | 'college' | 'admin';

interface LoginPageProps {
  defaultPortal?: PortalType;
}

export const LoginPage: React.FC<LoginPageProps> = ({ defaultPortal }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPortal = (defaultPortal || searchParams.get('portal') || 'student') as PortalType;
  const [portal, setPortal] = useState<PortalType>(
    ['student', 'mentor', 'college', 'admin'].includes(initialPortal) ? initialPortal : 'student'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Sync portal query param
  const handlePortalChange = (newPortal: PortalType) => {
    setPortal(newPortal);
    setError('');
    setSearchParams({ portal: newPortal });
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin' || user.role === 'admin') {
        if (portal === 'mentor') navigate('/mentor/sessions', { replace: true });
        else if (portal === 'college') navigate('/college', { replace: true });
        else navigate('/admin', { replace: true });
      } else if (user.role === 'mentor') {
        navigate('/mentor/sessions', { replace: true });
      } else if (user.role === 'college_admin') {
        navigate('/college', { replace: true });
      } else {
        // Regular student or general user
        navigate(user.isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
      }
    }
  }, [user, portal, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email, password });
      // Redirection handled by useEffect based on user.role and portal
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Portal metadata
  const portalMeta = {
    student: {
      badge: 'Student Trajectory',
      title: 'Student Workspace',
      desc: 'Sign in to execute your daily curated missions, algorithmic coding challenges, and career roadmap.',
      emailPlaceholder: 'student@college.edu',
      icon: GraduationCap,
      color: 'text-neutral-900 dark:text-white',
    },
    mentor: {
      badge: 'Mentor Network',
      title: 'Mentor Workspace',
      desc: 'Sign in to review student GitHub proof of work, schedule 1:1 office hours, and provide strategic code reviews.',
      emailPlaceholder: 'mentor@rishabhlabs.com',
      icon: Video,
      color: 'text-blue-600 dark:text-blue-400',
    },
    college: {
      badge: 'Campus Partner',
      title: 'College Portal',
      desc: 'Sign in to monitor institutional student cohorts, verify student projects, and review department placement readiness.',
      emailPlaceholder: 'dean@college.edu',
      icon: Building2,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    admin: {
      badge: 'Super Admin',
      title: 'Platform Command Center',
      desc: 'Authorized access for platform management, mentor assignments, college partners, and system monitoring.',
      emailPlaceholder: 'admin@rishabhlabs.com',
      icon: ShieldAlert,
      color: 'text-neutral-900 dark:text-white',
    },
  }[portal];

  const PortalIcon = portalMeta.icon;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#212121] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 shadow-sm">
              <div className="w-3.5 h-3.5 border-2 border-current rotate-45"></div>
            </div>
            <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
              RishabhLabs
            </span>
          </Link>
          <div className="flex items-center justify-center gap-1.5">
            <PortalIcon className={`w-4 h-4 ${portalMeta.color}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {portalMeta.badge}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {portalMeta.title}
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            {portalMeta.desc}
          </p>
        </div>

        {/* Segmented Portal Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handlePortalChange('student')}
            className={`py-2 px-1.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] ${
              portal === 'student'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Student</span>
          </button>
          <button
            type="button"
            onClick={() => handlePortalChange('mentor')}
            className={`py-2 px-1.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] ${
              portal === 'mentor'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Mentor</span>
          </button>
          <button
            type="button"
            onClick={() => handlePortalChange('college')}
            className={`py-2 px-1.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] ${
              portal === 'college'
                ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">College</span>
          </button>
          <button
            type="button"
            onClick={() => handlePortalChange('admin')}
            className={`py-2 px-1.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] ${
              portal === 'admin'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Admin</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {portal === 'mentor' ? 'Mentor Email' : portal === 'college' ? 'Institutional Email' : 'Email address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0 focus:border-neutral-900 dark:focus:border-neutral-500"
              placeholder={portalMeta.emailPlaceholder}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0 focus:border-neutral-900 dark:focus:border-neutral-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : `Sign In to ${portal === 'mentor' ? 'Mentor Workspace' : portal === 'college' ? 'College Portal' : portal === 'admin' ? 'Admin Panel' : 'Student Hub'}`}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {portal === 'student' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-white dark:bg-[#212121] px-2 text-neutral-400">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                  } catch (err: any) {
                    setError(err.message || 'Google authentication failed.');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-medium text-xs transition-colors flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </form>

        <p className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-neutral-900 dark:text-white hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
