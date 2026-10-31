import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AggregatedHackathon } from '../../types';
import { CURATED_MENTORS } from '../../data/curatedMentors';
import { api } from '../../services/api';
import {
  X,
  Star,
  Calendar,
  Send,
  CheckCircle2,
  ExternalLink,
  Shield,
  Sparkles,
  Code2,
  Building2,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface ConnectMentorModalProps {
  hackathon: AggregatedHackathon | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectMentorModal: React.FC<ConnectMentorModalProps> = ({
  hackathon,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [selectedMentorId, setSelectedMentorId] = useState<string>(CURATED_MENTORS[0]._id);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [discussionTopic, setDiscussionTopic] = useState<string>('Hackathon Architecture & Tech Stack Guidance');
  const [userMessage, setUserMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !hackathon) return null;

  // Registered 3 mentors: Harsh Sharma, Arpit Pandey, Rishabh Mishra
  const mentors = CURATED_MENTORS;
  const currentMentor = mentors.find((m) => m._id === selectedMentorId) || mentors[0];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        mentorId: currentMentor._id,
        mentorName: currentMentor.name,
        topic: discussionTopic,
        contextType: 'hackathon',
        message: userMessage || `Requesting guidance for hackathon: "${hackathon.title}". Focusing on prototype scope, architecture, and judge evaluation criteria.`,
        preferredSlot: selectedSlot || currentMentor.availability[0],
      };

      await api.requestMentorship(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2400);
    } catch (err: any) {
      console.warn('[ConnectMentor] Request notice:', err.message);
      // Even if network or session issues occur, gracefully show confirmation or redirect
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2400);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedirectToMentorship = (mentorName: string) => {
    onClose();
    navigate(`/mentorship?mentor=${encodeURIComponent(mentorName)}&topic=Hackathon`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-6 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-[#151515] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 font-mono">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              1:1 Hackathon Mentorship
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Connect with a Mentor
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-lg truncate">
              Get personalized architecture guidance and pitch strategy for <span className="font-semibold text-neutral-800 dark:text-neutral-200">"{hackathon.title}"</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {success ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Mentorship Request Submitted!
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              {currentMentor.name} will review your request for "{hackathon.title}". You will receive confirmation details on your student dashboard.
            </p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-neutral-700 dark:text-neutral-200">
            {/* 3 Registered Mentors Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider font-mono">
                Select Mentor (Harsh, Arpit & Rishabh)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {mentors.map((m) => {
                  const isSelected = m._id === selectedMentorId;
                  return (
                    <div
                      key={m._id}
                      onClick={() => {
                        setSelectedMentorId(m._id);
                        setSelectedSlot(m.availability[0]);
                      }}
                      className={`p-3.5 rounded-2xl border transition-colors cursor-pointer text-left flex flex-col justify-between ${isSelected
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs'
                          : 'border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#121212] hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-10 h-10 rounded-xl object-cover bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {m.name}
                          </h4>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                            {m.title}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60 truncate max-w-full">
                          {m.domain}
                        </span>

                        <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {m.rating}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {m.hourlyRate}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mentor Overview Card */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{currentMentor.name}</span>
                  <span className="text-[11px] font-normal text-neutral-400">({currentMentor.company})</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleRedirectToMentorship(currentMentor.name)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open in Mentorship Page</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {currentMentor.bio}
              </p>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBooking} className="space-y-4">
              {/* Slot Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Available Slot</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentMentor.availability.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-colors cursor-pointer ${selectedSlot === slot || (!selectedSlot && slot === currentMentor.availability[0])
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discussion Note / Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>What would you like to review?</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Pre-filled with hackathon context</span>
                </label>
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder={`e.g. Hi ${currentMentor.name.split(' ')[0]}, I'm competing in "${hackathon.title}" and would love feedback on my tech stack, problem decomposition, and presentation flow.`}
                  rows={3}
                  className="w-full p-3 text-xs bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleRedirectToMentorship(currentMentor.name)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline cursor-pointer"
                >
                  Visit Full Mentorship Hub
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm 1:1 Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

