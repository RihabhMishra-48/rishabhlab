import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CodingProblem } from '../../types';
import {
  Code2,
  Bug,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
  Sparkles
} from 'lucide-react';

export const ProblemListPage: React.FC = () => {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await api.getProblems();
        setProblems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const filtered = problems.filter((p) => {
    const matchDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDiff && matchCat && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Algorithmic Mastery
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-0.5">
            Coding Sandbox & Practice
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            LeetCode-style problems with sandboxed test runners and progressive AI hints.
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

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-neutral-400 text-[11px] font-semibold">Difficulty:</span>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                difficultyFilter === diff
                  ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold'
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
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Problem Table / List */}
      <div className="bg-white dark:bg-[#111722] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
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
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0 group-hover:scale-105 transition-transform">
                    {prob.isDebuggingChallenge ? (
                      <Bug className="w-4 h-4 text-rose-500" />
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
                      <span>{prob.category}</span>
                      <span>•</span>
                      <span>Acceptance: {prob.acceptanceRate}%</span>
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
      </div>
    </div>
  );
};
