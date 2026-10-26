import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Activity
} from 'lucide-react';

const DIRECTIONS = [
  'up-left',   'up',     'up-right',
  'left',      'center', 'right',
  'down-left', 'down',   'down-right'
];

const REACTIONS = [
  'blink',     'heart',    'sparkle',
  'surprised', 'wink',     'bashful',
  'sleepy',    'dizzy',    'delighted'
];

const CLOCKWISE = [
  'right', 'down-right', 'down', 'down-left',
  'left',  'up-left',    'up',   'up-right'
];

const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
const HYSTERESIS = 0.12;
const DEAD_ZONE = 70;

const SQUASH_KEYFRAMES: Keyframe[] = [
  { transform: 'scale(1, 1)', easing: 'ease-in' },
  { transform: 'scale(1.10, 0.86)', offset: 0.18, easing: 'ease-out' },
  { transform: 'scale(0.95, 1.08)', offset: 0.45, easing: 'ease-in-out' },
  { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
  { transform: 'scale(1, 1)' }
];

function getCellPosition(index: number) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return `${col * 50}% ${row * 50}%`;
}

function wrapAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

interface InteractiveMascotProps {
  size: number;
  activeReaction: string | null;
  direction: string;
  onBoop: (e?: React.MouseEvent) => void;
  showStageAura?: boolean;
}

const InteractiveMascot: React.FC<InteractiveMascotProps> = ({
  size,
  activeReaction,
  direction,
  onBoop,
  showStageAura = true,
}) => {
  const squashRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeReaction && squashRef.current) {
      if (typeof squashRef.current.animate === 'function') {
        squashRef.current.animate(SQUASH_KEYFRAMES, { duration: 420, easing: 'linear' });
      }
    }
  }, [activeReaction]);

  const dirIdx = DIRECTIONS.indexOf(direction);
  const dirBgPos = getCellPosition(dirIdx !== -1 ? dirIdx : 4);

  const reactIdx = activeReaction ? REACTIONS.indexOf(activeReaction) : -1;
  const reactBgPos = reactIdx !== -1 ? getCellPosition(reactIdx) : '50% 50%';

  return (
    <button
      type="button"
      onClick={onBoop}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="relative block p-0 border-0 bg-transparent cursor-pointer select-none outline-hidden focus:outline-hidden touch-manipulation group"
      title="Click or tap to boop avatar!"
    >
      {showStageAura && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400/20 via-blue-400/20 to-purple-400/15 blur-md pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-70" />
      )}

      <span
        ref={squashRef}
        style={{ transformOrigin: '50% 78%' }}
        className="relative block w-full h-full"
      >
        {/* Looking Direction Layer */}
        <span
          className="absolute inset-0 bg-no-repeat transition-opacity duration-100 pointer-events-none"
          style={{
            backgroundImage: 'url("/mascot/avatar-directions.webp")',
            backgroundSize: '300% 300%',
            backgroundPosition: dirBgPos,
            opacity: activeReaction ? 0 : 1,
          }}
        />

        {/* Reaction Expression Layer */}
        <span
          className="absolute inset-0 bg-no-repeat transition-opacity duration-100 pointer-events-none"
          style={{
            backgroundImage: 'url("/mascot/avatar-reactions.webp")',
            backgroundSize: '300% 300%',
            backgroundPosition: reactBgPos,
            opacity: activeReaction ? 1 : 0,
          }}
        />
      </span>
    </button>
  );
};

