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
  CheckCircle2
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

  const [selectedTrack, setSelectedTrack] = useState<string>(() => {
    if (queryTrack) return normalizeToTrackId(queryTrack);
    const goal = user?.targetGoal || (user?.id ? localStorage.getItem(`rishabhlabs_goal_${user.id}`) : null) || localStorage.getItem('rishabhlabs_goal');
    return normalizeToTrackId(goal);
  });

  useEffect(() => {
    if (queryTrack) {
      setSelectedTrack(normalizeToTrackId(queryTrack));
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

  const tracks = [
    {
      id: 'web-dev',
      label: 'Web Development',
      icon: DisplayCodeIcon,
      desc: 'HTML, CSS, Modern JS, React 18, Node.js & REST APIs'
    },
    {
      id: 'ai-ml',
      label: 'AI & Machine Learning',
      icon: ChipBrainIcon,
      desc: 'Python, NumPy, PyTorch, Neural Networks, Embeddings & LLMs'
    },
    {
      id: 'app-dev',
      label: 'Mobile App Development',
      icon: MobileNotchIcon,
      desc: 'React Native, Flutter, Device APIs, Offline State & UX'
    },
    {
      id: 'cybersecurity',
      label: 'Cybersecurity',
      icon: ShieldCheckIcon,
      desc: 'Network Packet Analysis, Linux Hardening, Web Pentesting & Cryptography'
    },
    {
      id: 'data-analytics',
      label: 'Data & Analytics',
      icon: ArrowTrendUpIcon,
      desc: 'SQL Mastery, Pandas DataFrames, ETL Pipelines & BI Dashboards'
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Interactive Learning Catalog
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-1">
          Learn Workspace
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Step-by-step curriculum with integrated runnable code sandboxes and quizzes. No setup required.
        </p>
      </div>

      {/* Track Selection Tabs across all 5 tracks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {tracks.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTrack === t.id;

          return (
            <button
              key={t.id}
              onClick={() => handleTrackChange(t.id)}
              className={`p-4 rounded-2xl border text-left transition-colors flex flex-col justify-between space-y-2.5 ${
                isSelected
                  ? 'border-blue-200/80 dark:border-blue-800/60 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs'
                  : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f] hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">{t.label}</p>
                <p
                  className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${
                    isSelected
                      ? 'text-neutral-700 dark:text-neutral-300'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {t.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

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
