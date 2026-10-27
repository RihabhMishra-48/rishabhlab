import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { College } from '../../types';
import {
  Building2,
  Users,
  CheckCircle2,
  Trophy,
  Sparkles,
  ArrowRight,
  FolderGit2
} from 'lucide-react';

export const CollegeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const res = await api.getCollegeOverview();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollege();
  }, []);

  const college: College = data?.college || {
    name: user?.college || 'Partner Institution',
    code: user?.college ? user.college.slice(0, 3).toUpperCase() : 'CAMPUS',
    location: 'Campus Analytics Hub',
    totalStudents: 0,
    activeStudents: 0,
    averageExecutionRate: 0,
    skillDistribution: {
      webDev: 0,
      aiMl: 0,
      dataAnalytics: 0,
      cybersecurity: 0,
    },
    topProjectsCount: 0,
    activeHackathonTeamsCount: 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* College Header matching Section 26 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white shadow-md font-bold text-lg">
            {college.code || 'COL'}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Institutional Admin Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-0.5">
              {college.name}
            </h1>
            <p className="text-xs text-neutral-500">{college.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Active Campus Partner
          </span>
        </div>
      </div>

      {/* 4 Core Institutional Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Enrolled</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">
            {college.totalStudents.toLocaleString()}
          </p>
          <span className="text-[11px] text-neutral-500">Engineering & Tech</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Active Builders</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-500 font-mono">
            {college.activeStudents.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold">
            {college.totalStudents > 0 ? `${Math.round((college.activeStudents / college.totalStudents) * 100)}% Active Ratio` : '0% Active Ratio'}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Avg Execution Rate</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-500 font-mono">
            {college.averageExecutionRate}%
          </p>
          <span className="text-[11px] text-neutral-500">Missions Completed</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Hackathon Squads</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-500 font-mono">
            {college.activeHackathonTeamsCount}
          </p>
          <span className="text-[11px] text-neutral-500">SIH 2026 Ready</span>
        </div>
      </div>

      {/* Skill Distribution Section matching Section 26 */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Cohort Competencies
          </span>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
            Student Skill Distribution
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-neutral-800 dark:text-neutral-200">Web Development (Full-Stack)</span>
              <span className="text-neutral-500 font-mono">{college.skillDistribution.webDev}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${college.skillDistribution.webDev}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-neutral-800 dark:text-neutral-200">AI / Machine Learning</span>
              <span className="text-neutral-500 font-mono">{college.skillDistribution.aiMl}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${college.skillDistribution.aiMl}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-neutral-800 dark:text-neutral-200">Data Science & Analytics</span>
              <span className="text-neutral-500 font-mono">{college.skillDistribution.dataAnalytics}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${college.skillDistribution.dataAnalytics}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-neutral-800 dark:text-neutral-200">Cybersecurity & Systems</span>
              <span className="text-neutral-500 font-mono">{college.skillDistribution.cybersecurity}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${college.skillDistribution.cybersecurity}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
