import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Lesson } from '../../types';
import { BookOpen, Clock, ArrowRight, Code2, Cpu, BarChart3, CheckCircle2, Shield } from 'lucide-react';

export const LearnCatalogPage: React.FC = () => {
  const { user } = useAuth();

  const getInitialTrack = () => {
    const goal = (user?.targetGoal || '').toLowerCase();
    if (goal.includes('cyber') || goal.includes('sec') || goal.includes('security')) {
      return 'cybersecurity';
    }
    if (goal.includes('ai') || goal.includes('ml') || goal.includes('machine') || goal.includes('deep')) {
      return 'ai-ml';
    }
    if (goal.includes('data') || goal.includes('anal')) {
      return 'data-analytics';
    }
    return 'web-dev';
  };

  const [selectedTrack, setSelectedTrack] = useState<string>(getInitialTrack);

  useEffect(() => {
    if (user?.targetGoal) {
      setSelectedTrack(getInitialTrack());
    }
  }, [user?.targetGoal]);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groupedLessons, setGroupedLessons] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const data = await api.getLessons(selectedTrack);
        setLessons(data.lessons);
        setGroupedLessons(data.grouped || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [selectedTrack]);

  const tracks = [
    { id: 'cybersecurity', label: 'Cybersecurity', icon: Shield, desc: 'Network Security, Linux Hardening, Web Pentesting & Cryptography' },
    { id: 'ai-ml', label: 'AI & Machine Learning', icon: Cpu, desc: 'Python, NumPy, Pandas, Scikit-Learn & Neural Networks' },
    { id: 'web-dev', label: 'Web Development', icon: Code2, desc: 'HTML, CSS, JS Array Methods, React, Node.js & REST' },
    { id: 'data-analytics', label: 'Data & Analytics', icon: BarChart3, desc: 'SQL, Exploratory Data Analysis & Dashboards' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Curated Knowledge Base
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-0.5">
          Learn Workspace
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Database-driven lessons with embedded try-it-yourself sandboxes. Never leave the platform to learn.
        </p>
      </div>

      {/* Track Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tracks.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTrack === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                isSelected
                  ? 'border-neutral-950 dark:border-white bg-white dark:bg-[#111722] shadow-sm ring-1 ring-neutral-950 dark:ring-white'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0D121B] hover:border-neutral-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">{t.label}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modules and Lessons List */}
      <div className="space-y-6">
        {Object.entries(groupedLessons).map(([moduleTitle, moduleLessons]) => (
          <div key={moduleTitle} className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              {moduleTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moduleLessons.map((les) => (
                <Link
                  key={les.slug}
                  to={`/learn/${les.track}/${les.slug}`}
                  className="p-5 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{les.readTime || '20 min'}</span>
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                      {les.title}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate max-w-sm">
                      {les.overview}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
