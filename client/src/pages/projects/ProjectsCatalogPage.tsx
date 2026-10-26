import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types';
import { getCuratedProjects } from '../../data/curatedProjects';
import {
  FolderGit2,
  Plus,
  ArrowRight,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import {
  DisplayCodeIcon,
  ChipBrainIcon,
  ShieldCheckIcon,
  MobileNotchIcon,
  ArrowTrendUpIcon
} from '../../components/icons/TrackIcons';

export const ProjectsCatalogPage: React.FC = () => {
  const { user } = useAuth();

  const getDefaultCategory = () => {
    const goal = (user?.targetGoal || '').toLowerCase();
    if (goal.includes('cyber') || goal.includes('sec') || goal.includes('security')) {
      return 'Cybersecurity';
    }
    if (goal.includes('ai') || goal.includes('ml') || goal.includes('machine') || goal.includes('deep')) {
      return 'AI & Machine Learning';
    }
    if (goal.includes('web') || goal.includes('full')) {
      return 'Web Development';
    }
    return 'All Tracks';
  };

  const getTargetProjectSlug = () => {
    const goal = (
      user?.targetGoal ||
      (user?.id ? localStorage.getItem(`rishabhlabs_goal_${user.id}`) : null) ||
      localStorage.getItem('rishabhlabs_goal') ||
      ''
    ).toLowerCase();

    if (goal.includes('cyber') || goal.includes('sec')) {
      return 'network-packet-sniffer';
    }
    if (goal.includes('ai') || goal.includes('ml') || goal.includes('machine')) {
      return 'customer-churn-predictor';
    }
    if (goal.includes('app') || goal.includes('mobile')) {
      return 'mobile-fitness-tracker';
    }
    if (goal.includes('data') || goal.includes('analyt')) {
      return 'automated-etl-pipeline';
    }
    return 'college-event-platform';
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(getDefaultCategory);
  const [activeTab, setActiveTab] = useState<'All' | 'Not Started' | 'In Progress' | 'Completed'>('All');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.targetGoal) {
      setSelectedCategory(getDefaultCategory());
    }
  }, [user?.targetGoal]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.getProjects({
          status: activeTab,
          category: selectedCategory === 'All Tracks' ? undefined : selectedCategory,
        });
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(getCuratedProjects(selectedCategory));
        }
      } catch (err) {
        console.warn('API getProjects fallback to curated projects:', err);
        setProjects(getCuratedProjects(selectedCategory));
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [activeTab, selectedCategory]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header matching Screen 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-stretch gap-4 sm:gap-5">
          <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-2xs">
            <img src="/graphics/support.png" alt="Projects & Launch" className="w-full h-full object-contain dark:invert" />
          </div>
          <div className="flex flex-col justify-between py-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 leading-none">
              Portfolio Proof-of-Work
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
              Projects & Engineering Launch
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-none">
              Build real software projects from scratch. Check off milestones and submit verifiable proof of work.
            </p>
          </div>
        </div>

        <Link
          to={`/projects/${getTargetProjectSlug()}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Start Target Project</span>
        </Link>
      </div>

      {/* Track Category Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {['All Tracks', 'Cybersecurity', 'AI & Machine Learning', 'Web Development'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status Filter Tabs & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          {(['All', 'Not Started', 'In Progress', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2a2a2a]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-neutral-100 dark:bg-[#262626] border border-neutral-200/60 dark:border-neutral-800">
          <button
            onClick={() => setViewMode('compact')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              viewMode === 'compact'
                ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
            title="Compact View (clean & lightweight)"
          >
            Compact
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              viewMode === 'detailed'
                ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-2xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
            title="Detailed View (with project summary)"
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] space-y-2">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">No projects found</p>
          <p className="text-xs text-neutral-500">Try switching your category or status filter above.</p>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {projects.map((proj) => {
            const isCompleted = proj.status === 'Completed';
            const isInProgress = proj.status === 'In Progress';
            const isCyber = proj.category === 'Cybersecurity';
            const isAi = proj.category === 'AI & Machine Learning';
            const isApp = proj.category === 'Mobile App Development' || proj.category === 'App Development';
            const isData = proj.category === 'Data & Analytics' || proj.category === 'Data Analytics';

            return (
              <Link
                key={proj._id}
                to={`/projects/${proj.slug}`}
                className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs transition-colors flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Lightweight Track Icon Container */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isCyber
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/25 text-emerald-500 dark:text-emerald-400'
                        : isAi
                        ? 'bg-purple-500/10 dark:bg-purple-950/40 border-purple-500/25 text-purple-500 dark:text-purple-400'
                        : isApp
                        ? 'bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-500/25 text-indigo-500 dark:text-indigo-400'
                        : isData
                        ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/25 text-amber-500 dark:text-amber-400'
                        : 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500/25 text-blue-500 dark:text-blue-400'
                    }`}
                  >
                    {isCyber ? (
                      <ShieldCheckIcon className="w-5 h-5" />
                    ) : isAi ? (
                      <ChipBrainIcon className="w-5 h-5" />
                    ) : isApp ? (
                      <MobileNotchIcon className="w-5 h-5" />
                    ) : isData ? (
                      <ArrowTrendUpIcon className="w-5 h-5" />
                    ) : (
                      <DisplayCodeIcon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Core Information: Title & Clean Meta Chips */}
                  <div className="space-y-1 min-w-0">
                    {/* Line 1: Title + Status + Difficulty */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {proj.title}
                      </h3>

                      {/* Status Chip */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : isInProgress
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        <span>{proj.status}</span>
                      </span>

                      {/* Difficulty Chip */}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800/90 text-neutral-500 dark:text-neutral-400 shrink-0">
                        {proj.difficulty}
                      </span>
                    </div>

                    {/* Optional Detailed Summary (shown only when Detailed view is selected) */}
                    {viewMode === 'detailed' && proj.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 pt-0.5">
                        {proj.description}
                      </p>
                    )}

                    {/* Line 2: Curated Tech Stack Pills + Hours */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-neutral-400">
                      {proj.techStack.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#282828] text-neutral-600 dark:text-neutral-300 text-[10px] font-medium border border-neutral-200/50 dark:border-neutral-800/60"
                        >
                          {tech}
                        </span>
                      ))}

                      {proj.techStack.length > 4 && (
                        <span className="text-[10px] text-neutral-400 font-medium px-1">
                          +{proj.techStack.length - 4}
                        </span>
                      )}

                      <span className="text-neutral-300 dark:text-neutral-700 mx-0.5">•</span>

                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>~{proj.estimatedHours} hrs</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Progress Bar & Action Arrow */}
                <div className="flex items-center gap-4 sm:gap-5 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                      {proj.progressPercent}%
                    </span>
                    <div className="w-20 sm:w-28 h-2 flex items-center gap-1.5 mt-1">
                      {proj.progressPercent > 0 && (
                        <div
                          style={{ flex: Math.max(proj.progressPercent, 8) }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'
                          }`}
                        />
                      )}
                      {proj.progressPercent < 100 && (
                        <div
                          style={{ flex: Math.max(100 - proj.progressPercent, 8) }}
                          className="h-full rounded-full bg-neutral-200 dark:bg-[#383d47] transition-all duration-300"
                        />
                      )}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800/80 group-hover:bg-blue-600 group-hover:text-white text-neutral-400 flex items-center justify-center transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
