import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Video,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Clock3,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Check,
  Edit3,
  GraduationCap,
  Github,
  BookOpen,
  Send
} from 'lucide-react';
import { UserAvatar } from '../../components/common/UserAvatar';

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

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await api.mentorGetSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load mentor sessions:', err);
      showNotification('Failed to load student sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setSavingId(id);
      await api.mentorUpdateSession(id, { status: newStatus });
      setSessions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
      );
      showNotification(`Session marked as ${newStatus}!`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update session.');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveDetails = async (id: string) => {
    try {
      setSavingId(id);
      const updated = await api.mentorUpdateSession(id, {
        meetingLink: meetingLinkInput,
        notesFromMentor: notesInput,
      });
      setSessions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, meetingLink: meetingLinkInput, notesFromMentor: notesInput } : s))
      );
      setEditingSessionId(null);
      showNotification('Meeting link & mentor notes saved successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Failed to save meeting details.');
    } finally {
      setSavingId(null);
    }
  };

  const startEditing = (session: any) => {
    setEditingSessionId(session._id);
    setMeetingLinkInput(session.meetingLink || 'https://meet.google.com/new');
    setNotesInput(session.notesFromMentor || '');
  };

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const studentName = s.studentId?.name?.toLowerCase() || '';
      const studentEmail = s.studentId?.email?.toLowerCase() || '';
      const topic = s.topic?.toLowerCase() || '';
      return studentName.includes(q) || studentEmail.includes(q) || topic.includes(q);
    }
    return true;
  });

  const stats = {
    total: sessions.length,
    upcoming: sessions.filter((s) => s.status === 'accepted').length,
    pending: sessions.filter((s) => s.status === 'pending').length,
    completed: sessions.filter((s) => s.status === 'completed').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Verified Mentor Workspace
            </span>
            <span className="text-xs text-neutral-400">· 1:1 Student Meetings</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            Mentor Office Hours & Student Bookings
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Review student session requests, schedule Google Meet / Zoom calls, and guide learners through roadmap bottlenecks.
          </p>
        </div>

        {notification && (
          <div className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-lg animate-fade-in flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            {notification}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Bookings</p>
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
            <CheckCircle className="w-3.5 h-3.5" /> Confirmed / Active
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.upcoming}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Completed Sessions
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
            placeholder="Search student, email, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#262626] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: 'pending', label: 'Pending' },
            { id: 'accepted', label: 'Confirmed' },
            { id: 'completed', label: 'Completed' },
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

      {/* Sessions List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-neutral-500">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your student sessions...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800">
          <Calendar className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No sessions found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {statusFilter !== 'all'
              ? `No sessions with status "${statusFilter}". Try switching filters.`
              : 'Students who book mentorship with you will appear here with their project inquiries.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const student = session.studentId;
            const isEditing = editingSessionId === session._id;
            const isSaving = savingId === session._id;

            return (
              <div
                key={session._id}
                className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4"
              >
                {/* Header: Student Profile + Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={student?.avatar}
                      name={student?.name}
                      email={student?.email}
                      size={44}
                      roundedClassName="rounded-xl"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                          {student?.name || 'Anonymous Student'}
                        </h3>
                        {student?.college && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            {student.college}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        <span>{student?.email || 'No email provided'}</span>
                        {student?.degree && <span>· {student.degree}</span>}
                        {student?.targetGoal && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            · Goal: {student.targetGoal}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Quick Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5 ${
                        session.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : session.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : session.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {session.status === 'accepted' && <CheckCircle className="w-3.5 h-3.5" />}
                      {session.status === 'pending' && <Clock3 className="w-3.5 h-3.5" />}
                      {session.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                      {session.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                      {session.status}
                    </span>

                    {session.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(session._id, 'accepted')}
                        disabled={isSaving}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        Accept Call
                      </button>
                    )}

                    {session.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(session._id, 'completed')}
                        disabled={isSaving}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>

                {/* Session Inquiries & Message */}
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#222222] border border-neutral-200/70 dark:border-neutral-800 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                      Topic: {session.topic}
                    </span>
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Slot: <span className="font-medium text-neutral-800 dark:text-neutral-200">{session.preferredSlot}</span>
                    </span>
                  </div>
                  {session.message && (
                    <p className="text-neutral-600 dark:text-neutral-300 italic">
                      "{session.message}"
                    </p>
                  )}
                </div>

                {/* Meeting Link & Mentor Notes Section */}
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
                        Notes & Preparation for Student:
                      </label>
                      <textarea
                        rows={2}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Please have your GitHub repo open, terminal ready with project running..."
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveDetails(session._id)}
                        disabled={isSaving}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        {isSaving ? 'Saving...' : 'Save Details'}
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
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-emerald-500 shrink-0" />
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 truncate"
                          >
                            {session.meetingLink}
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">No meeting link set yet.</p>
                      )}
                      {session.notesFromMentor && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                          Note: {session.notesFromMentor}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEditing(session)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Link / Notes
                      </button>

                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Video className="w-3 h-3" />
                          Join Meeting
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

export default MentorSessionsPage;
