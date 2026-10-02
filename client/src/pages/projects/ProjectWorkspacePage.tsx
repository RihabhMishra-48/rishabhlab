import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { Project } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  GitBranch,
  Upload,
  Video,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Check
} from 'lucide-react';

export const ProjectWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Submission Form State
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [liveDeployUrl, setLiveDeployUrl] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSubmittedSuccess, setProofSubmittedSuccess] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.getProjectBySlug(slug || 'ai-resume-analyzer');
        setProject(data);
        if (data.githubRepoUrl) setGithubRepoUrl(data.githubRepoUrl);
        if (data.liveDeployUrl) setLiveDeployUrl(data.liveDeployUrl);
        if (data.demoVideoUrl) setDemoVideoUrl(data.demoVideoUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  const handleToggleTask = async (milestoneId: string, taskId: string) => {
    if (!project) return;
    try {
      const res = await api.toggleProjectTask(project._id, milestoneId, taskId);
      setProject(res.project);
      if (res.project.progressPercent === 100) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setSubmittingProof(true);
    try {
      const res = await api.submitProjectProof(project._id, {
        githubRepoUrl,
        liveDeployUrl,
        demoVideoUrl,
        screenshots: ['/avatars/project_preview.png'],
      });
      setProject(res.project);
      setProofSubmittedSuccess(true);
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingProof(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-400">Loading project workspace...</div>;
  }

  if (!project) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-neutral-500">Project not found.</p>
        <Link to="/projects" className="text-xs font-semibold text-blue-500 hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Back button & Title Header */}
      <div className="space-y-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {project.title}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  project.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {project.liveDeployUrl && (
              <a
                href={project.liveDeployUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-850 hover:bg-neutral-200 text-xs font-medium text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live App</span>
              </a>
            )}
            {project.githubRepoUrl && (
              <a
                href={project.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-950 dark:bg-white hover:bg-neutral-800 text-xs font-medium text-white dark:text-neutral-950 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>GitHub Repo</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 w-full sm:w-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Milestone Completion
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">
              {project.progressPercent}%
            </span>
            <span className="text-xs text-neutral-500">
              ({project.milestones.reduce((acc, m) => acc + m.tasks.filter((t) => t.isCompleted).length, 0)} of{' '}
              {project.milestones.reduce((acc, m) => acc + m.tasks.length, 0)} tasks finished)
            </span>
          </div>
        </div>

        <div className="w-full sm:w-64 h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              project.progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${project.progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Milestones & Task Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Project Milestone Checklist
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                Click task to check/uncheck
              </span>
            </div>

            <div className="space-y-6">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{milestone.title}</span>
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {milestone.tasks.filter((t) => t.isCompleted).length}/{milestone.tasks.length}
                    </span>
                  </div>

                  <div className="space-y-2 pl-3">
                    {milestone.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(milestone.id, task.id)}
                        className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-3 cursor-pointer transition-colors ${
                          task.isCompleted
                            ? 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800/80 text-neutral-400 line-through'
                            : 'bg-white dark:bg-[#0D121B] border-neutral-200 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-400 shrink-0" />
                        )}
                        <span>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Requirements Spec */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Technical Requirements
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              {project.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0"></span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Proof of Work Submission & Mentor Feedback (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Submit Proof of Work Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Proof of Work Verification
              </span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Submit Project Artifacts
              </h3>
              <p className="text-xs text-neutral-500">
                Publishing your live repository and demo link adds verified proof to your public profile.
              </p>
            </div>

            {proofSubmittedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Proof of work submitted! Visible on your portfolio.</span>
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  required
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Live Deployment URL
                </label>
                <input
                  type="url"
                  value={liveDeployUrl}
                  onChange={(e) => setLiveDeployUrl(e.target.value)}
                  placeholder="https://my-app.vercel.app"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Loom / YouTube Demo Video (Optional)
                </label>
                <input
                  type="url"
                  value={demoVideoUrl}
                  onChange={(e) => setDemoVideoUrl(e.target.value)}
                  placeholder="https://loom.com/share/..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submittingProof}
                className="w-full py-3 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-2xs disabled:opacity-50"
              >
                {submittingProof ? 'Verifying...' : 'Submit Proof of Work →'}
              </button>
            </form>
          </div>

          {/* Mentor Review Card */}
          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-[#111722] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                Mentor Code Review
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
              "{project.mentorFeedback || 'Solid modular folder architecture. Once you finish skill filter pills, optimize API caching with a simple TTL memory cache.'}"
            </p>
            <div className="pt-2">
              <Link
                to="/mentorship"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Request 1:1 Code Review →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
