import React from 'react';
import { AggregatedHackathon } from '../../types';
import {
  X,
  ExternalLink,
  Calendar,
  Award,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Layers,
  Globe2,
  AlertTriangle,
  Lock,
  Users,
} from 'lucide-react';

interface HackathonDetailModalProps {
  hackathon: AggregatedHackathon | null;
  isOpen: boolean;
  onClose: () => void;
  onConnectMentor?: () => void;
}

export const HackathonDetailModal: React.FC<HackathonDetailModalProps> = ({
  hackathon,
  isOpen,
  onClose,
  onConnectMentor,
}) => {
  if (!isOpen || !hackathon) return null;

  const now = new Date();
  const deadline = hackathon.applicationDeadline ? new Date(hackathon.applicationDeadline) : null;
  const isClosed =
    hackathon.isClosed ||
    hackathon.status === 'closed' ||
    Boolean(deadline && deadline.getTime() < now.getTime());

  const prizeTotal =
    typeof hackathon.prizes === 'string'
      ? hackathon.prizes
      : hackathon.prizes?.total || 'Prizes & Grants';

  const prizeBreakdown =
    typeof hackathon.prizes === 'object' && Array.isArray(hackathon.prizes?.breakdown)
      ? hackathon.prizes.breakdown
      : [];

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'Devpost':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20';
      case 'Unstop':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Luma':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-8 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner header image */}
        {hackathon.bannerUrl && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-neutral-900 flex-shrink-0">
            <img
              src={hackathon.bannerUrl}
              alt={hackathon.title}
              className={`w-full h-full object-cover ${isClosed ? 'grayscale-[60%] opacity-70' : 'opacity-90'}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1a1a1a] via-transparent to-black/30" />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-white/80 dark:bg-[#1a1a1a]/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full border border-neutral-200/80 dark:border-neutral-700/60 shadow-sm transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable content container */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-neutral-700 dark:text-neutral-200">
          {/* Closed / Outdated Notice Alert */}
          {isClosed && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-rose-900 dark:text-rose-200">
                  Registrations Closed / Event Outdated
                </p>
                <p className="text-rose-700 dark:text-rose-300/80 leading-relaxed">
                  The registration deadline for this hackathon concluded on{' '}
                  <span className="font-semibold underline">
                    {deadline
                      ? deadline.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'the scheduled date'}
                  </span>
                  . Problem statements, timeline breakdowns, and winning benchmarks are preserved for engineering study.
                </p>
              </div>
            </div>
          )}

          {/* Header Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getPlatformBadge(
                  hackathon.sourcePlatform
                )}`}
              >
                {hackathon.sourcePlatform} Verified
              </span>

              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                {hackathon.category}
              </span>

              {isClosed ? (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                  <Lock className="w-3 h-3" /> Registrations Closed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  🟢 Open for Registration
                </span>
              )}

              {hackathon.location && (
                <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800/60 rounded-md">
                  <Globe2 className="w-3 h-3 text-neutral-600 dark:text-cyan-400" />
                  {hackathon.location}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-snug">
              {hackathon.title}
            </h2>

            {hackathon.organization && (
              <p className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                Organized by{' '}
                <span className="text-neutral-800 dark:text-neutral-200 font-semibold">
                  {hackathon.organization}
                </span>
              </p>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Total Prize Pool
                </div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white">
                  {prizeTotal}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  isClosed
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Application Deadline
                </div>
                <div
                  className={`text-sm font-bold ${
                    isClosed
                      ? 'text-rose-600 dark:text-rose-400 line-through'
                      : 'text-neutral-900 dark:text-white'
                  }`}
                >
                  {deadline
                    ? deadline.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Open Registration'}
                </div>
              </div>
            </div>
          </div>

          {/* Prize Structure breakdown */}
          {prizeBreakdown.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Prize Tiers & Rewards
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {prizeBreakdown.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800"
                  >
                    <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {p.place || `Tier ${idx + 1}`}
                    </div>
                    <div className="text-base font-extrabold text-amber-500 my-1">
                      {p.amount || 'Cash Grant'}
                    </div>
                    {p.perks && (
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                        {p.perks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comprehensive Timeline */}
          {hackathon.timeline && hackathon.timeline.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Comprehensive Timeline & Milestones
              </h3>
              <div className="space-y-2.5 border-l-2 border-neutral-200 dark:border-neutral-800 pl-4 ml-2">
                {hackathon.timeline.map((step, idx) => (
                  <div key={idx} className="relative pl-1">
                    <span className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-white dark:ring-[#1a1a1a]" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {step.stage}
                      </span>
                      <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40 w-fit">
                        {step.date}
                      </span>
                    </div>
                    {step.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Deep Description */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              <Layers className="w-4 h-4 text-neutral-400" />
              Event Overview & Scope
            </h3>
            <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-2 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
              <p>{hackathon.description || hackathon.summary}</p>
            </div>
          </div>

          {/* Eligibility Criteria */}
          {hackathon.eligibility && (
            <div>
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Eligibility Criteria
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
                {hackathon.eligibility}
              </p>
            </div>
          )}

          {/* Tags */}
          {hackathon.tags && hackathon.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hackathon.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md border border-neutral-200 dark:border-neutral-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-[#151515] border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-neutral-500 hidden sm:inline font-mono">
            Source: {hackathon.sourcePlatform} Verified Feed
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            {onConnectMentor && (
              <button
                onClick={onConnectMentor}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 rounded-xl border border-indigo-200 dark:border-indigo-800/40 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Connect to Mentor</span>
              </button>
            )}

            <a
              href={hackathon.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <span>Register Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
