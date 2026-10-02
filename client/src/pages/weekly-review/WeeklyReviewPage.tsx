import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { WeeklyReview } from '../../types';
import { normalizeTrackName } from '../../data/curatedRoadmaps';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Send,
  HelpCircle,
  Check
} from 'lucide-react';

const TRACK_NEXT_WEEK_ITEMS: Record<string, string[]> = {
  'App Development': [
    'React Navigation Native Stack Architecture & Nested Flows',
    'AsyncStorage & Encrypted MMKV Persistent State Storage',
    'Cross-Platform Responsive Component Hierarchy with Safe Areas',
  ],
  'Web Development': [
    'Next.js 15 App Router, Server Components & Server Actions',
    'Relational PostgreSQL Schema Design & Prisma Migrations',
    'OAuth2 Social Authentication & JWT Rotation Hardening',
  ],
  'AI / ML': [
    'PyTorch Autograd Engine & Gradient Descent from Scratch',
    'Convolutional Neural Networks (CNNs) for Computer Vision',
    'Cross-Entropy Loss Functions & GPU Acceleration Optimization',
  ],
  'Cybersecurity': [
    'OWASP Top 10 Web Vulnerability Exploitation Labs',
    'Burp Suite Traffic Interception & HTTP Header Tampering',
    'Asymmetric Cryptography, RSA Signatures & PKI Verification',
  ],
  'Data / Analytics': [
    'Advanced SQL Window Functions, Ranking & Recursive CTEs',
    'Automated Pandas Ingestion & Data Sanitation Pipelines',
    'Database Index Optimization & Query Execution Plans',
  ],
};

export const WeeklyReviewPage: React.FC = () => {
  const { user } = useAuth();
  const track = normalizeTrackName(user?.targetGoal || localStorage.getItem('rishabhlabs_goal') || 'App Development');
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [reflectionText, setReflectionText] = useState(() => localStorage.getItem('rishabhlabs_reflection') || '');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState<string | null>(() => localStorage.getItem('rishabhlabs_calibration') || null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const data = await api.getWeeklyReview();
        if (data) {
          setReview(data);
          if (data.reflectionText) setReflectionText(data.reflectionText);
          if (data.aiAdaptiveAdjustment) setFeedbackResponse(data.aiAdaptiveAdjustment);
        }
      } catch (err) {
        console.warn('Using curated weekly review for', track);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [track]);

  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const calibrationMsg = `Pace calibrated for ${track}. We have scheduled balanced 30-minute high-leverage sessions around your collegiate commitments so your momentum compounds steadily without burnout.`;

    try {
      localStorage.setItem('rishabhlabs_reflection', reflectionText);
      localStorage.setItem('rishabhlabs_calibration', calibrationMsg);
      setFeedbackResponse(calibrationMsg);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      const res = await api.submitWeeklyReflection(reflectionText);
      if (res?.review) {
        setReview(res.review);
        if (res.review.aiAdaptiveAdjustment) {
          setFeedbackResponse(res.review.aiAdaptiveAdjustment);
        }
      }
    } catch (err) {
      console.warn('Backend reflection sync note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextWeekList = (review?.nextWeekItems && review.nextWeekItems.length > 0)
    ? review.nextWeekItems
    : (TRACK_NEXT_WEEK_ITEMS[track] || TRACK_NEXT_WEEK_ITEMS['App Development']);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header matching Screen 10 */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Continuous Calibration Loop
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-0.5">
          Weekly Review
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          {review?.weekLabel || 'Week 1'} • {review?.dateRange || 'Current Week'}
        </p>
      </div>

      {/* Planned vs Completed Hours Card matching Screen 10 */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Planned
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono mt-0.5">
              {review?.plannedHours ?? 10}h
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Completed
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono mt-0.5">
              {review?.completedHours ?? 0}h {review?.completedMinutes ?? 0}m
            </p>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-500">Execution Velocity</span>
            <span className="text-neutral-900 dark:text-white font-mono">
              {review?.completionPercentage ?? 0}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-neutral-950 dark:bg-white rounded-full transition-all duration-700"
              style={{ width: `${review?.completionPercentage ?? 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2-Column Summary matching Screen 10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: What you completed */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            What you completed
          </h2>
          <div className="space-y-2.5">
            {review?.completedItems && review.completedItems.length > 0 ? (
              review.completedItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-800 dark:text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-neutral-400 font-medium">No tasks completed yet this week</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Complete your daily missions and lessons to log verified progress.</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Next week */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Next week
          </h2>
          <div className="space-y-2.5">
            {nextWeekList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                <Circle className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reflection Input Section matching Screen 10 */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Reflection
          </span>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
            What got in your way this week?
          </h2>
          <p className="text-xs text-neutral-500">
            Exam viva, lab submissions, or tricky recursion bugs? Rishabh Labs uses your answer to adapt next week's mission load.
          </p>
        </div>

        <form onSubmit={handleSubmitReflection} className="space-y-4">
          <textarea
            rows={3}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            required
            className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden resize-none"
            placeholder="Write your thoughts..."
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 transition-colors shadow-2xs disabled:opacity-50"
            >
              {isSubmitting ? 'Calibrating...' : 'Submit Reflection →'}
            </button>
          </div>
        </form>

        {feedbackResponse && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs leading-relaxed space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Adaptive Roadmap Calibration Active</span>
            </div>
            <p>{feedbackResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};
