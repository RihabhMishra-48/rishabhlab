import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Mentor } from '../../types';
import { getCuratedMentors } from '../../data/curatedMentors';
import {
  Users,
  Compass,
  FolderGit2,
  Trophy,
  ShieldCheck,
  Briefcase,
  Star,
  Clock,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Calendar,
  Shield,
  Video
} from 'lucide-react';

const getDomainTheme = (domain?: string) => {
  const d = (domain || '').toLowerCase();
  if (d.includes('cyber') || d.includes('sec')) {
    return {
      label: 'Cybersecurity',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      tag: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40',
      topGradient: 'from-emerald-500/15 via-teal-500/5 to-transparent',
      avatarBorder: 'ring-emerald-500/30',
    };
  }
  if (d.includes('ai') || d.includes('ml') || d.includes('machine')) {
    return {
      label: 'AI & Machine Learning',
      accentColor: 'text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
      tag: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40',
      topGradient: 'from-purple-500/15 via-indigo-500/5 to-transparent',
      avatarBorder: 'ring-purple-500/30',
    };
  }
  return {
    label: domain || 'Full-Stack Development',
    accentColor: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    tag: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40',
    topGradient: 'from-blue-500/15 via-indigo-500/5 to-transparent',
    avatarBorder: 'ring-blue-500/30',
  };
};

