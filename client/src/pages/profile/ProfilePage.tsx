import React, { useState, useEffect, useRef } from 'react';
import {
  Link
} from 'react-router-dom';
import { api, hasAuthToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../../components/common/UserAvatar';
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
  Check,
  Camera,
  X,
  Sparkles,
  Upload,
  GraduationCap,
  Building,
  Target,
  ArrowRight,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Skills' | 'Projects' | 'Achievements'>('Overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    college: '',
    degree: '',
    year: '3rd Year',
    targetGoal: 'Web Development',
    avatar: '',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditModalOpen) {
        setIsEditModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditModalOpen]);

  useEffect(() => {
    if (user) {
      const cachedAvatar = user.email ? localStorage.getItem(`rishabhlabs_avatar_${user.email.toLowerCase()}`) : null;
      const cleanAvatar =
        user.avatar && !user.avatar.includes('rishabh.webp') && !user.avatar.includes('unsplash.com')
          ? user.avatar
          : (cachedAvatar || '');
      setFormData({
        name: user.name || '',
        username: user.githubUsername || '',
        bio: user.bio || '',
        college: user.college || '',
        degree: user.degree || '',
        year: user.year || '',
        targetGoal: user.targetGoal || user.fieldOfInterest || 'Cybersecurity',
        avatar: cleanAvatar,
      });
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfileData(data);
    } catch (err) {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasAuthToken()) {
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user]);

  const handleCopyPublicLink = () => {
    const handle = user?.githubUsername || (user?.name ? user.name.toLowerCase().replace(/\s+/g, '-') : 'profile');
    const url = `${window.location.origin}/u/${handle}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size exceeds 2MB limit. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFormData((prev) => ({ ...prev, avatar: dataUrl }));
        if (user?.email) {
          localStorage.setItem(`rishabhlabs_avatar_${user.email.toLowerCase()}`, dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const cachedAvatar = user?.email ? localStorage.getItem(`rishabhlabs_avatar_${user.email.toLowerCase()}`) : null;
      const effectiveAvatar = formData.avatar || user?.avatar || cachedAvatar || '';

      if (effectiveAvatar && user?.email) {
        localStorage.setItem(`rishabhlabs_avatar_${user.email.toLowerCase()}`, effectiveAvatar);
      }

      // 1. Update backend MongoDB / REST API
      await api.updateProfile({
        name: formData.name,
        bio: formData.bio,
        college: formData.college,
        degree: formData.degree,
        year: formData.year,
        githubUsername: formData.username,
        avatar: effectiveAvatar,
        targetGoal: formData.targetGoal,
        fieldOfInterest: formData.targetGoal,
      });

      if (user?.id) {
        localStorage.setItem(`rishabhlabs_goal_${user.id}`, formData.targetGoal);
      }
      localStorage.setItem('rishabhlabs_goal', formData.targetGoal);

      // 2. Sync to Supabase profiles table if available
      try {
        const { supabase, isSupabaseConfigured } = await import('../../services/supabase');
        if (isSupabaseConfigured && user?.id) {
          const updateData: any = {
            full_name: formData.name.trim() || user?.name || 'Engineer',
            college_name: formData.college.trim() || null,
            degree: formData.degree.trim() || null,
            year_of_study: formData.year.trim() || null,
            avatar_url: effectiveAvatar || null,
            github_username: formData.username.trim() || null,
            target_goal: formData.targetGoal,
            bio: formData.bio.trim() || null,
          };
          const { error: sbErr } = await supabase.from('profiles').update(updateData).eq('id', user.id);
          if (sbErr) {
            console.warn('Supabase profile sync notice:', sbErr.message);
          }
        }
      } catch (sbErr) {
        console.warn('Supabase profile sync error:', sbErr);
      }

      // 3. Refresh user in AuthContext & Profile view
      await refreshUser();
      await fetchProfile();

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditModalOpen(false);
      }, 1000);
    } catch (err: any) {
      alert('Failed to save profile: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    roadmapProgress: profileData?.stats?.roadmapProgress ?? 0,
    projectsCount: profileData?.stats?.projectsCount ?? '0',
    streakDays: profileData?.stats?.streakDays ?? `${(user as any)?.streak_days ?? (user as any)?.streakDays ?? 0} days`,
    status: profileData?.stats?.status ?? (((user as any)?.streak_days ?? (user as any)?.streakDays ?? 0) > 0 ? 'Active' : 'Getting Started'),
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
            <UserAvatar
              src={user?.avatar}
              name={user?.name}
              email={user?.email}
              size={80}
              roundedClassName="rounded-3xl"
              className="border-2 border-neutral-200 dark:border-neutral-700 shadow-md group-hover:opacity-85 transition-opacity"
            />
            <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity pointer-events-none">
              <Camera className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {user?.name || 'Student'}
              </h1>
              {user?.githubUsername && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  @{user.githubUsername}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-500 flex items-center gap-1.5 flex-wrap">
              {user?.role === 'mentor' ? (
                <>
                  <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    Mentor · {user?.targetGoal || user?.fieldOfInterest || 'Technical Guide'}
                  </span>
                  {user?.mentorOrganization && (
                    <>
                      <span>•</span>
                      <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">
                        {user.mentorOrganization}
                      </strong>
                    </>
                  )}
                  {Boolean(user?.mentorExperienceYears) && (
                    <span>• {user.mentorExperienceYears}+ yrs experience</span>
                  )}
                  {!user?.mentorOrganization && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      + Add Organization / Company
                    </button>
                  )}
                </>
              ) : (
                <>
                  {user?.targetGoal && (
                    <span className="px-2 py-0.5 rounded-md font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {user.targetGoal} Track
                    </span>
                  )}
                  {user?.year && <span>• {user.year}</span>}
                  {user?.degree && <span>• {user.degree}</span>}
                  {user?.college && (
                    <>
                      <span>•</span>
                      <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">
                        {user.college}
                      </strong>
                    </>
                  )}
                  {!user?.college && !user?.degree && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      + Add College & Degree
                    </button>
                  )}
                </>
              )}
            </p>

            <div className="pt-0.5">
              {user?.bio ? (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                  {user.bio}
                </p>
              ) : (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs text-neutral-400 dark:text-neutral-500 italic hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex items-center gap-1"
                >
                  <span>No bio added yet. Click to write your bio...</span>
                  <Edit3 className="w-3 h-3 text-neutral-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 flex-wrap">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

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
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === tab
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2a2a2a]'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Roadmap
          </span>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono">
            {stats.roadmapProgress}%
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Projects
          </span>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono">
            {stats.projectsCount}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Streak
          </span>
          <p className="text-2xl font-extrabold text-orange-500 font-mono">
            {stats.streakDays}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-1">
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
          {/* Skills Pills */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
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
          <div className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Synced GitHub Commits ({profileData?.githubStats?.totalCommits || 0} Commits)
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {user?.githubUsername ? `@${user.githubUsername}` : 'Not connected'}
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
              <div className="py-4 text-center space-y-2">
                <p className="text-xs text-neutral-400">
                  {user?.githubUsername
                    ? `GitHub account @${user.githubUsername} is connected. As you ship code, commits will appear here.`
                    : 'No external commits synced yet. Connect your GitHub username in Edit Profile to sync your proof of work.'}
                </p>
                {!user?.githubUsername && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Connect GitHub Username →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Skills' && (() => {
        const skillsToDisplay = profileData?.skills || [];

        if (skillsToDisplay.length === 0) {
          return (
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#212121] border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No Verified Skills Yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                You have freshly initialized your profile. As you complete lessons in your {user?.targetGoal || 'Cybersecurity'} Roadmap, ship daily missions, and pass coding labs, your verified skills will be recorded here.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  to="/roadmap"
                  className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Start Roadmap →
                </Link>
                <Link
                  to="/missions"
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Today's Mission
                </Link>
              </div>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {skillsToDisplay.map((sk: any) => (
              <div
                key={sk.name}
                className="p-4 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{sk.category}</span>
                  {sk.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">{sk.name}</p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-neutral-500 font-medium">{sk.level}</span>
                  <span className={`font-semibold ${sk.verified ? 'text-emerald-500' : 'text-neutral-400'}`}>
                    {sk.verified ? 'Verified ✓' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {activeTab === 'Projects' && (() => {
        const projectsToDisplay = profileData?.projects || [];

        if (projectsToDisplay.length === 0) {
          return (
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#212121] border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                No Projects Started Yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                You haven't enrolled in any project yet. Choose an industry project from your track to write code, submit proof of work, and build your portfolio.
              </p>
              <div className="pt-2">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <span>Browse Track Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {projectsToDisplay.map((p: any) => (
              <div
                key={p.title}
                className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{p.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {p.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(p.techStack || []).map((t: string) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/projects/${p.slug || ''}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity shrink-0 shadow-2xs"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        );
      })()}

      {activeTab === 'Achievements' && (() => {
        const earnedAchievements = profileData?.achievements || [
          {
            title: 'Day 1 Explorer',
            desc: `Registered on Rishabh Labs and set your learning path.`,
            date: 'Day 1',
            badge: '⚡',
            unlocked: true,
          },
        ];

        const streak = (user as any)?.streak_days ?? (user as any)?.streakDays ?? 0;
        const progress = profileData?.stats?.roadmapProgress ?? 0;

        const milestones = [
          ...earnedAchievements.map((a: any) => ({ ...a, unlocked: true })),
          {
            title: '7-Day Consistency Master',
            desc: 'Maintain a 7-day learning streak without missing a daily mission.',
            date: 'Locked',
            badge: '🔥',
            unlocked: streak >= 7,
          },
          {
            title: 'Curriculum Midpoint Achiever',
            desc: 'Complete 50% of your personalized track roadmap.',
            date: 'Locked',
            badge: '🎯',
            unlocked: progress >= 50,
          },
          {
            title: 'First Verified Project Shipped',
            desc: 'Complete all milestones for a capstone project and pass mentor evaluation.',
            date: 'Locked',
            badge: '🚀',
            unlocked: false,
          },
        ];

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((a: any, i: number) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border space-y-2 shadow-2xs ${
                  a.unlocked
                    ? 'bg-white dark:bg-[#212121] border-neutral-200/80 dark:border-neutral-800'
                    : 'bg-neutral-50/50 dark:bg-neutral-900/30 border-dashed border-neutral-200 dark:border-neutral-800/80 opacity-70'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                  a.unlocked ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100' : 'bg-neutral-200/50 dark:bg-neutral-800/40 text-neutral-400'
                }`}>
                  {a.badge || '🏆'}
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{a.title}</h3>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    a.unlocked ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                  }`}>
                    {a.unlocked ? 'Unlocked' : 'Goal'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">{a.desc}</p>
                <span className="text-[10px] text-neutral-400 block font-mono pt-1">{a.date}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Edit Profile Details</h2>
                <p className="text-xs text-neutral-500">Control your identity, academic details, and public proof of work.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar Uploader & Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shrink-0">
                    <UserAvatar
                      src={formData.avatar || user?.avatar}
                      name={formData.name || user?.name}
                      email={user?.email}
                      size={64}
                      roundedClassName="rounded-2xl"
                      className="w-full h-full"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      {(formData.avatar || user?.avatar) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, avatar: '' }));
                            if (user?.email) {
                              localStorage.removeItem(`rishabhlabs_avatar_${user.email.toLowerCase()}`);
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400">Supports JPG, PNG, WEBP (Max 2MB)</p>
                  </div>
                </div>
              </div>

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white"
                    placeholder="e.g. Shravan Rathore"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Username / GitHub Handle
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white font-mono"
                    placeholder="e.g. shravan"
                  />
                  <p className="text-[10px] text-neutral-400 font-mono">
                    URL: {window.location.origin}/u/{formData.username || 'username'}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Bio / Headline
                  </label>
                  <span className="text-[10px] text-neutral-400">{formData.bio.length} / 250</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={250}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white resize-none leading-relaxed"
                  placeholder="Write what you are currently building, learning, or interested in..."
                />
              </div>

              {/* College & Degree */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white"
                    placeholder="e.g. Your College / University"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Degree / Branch
                  </label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white"
                    placeholder="e.g. B.Tech Computer Science"
                  />
                </div>
              </div>

              {/* Year & Learning Track */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Year of Study
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white"
                  >
                    <option value="">Not Specified / Optional</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Post-Graduate">Post-Graduate</option>
                    <option value="Self-Taught / Working Professional">Self-Taught / Working Professional</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Active Learning Track
                  </label>
                  <select
                    value={formData.targetGoal}
                    onChange={(e) => setFormData({ ...formData, targetGoal: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="App Development">App Development</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Data / Analytics">Data / Analytics</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                >
                  {isSaving && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
