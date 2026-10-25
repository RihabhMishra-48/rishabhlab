import React, { useState, useEffect } from 'react';
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
      badge: 'Full-Stack',
      desc: 'HTML, CSS, Modern JS, React 18, Node.js & REST APIs'
    },
    {
      id: 'ai-ml',
      label: 'AI & Machine Learning',
      icon: ChipBrainIcon,
      badge: 'GenAI & Deep Learning',
      desc: 'Python, NumPy, PyTorch, Neural Networks, Embeddings & LLMs'
    },
    {
      id: 'app-dev',
      label: 'Mobile App Development',
      icon: MobileNotchIcon,
      badge: 'Cross-Platform',
      desc: 'React Native, Flutter, Device APIs, Offline State & UX'
    },
    {
      id: 'cybersecurity',
      label: 'Cybersecurity',
      icon: ShieldCheckIcon,
      badge: 'Defense & Pentesting',
      desc: 'Network Packet Analysis, Linux Hardening, Web Pentesting & Cryptography'
    },
    {
      id: 'data-analytics',
      label: 'Data & Analytics',
      icon: ArrowTrendUpIcon,
      badge: 'Data Engineering',
      desc: 'SQL Mastery, Pandas DataFrames, ETL Pipelines & BI Dashboards'
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
      {showExploreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  Explore & Enroll in Learning Tracks
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Choose a secondary track to study alongside your primary curriculum.
                </p>
              </div>
              <button
                onClick={() => setShowExploreModal(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {tracks.map((t) => {
                const Icon = t.icon;
                const isEnrolled = enrolledTracks.includes(t.id);
                const isPrimary = t.id === primaryTrack;

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isEnrolled
                        ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/40'
                        : 'bg-neutral-50/70 dark:bg-neutral-900/60 border-neutral-200/60 dark:border-neutral-800'
                      }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <Icon className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{t.label}</h4>
                          <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      {isPrimary ? (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white">
                          Primary Track
                        </span>
                      ) : isEnrolled ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Enrolled
                          </span>
                          <button
                            onClick={() => handleRemoveSecondaryTrack(t.id)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnrollSecondary(t.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 transition-colors shadow-2xs"
                        >
                          Enroll as 2nd Track
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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
