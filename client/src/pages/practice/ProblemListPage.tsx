import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CodingProblem } from '../../types';
import { getCuratedProblems } from '../../data/curatedProblems';
import {
  Code2,
  Bug,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Terminal,
  Cpu,
  Shield,
  Smartphone,
  BarChart3
} from 'lucide-react';

export const ProblemListPage: React.FC = () => {
  const { user } = useAuth();

  const mapGoalToCategory = (goal?: string | null): string => {
    if (!goal) return 'All';
    const lower = goal.toLowerCase();
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine')) return 'AI & Machine Learning';
    if (lower.includes('web') || lower.includes('front') || lower.includes('full')) return 'Web Development';
    if (lower.includes('app') || lower.includes('mobile')) return 'Mobile App Development';
    if (lower.includes('cyber') || lower.includes('sec')) return 'Cybersecurity';
    if (lower.includes('data') || lower.includes('analyt')) return 'Data & Analytics';
    return 'All';
  };

  const savedGoal = user?.targetGoal || (user?.id ? localStorage.getItem(`rishabhlabs_goal_${user.id}`) : null) || localStorage.getItem('rishabhlabs_goal');
  const initialCategory = mapGoalToCategory(savedGoal);

  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const data = await api.getProblems();
        if (data && data.length > 0) {
          setProblems(data);
        } else {
          setProblems(getCuratedProblems());
        }
      } catch (err) {
        console.warn('API getProblems fallback to curated challenges:', err);
        setProblems(getCuratedProblems());
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const categories = [
    'All',
    'AI & Machine Learning',
    'Web Development',
    'Mobile App Development',
    'Cybersecurity',
    'Data & Analytics',
  ];

  const filtered = problems.filter((p) => {
    const matchDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDiff && matchCat && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Interactive Problem Solving
            </span>
            {user?.targetGoal && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                Tailored for {user.targetGoal}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-0.5">
            Coding Sandbox & Practice
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Production-grade algorithmic and domain-specific challenges with in-browser test runners and AI hints.
          </p>
        </div>

        <Link
          to="/debugging-lab"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-colors self-start sm:self-auto"
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Open Debugging Lab</span>
        </Link>
      </div>

      {/* Track & Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Track:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              categoryFilter === cat
                ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs'
                : 'bg-white dark:bg-[#111722] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Difficulty & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-neutral-400 text-[11px] font-semibold">Difficulty:</span>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                difficultyFilter === diff
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
            placeholder="Search questions by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Problem Table / List */}
      <div className="bg-white dark:bg-[#111722] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-neutral-500">Loading practice problems...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              No problems match your current filter.
            </p>
            <button
              onClick={() => {
                setCategoryFilter('All');
                setDifficultyFilter('All');
                setSearchQuery('');
              }}
              className="text-xs text-blue-500 hover:underline font-bold"
            >
              Clear filters
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
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
                      {prob.isDebuggingChallenge ? (
                        <Bug className="w-4 h-4 text-rose-500" />
                      ) : prob.category.includes('AI') ? (
                        <Cpu className="w-4 h-4 text-purple-500" />
                      ) : prob.category.includes('Cyber') ? (
                        <Shield className="w-4 h-4 text-emerald-500" />
                      ) : prob.category.includes('Data') ? (
                        <BarChart3 className="w-4 h-4 text-amber-500" />
                      ) : prob.category.includes('App') ? (
                        <Smartphone className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Code2 className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                          {prob.title}
                        </h3>
                        {prob.isDebuggingChallenge && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-rose-500/10 text-rose-500 font-bold rounded">
                            Fix the Bug
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                        <span className="font-medium text-neutral-500 dark:text-neutral-400">{prob.category}</span>
                        <span>•</span>
                        <span>Acceptance: {prob.acceptanceRate || 85}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isEasy
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : isMedium
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {prob.difficulty}
                    </span>

                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
