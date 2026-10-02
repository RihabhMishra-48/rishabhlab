import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User as UserIcon,
  Compass,
  FolderGit2,
  Flame,
  ShieldCheck,
  ExternalLink,
  GitBranch,
  Award,
  Edit3,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Skills' | 'Projects' | 'Achievements'>('Overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfileData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCopyPublicLink = () => {
    const url = `${window.location.origin}/u/${user?.githubUsername || 'rishabh-labs'}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const stats = {
    roadmapProgress: profileData?.stats?.roadmapProgress ?? 0,
    projectsCount: profileData?.stats?.projectsCount ?? '0 / 0',
    streakDays: profileData?.stats?.streakDays ?? `${(user as any)?.streak_days ?? (user as any)?.streakDays ?? 0} days`,
    status: profileData?.stats?.status ?? (((user as any)?.streak_days ?? (user as any)?.streakDays ?? 0) > 0 ? 'Active' : 'Getting Started'),
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Profile Header matching Screen 9 */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || '/avatars/rishabh.png'}
            alt={user?.name || 'User'}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-neutral-200 dark:border-neutral-700 shadow-md"
            onError={(e: any) => {
              e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop';
            }}
          />
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {user?.name || 'Student'}
            </h1>
            <p className="text-xs text-neutral-500">
              {user?.targetGoal ? `${user.targetGoal} Track` : 'Student'} {user?.year ? `• ${user.year}` : ''} {user?.college ? `• ` : ''}
              {user?.college && <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{user.college}</strong>}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md pt-1">
              {user?.bio || 'Building hands-on projects, mastering technical execution, and progressing through personalized roadmaps.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <button
            onClick={handleCopyPublicLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Public URL'}</span>
          </button>
        </div>
      </div>

      {/* Tabs matching Screen 9 */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {(['Overview', 'Skills', 'Projects', 'Achievements'] as const).map((tab) => (
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

      {/* 4 Metric Cards matching Screen 9 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Roadmap
          </span>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono">
            {stats.roadmapProgress}%
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Projects
          </span>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono">
            {stats.projectsCount}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Streak
          </span>
          <p className="text-2xl font-extrabold text-amber-500 font-mono">
            {stats.streakDays}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Status
          </span>
          <p className="text-2xl font-extrabold text-emerald-500 font-mono">
            {stats.status}
          </p>
        </div>
      </div>

      {/* Tab Specific Content */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Skills Pills matching Screen 9 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Verified Skills
              </h2>
              {profileData?.skills && profileData.skills.length > 0 && (
                <button
                  onClick={() => setActiveTab('Skills')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all →
                </button>
              )}
            </div>

            {profileData?.skills && profileData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {profileData.skills.map((s: any) => (
                  <div
                    key={s.name}
                    className="px-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 px-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-2">
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  No verified skills yet
                </p>
                <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                  Complete your daily missions and solve practice challenges to verify your skills.
                </p>
                <div className="pt-2">
                  <Link
                    to="/missions"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Start Day 1 Mission →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* GitHub Activity Feed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Synced GitHub Commits ({profileData?.githubStats?.totalCommits || 0} Commits)
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {profileData?.githubStats?.connected ? `@${profileData.githubStats.username}` : 'Not connected'}
              </span>
            </div>

            {profileData?.githubStats?.recentActivities && profileData.githubStats.recentActivities.length > 0 ? (
              <div className="space-y-2.5">
                {profileData.githubStats.recentActivities.map((act: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-bold text-neutral-900 dark:text-white truncate">
                        {act.repo}
                      </span>
                      <span className="text-neutral-500 truncate max-w-md">
                        {act.message}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 py-3 text-center">
                No external commits synced yet. When you ship projects, your verified proofs will appear here.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Skills' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(profileData?.skills || []).map((sk: any) => (
            <div
              key={sk.name}
              className="p-4 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-1"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{sk.category}</span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">{sk.name}</p>
              <div className="flex items-center justify-between pt-2 text-[11px]">
                <span className="text-neutral-500">{sk.level}</span>
                {sk.verified && <span className="text-emerald-500 font-bold">Verified ✓</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Projects' && (
        <div className="space-y-4">
          {(profileData?.projects || []).map((p: any) => (
            <div
              key={p.title}
              className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{p.title}</h3>
                <p className="text-xs text-neutral-500">{p.description}</p>
                <p className="text-[11px] text-neutral-400">{p.techStack.join(' • ')}</p>
              </div>
              <span className="text-xs font-bold text-emerald-500">{p.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(profileData?.achievements || []).map((a: any, i: number) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-2"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                🏆
              </div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{a.title}</h3>
              <p className="text-[11px] text-neutral-500">{a.desc}</p>
              <span className="text-[10px] text-neutral-400 block font-mono">{a.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
