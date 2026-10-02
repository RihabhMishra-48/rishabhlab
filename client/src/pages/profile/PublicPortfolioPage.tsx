import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ShieldCheck, CheckCircle2, GitBranch, ExternalLink, ArrowLeft } from 'lucide-react';

export const PublicPortfolioPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const data = await api.getPublicProfile(username || 'rishabh-labs');
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublic();
  }, [username]);

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-sm text-neutral-400">Loading verified portfolio...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#070A0F] text-neutral-900 dark:text-neutral-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Rishabh Labs Verified Directory</span>
        </Link>

        {/* Public Header */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={profile?.user?.avatar || '/avatars/rishabh.png'}
                alt={profile?.user?.name}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-neutral-200 dark:border-neutral-700"
                onError={(e: any) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop';
                }}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                    {profile?.user?.name || 'Rishabh Mishra'}
                  </h1>
                  <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  {profile?.user?.degree} • {profile?.user?.college}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-lg pt-1">
                  {profile?.user?.bio}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Streak Record</span>
              <p className="text-2xl font-extrabold text-amber-500 font-mono mt-0.5">{profile?.stats?.streakDays ?? 0} Days</p>
            </div>
          </div>

          {/* Verified Skills */}
          <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Verified Technical Competencies
            </span>
            <div className="flex flex-wrap gap-2">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((s: string) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{s}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-400">No verified skills completed yet. Complete coding sandboxes and project milestones to earn skill badges.</span>
              )}
            </div>
          </div>
        </div>

        {/* Verified Projects Portfolio */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Shipped Projects & Verified Code Artifacts
          </h2>
          <div className="space-y-4">
            {(profile?.verifiedProjects || []).map((proj: any) => (
              <div
                key={proj.title}
                className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">{proj.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold">
                      Verified Shipped
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 max-w-xl">{proj.description}</p>
                  <p className="text-[11px] text-neutral-400 pt-1 font-mono">{proj.techStack.join(' • ')}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {proj.liveDeployUrl && (
                    <a
                      href={proj.liveDeployUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {proj.githubRepoUrl && (
                    <a
                      href={proj.githubRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1.5"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
