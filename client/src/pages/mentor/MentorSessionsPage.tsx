import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { UserAvatar } from '../../components/common/UserAvatar';
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
  Trash2
} from 'lucide-react';

export const MentorSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing modal / inline states
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
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

    const onFocus = () => fetchSessions(false);
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
    try {
      const channel = supabase
        .channel('mentor-sessions-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_requests' }, () => {
          fetchSessions(false);
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime sessions subscription notice:', e);
    }
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
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'ML'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-neutral-900 dark:text-white">
                {user?.name || 'Lead Mentor'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                Core Mentor Network
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Available for Architecture Guidance, Code Reviews & Placement Prep
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Accepting Inquiries
          </span>
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
                      {session.studentEmail && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                          {session.studentEmail}
                        </p>
                      )}
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
    </div>
  );
};
