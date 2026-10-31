import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { UserAvatar } from '../../components/common/UserAvatar';
import { AvatarPicker } from '../../components/common/AvatarPicker';
import {
  Video,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Clock3,
  ExternalLink,
  Sparkles,
  Search,
  Check,
  Edit3,
  BookOpen,
  History,
  FileText,
  UserCheck,
  Trash2,
  Edit2,
  Settings,
  Mail,
  Send,
  X,
  Phone
} from 'lucide-react';

export const MentorSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Mentor profile & office hours self-editing state
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    title: '',
    company: '',
    domain: 'Full-Stack Development',
    avatar: '',
    bio: '',
    topics: 'Roadmap, Architecture, Placement Prep',
    availability: 'Today, 7:00 PM IST, Tomorrow, 6:00 PM IST',
    hourlyRate: 'Free for Students',
    isAvailableToday: true,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing modal / inline states
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Direct Communication Modal state
  const [messageModalSession, setMessageModalSession] = useState<any | null>(null);
  const [communicationMessage, setCommunicationMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchMentorProfile = async () => {
    try {
      const data = await api.mentorGetProfile();
      if (data) {
        setMentorProfile(data);
        setProfileForm({
          title: data.title || 'Technical Specialist & Mentor',
          company: data.company || user?.college || 'RishabhLabs',
          domain: data.domain || 'Full-Stack Development',
          avatar: data.avatar || user?.avatar || '',
          bio: data.bio || '',
          topics: Array.isArray(data.topics) ? data.topics.join(', ') : (data.topics || 'Roadmap, Architecture'),
          availability: Array.isArray(data.availability) ? data.availability.join(', ') : (data.availability || 'Today, 7:00 PM IST'),
          hourlyRate: data.hourlyRate || 'Free for Students',
          isAvailableToday: data.isAvailableToday !== undefined ? Boolean(data.isAvailableToday) : true,
        });
      }
    } catch (e) {
      console.warn('Could not load mentor profile details:', e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const res = await api.mentorUpdateProfile({
        title: profileForm.title,
        company: profileForm.company,
        domain: profileForm.domain,
        avatar: profileForm.avatar,
        bio: profileForm.bio,
        hourlyRate: profileForm.hourlyRate,
        topics: profileForm.topics.split(',').map((t) => t.trim()).filter(Boolean),
        availability: profileForm.availability.split(',').map((a) => a.trim()).filter(Boolean),
        isAvailableToday: profileForm.isAvailableToday,
      });
      if (res?.mentor) {
        setMentorProfile(res.mentor);
      }
      setProfileModalOpen(false);
      showNotification('Mentor profile & office hours updated successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const fetchSessions = async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const data = await api.mentorGetSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load mentor sessions:', err);
      if (showSpinner) {
        showNotification('Failed to load consultation inquiries.');
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(true);
    fetchMentorProfile();

    const onFocus = () => {
      fetchSessions(false);
      fetchMentorProfile();
    };
    window.addEventListener('focus', onFocus);

    // Silent background poll to guarantee fresh inquiries across devices
    const pollInterval = setInterval(() => {
      fetchSessions(false);
    }, 15000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(pollInterval);
    };
  }, []);

  // Real-time listener for live updates across browser windows
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let channel: any = null;
    const timer = setTimeout(() => {
      try {
        channel = supabase
          .channel('mentor-sessions-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_requests' }, () => {
            fetchSessions(false);
          })
          .subscribe();
      } catch (e) {
        console.warn('Realtime sessions subscription notice:', e);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setSavingId(id);
      await api.mentorUpdateSession(id, { status: newStatus });
      setSessions((prev) =>
        prev.map((s) => (s._id === id || s.id === id ? { ...s, status: newStatus } : s))
      );
      showNotification(`Session marked as ${newStatus}!`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update session.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this consultation booking permanently?')) return;
    try {
      setSavingId(id);
      await api.mentorDeleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id && s.id !== id));
      showNotification('Booking inquiry removed permanently.');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete booking.');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveDetails = async (id: string) => {
    try {
      setSavingId(id);
      await api.mentorUpdateSession(id, {
        meetingLink: meetingLinkInput,
        notesFromMentor: notesInput,
      });
      setSessions((prev) =>
        prev.map((s) =>
          s._id === id || s.id === id
            ? { ...s, meetingLink: meetingLinkInput, notesFromMentor: notesInput }
            : s
        )
      );
      setEditingSessionId(null);
      showNotification('Meeting URL & mentor notes updated!');
    } catch (err: any) {
      showNotification(err.message || 'Failed to save meeting details.');
    } finally {
      setSavingId(null);
    }
  };

  const startEditing = (session: any) => {
    setEditingSessionId(session._id || session.id);
    setMeetingLinkInput(session.meetingLink || 'https://meet.google.com/rsh-mentor-call');
    setNotesInput(session.notesFromMentor || '');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageModalSession || !communicationMessage.trim()) return;
    try {
      setIsSendingMessage(true);
      const sid = messageModalSession._id || messageModalSession.id;
      const res = await api.sendMentorshipMessage(sid, communicationMessage.trim());
      showNotification(res.message || 'Direct email message delivered to student!');
      setMessageModalSession(null);
      setCommunicationMessage('');
      fetchSessions(false);
    } catch (err: any) {
      showNotification(err.message || 'Failed to send message to student.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const isUpcoming = s.status === 'confirmed' || s.status === 'accepted';
    if (statusFilter === 'confirmed' && !isUpcoming) return false;
    if (statusFilter === 'pending' && s.status !== 'pending') return false;
    if (statusFilter === 'completed' && s.status !== 'completed') return false;
    if (statusFilter === 'cancelled' && s.status !== 'cancelled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = (s.bookingCode || s._id || s.id || '').toLowerCase();
      const topic = (s.topic || '').toLowerCase();
      const msg = (s.message || '').toLowerCase();
      const slot = (s.preferredSlot || '').toLowerCase();
      return code.includes(q) || topic.includes(q) || msg.includes(q) || slot.includes(q);
    }
    return true;
  });

  const stats = {
    total: sessions.length,
    upcoming: sessions.filter((s) => s.status === 'confirmed' || s.status === 'accepted').length,
    pending: sessions.filter((s) => s.status === 'pending').length,
    completed: sessions.filter((s) => s.status === 'completed').length,
  };

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {notification && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Mentor Profile Overview Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <UserAvatar
            src={mentorProfile?.avatar || user?.avatar}
            name={mentorProfile?.name || user?.name || 'Mentor'}
            size="lg"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-sm text-neutral-900 dark:text-white">
                {mentorProfile?.name || user?.name || 'Lead Mentor'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                Core Mentor Network
              </span>
              {mentorProfile?.domain && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {mentorProfile.domain}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
              {mentorProfile?.title || 'Technical Specialist & Mentor'} · <span className="text-neutral-400">{mentorProfile?.company || user?.college || 'RishabhLabs'}</span>
            </p>
            {mentorProfile?.bio && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-xl">
                {mentorProfile.bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
            mentorProfile?.isAvailableToday !== false
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}>
            {mentorProfile?.isAvailableToday !== false ? 'Accepting Inquiries' : 'Inquiries Paused'}
          </span>
          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile & Slots</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Inquiries</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Clock3 className="w-3.5 h-3.5" /> Pending Review
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.pending}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed / Upcoming
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.upcoming}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Completed Archive
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search bookings by code, topic, or query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#262626] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'pending', label: 'Pending Queries' },
            { id: 'confirmed', label: 'Confirmed Calls' },
            { id: 'completed', label: 'Completed History' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions / Inquiries List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-neutral-500">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your consultation inquiries...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1a1a1e] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-center mx-auto text-neutral-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              No consultation inquiries yet
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {statusFilter !== 'all'
                ? `No active consultation records matching "${statusFilter}". Try selecting another tab.`
                : 'When students schedule 1:1 sessions through the Mentorship portal, their live consultation tickets and inquiry briefs will appear here in real time.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/mentorship"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              <span>Explore Mentorship Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const sid = session._id || session.id;
            const isEditing = editingSessionId === sid;
            const isSaving = savingId === sid;
            const isConfirmed = session.status === 'confirmed' || session.status === 'accepted';

            return (
              <div
                key={sid}
                className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4"
              >
                {/* Header: Ticket Reference Code + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-mono text-xs font-bold shrink-0">
                      <FileText className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                          {session.bookingCode || `BK-${String(sid).slice(-6).toUpperCase()}`}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          1:1 Consultation Ticket
                        </span>
                        {session.mentorName && isSuperAdmin && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            Assigned: {session.mentorName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Slot: <strong className="text-neutral-800 dark:text-neutral-200 font-medium">{session.preferredSlot}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5 ${
                        isConfirmed
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : session.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : session.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isConfirmed && <CheckCircle className="w-3.5 h-3.5" />}
                      {session.status === 'pending' && <Clock3 className="w-3.5 h-3.5" />}
                      {session.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                      {session.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                      {isConfirmed ? 'Confirmed' : session.status}
                    </span>

                    {session.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(sid, 'confirmed')}
                        disabled={isSaving}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        Confirm Booking
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleUpdateStatus(sid, 'completed')}
                        disabled={isSaving}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Mark Completed
                      </button>
                    )}

                    {(isSuperAdmin || user?.role === 'mentor') && (
                      <button
                        onClick={() => handleDeleteSession(sid)}
                        disabled={isSaving}
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
                        title="Delete booking permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Real Student Info Strip */}
                {(session.studentName || session.studentEmail) && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50/80 dark:bg-[#202024] border border-neutral-200/60 dark:border-neutral-800">
                    <UserAvatar
                      src={session.studentAvatar}
                      name={session.studentName}
                      email={session.studentEmail}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {session.studentName || 'Verified Learner'}
                        </span>
                        {session.studentCollege && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
                            {session.studentCollege}
                          </span>
                        )}
                        {session.studentTrack && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                            {session.studentTrack}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 flex-wrap mt-0.5">
                        {session.studentEmail && (
                          <span className="truncate">{session.studentEmail}</span>
                        )}
                        {session.studentPhone && (
                          <div className="flex items-center gap-2">
                            <span>•</span>
                            <a
                              href={`tel:${session.studentPhone.replace(/\s+/g, '')}`}
                              className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{session.studentPhone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${session.studentPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Topic & Student Query Message */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200/70 dark:border-neutral-800 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/50 dark:border-neutral-700/50 pb-2">
                    <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                      Topic: {session.topic}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Technical Inquiry
                    </span>
                  </div>
                  {session.message ? (
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed pt-1">
                      "{session.message}"
                    </p>
                  ) : (
                    <p className="text-neutral-400 italic">No additional query message supplied.</p>
                  )}
                </div>

                {/* Meeting Link & Mentor Prep Notes Section */}
                {isEditing ? (
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#222222] border border-emerald-500/30 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Google Meet / Zoom URL:
                      </label>
                      <input
                        type="url"
                        value={meetingLinkInput}
                        onChange={(e) => setMeetingLinkInput(e.target.value)}
                        placeholder="https://meet.google.com/xyz-abc-def"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Mentor Preparation & Outcome Notes:
                      </label>
                      <textarea
                        rows={2}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add preparation notes or post-session recommendations..."
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveDetails(sid)}
                        disabled={isSaving}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        {isSaving ? 'Saving...' : 'Save Meeting Details'}
                      </button>
                      <button
                        onClick={() => setEditingSessionId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                    <div className="flex-1 min-w-0">
                      {session.meetingLink ? (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-neutral-400 font-medium">Meeting URL:</span>
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline truncate max-w-xs flex items-center gap-1"
                          >
                            <span>{session.meetingLink}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">No meeting link set yet.</span>
                      )}
                      {session.notesFromMentor && (
                        <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                          <span className="font-medium text-neutral-600 dark:text-neutral-400">Notes:</span> {session.notesFromMentor}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setMessageModalSession(session);
                          setCommunicationMessage('');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
                        title="Send direct email reply to student"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Message Student</span>
                      </button>
                      <button
                        onClick={() => startEditing(session)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Link / Notes</span>
                      </button>
                      {session.meetingLink && isConfirmed && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Call</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mentor Profile & Office Hours Edit Modal */}
      {profileModalOpen && (
        <div
          onClick={() => setProfileModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E1B1C] border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                  Update Mentor Profile & Office Hours
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Changes reflect immediately on the student-facing Mentorship portal.
                </p>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Picture Selection */}
              <AvatarPicker
                value={profileForm.avatar}
                onChange={(val) => setProfileForm({ ...profileForm, avatar: val })}
                name={mentorProfile?.name || user?.name}
                email={user?.email}
                label="Mentor Profile Picture"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    placeholder="e.g. Senior Full-Stack Architect"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Organization / College
                  </label>
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                    placeholder="e.g. GLA University / RishabhLabs"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Domain Specialization *
                  </label>
                  <select
                    value={profileForm.domain}
                    onChange={(e) => setProfileForm({ ...profileForm, domain: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="Full-Stack Development">Full-Stack Development</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud & Systems">Cloud & Systems</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Consultation Fee Display
                  </label>
                  <input
                    type="text"
                    value={profileForm.hourlyRate}
                    onChange={(e) => setProfileForm({ ...profileForm, hourlyRate: e.target.value })}
                    placeholder="e.g. Free for Students"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Focus Topics & Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={profileForm.topics}
                  onChange={(e) => setProfileForm({ ...profileForm, topics: e.target.value })}
                  placeholder="Roadmap, Architecture, System Design, Placement Prep"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Available Slots for Bookings (comma-separated)
                </label>
                <input
                  type="text"
                  value={profileForm.availability}
                  onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                  placeholder="Today, 7:00 PM IST, Tomorrow, 6:00 PM IST, Saturday, 11:00 AM IST"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Bio / Philosophy
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Share a brief overview of your background, experience, and what students can expect..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">Accepting Student Inquiries</p>
                  <p className="text-[11px] text-neutral-500">Allow students to book 1:1 consultation sessions on the platform.</p>
                </div>
                <input
                  type="checkbox"
                  checked={profileForm.isAvailableToday}
                  onChange={(e) => setProfileForm({ ...profileForm, isAvailableToday: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mentor Direct Communication Modal */}
      {messageModalSession && (
        <div
          onClick={() => setMessageModalSession(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E1B1C] border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    Send Email Message to Student
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Delivered automatically via platform email to the student's inbox.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMessageModalSession(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student & Session Context Pill */}
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <UserAvatar
                src={messageModalSession.studentAvatar}
                name={messageModalSession.studentName}
                email={messageModalSession.studentEmail}
                size="sm"
              />
              <div className="min-w-0 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 dark:text-white truncate">
                    {messageModalSession.studentName || 'Learner'}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {messageModalSession.bookingCode || 'BK-ONLINE'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate">
                  {messageModalSession.studentEmail || 'Registered Student'} • {messageModalSession.topic}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Your Message / Guidance:
                </label>
                <textarea
                  rows={4}
                  required
                  value={communicationMessage}
                  onChange={(e) => setCommunicationMessage(e.target.value)}
                  placeholder="e.g. Hi there! Looking forward to our call tomorrow. Please make sure to clone the repo locally and have your API endpoints list ready..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden resize-none"
                />
              </div>

              {/* Quick Template Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-neutral-400 font-medium">Quick inserts:</span>
                {[
                  'Please have your GitHub repo and error logs ready.',
                  'Can we move the call 30 minutes earlier?',
                  'Looking forward to our roadmap session today!',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setCommunicationMessage((prev) => prev ? `${prev} ${txt}` : txt)}
                    className="text-[10px] px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {txt.slice(0, 32)}...
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setMessageModalSession(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingMessage || !communicationMessage.trim()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingMessage ? 'Sending Email...' : 'Send Email Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