export const MascotCompanion: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [speechIndex, setSpeechIndex] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [sparkClaimed, setSparkClaimed] = useState(false);

  // Direction and reaction states
  const [direction, setDirection] = useState('center');
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  // Refs for tracking and timers
  const floatingContainerRef = useRef<HTMLDivElement>(null);
  const modalStageRef = useRef<HTMLDivElement>(null);
  const currentSectorRef = useRef<number>(-1);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boopCountRef = useRef(0);
  const lastBoopAtRef = useRef(0);

  // User streak stats
  const streakDays = user?.streakDays || user?.streak_days || 17;
  const streakFreezeAvailable = 1;
  const nextMilestone = 20;
  const daysToMilestone = Math.max(0, nextMilestone - streakDays);

  const speeches = [
    `Day ${streakDays} streak is live 🔥! Keep writing clean code to protect your flame.`,
    `Weekly Code Sprint #18 is active! Your rank #14 can climb to top 10 today 🏆`,
    `Streak Freeze 🛡️ is active. Even if you take a break today, your streak stays safe!`,
    `Great progress on Web Dev! 3 days left until your Day 20 Silver Dev Badge ⭐`,
    `Tap or boop me to check my expressions or test coding reactions! ✨`,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % speeches.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [speeches.length]);

  // Trigger temporary reaction
  const triggerReaction = useCallback((reactionName: string, duration = 800) => {
    if (reactionTimerRef.current) {
      clearTimeout(reactionTimerRef.current);
    }
    setActiveReaction(reactionName);

    reactionTimerRef.current = setTimeout(() => {
      setActiveReaction(null);
      reactionTimerRef.current = null;
    }, duration);
  }, []);

  // Boop handler with combo dizzy reaction
  const handleBoop = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const now = Date.now();
    const newCount = now - lastBoopAtRef.current < 1600 ? boopCountRef.current + 1 : 1;
    lastBoopAtRef.current = now;
    boopCountRef.current = newCount;

    if (newCount >= 4) {
      boopCountRef.current = 0;
      triggerReaction('dizzy', 1400);
    } else {
      const payoffs = ['heart', 'sparkle', 'delighted', 'wink'];
      triggerReaction(payoffs[(newCount - 1) % payoffs.length], 750);
    }
  }, [triggerReaction]);

  // Pointer tracking across window
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (activeReaction) return;

      // Choose active tracking target: modal stage if open, otherwise floating widget
      const targetEl = isOpen ? modalStageRef.current : floatingContainerRef.current;
      if (!targetEl) return;

      const rect = targetEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        currentSectorRef.current = -1;
        setDirection('center');
        return;
      }

      const angle = Math.atan2(dy, dx);
      if (
        currentSectorRef.current !== -1 &&
        Math.abs(wrapAngle(angle - currentSectorRef.current * SECTOR)) < SECTOR / 2 + HYSTERESIS
      ) {
        return;
      }

      const sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      currentSectorRef.current = sector;
      setDirection(CLOCKWISE[sector]);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [activeReaction, isOpen]);


  const triggerCelebration = () => {
    setSparkClaimed(true);
    triggerReaction('sparkle', 1200);
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

  const reactionButtons = [
    { key: 'heart', label: 'Heart', emoji: '❤️' },
    { key: 'sparkle', label: 'Sparkle', emoji: '✨' },
    { key: 'surprised', label: 'Surprised', emoji: '😮' },
    { key: 'wink', label: 'Wink', emoji: '😉' },
    { key: 'bashful', label: 'Bashful', emoji: '😊' },
    { key: 'sleepy', label: 'Sleepy', emoji: '💤' },
    { key: 'dizzy', label: 'Dizzy', emoji: '😵' },
    { key: 'delighted', label: 'Delighted', emoji: '🥳' },
    { key: 'blink', label: 'Blink', emoji: '👀' },
  ];

  return (
    <>
      {/* Floating Mascot Widget */}
      <div
        ref={floatingContainerRef}
        className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 select-none flex flex-col items-end pointer-events-auto"
      >
        {/* Speech Bubble */}
        {showSpeechBubble && !isOpen && (
          <div className="mb-2 max-w-[240px] sm:max-w-[280px] p-3 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-800 shadow-lg text-xs text-neutral-800 dark:text-neutral-200 relative animate-in fade-in duration-300">
            <button
              onClick={() => setShowSpeechBubble(false)}
              className="absolute top-1.5 right-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded-full"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="pr-3">
              <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 block mb-0.5 font-mono">
                CHIBI AVATAR DEV COMPANION
              </span>
              <p className="leading-snug text-[11px] sm:text-xs">
                {speeches[speechIndex]}
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="mt-1.5 text-[10px] font-bold text-neutral-900 dark:text-white hover:underline flex items-center gap-1"
              >
                <span>View Streak Guardian Hub</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-[#212121] border-b border-r border-neutral-200 dark:border-neutral-800 rotate-45" />
          </div>
        )}

        {/* Mascot Avatar Trigger Container */}
        <div className="relative flex items-center justify-center">
          {/* Interactive Character Sprite */}
          <InteractiveMascot
            size={76}
            activeReaction={activeReaction}
            direction={direction}
            onBoop={handleBoop}
            showStageAura={true}
          />

          {/* Streak Flame Badge: Clicking opens modal */}
          <button
            onClick={() => setIsOpen(true)}
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-mono font-bold text-[10px] shadow-md border-2 border-white dark:border-neutral-900 cursor-pointer transition-colors whitespace-nowrap"
            title="Click to view Streak Guardian details"
          >
            <Flame className="w-3 h-3 fill-current" />
            <span>{streakDays}</span>
          </button>
        </div>
      </div>

      {/* Expanded Streak Guardian Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#1f1f1f] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 sm:p-7 relative my-auto space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Character Header */}
            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Interactive Dev Companion
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white leading-tight">
                  Chibi Avatar (Cool Guy)
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Tracks your cursor gaze & responds to coding victories.
                </p>
              </div>
            </div>

            {/* Interactive Stage (Showcase Engine) */}
            <div
              ref={modalStageRef}
              className="relative w-full rounded-2xl bg-neutral-950 dark:bg-black border border-neutral-800 p-4 pt-5 pb-4 flex flex-col items-center justify-center shadow-inner overflow-hidden"
            >
              {/* Stage Top Labels */}
              <div className="w-full flex items-center justify-between text-[10px] font-bold tracking-wider uppercase mb-2">
                <span className="text-neutral-400 flex items-center gap-1.5 font-mono">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Gaze Tracker
                </span>
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  60 FPS Interactive
                </span>
              </div>

              {/* Central Mascot (130px size) */}
              <div className="my-2">
                <InteractiveMascot
                  size={130}
                  activeReaction={activeReaction}
                  direction={direction}
                  onBoop={handleBoop}
                  showStageAura={true}
                />
              </div>

              {/* Status Hint Pill */}
              <div className="mt-2 text-[11px] font-semibold text-neutral-300 bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-full font-mono">
                {activeReaction
                  ? `Reaction: ${activeReaction.toUpperCase()}`
                  : `Looking: ${direction.replace('-', ' ').toUpperCase()}`}
              </div>

              {/* Reaction Buttons Matrix */}
              <div className="w-full mt-4 pt-3 border-t border-neutral-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-2 text-center">
                  Trigger Reactions (Click to Test)
                </span>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {reactionButtons.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => triggerReaction(r.key, 900)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        activeReaction === r.key
                          ? 'bg-neutral-800 border-neutral-500 text-white'
                          : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{r.emoji}</span>
                      <span className="text-[11px]">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Streak Status Showcase Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#252528] border border-neutral-200/90 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
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
              <div className="pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  This Week's Consistency
                </span>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weekdays.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-xl bg-neutral-50 dark:bg-[#1e1e20] border border-neutral-200/60 dark:border-neutral-800 flex flex-col items-center gap-1"
                    >
                      <span className="text-[9px] font-bold text-neutral-400">{item.day}</span>
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Milestone Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
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
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
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
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
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
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-100 dark:bg-[#282828] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-[#333] text-xs font-semibold transition-colors cursor-pointer"
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
