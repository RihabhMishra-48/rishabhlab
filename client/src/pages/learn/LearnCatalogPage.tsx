import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Lesson } from '../../types';
import { getCuratedLessons } from '../../data/curatedLessons';
import {
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle2,
  Plus,
  X,
  Check,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  DisplayCodeIcon,
  ChipBrainIcon,
  ShieldCheckIcon,
  MobileNotchIcon,
  ArrowTrendUpIcon
} from '../../components/icons/TrackIcons';

export const LearnCatalogPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTrack = searchParams.get('track');

  const normalizeToTrackId = (raw: string | null | undefined): string => {
    if (!raw) return 'web-dev';
    const lower = raw.toLowerCase();
    if (lower.includes('cyber') || lower.includes('sec')) return 'cybersecurity';
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine')) return 'ai-ml';
    if (lower.includes('app') || lower.includes('mobile') || lower.includes('flutter')) return 'app-dev';
    if (lower.includes('data') || lower.includes('analyt') || lower.includes('sql')) return 'data-analytics';
    return 'web-dev';
  };

  const primaryTrack = normalizeToTrackId(
    user?.targetGoal ||
    (user?.id ? localStorage.getItem(`rishabhlabs_goal_${user.id}`) : null) ||
    localStorage.getItem('rishabhlabs_goal') ||
    'web-dev'
  );

  const [enrolledTracks, setEnrolledTracks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.includes(primaryTrack)) return [primaryTrack, ...parsed];
          return parsed;
        }
      }
    } catch { }
    return [primaryTrack];
  });

  const [selectedTrack, setSelectedTrack] = useState<string>(() => {
    if (queryTrack) return normalizeToTrackId(queryTrack);
    return primaryTrack;
  });

  const [showExploreModal, setShowExploreModal] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    if (queryTrack) {
      const norm = normalizeToTrackId(queryTrack);
      setSelectedTrack(norm);
      if (!enrolledTracks.includes(norm)) {
        const updated = [...enrolledTracks, norm];
        setEnrolledTracks(updated);
        localStorage.setItem(`rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`, JSON.stringify(updated));
      }
    }
  }, [queryTrack]);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groupedLessons, setGroupedLessons] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const data = await api.getLessons(selectedTrack);
        if (data?.lessons && data.lessons.length > 0) {
          setLessons(data.lessons);
          setGroupedLessons(data.grouped || {});
        } else {
          // Fallback to curated lessons for resilient offline & serverless UX
          const curated = getCuratedLessons(selectedTrack);
          setLessons(curated);
          const grouped: Record<string, any[]> = {};
          curated.forEach((l) => {
            const mod = l.moduleTitle || 'Core Engineering Lessons';
            if (!grouped[mod]) grouped[mod] = [];
            grouped[mod].push(l);
          });
          setGroupedLessons(grouped);
        }
      } catch (err) {
        console.warn('API lessons fetch fallback to curated catalog:', err);
        const curated = getCuratedLessons(selectedTrack);
        setLessons(curated);
        const grouped: Record<string, any[]> = {};
        curated.forEach((l) => {
          const mod = l.moduleTitle || 'Core Engineering Lessons';
          if (!grouped[mod]) grouped[mod] = [];
          grouped[mod].push(l);
        });
        setGroupedLessons(grouped);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [selectedTrack]);

  const handleTrackChange = (trackId: string) => {
    setSelectedTrack(trackId);
    setSearchParams({ track: trackId });
  };

  const handleEnrollSecondary = (trackId: string) => {
    if (!enrolledTracks.includes(trackId)) {
      const updated = [...enrolledTracks, trackId];
      setEnrolledTracks(updated);
      localStorage.setItem(`rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`, JSON.stringify(updated));
    }
    handleTrackChange(trackId);
    setShowExploreModal(false);
  };

  const handleRemoveSecondaryTrack = (trackId: string) => {
    if (trackId === primaryTrack) return; // Cannot remove primary
    const updated = enrolledTracks.filter((t) => t !== trackId);
    setEnrolledTracks(updated);
    localStorage.setItem(`rishabhlabs_enrolled_tracks_${user?.id || 'guest'}`, JSON.stringify(updated));
    if (selectedTrack === trackId) {
      handleTrackChange(primaryTrack);
    }
  };

  const tracks = [
    {
      id: 'web-dev',
      label: 'Web Development',
      icon: DisplayCodeIcon,
      badge: 'Full Stack',
      accentColor: 'blue' as const,
      desc: 'React 19, TypeScript, Next.js 15, Node.js, REST APIs & Distributed Web Systems',
      skills: ['React 19', 'TypeScript', 'Node.js', 'Next.js'],
      hours: '120 hrs',
    },
    {
      id: 'ai-ml',
      label: 'AI & Machine Learning',
      icon: ChipBrainIcon,
      badge: 'GenAI & Deep Learning',
      accentColor: 'purple' as const,
      desc: 'Python, PyTorch, Neural Networks, Embeddings, LLMs & Production AI Serving',
      skills: ['Python', 'PyTorch', 'Vector DBs', 'LLMs'],
      hours: '140 hrs',
    },
    {
      id: 'app-dev',
      label: 'Mobile App Development',
      icon: MobileNotchIcon,
      badge: 'Cross-Platform',
      accentColor: 'cyan' as const,
      desc: 'React Native / Flutter, Mobile UI Architecture, State Machines & Device APIs',
      skills: ['React Native', 'Flutter', 'State Machines', 'Native Bridges'],
      hours: '110 hrs',
    },
    {
      id: 'cybersecurity',
      label: 'Cybersecurity',
      icon: ShieldCheckIcon,
      badge: 'Infosec & Defense',
      accentColor: 'emerald' as const,
      desc: 'Network Packet Analysis, Penetration Testing, Linux Hardening & Cryptography',
      skills: ['Wireshark', 'Kali Linux', 'Burp Suite', 'OWASP'],
      hours: '130 hrs',
    },
    {
      id: 'data-analytics',
      label: 'Data & Analytics',
      icon: ArrowTrendUpIcon,
      badge: 'Data Engineering',
      accentColor: 'amber' as const,
      desc: 'SQL Mastery, Pandas, Distributed ETL Pipelines & Executive Visualizations',
      skills: ['SQL', 'Pandas', 'Apache Spark', 'ETL Pipelines'],
      hours: '115 hrs',
    },
  ];

  const currentTrackObj = tracks.find((t) => t.id === selectedTrack) || tracks[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-stretch gap-4 sm:gap-5">
        <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-2xs">
          <img src="/graphics/e-learning.svg" alt="Learn Workspace" className="w-full h-full object-contain dark:invert" />
        </div>
        <div className="flex flex-col justify-between py-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 leading-none">
            Interactive Learning Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Learn Workspace
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-none">
            Focused curriculum aligned with your enrolled career path. Runnable code sandboxes and quizzes included.
          </p>
        </div>
      </div>

      {/* Enrolled Tracks Bar (Only shows enrolled tracks, NO unrelated tracks cluttering the screen!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-[#202020] border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pl-2 shrink-0">
            Active Track:
          </span>
          {enrolledTracks.map((trackId) => {
            const trackObj = tracks.find((t) => t.id === trackId);
            if (!trackObj) return null;
            const Icon = trackObj.icon;
            const isSelected = selectedTrack === trackId;
            const isPrimary = trackId === primaryTrack;

            return (
              <div
                key={trackId}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${isSelected
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white border border-neutral-200/80 dark:border-neutral-700'
                  }`}
              >
                <button
                  onClick={() => handleTrackChange(trackId)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{trackObj.label}</span>
                </button>

                {isPrimary && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                    Primary
                  </span>
                )}

                {!isPrimary && (
                  <button
                    onClick={() => handleRemoveSecondaryTrack(trackId)}
                    title="Remove secondary track"
                    className="ml-1 text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 font-bold text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowExploreModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 border border-neutral-200/80 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-blue-500" />
          <span>{enrolledTracks.length > 1 ? 'Manage Tracks' : 'Explore'}</span>
        </button>
      </div>

      {/* Explore & Add Track Modal */}
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>LEARNING SPECIALIZATION • MAX 2 TRACKS</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                  Explore & Enroll in Learning Tracks
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
                  Focus deeply on your primary track, or enroll in a second track to cross-train skills. Your interactive lessons and exercises update instantly.
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">Active Learning Tracks:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {enrolledTracks.map((trk) => {
                      const isPrim = trk === primaryTrack;
                      const trackObj = tracks.find((t) => t.id === trk);
                      const displayTitle = trackObj?.label || trk;
                      return (
                        <span
                          key={trk}
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            isPrim
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {displayTitle} {isPrim ? '(Primary)' : '(2nd Track)'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <span className="text-[11px] font-mono font-semibold text-neutral-500 shrink-0">
                  {enrolledTracks.length}/2 Slots Utilized {enrolledTracks.length < 2 ? '• 1 Slot Open' : '• Limit Reached'}
                </span>
              </div>

              {/* 5 Tracks Grid: 2 columns, with 5th track spanning full width (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {tracks.map((t, idx) => {
                  const Icon = t.icon;
                  const isEnrolled = enrolledTracks.includes(t.id);
                  const isPrimary = t.id === primaryTrack;
                  const isCurrentView = t.id === selectedTrack;
                  const isLastCard = idx === tracks.length - 1;

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
                    amber: {
                      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
                      borderHover: 'hover:border-amber-500/50',
                    },
                  }[t.accentColor || 'blue'];

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition-colors relative flex flex-col justify-between gap-3 ${
                        isLastCard ? 'sm:col-span-2' : 'sm:col-span-1'
                      } ${
                        isCurrentView
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
                                {t.label}
                              </h3>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${colorStyles.badge}`}>
                                {t.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                              ~{t.hours} • Structured Modules & Exercises
                            </p>
                          </div>
                        </div>

                        {/* Status Pill in Card Header */}
                        {isPrimary ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                            Primary Track ★
                          </span>
                        ) : isEnrolled ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                            Enrolled (2nd) ✓
                          </span>
                        ) : null}
                      </div>

                      {/* Middle: Concise Description */}
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug line-clamp-2">
                        {t.desc}
                      </p>

                      {/* Bottom Row: Skills + Action Button */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {t.skills.slice(0, 3).map((sk) => (
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
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 inline-block">
                              Active Lessons ✓
                            </span>
                          ) : isEnrolled ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  handleTrackChange(t.id);
                                  setShowExploreModal(false);
                                }}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 transition-colors"
                              >
                                View Lessons
                              </button>
                              {!isPrimary && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSecondaryTrack(t.id);
                                  }}
                                  className="text-xs font-semibold px-2 py-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                                  title="Drop secondary track"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ) : enrolledTracks.length < 2 ? (
                            <button
                              onClick={() => handleEnrollSecondary(t.id)}
                              className="text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 transition-colors shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Enroll as 2nd Track</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-semibold text-neutral-400">
                              Max 2 Tracks
                            </span>
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

      {/* Modules and Lessons List */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-neutral-500">Loading lessons...</p>
        </div>
      ) : Object.keys(groupedLessons).length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            No lessons available yet for this track.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedLessons).map(([moduleTitle, moduleLessons]) => (
            <div key={moduleTitle} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {moduleTitle}
                </h2>
                <span className="text-[11px] font-mono text-neutral-400">
                  {moduleLessons.length} lessons
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moduleLessons.map((les) => (
                  <Link
                    key={les.slug}
                    to={`/learn/${les.track || selectedTrack}/${les.slug}`}
                    className="p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1.5 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{les.readTime || '20 min'}</span>
                        </span>
                        {les.interactiveSandbox && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                            Interactive Sandbox
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {les.title}
                      </h3>
                      <p className="text-xs text-neutral-500 truncate max-w-sm">
                        {les.overview}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-400 shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
