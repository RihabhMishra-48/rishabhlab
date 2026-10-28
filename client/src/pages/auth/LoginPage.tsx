import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, CheckCircle2, RefreshCw, Mail, Key } from 'lucide-react';

export type PortalType = 'student' | 'mentor' | 'college' | 'admin';

interface LoginPageProps {
  defaultPortal?: PortalType;
}

export const LoginPage: React.FC<LoginPageProps> = ({ defaultPortal }) => {
  const [searchParams] = useSearchParams();
  const initialPortal = (defaultPortal || searchParams.get('portal') || 'student') as PortalType;
  const [portal] = useState<PortalType>(
    ['student', 'mentor', 'college', 'admin'].includes(initialPortal) ? initialPortal : 'student'
  );

  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 8-digit OTP inputs
  const [otp, setOtp] = useState<string[]>(Array(8).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { user, login, sendOtp, verifyOtpAndLogin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

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
        navigate(user.isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
      }
    }
  }, [user, portal, navigate]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (loginMethod === 'otp' && otpStep === 'verify') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [loginMethod, otpStep]);

  // Standard Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Login: Request 8-Digit Code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp({ email: email.trim(), type: 'login' });
      setSuccessMsg(res.message || `An 8-digit login code has been sent to ${email}.`);
      setOtpStep('verify');
      setResendCooldown(45);
      setOtp(Array(8).fill(''));
    } catch (err: any) {
      setError(err.message || 'Failed to send login code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP digit navigation
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const char = cleaned[cleaned.length - 1];
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (index < 7) {
      inputRefs.current[index + 1]?.focus();
    } else {
      const full = newOtp.join('');
      if (full.length === 8) {
        submitOtpLogin(full);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 7);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === 8) {
      submitOtpLogin(pasted);
    }
  };

  // Submit 8-Digit OTP Login
  const submitOtpLogin = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otp.join('');
    if (fullCode.length !== 8) {
      setError('Please enter all 8 digits of the verification code.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await verifyOtpAndLogin({
        email: email.trim(),
        otp: fullCode,
        type: 'login',
      });
    } catch (err: any) {
      setError(err.message || 'Verification failed. Incorrect or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Portal metadata
  const portalMeta = {
    student: {
      title: 'Student Workspace',
      desc: 'Sign in to execute your daily curated missions, algorithmic coding challenges, and career roadmap.',
      emailPlaceholder: 'student@college.edu',
    },
    mentor: {
      title: 'Mentor Workspace',
      desc: 'Sign in to review student GitHub proof of work, schedule 1:1 office hours, and provide strategic code reviews.',
      emailPlaceholder: 'mentor@rishabhlabs.com',
    },
    college: {
      title: 'College Portal',
      desc: 'Sign in to monitor institutional student cohorts, verify student projects, and review department placement readiness.',
      emailPlaceholder: 'dean@college.edu',
    },
    admin: {
      title: 'Platform Command Center',
      desc: 'Authorized access for platform management, mentor assignments, college partners, and system monitoring.',
      emailPlaceholder: 'admin@rishabhlabs.com',
    },
  }[portal];

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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {portalMeta.title}
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            {portalMeta.desc}
          </p>
        </div>

        {/* Method Toggle: Password vs 8-Digit OTP */}
        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === 'password'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setOtpStep('request');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === 'otp'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>8-Digit Email OTP</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {successMsg && !error && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {loginMethod === 'password' ? (
          /* Password Login */
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
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
              className="w-full py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
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
                  className="w-full py-2.5 px-4 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-medium text-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
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
        ) : otpStep === 'request' ? (
          /* OTP Login - Step 1: Request Code */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0 focus:border-neutral-900 dark:focus:border-neutral-500"
                placeholder="name@example.com"
              />
            </div>

            <p className="text-[11px] text-neutral-500">
              We will send a one-time 8-digit verification code to your email for instant passwordless sign-in.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin"></span>
                  Sending code...
                </span>
              ) : (
                <>
                  <span>Send 8-Digit Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* OTP Login - Step 2: Verify 8-Digit Code */
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <span className="truncate">Sent to <strong className="text-neutral-900 dark:text-white font-semibold">{email}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setOtpStep('request');
                  setError('');
                }}
                className="text-neutral-900 dark:text-white hover:underline font-semibold text-[11px] shrink-0 ml-2 cursor-pointer"
              >
                Change
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Enter 8-Digit Code
              </label>
              <div className="flex items-center justify-center gap-1 sm:gap-1.5" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-9 h-11 sm:w-10 sm:h-12 text-center text-base sm:text-lg font-bold font-mono bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white outline-none focus:border-neutral-950 dark:focus:border-white focus:bg-white dark:focus:bg-neutral-800 transition-colors shadow-xs"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => submitOtpLogin()}
              disabled={isSubmitting || otp.join('').length !== 8}
              className="w-full py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                <>
                  <span>Sign In with 8-Digit Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Didn't receive the email?</span>
              {resendCooldown > 0 ? (
                <span className="font-semibold text-neutral-400 text-xs">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    setError('');
                    setIsSubmitting(true);
                    try {
                      const res = await sendOtp({ email: email.trim(), type: 'login' });
                      setSuccessMsg(res.message || `New 8-digit code sent to ${email}.`);
                      setResendCooldown(45);
                      setOtp(Array(8).fill(''));
                      inputRefs.current[0]?.focus();
                    } catch (err: any) {
                      setError(err.message || 'Failed to resend code.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-white hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>
          </div>
        )}

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
