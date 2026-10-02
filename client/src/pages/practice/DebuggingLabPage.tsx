import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CodingProblem } from '../../types';
import { Bug, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const DebuggingLabPage: React.FC = () => {
  const [debuggingProblems, setDebuggingProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await api.getProblems({ type: 'debugging' });
        setDebuggingProblems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-3">
          <Bug className="w-3.5 h-3.5" />
          <span>Interactive Debugging Lab</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          "Fix the Bug" Challenges
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
          Real engineers spend 70% of their time debugging broken codebases. Inspect real-world bugs, patch edge-case defects, and earn your verified bug-fix credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {debuggingProblems.map((prob) => (
          <div
            key={prob.slug}
            className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 uppercase tracking-wider">
                  Bug Defect
                </span>
                <span className="text-xs font-bold text-neutral-400 font-mono">
                  {prob.difficulty}
                </span>
              </div>

              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {prob.title}
              </h2>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {prob.brokenBugExplanation || 'Defective logic causes edge-case failure on unexpected nulls or off-by-one bounds.'}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                {prob.publicTestCases?.length || 3} Test Cases to Pass
              </span>
              <Link
                to={`/practice/${prob.slug}`}
                className="px-4 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 flex items-center gap-1.5 shadow-2xs"
              >
                <span>Fix the Bug</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
