import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { getCuratedMission, advanceTrackDay } from '../../data/curatedMissions';
import { normalizeTrackName } from '../../data/curatedRoadmaps';
import { api, hasAuthToken } from '../../services/api';
import { DailyMission } from '../../types';
import {
  Flame,
  Shield,
  Trophy,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Check,
  AlertCircle,
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
      title="Click or tap to interact!"
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

// Helper to clean repetitive prefix from curated mission task titles
function cleanTaskTitle(title: string): string {
  return title.replace(/^(learn|practice|build|ship)\s*[-–:]\s*/i, '').trim();
}

function getTaskBadgeStyle(type: string): string {
  switch (type.toLowerCase()) {
    case 'learn':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'practice':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'build':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    case 'ship':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    default:
      return 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20';
  }
}

export const MascotCompanion: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);

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
  const streakDays = user?.streakDays ?? (user as any)?.streak_days ?? 0;
  const streakFreezeAvailable = (user as any)?.streakFreezeAvailable ?? (user as any)?.streak_freeze_available ?? 0;
  const nextMilestone = streakDays >= 30 ? 60 : streakDays >= 14 ? 30 : streakDays >= 7 ? 14 : 7;
  const daysToMilestone = Math.max(0, nextMilestone - streakDays);

  // Current track and cached mission
  const targetTrack = normalizeTrackName(
    user?.targetGoal || localStorage.getItem('rishabhlabs_goal') || 'App Development'
  );
  const [mission, setMission] = useState<DailyMission>(() => getCuratedMission(targetTrack));

  // Sync mission on mount & track change or modal open (0ms instant cache)
  useEffect(() => {
    setMission(getCuratedMission(targetTrack));

    // Only sync with backend if user is authenticated and token is available
    if (!user || !hasAuthToken()) {
      return;
    }

    const syncBackend = async () => {
      try {
        const data = await api.getTodayMission();
        if (data && data.tasks && data.tasks.length > 0) {
          setMission(data);
        }
      } catch {
        // Fallback already cached
      }
    };
    syncBackend();
  }, [targetTrack, isOpen, user]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Dismiss small teaser bubble on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (floatingContainerRef.current && !floatingContainerRef.current.contains(e.target as Node)) {
        setShowSpeechBubble(false);
      }
    };
    if (showSpeechBubble && !isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSpeechBubble, isOpen]);

  // Derived task metrics
  const tasks = mission?.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;
  const isAllDone = totalTasks > 0 && completedCount === totalTasks;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Filtered task list
  const displayedTasks = tasks.filter((t) => {
    if (taskFilter === 'completed') return t.isCompleted;
    if (taskFilter === 'pending') return !t.isCompleted;
    return true;
  });

  // Reaction trigger helper
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

  // Boop handler with combo reaction
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

  // Instant 0ms toggle for tasks
  const handleToggleTask = async (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!mission) return;

    const updatedTasks = tasks.map((t) =>
      t.taskId === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const doneCount = updatedTasks.filter((t) => t.isCompleted).length;
    const allFinished = doneCount === updatedTasks.length;

    const updatedMission: DailyMission = {
      ...mission,
      tasks: updatedTasks,
      completedTasksCount: doneCount,
      isAllCompleted: allFinished,
    };
    setMission(updatedMission);

    // Save locally per-day
    try {
      const completedIds = updatedTasks.filter((t) => t.isCompleted).map((t) => t.taskId);
      const dayNum = mission.dayNumber || 1;
      localStorage.setItem(`rishabhlabs_mission_completed_${targetTrack}_day_${dayNum}`, JSON.stringify(completedIds));
      localStorage.setItem(`rishabhlabs_mission_completed_${targetTrack}`, JSON.stringify(completedIds));
    } catch {
      // Ignore
    }

    if (allFinished) {
      triggerReaction('delighted', 1500);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } else {
      triggerReaction('wink', 600);
    }

    // Backend sync in background
    if (mission._id) {
      try {
        await api.toggleMissionTask(mission._id, taskId);
      } catch (err) {
        console.warn('Mission sync notice:', err);
      }
    }
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIdx = (new Date().getDay() + 6) % 7;
  const weekdays = dayNames.map((day, idx) => {
    const isCompleted =
      isAllDone && idx === todayDayIdx
        ? true
        : streakDays > 0 && idx <= todayDayIdx && todayDayIdx - idx < streakDays;
    return { day, completed: isCompleted, isToday: idx === todayDayIdx };
  });

  return (
    <>
      {/* Floating Mascot Widget (Minimized State) */}
      <div
        ref={floatingContainerRef}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 right-3 sm:right-6 z-40 select-none flex flex-col items-end pointer-events-auto"
      >
        {/* Minimal Speech Capsule (strictly 1-2 lines) */}
        {showSpeechBubble && !isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="mb-2 max-w-[260px] p-2.5 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-xl text-neutral-800 dark:text-neutral-200 relative animate-in fade-in duration-200 cursor-pointer select-none"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeechBubble(false);
              }}
              className="absolute top-1.5 right-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded-full"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="pr-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 dark:text-orange-400 mb-0.5 font-mono">
                <Zap className="w-3 h-3 fill-current" />
                <span>{completedCount}/{totalTasks} TASKS DONE ({progressPercent}%)</span>
              </div>
              <p className="leading-tight text-[11px] font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-2">
                {isAllDone
                  ? 'Sabhi daily tasks poore! Tap karein progress dekhne ke liye →'
                  : `${pendingCount} daily task bacha hai · Tap karein brief & tasks ke liye →`}
              </p>
            </div>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-[#1f1f1f] border-b border-r border-neutral-200 dark:border-neutral-800 rotate-45" />
          </div>
        )}

        {/* Mascot Avatar Trigger Container */}
        <div
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center cursor-pointer group"
          title="Click to view today's tasks & personal progress"
        >
          {/* Interactive Character Sprite */}
          <InteractiveMascot
            size={76}
            activeReaction={activeReaction}
            direction={direction}
            onBoop={() => setIsOpen(true)}
            showStageAura={true}
          />

          {/* Streak Flame Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-mono font-bold text-[10px] shadow-md border-2 border-white dark:border-neutral-900 cursor-pointer transition-colors whitespace-nowrap"
            title="Click to view today's tasks & personal progress"
          >
            <Flame className="w-3 h-3 fill-current" />
            <span>{streakDays}</span>
          </button>
        </div>
      </div>

      {/* Expanded Dev Guardian Modal */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#191718] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-5 sm:p-6 relative my-auto space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
          >
            
            {/* Top Bar: Day, Track & Close Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-mono">
                  Day {mission?.dayNumber || 1} • {targetTrack}
                </span>
                <span className="text-[11px] font-bold text-neutral-400">
                  Daily Briefing
                </span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Unified Mascot Hero Card (Mascot + Coach Speech + Diagnostics) */}
            <div 
              ref={modalStageRef}
              className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-[#211F20] border border-neutral-200/90 dark:border-neutral-800 flex items-center gap-4"
            >
              {/* Left: Mascot Sprite */}
              <div className="shrink-0 flex items-center justify-center">
                <InteractiveMascot
                  size={84}
                  activeReaction={activeReaction}
                  direction={direction}
                  onBoop={handleBoop}
                  showStageAura={true}
                />
              </div>

              {/* Right: Personal Coach Diagnostic Speech & Quick Stats */}
              <div className="min-w-0 flex-1 space-y-2">
                {/* Speech Bubble */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#161415] border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xs">
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-snug">
                    {isAllDone ? (
                      <span>🎉 <strong className="text-emerald-500">Shandaar!</strong> Aaj ke sabhi daily tasks verified hain. Streak 100% safe hai!</span>
                    ) : completedCount > 0 ? (
                      <span>🔥 <strong className="text-orange-500">{completedCount}/{totalTasks} Done!</strong> Momentum solid hai, bas {pendingCount} task bache hain.</span>
                    ) : (
                      <span>⚡ <strong className="text-amber-500">{pendingCount} Tasks Pending:</strong> Raat se pehle complete karein taaki streak bachi rahe!</span>
                    )}
                  </p>
                </div>

                {/* Inline Diagnostic Pills (Wins & Alert) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    {streakDays > 0 ? `${streakDays}d Streak Active` : 'Start Streak Today'}
                  </span>

                  {pendingCount > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                      <AlertCircle className="w-3 h-3" />
                      {pendingCount} Left Today
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                      <Check className="w-3 h-3" />
                      100% Cleared
                    </span>
                  )}

                  {streakFreezeAvailable > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-200/60 dark:bg-neutral-800">
                      <Shield className="w-3 h-3 text-blue-500" />
                      {streakFreezeAvailable} Freeze Ready
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Progress Bar */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700 dark:text-neutral-300">
                  Daily Execution Progress
                </span>
                <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {completedCount}/{totalTasks} Done ({progressPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-emerald-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Today's Tasks Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  Today's Tasks
                </span>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-[10px] font-bold">
                  {(['all', 'pending', 'completed'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTaskFilter(filter)}
                      className={`px-2 py-0.5 rounded-md capitalize transition-colors cursor-pointer ${
                        taskFilter === filter
                          ? 'bg-white dark:bg-[#151314] text-neutral-900 dark:text-white shadow-2xs'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Items */}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                {displayedTasks.map((t) => {
                  const cleanedTitle = cleanTaskTitle(t.title);
                  return (
                    <div
                      key={t.taskId}
                      onClick={(e) => handleToggleTask(t.taskId, e)}
                      className={`p-2.5 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer select-none ${
                        t.isCompleted
                          ? 'bg-emerald-500/5 dark:bg-emerald-950/15 border-emerald-500/25'
                          : 'bg-neutral-50 dark:bg-[#211F20] border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleTask(t.taskId, e)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                            t.isCompleted
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-transparent hover:border-neutral-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {/* Title & Tag */}
                        <div className="min-w-0">
                          <p
                            className={`text-xs leading-snug line-clamp-1 ${
                              t.isCompleted
                                ? 'line-through text-neutral-400 dark:text-neutral-500 font-normal'
                                : 'font-semibold text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {cleanedTitle}
                          </p>
                        </div>
                      </div>

                      {/* Right: Badge & Duration */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border font-mono ${getTaskBadgeStyle(t.type)}`}>
                          {t.type}
                        </span>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-0.5 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {t.durationText || `${t.durationMinutes}m`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Strip: 7-Day Consistency & Direct Action */}
            <div className="pt-2 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3">
              {/* 7-Day Heat Dots */}
              <div className="flex items-center gap-1">
                {weekdays.map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-5.5 h-6 rounded-md flex flex-col items-center justify-center ${
                      item.isToday
                        ? 'bg-orange-500/10 border border-orange-500/30'
                        : 'bg-neutral-100 dark:bg-neutral-800/80'
                    }`}
                    title={`${item.day}: ${item.completed ? 'Completed' : 'Pending'}`}
                  >
                    <span className={`text-[7.5px] font-bold ${item.isToday ? 'text-orange-500' : 'text-neutral-400'}`}>
                      {item.day[0]}
                    </span>
                    {item.completed ? (
                      <Flame className="w-2.5 h-2.5 text-orange-500 fill-current -mt-0.5" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 my-0.5" />
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isAllDone && (
                  <button
                    onClick={() => {
                      const next = advanceTrackDay(targetTrack);
                      setMission(getCuratedMission(targetTrack, next));
                      triggerReaction('sparkle', 1200);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    title="Unlock and start next day mission"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Start Day {(mission?.dayNumber || 1) + 1}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/missions');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
                >
                  <span>Open Full Mission</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
