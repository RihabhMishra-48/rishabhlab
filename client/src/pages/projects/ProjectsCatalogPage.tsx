import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types';
import {
  FolderGit2,
  Plus,
  ArrowRight,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Layers,
  Cpu,
  Code2,
  Clock,
  Shield
} from 'lucide-react';

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
    const goal = (user?.targetGoal || '').toLowerCase();
    if (goal.includes('cyber') || goal.includes('sec') || goal.includes('security')) {
      return 'network-packet-sniffer';
    }
    if (goal.includes('web') || goal.includes('full')) {
      return 'college-event-platform';
    }
    return 'customer-churn-predictor';
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(getDefaultCategory);
  const [activeTab, setActiveTab] = useState<'All' | 'Not Started' | 'In Progress' | 'Completed'>('All');
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
        setProjects(data);
      } catch (err) {
        console.error(err);
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
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Portfolio Proof-of-Work
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-0.5">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Build real software projects from scratch. Check off milestones and submit verifiable proof of work.
          </p>
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
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status Filter Tabs matching Screen 6 */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {(['All', 'Not Started', 'In Progress', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Projects List matching Screen 6 */}
      {loading ? (
        <div className="p-8 text-center text-xs text-neutral-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111722] space-y-2">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">No projects found</p>
          <p className="text-xs text-neutral-500">Try switching your category or status filter above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => {
            const isCompleted = proj.status === 'Completed';
            const isInProgress = proj.status === 'In Progress';
            const isCyber = proj.category === 'Cybersecurity';
            const isAi = proj.category === 'AI & Machine Learning';

            return (
              <Link
                key={proj._id}
                to={`/projects/${proj.slug}`}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* 3D project thumbnail icon */}
                  <div className="w-12 h-12 rounded-2xl bg-neutral-950 dark:bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    {isCyber ? (
                      <Shield className="w-6 h-6 text-emerald-400" />
                    ) : isAi ? (
                      <Cpu className="w-6 h-6 text-purple-400" />
                    ) : (
                      <Code2 className="w-6 h-6 text-blue-400" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                        {proj.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : isInProgress
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                        }`}
                      >
                        {proj.status}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-mono">
                        {proj.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xl">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-400">
                      <span className="font-semibold text-neutral-600 dark:text-neutral-300">{proj.category}</span>
                      <span>•</span>
                      <span>{proj.techStack.join(' • ')}</span>
                      <span>•</span>
                      <span>~{proj.estimatedHours} hrs</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Progress & Arrow */}
                <div className="flex items-center gap-6 self-end sm:self-auto shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                      {proj.progressPercent}%
                    </span>
                    <div className="w-24 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          isCompleted ? 'bg-emerald-500' : proj.progressPercent > 0 ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'
                        }`}
                        style={{ width: `${Math.max(proj.progressPercent, 4)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
