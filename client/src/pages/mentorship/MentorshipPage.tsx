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
      } catch {}

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
          <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-2xs">
            <img src="/graphics/mentorship.png" alt="Mentorship & Summit" className="w-full h-full object-contain dark:invert" />
          </div>
          <div className="flex flex-col justify-between py-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 leading-none">
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

      {/* Hero Book a 1:1 Session Card (Matching Screen 8 with mentor climbing graphic) */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-neutral-950 text-white border border-neutral-800 shadow-xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-3 z-10 max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Book a 1:1 Session
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Get personalized guidance from industry experts at Stripe, Razorpay, and Microsoft. Overcome blockers in code, hackathons, and career planning.
          </p>
          <div className="pt-3">
            <button
              onClick={() => {
                if (mentors.length > 0 && !selectedMentor) {
                  setSelectedMentor(mentors[0]);
                }
                setBookingModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-sm"
            >
              <Video className="w-4 h-4 text-neutral-950 shrink-0" />
              <span>Schedule Mentorship Session</span>
            </button>
          </div>
        </div>

        {/* Book Meeting Graphic */}
        <div className="relative z-10 shrink-0 select-none w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-5 flex items-center justify-center shadow-lg">
          <Video className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
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
                className={`p-4 rounded-2xl border text-center transition-colors flex flex-col items-center justify-center gap-2 group ${
                  isSelected
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedDomain === dom
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
          {(selectedDomain === 'All' ? mentors : mentors.filter((m) => m.domain === selectedDomain)).map((mentor) => (
            <div
              key={mentor._id}
              className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-xs"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{mentor.name}</h3>
                      {mentor.domain && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                          {mentor.domain}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">{mentor.title} @ <strong className="text-neutral-800 dark:text-neutral-200">{mentor.company}</strong></p>
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-500 font-bold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{mentor.rating}</span>
                      <span className="text-neutral-400 font-normal">({mentor.reviewsCount} reviews)</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium ml-1">
                        <img src="/graphics/thumbs-up-trust.svg" alt="Trust" className="w-3 h-3 object-contain dark:invert" />
                        <span>Trust Verified</span>
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {mentor.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mentor.topics.map((t) => (
                    <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {mentor.hourlyRate}
                </span>
                <button
                  onClick={() => {
                    setSelectedMentor(mentor);
                    setBookingModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 transition-colors shadow-2xs"
                >
                  Book Session
                </button>
              </div>
            </div>
          ))}
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
                  Google Meet link: <strong className="text-blue-500">meet.google.com/rsh-labs-mentor</strong>
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
