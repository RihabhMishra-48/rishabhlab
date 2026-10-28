import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Mentor, MentorshipRequest } from '../models/Mentorship';
import { getCleanMentors } from '../seed/seedData';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const router = Router();

// ============================================================================
// 1. PUBLIC / CATALOG MENTORS LIST (Restricted to Harsh, Rishabh, Arpit)
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const { topic, domain } = req.query;
    let mentors: any[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sbMentors } = await supabase.from('mentors').select('*');
        if (sbMentors && sbMentors.length > 0) {
          // Strictly keep only Rishabh Mishra, Arpit Pandey, and Harsh Sharma
          mentors = sbMentors
            .filter((m: any) => {
              const l = (m.name || '').toLowerCase();
              if (l.includes('khare')) return false;
              return l.includes('harsh') || l.includes('rishabh') || l.includes('arpit');
            })
            .map((m: any) => {
              const l = (m.name || '').toLowerCase();
              let avatar = '/avatars/rishabh.webp';
              if (l.includes('arpit')) avatar = '/avatars/arpit.webp';
              else if (l.includes('harsh')) avatar = '/avatars/harsh.webp';
              else if (l.includes('rishabh')) avatar = '/avatars/rishabh.webp';

              return {
                _id: m.id,
                id: m.id,
                name: m.name,
                title: m.title || 'Senior Mentor',
                company: m.company || 'RishabhLabs',
                domain: m.domain || 'Technology',
                avatar,
                rating: m.rating || 5.0,
                reviewsCount: m.reviews_count || (m.experience_years ? m.experience_years * 16 : 85),
                bio: m.bio || '',
                hourlyRate: m.hourly_rate_inr ? `₹${m.hourly_rate_inr}` : 'Free for Students',
                topics: m.topics || ['Roadmap', 'System Design'],
                availability: m.available_days && m.available_days.length > 0
                  ? m.available_days.map((d: string) => `${d}, 7:00 PM IST`)
                  : ['Today, 7:00 PM IST'],
                isAvailableToday: true,
              };
            });
        }
      } catch (e) {
        console.warn('Supabase mentors fetch warning:', e);
      }
    }

    if (!mentors || mentors.length === 0) {
      mentors = getCleanMentors();
    }

    if (domain && domain !== 'All') {
      mentors = mentors.filter((m: any) => m.domain === domain);
    } else if (topic && topic !== 'All') {
      const t = String(topic).toLowerCase();
      mentors = mentors.filter((m: any) =>
        m.domain?.toLowerCase().includes(t) ||
        (m.topics && m.topics.some((top: string) => top.toLowerCase().includes(t)))
      );
    }

    res.json(mentors);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 2. BOOK A SESSION
// ============================================================================
router.post('/request', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { mentorId, topic, contextType, message, preferredSlot } = req.body;

    let newRequestId = 'req-' + Date.now();
    let newRequest: any = {
      _id: newRequestId,
      id: newRequestId,
      mentorId: mentorId || null,
      topic: topic || 'Roadmap & Career Strategy',
      contextType: contextType || 'general',
      message: message || 'Seeking guidance on technical roadmap and architecture.',
      preferredSlot: preferredSlot || 'Tomorrow, 6:00 PM IST',
      status: 'confirmed',
      meetingLink: 'https://meet.google.com/rl-mentor-call',
      notesFromMentor: 'Session confirmed! Please have your questions ready.',
      createdAt: new Date(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: inserted, error: insErr } = await supabase.from('mentorship_requests').insert({
          mentor_id: mentorId || null,
          student_id: user._id || null,
          topic: newRequest.topic,
          requested_date: new Date(Date.now() + 86400000).toISOString(),
          student_note: newRequest.message,
          status: 'confirmed',
          meeting_link: newRequest.meetingLink,
        }).select().single();

        if (inserted && !insErr) {
          newRequest._id = inserted.id;
          newRequest.id = inserted.id;
        }
      } catch (e) {
        console.warn('Supabase request insert warning:', e);
      }
    }

    res.status(201).json({
      success: true,
      message: '1:1 Mentorship session confirmed! Check your workspace below.',
      request: newRequest,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 3. STUDENT'S OWN REQUESTS
// ============================================================================
router.get('/my-requests', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: requests } = await supabase
          .from('mentorship_requests')
          .select('*')
          .eq('student_id', user._id)
          .order('created_at', { ascending: false });

        if (requests && requests.length > 0) {
          const { data: mentorsList } = await supabase.from('mentors').select('id, name, title, company, avatar');
          const mentorMap = new Map((mentorsList || []).map((m: any) => [m.id, m]));

          return res.json(requests.map((r: any) => ({
            _id: r.id,
            id: r.id,
            topic: r.topic,
            preferredSlot: r.requested_date,
            status: r.status,
            meetingLink: r.meeting_link,
            mentorId: mentorMap.get(r.mentor_id) || { name: 'Senior Mentor' },
            createdAt: r.created_at,
          })));
        }
      } catch (e) {
        console.warn('Supabase my-requests warning:', e);
      }
    }
    res.json([]);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 4. MENTOR WORKSPACE SESSIONS & INQUIRIES (Strict Student Privacy Guaranteed)
