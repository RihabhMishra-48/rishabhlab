import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CodingProblem } from '../../types';
import { getCuratedProblems } from '../../data/curatedProblems';
import {
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Terminal,
  Target,
  Plus,
  X,
  Code,
  Check
} from 'lucide-react';
import {
  DisplayCodeIcon,
  ChipBrainIcon,
  ShieldCheckIcon,
  MobileNotchIcon,
  ArrowTrendUpIcon,
  BugIcon
} from '../../components/icons/TrackIcons';

const TRACK_CONFIGS = [
  {
    id: 'Web Development',
    title: 'Web Development',
    icon: DisplayCodeIcon,
    badge: 'Full Stack',
    accentColor: 'blue' as const,
    desc: 'JavaScript DOM, React 19 State, Debouncing, Polyfills & Async Workflows',
    skills: ['DOM Trees', 'React State', 'Async Iterators', 'Event Loops'],
  },
  {
    id: 'AI & Machine Learning',
    title: 'AI & Machine Learning',
    icon: ChipBrainIcon,
    badge: 'GenAI & Math',
    accentColor: 'purple' as const,
    desc: 'NumPy Tensors, Min-Max Normalization, Embeddings & Vector Calculations',
    skills: ['Tensors', 'Cosine Similarity', 'Tokenizers', 'Softmax'],
  },
  {
    id: 'Mobile App Development',
    title: 'Mobile App Development',
    icon: MobileNotchIcon,
    badge: 'Mobile Systems',
    accentColor: 'cyan' as const,
    desc: 'Safe Area Calculations, Responsive Viewports & Native Gesture Handlers',
    skills: ['Safe Insets', 'Gesture Trees', 'Layout Engines', 'Async Queues'],
  },
  {
    id: 'Cybersecurity',
    title: 'Cybersecurity',
    icon: ShieldCheckIcon,
    badge: 'Security & Auth',
    accentColor: 'emerald' as const,
    desc: 'JWT Signature Verification, Base64URL Decoders & IDOR Exploit Mitigations',
    skills: ['JWT RFC7519', 'Base64URL', 'Access Control', 'Hashing'],
  },
  {
    id: 'Data & Analytics',
    title: 'Data & Analytics',
    icon: ArrowTrendUpIcon,
    badge: 'Data Pipelines',
    accentColor: 'orange' as const,
    desc: 'SQL Moving Averages, Window Partitions, Cumulative Aggregations & Pandas',
    skills: ['Window Functions', 'Rolling Averages', 'ETL Maps', 'Partitions'],
  },
];

