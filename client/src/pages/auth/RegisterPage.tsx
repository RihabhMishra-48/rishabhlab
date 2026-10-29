import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [role] = useState<'student' | 'mentor' | 'college_admin'>('student');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 8-digit OTP state
  const [otp, setOtp] = useState<string[]>(Array(8).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { user, sendOtp, verifyOtpAndLogin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [user, navigate]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Step 1: Submit Form & Send 8-digit OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        college: college.trim() || undefined,
        type: 'signup',
      });

      setSuccessMsg(res.message || `An 8-digit verification code has been sent to ${email}.`);
      setStep('otp');
      setResendCooldown(45);
      setOtp(Array(8).fill(''));
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle 8-digit OTP digit typing & navigation
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Single digit input
    const char = cleaned[cleaned.length - 1];
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-advance to next input box
    if (index < 7) {
      inputRefs.current[index + 1]?.focus();
    } else {
      const completeCode = newOtp.join('');
      if (completeCode.length === 8) {
        submitOtp(completeCode);
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

  // Handle pasting full 8-digit code
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
      submitOtp(pasted);
    }
  };

  // Step 3: Verify 8-Digit OTP & Confirm Signup
  const submitOtp = async (codeToVerify?: string) => {
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
        type: 'signup',
      });
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please double check the 8-digit code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend code handler
  const handleResend = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const res = await sendOtp({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        college: college.trim() || undefined,
        type: 'signup',
      });
      setSuccessMsg(res.message || `New 8-digit verification code sent to ${email}.`);
      setResendCooldown(45);
      setOtp(Array(8).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#212121] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-4 sm:p-8 space-y-6">
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
            {step === 'otp' ? 'Confirm Signup' : 'Create an account'}
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            {step === 'otp'
              ? `Enter the 8-digit code sent to ${email}`
              : 'Start your personalized engineering execution roadmap with verified credentials.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {successMsg && step === 'otp' && !error && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'form' ? (
          /* Step 1: Initial Signup Details */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0 focus:border-neutral-900 dark:focus:border-neutral-500"
                placeholder="e.g. Arpit Pandey"
              />
            </div>

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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0 focus:border-neutral-900 dark:focus:border-neutral-500"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                College / University <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0 focus:border-neutral-900 dark:focus:border-neutral-500"
                placeholder="e.g. GLA University"
              />
            </div>

            <p className="text-[11px] text-neutral-500 text-center">
              Next: We will send an 8-digit verification code to confirm your email.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin"></span>
                  Sending 8-digit code...
                </span>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="relative my-3">
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
                  setError(err.message || 'Google registration failed.');
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
          </form>
        ) : (
          /* Step 2: 8-Digit OTP Verification Screen (Confirm Signup) */
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <span className="truncate">Sent to <strong className="text-neutral-900 dark:text-white font-semibold">{email}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError('');
                }}
                className="text-neutral-900 dark:text-white hover:underline font-semibold text-[11px] shrink-0 ml-2 cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* 8-Digit Segmented OTP Grid */}
            <div className="space-y-2">
              <label className="block text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Enter 8-Digit Code
              </label>
              <div className="flex items-center justify-center gap-0.5 xs:gap-1 sm:gap-1.5" onPaste={handlePaste}>
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
                    className="w-7 h-10 xs:w-8.5 xs:h-11 sm:w-10 sm:h-12 text-center text-sm xs:text-base sm:text-lg font-bold font-mono bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg sm:rounded-xl text-neutral-900 dark:text-white outline-none focus:border-neutral-950 dark:focus:border-white focus:bg-white dark:focus:bg-neutral-800 transition-colors shadow-xs"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => submitOtp()}
              disabled={isSubmitting || otp.join('').length !== 8}
              className="w-full py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin"></span>
                  Confirming signup...
                </span>
              ) : (
                <>
                  <span>Confirm & Complete Signup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Resend Action */}
            <div className="text-center pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Didn't receive the email?</span>
              {resendCooldown > 0 ? (
                <span className="font-semibold text-neutral-400 text-xs">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
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
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-neutral-900 dark:text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
