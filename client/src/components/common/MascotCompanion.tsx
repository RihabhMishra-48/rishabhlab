import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import {
  Flame,
  Shield,
  Trophy,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Minimize2,
  Maximize2,
  Volume2
} from 'lucide-react';

export const MascotCompanion: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      return localStorage.getItem('rishabhlabs_mascot_minimized') === 'true';
    } catch {
      return false;
    }
  });
  const [speechIndex, setSpeechIndex] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [sparkClaimed, setSparkClaimed] = useState(false);

  // User streak stats
  const streakDays = user?.streakDays || user?.streak_days || 17;
  const streakFreezeAvailable = 1;
  const nextMilestone = 20;
  const daysToMilestone = Math.max(0, nextMilestone - streakDays);

  const speeches = [
    `Radhe Radhe! Day ${streakDays} streak is live 🔥. Complete today's mission to keep your flame glowing!`,
    `Weekly Code Sprint #18 is active! GLA University rank #14 can climb to top 10 today 🏆`,
    `Streak Freeze 🛡️ is active. Even if you take a break today, your streak stays safe!`,
    `Great progress on Web Development! 3 days left until your Day 20 Silver Dev Badge ⭐`,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % speeches.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [speeches.length]);

  const handleToggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rishabhlabs_mascot_minimized', String(next));
      } catch {}
      return next;
    });
  };

  const triggerCelebration = () => {
    setSparkClaimed(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7, x: 0.85 },
      colors: ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'],
    });
    setTimeout(() => setSparkClaimed(false), 4000);
  };

  const weekdays = [
    { day: 'Mon', completed: true },
    { day: 'Tue', completed: true },
    { day: 'Wed', completed: true },
    { day: 'Thu', completed: true },
    { day: 'Fri', completed: true },
    { day: 'Sat', completed: true },
    { day: 'Sun', completed: true },
  ];

  return (
    <>
      {/* Floating Mascot Widget */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 select-none flex flex-col items-end">
        {/* Speech Bubble */}
        {!isMinimized && showSpeechBubble && !isOpen && (
          <div className="mb-2 max-w-[240px] sm:max-w-[280px] p-3 rounded-2xl bg-white dark:bg-[#212121] border border-amber-200/80 dark:border-amber-900/60 shadow-lg text-xs text-neutral-800 dark:text-neutral-200 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => setShowSpeechBubble(false)}
              className="absolute top-1.5 right-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded-full"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="pr-3">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-0.5 font-mono">
                LITTLE KRISHNA • STREAK GUARDIAN
              </span>
              <p className="leading-snug text-[11px] sm:text-xs">
                {speeches[speechIndex]}
              </p>
            </div>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-[#212121] border-b border-r border-amber-200/80 dark:border-amber-900/60 rotate-45"></div>
          </div>
        )}

        {/* Mascot Avatar Trigger */}
        <div
          onClick={() => setIsOpen(true)}
          className={`relative group cursor-pointer transition-all duration-300 flex items-center justify-center ${
            isMinimized
              ? 'w-11 h-11 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/40 p-1 shadow-md hover:scale-105'
              : 'w-16 h-16 sm:w-20 sm:h-20'
          }`}
          title="Click to view Streak & Companion details"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/30 to-blue-400/20 blur-md pointer-events-none"></div>

          {/* Character Mascot Image */}
          <img
            src="/mascot/krishna.png"
            alt="Little Krishna Mascot"
            className={`w-full h-full object-contain relative z-10 transition-transform duration-200 ${
              isMinimized ? 'scale-90' : 'group-hover:scale-105'
            }`}
          />

          {/* Streak Flame Badge */}
          <div className="absolute -top-1 -left-1 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono font-bold text-[10px] shadow-sm border border-white dark:border-neutral-900">
            <Flame className="w-3 h-3 fill-current" />
            <span>{streakDays}</span>
          </div>

          {/* Minimize / Expand Toggle overlay on hover */}
          <button
            onClick={handleToggleMinimize}
            className="absolute -bottom-1 -right-1 z-20 w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
            title={isMinimized ? 'Expand Companion' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Streak Guardian Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1f1f1f] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 space-y-5 p-6 sm:p-7 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Character Header */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-100 to-blue-50 dark:from-amber-950/50 dark:to-blue-950/30 border border-amber-200/60 dark:border-amber-800/40 p-1 flex items-center justify-center shrink-0 shadow-inner">
                <img
                  src="/mascot/krishna.png"
                  alt="Little Krishna Mascot"
                  className="w-full h-full object-contain"
                />
                <span className="absolute -bottom-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold font-mono">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Your Learning Companion
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white leading-tight">
                  Little Krishna
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Guiding your daily consistency & streak momentum.
                </p>
              </div>
            </div>

            {/* Streak Status Showcase Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/40 dark:border-amber-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium block">
                      Active Streak
                    </span>
                    <span className="text-xl font-extrabold font-mono text-neutral-900 dark:text-white leading-none">
                      {streakDays} Days Strong
                    </span>
                  </div>
                </div>

                {/* Streak Freeze Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{streakFreezeAvailable} Freeze Ready</span>
                </div>
              </div>

              {/* 7-Day Dot Tracker */}
              <div className="pt-2 border-t border-amber-200/40 dark:border-amber-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  This Week's Activity
                </span>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weekdays.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-xl bg-white dark:bg-[#262626] border border-neutral-200/60 dark:border-neutral-800 flex flex-col items-center gap-1"
                    >
                      <span className="text-[9px] font-bold text-neutral-400">{item.day}</span>
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Milestone Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-amber-500 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    Day 20 Milestone: Silver Dev Badge
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {daysToMilestone > 0 ? `${daysToMilestone} days left to unlock` : 'Milestone achieved!'}
                  </p>
                </div>
              </div>
              <button
                onClick={triggerCelebration}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-2xs flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>{sparkClaimed ? 'Sparked! ✨' : 'Spark'}</span>
              </button>
            </div>

            {/* Action Shortcuts */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/missions');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Complete Today's Mission & Protect Streak</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/practice');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-100 dark:bg-[#282828] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-[#333] text-xs font-semibold transition-colors"
              >
                <span>Solve Today's Coding Challenge (+50 XP)</span>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