export const MentorshipPage: React.FC = () => {
  const { user } = useAuth();

  const getInitialDomain = () => {
    const goal = (user?.targetGoal || '').toLowerCase();
    if (goal.includes('cyber') || goal.includes('sec')) return 'Cybersecurity';
    if (goal.includes('ai') || goal.includes('ml')) return 'AI & Machine Learning';
    return 'All';
  };

  const [selectedDomain, setSelectedDomain] = useState<string>(getInitialDomain);

  useEffect(() => {
    if (user?.targetGoal) {
      setSelectedDomain(getInitialDomain());
    }
  }, [user?.targetGoal]);

  const getDefaultMessage = () => {
    const goal = (user?.targetGoal || '').toLowerCase();
    if (goal.includes('cyber') || goal.includes('sec')) {
      return 'Looking for 1:1 guidance on network security protocols, vulnerability scanning projects, and cybersecurity career roadmap.';
    }
    if (goal.includes('ai') || goal.includes('ml')) {
      return 'Looking for guidance on model training pipelines, neural networks, and AI project architecture.';
    }
    return 'Looking for code architecture review and guidance on my project roadmap.';
  };

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('Roadmap');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(getDefaultMessage);
  const [preferredSlot, setPreferredSlot] = useState('Tomorrow, 6:00 PM IST');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSessions, setBookedSessions] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rishabhlabs_booked_sessions') || '[]');
    } catch {
      return [];
    }
  });

  const commonTopics = [
    { id: 'Career Direction', label: 'Career Direction', icon: Compass, desc: 'Align your goals with hiring markets' },
    { id: 'Roadmap', label: 'Roadmap', icon: Compass, customGraphic: '/graphics/roadmap.png', desc: 'Review your personalized learning milestones' },
    { id: 'Project Review', label: 'Project Review', icon: FolderGit2, customGraphic: '/graphics/thumbs-up-trust.svg', desc: 'Codebase architecture & refactoring critique' },
    { id: 'Hackathon Strategy', label: 'Hackathon Strategy', icon: Trophy, customGraphic: '/graphics/troph-cap.svg', desc: 'Winning 48h MVP scoping & pitch prep' },
    { id: 'Portfolio Building', label: 'Portfolio Building', icon: ShieldCheck, desc: 'Polish your verified Proof of Work' },
    { id: 'Internship Prep', label: 'Internship Prep', icon: Briefcase, desc: 'Mock interviews & technical questions' },
  ];

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await api.getMentors();
        if (data && data.length > 0) {
          setMentors(data);
          setSelectedMentor(data[0]);
          return;
        }
      } catch (err) {
        console.warn('API getMentors fallback to curated mentor list:', err);
      }

      const curated = getCuratedMentors(selectedDomain);
      setMentors(curated);
      if (curated.length > 0) setSelectedMentor(curated[0]);
    };
    fetchMentors();
  }, [selectedDomain]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && bookingModalOpen) {
        setBookingModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookingModalOpen]);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    setIsSubmitting(true);
    try {
      const newSession = {
        id: 'session-' + Date.now(),
        mentorName: selectedMentor.name,
        mentorRole: `${selectedMentor.title} at ${selectedMentor.company}`,
        mentorAvatar: selectedMentor.avatar,
        topic: selectedTopic,
        slot: preferredSlot,
        meetLink: 'https://meet.google.com/new',
        bookedAt: new Date().toLocaleDateString(),
      };

      const updated = [newSession, ...bookedSessions];
      setBookedSessions(updated);
      localStorage.setItem('rishabhlabs_booked_sessions', JSON.stringify(updated));

      try {
        await api.requestMentorship({
          mentorId: selectedMentor._id,
          topic: selectedTopic,
          message: bookingMessage,
          preferredSlot,
        });
      } catch { }

      setBookingSuccess(true);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        setBookingModalOpen(false);
        setBookingSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header matching Screen 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-stretch gap-4 sm:gap-5">
          <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-2xs">
            <img src="/graphics/mentorship.png" alt="Mentorship & Summit" className="w-full h-full object-contain dark:invert" />
          </div>
          <div className="flex flex-col justify-between py-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 leading-none">
              Expert Human Layer
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
              Mentorship
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-none">
              Get guidance when you need it.
            </p>
          </div>
        </div>
      </div>

      {/* Mentor Profile Status Banner */}
      {user?.role === 'mentor' && (
        <div className="p-5 rounded-3xl bg-neutral-900 text-white dark:bg-[#212121] border border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold">Your Mentor Profile</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.verificationStatus === 'pending'
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                  {user.verificationStatus === 'pending' ? 'Advance Verification: In Progress' : 'Verified Industry Mentor'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Domain: <strong className="text-white">{user.fieldOfInterest || user.targetGoal || 'Cybersecurity'}</strong>{user.mentorOrganization || user.college ? <> · Institution: <strong className="text-white">{user.mentorOrganization || user.college}</strong></> : null}
              </p>
            </div>
          </div>
          <div className="text-xs text-neutral-400">
            {user.verificationStatus === 'pending' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/90 text-neutral-300 border border-neutral-700/80 font-medium">
                Reviewing credentials · Live directory preview enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                Active on Mentor Directory
              </span>
            )}
          </div>
        </div>
      )}

      {/* Hero Book a 1:1 Session Card (Sleek Grayish Monochrome Aesthetic) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#FAFAFA] via-[#F4F4F5] to-[#E4E4E7] dark:from-[#212121] dark:via-[#1A1A1A] dark:to-[#141414] border border-neutral-200/90 dark:border-neutral-800 shadow-sm overflow-hidden p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Soft Ambient Neutral Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-neutral-200/60 dark:bg-neutral-800/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-slate-200/50 dark:bg-neutral-900/30 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/70 dark:bg-neutral-800 border border-neutral-300/70 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>Expert Human Guidance</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Book a <span className="text-neutral-950 dark:text-white bg-neutral-200/70 dark:bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-300/70 dark:border-neutral-700">1:1 Session</span> with Mentors
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
            Get personalized guidance from industry specialists at Stripe, Razorpay, and Microsoft. Overcome blockers in code, hackathon MVP scoping, and technical placement strategy.
          </p>

          {/* Quick Perks Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-neutral-600 dark:text-neutral-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700/80 shadow-2xs font-medium">
              <Clock className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
              <span>45m Focused Slot</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700/80 shadow-2xs font-medium">
              <Video className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
              <span>Instant Online Meet</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-2xs">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Free for Students</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (mentors.length > 0 && !selectedMentor) {
                  setSelectedMentor(mentors[0]);
                }
                setBookingModalOpen(true);
              }}
              className="px-6 py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <Video className="w-4 h-4 text-white dark:text-neutral-950 shrink-0" />
              <span>Schedule Mentorship Session</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/70 dark:text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Right Graphic with Circular Halo Backdrop (Sleek Grayish Palette) */}
        <div className="relative z-10 shrink-0 flex items-center justify-center p-3">
          {/* Circular Frosted Grayish Backdrop Aura */}
          <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-neutral-200/90 via-slate-100 to-neutral-200/60 dark:from-neutral-800/90 dark:via-neutral-850 dark:to-neutral-900 border border-neutral-300/80 dark:border-neutral-700/80 flex items-center justify-center relative shadow-inner">
            {/* Top-left Floating Badge */}
            <div className="absolute -top-3 -left-3 px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-[11px] shadow-md border border-neutral-800 dark:border-neutral-300 flex items-center gap-1.5 z-20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Top Rated 4.98★</span>
            </div>

            {/* Inner Live Booking Card */}
            <div className="w-48 bg-white dark:bg-[#242424] rounded-2xl border border-neutral-200/90 dark:border-neutral-700 p-4 shadow-xl space-y-3 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Live Booking
                  </span>
                </div>
                <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                  Today
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-100/90 dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/70 space-y-0.5">
                <p className="text-[10px] text-neutral-400 font-medium">Earliest Available</p>
                <p className="text-xs font-extrabold text-neutral-900 dark:text-white">Today, 7:00 PM IST</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Verified Mentors</span>
                <div className="flex -space-x-2">
                  {mentors.slice(0, 3).map((m) => (
                    <img
                      key={m._id}
                      src={m.avatar}
                      alt={m.name}
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800 shadow-2xs"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom-right Floating Meet Chip */}
            <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-[10px] shadow-sm flex items-center gap-1.5 z-20">
              <Video className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>Online Meet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Common Topics Grid matching Screen 8 */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
          Common Topics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {commonTopics.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedTopic === topic.id;

            return (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic.id);
                  setBookingModalOpen(true);
                }}
                className={`p-4 rounded-2xl border text-center transition-colors flex flex-col items-center justify-center gap-2 group ${isSelected
                  ? 'border-neutral-950 dark:border-white bg-white dark:bg-[#212121] shadow-sm'
                  : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#262626] hover:border-neutral-300'
                  }`}
              >
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center p-1.5">
                  {(topic as any).customGraphic ? (
                    <img src={(topic as any).customGraphic} alt={topic.label} className="w-4 h-4 object-contain dark:invert" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                  {topic.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Mentors Roster with Domain Filter */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Available Mentors
            </h2>
            <p className="text-xs text-neutral-500">
              Verified industry practitioners across cybersecurity, engineering, and artificial intelligence.
            </p>
          </div>

          {/* Domain Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Cybersecurity', 'AI & Machine Learning', 'Full-Stack Development'].map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedDomain === dom
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'bg-white dark:bg-[#262626] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                  }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(selectedDomain === 'All' ? mentors : mentors.filter((m) => m.domain === selectedDomain)).map((mentor) => {
            const theme = getDomainTheme(mentor.domain);

            return (
              <div
                key={mentor._id}
                className="relative rounded-3xl bg-white dark:bg-[#202020] border border-neutral-200/90 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md"
              >
                {/* Top Subtle Domain Ambient Gradient Banner */}
                <div className={`h-24 w-full absolute top-0 left-0 bg-gradient-to-r ${theme.topGradient} border-b border-neutral-100 dark:border-neutral-800/40 pointer-events-none`} />

                {/* Card Main Body */}
                <div className="p-6 space-y-4 relative z-10">
                  {/* Top Header: Large Avatar + Domain Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-white dark:border-neutral-800 shadow-md ring-2 ${theme.avatarBorder}`}
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop';
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#202020]" />
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide shadow-2xs ${theme.badge}`}>
                      {theme.label}
                    </span>
                  </div>

                  {/* Mentor Info */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                      {mentor.name}
                    </h3>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {mentor.title} @ <strong className="text-neutral-800 dark:text-neutral-200 font-semibold">{mentor.company}</strong>
                    </p>

                    {/* Rating & Verified Pill */}
                    <div className="flex flex-wrap items-center gap-2 pt-1.5">
                      <div className="flex items-center gap-1 font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-current text-neutral-800 dark:text-neutral-200" />
                        <span>{mentor.rating}</span>
                        <span className="text-neutral-400 font-normal">({mentor.reviewsCount})</span>
                      </div>

                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Trust Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Concise uncluttered Bio (Line-clamped to 2 lines to remove text clutter) */}
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                    {mentor.bio}
                  </p>

                  {/* Clean Domain-Themed Topic Tags (Top 3 only + overflow count) */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Focus Areas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.topics.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${theme.tag}`}
                        >
                          {t}
                        </span>
                      ))}
                      {mentor.topics.length > 3 && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                          +{mentor.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50">
                      {mentor.hourlyRate}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setBookingModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-bold transition-colors shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Session</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setBookingModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#212121] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Confirm 1:1 Mentorship Session
                  </h3>
                  <p className="text-xs text-neutral-500">
                    With {selectedMentor?.name || 'Rishabh Mishra'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
                  Session Confirmed!
                </h4>
                <p className="text-xs text-neutral-500">
                  Online Meet link: <strong className="text-blue-500">meet.google.com/rsh-labs-mentor</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookSession} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  >
                    {commonTopics.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  >
                    <option value="Tomorrow, 6:00 PM IST">Tomorrow, 6:00 PM IST</option>
                    <option value="Tomorrow, 8:00 PM IST">Tomorrow, 8:00 PM IST</option>
                    <option value="Saturday, 11:00 AM IST">Saturday, 11:00 AM IST</option>
                    <option value="Sunday, 4:00 PM IST">Sunday, 4:00 PM IST</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    What would you like to focus on?
                  </label>
                  <textarea
                    rows={3}
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:outline-none focus:ring-0 resize-none"
                    placeholder="Describe your current blocker or goals..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm 1:1 Session →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