// ============================================================================
router.get('/mentor/sessions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const isSuperAdmin = (user.role as string) === 'super_admin' || (user.role as string) === 'admin';

    if (!isSuperAdmin && user.role !== 'mentor') {
      return res.status(403).json({ message: 'Access denied: Mentor privileges required' });
    }

    let sessionsList: any[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: mentorsList } = await supabase.from('mentors').select('id, name');
        const mentorMap = new Map((mentorsList || []).map((m: any) => [m.id, m.name]));

        let query = supabase.from('mentorship_requests').select('*').order('created_at', { ascending: false });

        if (!isSuperAdmin) {
          // If specific mentor, match their mentor row
          const matchedMentor = (mentorsList || []).find((m: any) =>
            m.name.toLowerCase().includes(user.name.toLowerCase()) ||
            user.name.toLowerCase().includes(m.name.toLowerCase().split(' ')[0])
          );
          if (matchedMentor) {
            query = query.eq('mentor_id', matchedMentor.id);
          }
        }

        const { data: sbRequests, error: sbErr } = await query;
        if (!sbErr && sbRequests && sbRequests.length > 0) {
          // STRICT RULE: No student identity, email, degree, college, or role is included
          sessionsList = sbRequests.map((req: any) => ({
            _id: req.id,
            id: req.id,
            bookingCode: `BK-${req.id.slice(0, 6).toUpperCase()}`,
            topic: req.topic || 'General Technical Architecture',
            preferredSlot: req.requested_date
              ? new Date(req.requested_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : 'Today, 7:30 PM IST',
            requestedDate: req.requested_date,
            message: req.student_note || 'Seeking mentorship review & guidance.',
            status: req.status || 'pending',
            meetingLink: req.meeting_link || 'https://meet.google.com/rsh-mentor-call',
            notesFromMentor: req.notes_from_mentor || '',
            createdAt: req.created_at,
            mentorName: mentorMap.get(req.mentor_id) || 'Senior Mentor',
            mentorId: req.mentor_id,
          }));
        }
      } catch (e) {
        console.warn('Supabase mentor sessions error:', e);
      }
    }

    res.json(sessionsList);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 5. UPDATE SESSION STATUS / MEETING LINK / MENTOR PREP NOTES
// ============================================================================
router.put('/sessions/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    let { status, meetingLink, notesFromMentor, preferredSlot } = req.body;
    const user = req.user!;
    const isSuperAdmin = (user.role as string) === 'super_admin' || (user.role as string) === 'admin';

    if (!isSuperAdmin && user.role !== 'mentor') {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    // Normalizing status to match check constraint: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    if (status === 'accepted') status = 'confirmed';

    let updatedSession: any = {
      _id: id,
      id,
      status: status || 'confirmed',
      meetingLink: meetingLink || 'https://meet.google.com/rsh-mentor-call',
      notesFromMentor: notesFromMentor || '',
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const updatePayload: any = {};
        if (status) updatePayload.status = status;
        if (meetingLink !== undefined) updatePayload.meeting_link = meetingLink;
        if (preferredSlot !== undefined) updatePayload.requested_date = preferredSlot;

        const { data: updatedSb } = await supabase
          .from('mentorship_requests')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (updatedSb) {
          updatedSession = {
            _id: updatedSb.id,
            id: updatedSb.id,
            bookingCode: `BK-${updatedSb.id.slice(0, 6).toUpperCase()}`,
            topic: updatedSb.topic,
            preferredSlot: updatedSb.requested_date
              ? new Date(updatedSb.requested_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : 'Flexible Slot',
            requestedDate: updatedSb.requested_date,
            message: updatedSb.student_note || '',
            status: updatedSb.status,
            meetingLink: updatedSb.meeting_link,
            notesFromMentor: notesFromMentor || '',
            createdAt: updatedSb.created_at,
          };
        }
      } catch (e) {
        console.warn('Supabase update session error:', e);
      }
    }

    res.json(updatedSession);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