export const ProblemListPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get('category');

  const normalizeToTrackName = (raw?: string | null): string => {
    if (!raw) return 'Web Development';
    const lower = raw.toLowerCase();
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine')) return 'AI & Machine Learning';
    if (lower.includes('web') || lower.includes('front') || lower.includes('full')) return 'Web Development';
    if (lower.includes('app') || lower.includes('mobile')) return 'Mobile App Development';
    if (lower.includes('cyber') || lower.includes('sec')) return 'Cybersecurity';
    if (lower.includes('data') || lower.includes('analyt')) return 'Data & Analytics';
    return 'Web Development';
  };

  const primaryTrack = normalizeToTrackName(
    user?.targetGoal ||
    (user?.id ? localStorage.getItem(`rishabhlabs_goal_${user.id}`) : null) ||
    localStorage.getItem('rishabhlabs_goal') ||
    'Web Development'
  );

  // Shared enrolled tracks system across Learn, Roadmap, and Practice
  const [enrolledTracks, setEnrolledTracks] = useState<string[]>(() => {
    try {
      const storageKey = `rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map(normalizeToTrackName);
          const unique = Array.from(new Set([primaryTrack, ...normalized]));
          try {
            localStorage.setItem(storageKey, JSON.stringify(unique));
          } catch { }
          return unique;
        }
      }
    } catch { }
    return [primaryTrack];
  });

  const [activeTrack, setActiveTrack] = useState<string>(() => {
    if (queryCategory) return normalizeToTrackName(queryCategory);
    return primaryTrack;
  });

  const [problems, setProblems] = useState<CodingProblem[]>(() => getCuratedProblems());
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure clean deduplicated tracks in state and localStorage on mount
    const storageKey = `rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`;
    setEnrolledTracks((prev) => {
      const unique = Array.from(new Set([primaryTrack, ...prev.map(normalizeToTrackName)]));
      if (unique.length !== prev.length || unique.some((t, i) => t !== prev[i])) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(unique));
        } catch { }
        return unique;
      }
      return prev;
    });
  }, [primaryTrack, user?.id]);

  useEffect(() => {
    if (showExploreModal) {
      document.body.style.overflow = 'hidden';
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowExploreModal(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showExploreModal]);

  useEffect(() => {
    let isCancelled = false;
    const fetchProblems = async () => {
      try {
        const data = await api.getProblems();
        if (isCancelled) return;
        if (data && data.length > 0) {
          setProblems(data);
        }
      } catch (err) {
        // Silently handled by instant curated list
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    fetchProblems();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleTrackChange = (trackName: string) => {
    const norm = normalizeToTrackName(trackName);
    setActiveTrack(norm);
    setSearchParams({ category: norm });
  };

  const handleEnrollSecondary = (chosenTrack: string) => {
    const normalized = normalizeToTrackName(chosenTrack);
    const updated = Array.from(new Set([...enrolledTracks, normalized]));
    setEnrolledTracks(updated);
    try {
      localStorage.setItem(`rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch { }
    handleTrackChange(normalized);
    setShowExploreModal(false);
  };

  const handleRemoveSecondaryTrack = (trackName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (trackName === primaryTrack) return;
    const updated = enrolledTracks.filter((t) => t !== trackName);
    setEnrolledTracks(updated);
    try {
      localStorage.setItem(`rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch { }
    if (activeTrack === trackName) {
      handleTrackChange(primaryTrack);
    }
  };

  // Filter problems by active enrolled track, difficulty, and search query
  const filtered = problems.filter((p) => {
    const matchDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;

    // Category match against active track
    const pCat = p.category.toLowerCase();
    const actLower = activeTrack.toLowerCase();
    const matchCat =
      (actLower.includes('web') && pCat.includes('web')) ||
      (actLower.includes('ai') && (pCat.includes('ai') || pCat.includes('machine'))) ||
      (actLower.includes('app') && pCat.includes('app')) ||
      (actLower.includes('cyber') && pCat.includes('cyber')) ||
      (actLower.includes('data') && pCat.includes('data'));

    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchDiff && matchCat && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Interactive Problem Solving
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-1">
            Coding Sandbox & Practice
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Production-grade algorithmic and domain-specific challenges tailored strictly to your specialization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            to="/python-hub"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors shadow-2xs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python Hub & Arena</span>
          </Link>

          <Link
            to="/debugging-lab"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-colors shadow-2xs"
          >
            <BugIcon className="w-3.5 h-3.5" />
            <span>Open Debugging Lab</span>
          </Link>
        </div>
      </div>

      {/* Enrolled Track Bar (Allows enrolling in multiple tracks) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-mono">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            Active Practice Track{enrolledTracks.length > 1 ? 's' : ''}
          </span>
          <span className="text-[11px] text-neutral-500">
            {enrolledTracks.length === 1 ? 'Focused on your target career' : `${enrolledTracks.length} Active Tracks`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {Array.from(new Set(enrolledTracks)).map((trk) => {
            const isSelected = activeTrack === trk;
            const isPrimary = trk === primaryTrack;

            return (
              <div
                key={trk}
                onClick={() => handleTrackChange(trk)}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${isSelected
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-[#262626]'
                  }`}
              >
                <span>{trk}</span>
                {isPrimary ? (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${isSelected
                      ? 'bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                  >
                    Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSecondaryTrack(trk, e)}
                    className={`p-0.5 rounded-md transition-colors ${isSelected
                      ? 'text-neutral-400 hover:text-white hover:bg-white/20'
                      : 'text-neutral-400 hover:text-rose-600 hover:bg-rose-500/10'
                      }`}
                    title={`Deselect ${trk}`}
                    aria-label={`Deselect ${trk}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Track Button — Unlimited tracks (removed 2-track max limit) */}
          {enrolledTracks.length < TRACK_CONFIGS.length && (
            <button
              onClick={() => setShowExploreModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors bg-neutral-50/50 dark:bg-transparent cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Track</span>
            </button>
          )}
        </div>
      </div>

      {/* Difficulty & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-neutral-400 text-[11px] font-semibold">Difficulty:</span>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${difficultyFilter === diff
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={`Search ${activeTrack} problems...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Problem Table / List */}
      <div className="bg-white dark:bg-[#212121] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-neutral-500">Loading {activeTrack} practice problems...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              No problems match your current difficulty filter in {activeTrack}.
            </p>
            <button
              onClick={() => {
                setDifficultyFilter('All');
                setSearchQuery('');
              }}
              className="text-xs text-blue-500 hover:underline font-bold"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filtered.map((prob) => {
              const isEasy = prob.difficulty === 'Easy';
              const isMedium = prob.difficulty === 'Medium';

              return (
                <Link
                  key={prob.slug}
                  to={`/practice/${prob.slug}`}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#2a2a2a] transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
                      {prob.isDebuggingChallenge ? (
                        <BugIcon className="w-4 h-4 text-rose-500" />
                      ) : prob.category.includes('AI') ? (
                        <ChipBrainIcon className="w-4 h-4 text-purple-500" />
                      ) : prob.category.includes('Cyber') ? (
                        <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                      ) : prob.category.includes('Data') ? (
                        <ArrowTrendUpIcon className="w-4 h-4 text-orange-500" />
                      ) : prob.category.includes('App') ? (
                        <MobileNotchIcon className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <DisplayCodeIcon className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {prob.title}
                        </h3>
                        {prob.isDebuggingChallenge && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold rounded">
                            Fix the Bug
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">{prob.category}</span>
                        <span>•</span>
                        <span>Acceptance: {prob.acceptanceRate || 85}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${isEasy
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                        : isMedium
                          ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/25'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25'
                        }`}
                    >
                      {prob.difficulty}
                    </span>

                    <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Explore / Add Second Track Modal */}
      {showExploreModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-5 animate-in fade-in duration-150"
          onClick={() => setShowExploreModal(false)}
        >
          <div
            className="w-full max-w-4xl bg-white dark:bg-[#1a1a1a] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Sticky Modal Header (Solid background, no blur) */}
            <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-4 shrink-0 bg-white dark:bg-[#1a1a1a]">
              <div className="space-y-1">
                {/* <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>PRACTICE SPECIALIZATION • MAX 2 TRACKS</span>
                </div> */}
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  Add Practice Tracks
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
                  Cross-train by unlocking practice challenges across engineering tracks. Your problem catalog and filter tabs update immediately.
                </p>
              </div>

              <button
                onClick={() => setShowExploreModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Track Cards Body */}
            <div ref={scrollContainerRef} className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
              {/* Enrollment Slots Tracker Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300 shrink-0">Active Coding Tracks:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from(new Set(enrolledTracks)).map((trk) => {
                      const isPrim = trk === primaryTrack;
                      if (isPrim) {
                        return (
                          <span
                            key={trk}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 select-none"
                            title="Primary track cannot be deselected"
                          >
                            <span>{trk}</span>
                            <span className="text-[10px] font-medium opacity-75">(Primary)</span>
                          </span>
                        );
                      }

                      return (
                        <button
                          key={trk}
                          type="button"
                          onClick={(e) => handleRemoveSecondaryTrack(trk, e)}
                          className="group/chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
                          title={`Click to deselect ${trk}`}
                        >
                          <span>{trk}</span>
                          <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500/15 group-hover/chip:bg-rose-500/20 transition-colors">
                            <Check className="w-2.5 h-2.5 group-hover/chip:hidden text-emerald-600 dark:text-emerald-400" />
                            <X className="w-2.5 h-2.5 hidden group-hover/chip:block text-rose-600 dark:text-rose-400" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <span className="text-[11px] font-mono font-semibold text-neutral-500 shrink-0">
                  {enrolledTracks.length} of {TRACK_CONFIGS.length} Tracks Enrolled
                </span>
              </div>

              {/* 5 Tracks Grid: 2 columns, with 5th track spanning full width (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {TRACK_CONFIGS.map((tc, idx) => {
                  const Icon = tc.icon;
                  const normalizedId = normalizeToTrackName(tc.id);
                  const isPrimary = normalizedId === primaryTrack;
                  const isEnrolled = enrolledTracks.includes(normalizedId);
                  const isCurrentView = normalizedId === activeTrack;
                  const isLastCard = idx === TRACK_CONFIGS.length - 1;

                  // Theme accents per track
                  const colorStyles = {
                    blue: {
                      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
                      borderHover: 'hover:border-blue-500/50',
                    },
                    purple: {
                      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                      badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60',
                      borderHover: 'hover:border-purple-500/50',
                    },
                    cyan: {
                      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
                      badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/60',
                      borderHover: 'hover:border-cyan-500/50',
                    },
                    emerald: {
                      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
                      borderHover: 'hover:border-emerald-500/50',
                    },
                    orange: {
                      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                      badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60',
                      borderHover: 'hover:border-orange-500/50',
                    },
                  }[tc.accentColor || 'blue'];

                  return (
                    <div
                      key={tc.id}
                      className={`p-4 rounded-2xl border transition-colors relative flex flex-col justify-between gap-3 ${isLastCard ? 'sm:col-span-2' : 'sm:col-span-1'
                        } ${isCurrentView
                          ? 'bg-neutral-50/90 dark:bg-neutral-900/80 border-blue-500/50 ring-1 ring-blue-500/30'
                          : isEnrolled
                            ? 'bg-neutral-50/50 dark:bg-neutral-900/40 border-emerald-500/30'
                            : `bg-neutral-50/30 dark:bg-neutral-900/30 border-neutral-200/80 dark:border-neutral-800 ${colorStyles.borderHover}`
                        }`}
                    >
                      {/* Top Row: Icon + Title + Badge + Sub-stats + Status Pill */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorStyles.iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                                {tc.title}
                              </h3>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${colorStyles.badge}`}>
                                {tc.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                              Coding Challenges & Algorithmic Practice
                            </p>
                          </div>
                        </div>

                        {/* Status Pill in Card Header */}
                        {isPrimary ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                            Primary Track ★
                          </span>
                        ) : isEnrolled ? (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSecondaryTrack(normalizedId, e)}
                            className="group/tag inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 transition-colors shrink-0 cursor-pointer"
                            title="Click to deselect"
                          >
                            <span>Enrolled</span>
                            <Check className="w-2.5 h-2.5 group-hover/tag:hidden" />
                            <X className="w-2.5 h-2.5 hidden group-hover/tag:inline text-rose-500" />
                          </button>
                        ) : null}
                      </div>

                      {/* Middle: Concise Description */}
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug line-clamp-2">
                        {tc.desc}
                      </p>

                      {/* Bottom Row: Skills + Action Button */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {tc.skills.slice(0, 3).map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/90 text-neutral-600 dark:text-neutral-300 font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>

                        <div className="shrink-0">
                          {isCurrentView ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 inline-block">
                                Active Filter ✓
                              </span>
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveSecondaryTrack(normalizedId, e)}
                                  className="text-xs font-bold px-2.5 py-1 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-500/10 border border-neutral-200 dark:border-neutral-700 hover:border-rose-500/30 transition-colors cursor-pointer"
                                  title="Deselect this track"
                                >
                                  Deselect
                                </button>
                              )}
                            </div>
                          ) : isEnrolled ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  handleTrackChange(normalizedId);
                                  setShowExploreModal(false);
                                }}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 transition-colors cursor-pointer"
                              >
                                View Problems
                              </button>
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveSecondaryTrack(normalizedId, e)}
                                  className="text-xs font-bold px-2.5 py-1.5 rounded-xl text-neutral-500 hover:text-rose-600 hover:bg-rose-500/10 border border-neutral-200 dark:border-neutral-700 hover:border-rose-500/30 transition-colors cursor-pointer"
                                  title="Deselect track"
                                >
                                  Deselect
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEnrollSecondary(normalizedId)}
                              className="text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 transition-colors shadow-2xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Unlock Track</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
