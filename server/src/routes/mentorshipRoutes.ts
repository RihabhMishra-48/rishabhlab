import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Mentor, MentorshipRequest } from '../models/Mentorship';
import { getCleanMentors } from '../seed/seedData';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const resolveUserAvatar = (rawAvatar?: string | null, name?: string | null, email?: string | null) => {
  const n = (name || '').toLowerCase();
  const e = (email || '').toLowerCase();
  const a = rawAvatar || '';
  if (a.startsWith('/avatars/')) return a;
  if (n.includes('arpit') || e.includes('arpit') || e.includes('officialcrikit') || a.includes('ACg8ocJ0KvIuzezERY')) {
    return '/avatars/arpit.webp';
  }
  if (n.includes('rishabh') || e.includes('rishabh') || e.includes('mishrarishabh2006')) {
    return '/avatars/rishabh.webp';
  }
  if (n.includes('harsh') || e.includes('harsh')) {
    return '/avatars/harsh.webp';
  }
  return rawAvatar || null;
};

const router = Router();

// ============================================================================
// 1. PUBLIC / CATALOG MENTORS LIST (Real Database-Driven)
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const { topic, domain } = req.query;
    let mentors: any[] = [];

    // 1. Fetch live mentors from Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sbMentors, error: sbErr } = await supabase
          .from('mentors')
          .select('*')
          .order('created_at', { ascending: false });

        if (!sbErr && sbMentors && sbMentors.length > 0) {
          mentors = sbMentors.map((m: any) => ({
            _id: m.id,
            id: m.id,
            name: m.name,
            title: m.title || 'Senior Mentor',
            company: m.company || 'RishabhLabs',
            domain: m.domain || 'Technology',
            avatar: resolveUserAvatar(m.avatar, m.name) || '/avatars/default.webp',
            rating: Number(m.rating) || 5.0,
            reviewsCount: Number(m.reviews_count) || (m.experience_years ? m.experience_years * 16 : 48),
            bio: m.bio || '',
            hourlyRate: m.hourly_rate || (m.hourly_rate_inr ? `₹${m.hourly_rate_inr}` : 'Free for Students'),
            topics: Array.isArray(m.topics) ? m.topics : ['Roadmap', 'Architecture'],
            availability: Array.isArray(m.availability)
              ? m.availability
              : (Array.isArray(m.available_days) && m.available_days.length > 0
                ? m.available_days.map((d: string) => `${d}, 7:00 PM IST`)
                : ['Today, 7:00 PM IST']),
            isAvailableToday: m.is_available_today !== undefined ? Boolean(m.is_available_today) : true,
          }));
        }
      } catch (e) {
        console.warn('Supabase mentors fetch warning:', e);
      }
    }

    // 2. Fetch from MongoDB if Supabase returned nothing
    if (mentors.length === 0 && mongoose.connection.readyState === 1) {
      try {
        const mMentors = await Mentor.find({}).sort({ createdAt: -1 });
        if (mMentors && mMentors.length > 0) {
          mentors = mMentors.map((m: any) => ({
            _id: m._id.toString(),
            id: m._id.toString(),
            name: m.name,
            title: m.title,
            company: m.company,
            domain: m.domain || 'Technology',
            avatar: m.avatar || '/avatars/default.webp',
            rating: m.rating || 5.0,
            reviewsCount: m.reviewsCount || 48,
            bio: m.bio,
            hourlyRate: m.hourlyRate || 'Free for Students',
            topics: m.topics || [],
            availability: m.availability || ['Today, 7:00 PM IST'],
            isAvailableToday: m.isAvailableToday !== undefined ? m.isAvailableToday : true,
          }));
        }
      } catch (mErr) {
        console.warn('Mongo find mentors warning:', mErr);
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

    let targetDate = new Date();
    if (preferredSlot && typeof preferredSlot === 'string') {
      const lower = preferredSlot.toLowerCase();
      if (lower.includes('tomorrow')) {
        targetDate.setDate(targetDate.getDate() + 1);
      } else if (lower.includes('saturday')) {
        const day = targetDate.getDay();
        const diff = (6 - day + 7) % 7 || 7;
        targetDate.setDate(targetDate.getDate() + diff);
      } else if (lower.includes('sunday')) {
        const day = targetDate.getDay();
        const diff = (7 - day) % 7 || 7;
        targetDate.setDate(targetDate.getDate() + diff);
      } else {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      if (lower.includes('11:00 am')) {
        targetDate.setHours(11, 0, 0, 0);
      } else if (lower.includes('4:00 pm')) {
        targetDate.setHours(16, 0, 0, 0);
      } else if (lower.includes('6:00 pm')) {
        targetDate.setHours(18, 0, 0, 0);
      } else if (lower.includes('8:00 pm')) {
        targetDate.setHours(20, 0, 0, 0);
      }
    } else {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    let newRequestId = 'req-' + Date.now();
    let newRequest: any = {
      _id: newRequestId,
      id: newRequestId,
      mentorId: mentorId || null,
      topic: topic || 'Roadmap & Career Strategy',
      contextType: contextType || 'general',
      message: message || '',
      preferredSlot: preferredSlot || targetDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }),
      status: 'pending',
      meetingLink: '',
      notesFromMentor: '',
      createdAt: new Date(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        // Resolve real student UUID from logged-in user profile
        let validStudentId: string = (user as any).id || (user as any)._id?.toString() || '';
        const isStudentUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validStudentId);
        if (!isStudentUUID && user.email) {
          const { data: p } = await supabase.from('profiles').select('id').eq('email', user.email.toLowerCase()).maybeSingle();
          if (p?.id) validStudentId = p.id;
        }

        // Resolve mentor UUID
        let validMentorId = mentorId;
        const isMentorUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validMentorId);
        if (!isMentorUUID && mentorId) {
          const searchKey = String(mentorId).replace('mentor-', '');
          const { data: m } = await supabase.from('mentors').select('id').or(`name.ilike.%${searchKey}%,id.eq.${mentorId}`).limit(1).maybeSingle();
          if (m?.id) validMentorId = m.id;
        }

        const { data: inserted, error: insErr } = await supabase.from('mentorship_requests').insert({
          mentor_id: validMentorId || null,
          student_id: validStudentId || null,
          topic: newRequest.topic,
          requested_date: targetDate.toISOString(),
          student_note: newRequest.message,
          status: 'pending',
          meeting_link: '',
          notes_from_mentor: '',
        }).select().single();

        if (inserted && !insErr) {
          newRequest._id = inserted.id;
          newRequest.id = inserted.id;
        } else if (insErr) {
          console.warn('Supabase request insert warning:', insErr);
        }
      } catch (e) {
        console.warn('Supabase request insert exception:', e);
      }
    }

    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(mentorId) && mongoose.Types.ObjectId.isValid(user._id)) {
          const mongoReq = await MentorshipRequest.create({
            studentId: user._id,
            mentorId,
            topic: newRequest.topic,
            contextType: newRequest.contextType,
            message: newRequest.message,
            preferredSlot: newRequest.preferredSlot,
            status: 'pending',
            meetingLink: '',
            notesFromMentor: '',
          });
          if (mongoReq && !newRequest.id.includes('-')) {
            newRequest._id = mongoReq._id.toString();
            newRequest.id = mongoReq._id.toString();
          }
        }
      } catch (mErr) {
        console.warn('Mongo request create warning:', mErr);
      }
    }

    res.status(201).json({
      success: true,
      message: '1:1 Mentorship request booked successfully! Your mentor will confirm your slot.',
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
        let studentId: string = (user as any).id || (user as any)._id?.toString() || '';
        const isStudentUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
        if (!isStudentUUID && user.email) {
          const { data: p } = await supabase.from('profiles').select('id').eq('email', user.email.toLowerCase()).maybeSingle();
          if (p?.id) studentId = p.id;
        }

        const { data: requests } = await supabase
          .from('mentorship_requests')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        if (requests && requests.length > 0) {
          const { data: mentorsList } = await supabase.from('mentors').select('id, name, title, company, avatar');
          const mentorMap = new Map((mentorsList || []).map((m: any) => [m.id, m]));

          return res.json(requests.map((r: any) => ({
            _id: r.id,
            id: r.id,
            topic: r.topic,
            preferredSlot: r.requested_date
              ? new Date(r.requested_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
              : 'Flexible Timing',
            status: r.status,
            meetingLink: r.meeting_link || '',
            notesFromMentor: r.notes_from_mentor || '',
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
// 4. MENTOR WORKSPACE SESSIONS & INQUIRIES (Live Database)
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
        const { data: mentorsList } = await supabase.from('mentors').select('id, name, title, company, avatar');
        const mentorMap = new Map((mentorsList || []).map((m: any) => [m.id, m]));

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
          // Query real student profiles
          const studentIds = Array.from(new Set(sbRequests.map((r: any) => r.student_id).filter(Boolean)));
          const profileMap = new Map();
          if (studentIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, email, full_name, avatar_url, college_name, target_goal, field_of_interest')
              .in('id', studentIds);
            (profiles || []).forEach((p: any) => profileMap.set(p.id, p));
          }

          // STRICT REAL DATA: Only return genuine student bookings
          sessionsList = sbRequests
            .filter((req: any) => req.student_id)
            .map((req: any) => {
              const student = req.student_id ? profileMap.get(req.student_id) : null;
              const mentor = mentorMap.get(req.mentor_id);
              return {
                _id: req.id,
                id: req.id,
                bookingCode: `BK-${req.id.slice(0, 6).toUpperCase()}`,
                topic: req.topic || 'General Technical Architecture',
                preferredSlot: req.requested_date
                  ? new Date(req.requested_date).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Asia/Kolkata',
                    })
                  : 'Flexible Slot',
                requestedDate: req.requested_date,
                message: req.student_note || '',
                status: req.status || 'pending',
                meetingLink: req.meeting_link || '',
                notesFromMentor: req.notes_from_mentor || '',
                createdAt: req.created_at,
                mentorName: mentor?.name || 'Assigned Mentor',
                mentorAvatar: resolveUserAvatar(mentor?.avatar, mentor?.name) || '',
                mentorTitle: mentor?.title || '',
                mentorId: req.mentor_id,
                studentId: req.student_id,
                studentName: student?.full_name || student?.email?.split('@')[0] || 'Verified Learner',
                studentEmail: student?.email || '',
                studentAvatar: resolveUserAvatar(student?.avatar_url, student?.full_name, student?.email) || '',
                studentCollege: student?.college_name || '',
                studentTrack: student?.target_goal || student?.field_of_interest || '',
              };
            });
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

    // Normalizing status to match check constraint: 'pending' | 'accepted' | 'confirmed' | 'completed' | 'cancelled'
    if (status === 'accepted') status = 'confirmed';

    let updatedSession: any = {
      _id: id,
      id,
      status: status || 'confirmed',
      meetingLink: meetingLink || '',
      notesFromMentor: notesFromMentor || '',
    };

    // 1. Update in Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const updatePayload: any = {};
        if (status) updatePayload.status = status;
        if (meetingLink !== undefined) updatePayload.meeting_link = meetingLink;
        if (notesFromMentor !== undefined) updatePayload.notes_from_mentor = notesFromMentor;
        if (preferredSlot !== undefined) updatePayload.requested_date = preferredSlot;

        let query = supabase.from('mentorship_requests').update(updatePayload);
        if (isUUID) {
          query = query.eq('id', id);
        } else {
          // If custom id, attempt matching
          query = query.eq('id', id);
        }

        const { data: updatedSb, error: sbErr } = await query.select().single();

        if (updatedSb && !sbErr) {
          updatedSession = {
            _id: updatedSb.id,
            id: updatedSb.id,
            bookingCode: `BK-${updatedSb.id.slice(0, 6).toUpperCase()}`,
            topic: updatedSb.topic,
            preferredSlot: updatedSb.requested_date
              ? new Date(updatedSb.requested_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : (updatedSb.preferred_slot || 'Flexible Slot'),
            requestedDate: updatedSb.requested_date,
            message: updatedSb.student_note || updatedSb.message || '',
            status: updatedSb.status,
            meetingLink: updatedSb.meeting_link,
            notesFromMentor: updatedSb.notes_from_mentor || '',
            createdAt: updatedSb.created_at,
          };
        } else if (sbErr) {
          console.warn('Supabase update session warning:', sbErr);
        }
      } catch (e) {
        console.warn('Supabase update session error:', e);
      }
    }

    // 2. Update in MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const mUpdated = await MentorshipRequest.findByIdAndUpdate(
            id,
            {
              ...(status && { status }),
              ...(meetingLink !== undefined && { meetingLink }),
              ...(notesFromMentor !== undefined && { notesFromMentor }),
              ...(preferredSlot !== undefined && { preferredSlot }),
            },
            { new: true }
          );
          if (mUpdated) {
            updatedSession = {
              _id: mUpdated._id.toString(),
              id: mUpdated._id.toString(),
              bookingCode: `BK-${mUpdated._id.toString().slice(-6).toUpperCase()}`,
              topic: mUpdated.topic,
              preferredSlot: mUpdated.preferredSlot,
              message: mUpdated.message,
              status: mUpdated.status,
              meetingLink: mUpdated.meetingLink,
              notesFromMentor: mUpdated.notesFromMentor,
              createdAt: (mUpdated as any).createdAt || (mUpdated as any).created_at || new Date().toISOString(),
            };
          }
        }
      } catch (mErr) {
        console.warn('Mongo update session warning:', mErr);
      }
    }

    res.json(updatedSession);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 6. DELETE SESSION / BOOKING INQUIRY
// ============================================================================
router.delete('/sessions/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const isSuperAdmin = (user.role as string) === 'super_admin' || (user.role as string) === 'admin';

    if (!isSuperAdmin && user.role !== 'mentor') {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    // 1. Delete from Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          await supabase.from('mentorship_requests').delete().eq('id', id);
        } else {
          await supabase.from('mentorship_requests').delete().eq('id', id);
        }
      } catch (sbErr) {
        console.warn('Supabase delete session warning:', sbErr);
      }
    }

    // 2. Delete from MongoDB
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await MentorshipRequest.findByIdAndDelete(id);
      } catch (mErr) {
        console.warn('Mongo delete session warning:', mErr);
      }
    }

    res.json({ success: true, message: 'Session inquiry deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
