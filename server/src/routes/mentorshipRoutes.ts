import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Mentor, MentorshipRequest } from '../models/Mentorship';
import { User } from '../models/User';
import { getCleanMentors } from '../seed/seedData';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import {
  sendMentorBookingNotificationEmail,
  sendStudentBookingAcceptedEmail,
  sendMentorshipCommunicationEmail,
} from '../services/emailService';

const sanitizeAvatar = (url?: string | null) => {
  if (!url) return null;
  if (url.includes('ACg8ocJ0KvIuzezERY')) return null; // rate-limited broken Google avatar
  return url;
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
            avatar: sanitizeAvatar(m.avatar) || m.avatar || '/avatars/default.webp',
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
    const { mentorId, topic, contextType, message, preferredSlot, studentPhone } = req.body;

    const effectivePhone = (studentPhone || user.phone || '').trim();

    // Instantly save phone to database for future bookings if provided
    if (effectivePhone && effectivePhone !== user.phone) {
      user.phone = effectivePhone;
      if (mongoose.connection.readyState === 1 && user._id) {
        User.findByIdAndUpdate(user._id, { phone: effectivePhone }).catch(() => {});
      }
      if (supabase && (user._id || (user as any).id)) {
        const uid = (user._id || (user as any).id)?.toString();
        supabase.auth.admin.updateUserById(uid, { user_metadata: { phone: effectivePhone } }).catch(() => {});
      }
    }

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

    let targetMentorName = '';
    let validMentorId: string | null = null;
    let validStudentId: string | null = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Resolve Mentor UUID from mentors table
        const { data: allMentors } = await supabase.from('mentors').select('id, name');
        if (allMentors && allMentors.length > 0) {
          // A. Exact ID match
          const matchById = allMentors.find((m: any) => m.id === mentorId);
          if (matchById) {
            validMentorId = matchById.id;
            targetMentorName = matchById.name;
          } else {
            // B. Check if mentorId is a profile ID with matching name
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(mentorId || ''));
            let profileName = '';
            if (isUUID) {
              const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', mentorId).maybeSingle();
              if (prof?.full_name) profileName = prof.full_name;
            }

            // C. Match by name or search key
            const searchKey = (profileName || String(mentorId || '').replace('mentor-', '')).toLowerCase().trim();
            const matchByName = allMentors.find((m: any) => {
              const cleanM = (m.name || '').toLowerCase().trim();
              return cleanM === searchKey || cleanM.includes(searchKey) || searchKey.includes(cleanM.split(' ')[0]);
            });

            if (matchByName) {
              validMentorId = matchByName.id;
              targetMentorName = matchByName.name;
            } else {
              validMentorId = allMentors[0].id;
              targetMentorName = allMentors[0].name;
            }
          }
        }

        // 2. Resolve Student UUID from profiles table
        let candidateId: string = (user as any).id || (user as any)._id?.toString() || '';
        const isCandidateUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidateId);

        if (isCandidateUUID) {
          const { data: p } = await supabase.from('profiles').select('id').eq('id', candidateId).maybeSingle();
          if (p?.id) validStudentId = p.id;
        }

        if (!validStudentId && user.email) {
          const { data: p } = await supabase.from('profiles').select('id').eq('email', user.email.toLowerCase()).maybeSingle();
          if (p?.id) {
            validStudentId = p.id;
          } else {
            const newId = crypto.randomUUID();
            const { data: createdP } = await supabase.from('profiles').insert({
              id: newId,
              email: user.email.toLowerCase(),
              full_name: user.name || user.email.split('@')[0],
              role: user.role || 'student',
              college_name: (user as any).college || '',
              target_goal: (user as any).targetGoal || 'Web Development',
              field_of_interest: (user as any).fieldOfInterest || 'Web Development',
              is_onboarded: true,
              verification_status: 'approved',
            }).select('id').maybeSingle();
            if (createdP?.id) validStudentId = createdP.id;
          }
        }

        // 3. Insert into Supabase mentorship_requests with strictly existing columns
        const contactSuffix = effectivePhone ? `\n\n[Contact Mobile/WhatsApp]: ${effectivePhone}` : '';
        const studentNotePayload = `${newRequest.message}${contactSuffix}`;

        const { data: inserted, error: insErr } = await supabase.from('mentorship_requests').insert({
          mentor_id: validMentorId,
          student_id: validStudentId,
          topic: newRequest.topic,
          requested_date: targetDate.toISOString(),
          student_note: studentNotePayload,
          status: 'pending',
          meeting_link: '',
        }).select().single();

        if (inserted && !insErr) {
          newRequest._id = inserted.id;
          newRequest.id = inserted.id;
          newRequest.createdAt = inserted.created_at;
        } else if (insErr) {
          console.warn('Supabase request insert warning:', insErr);
        }
      } catch (e) {
        console.warn('Supabase request insert exception:', e);
      }
    }

    if (mongoose.connection.readyState === 1) {
      try {
        let mMentorId = null;
        if (mongoose.Types.ObjectId.isValid(mentorId)) {
          mMentorId = mentorId;
        } else {
          const mM = await Mentor.findOne({
            $or: [
              { name: new RegExp(targetMentorName || String(mentorId), 'i') },
              { domain: new RegExp(String(topic || ''), 'i') },
            ]
          });
          if (mM) mMentorId = mM._id;
        }

        let mStudentId = null;
        if (mongoose.Types.ObjectId.isValid(user._id)) {
          mStudentId = user._id;
        } else if (user.email) {
          const mU = await User.findOne({ email: user.email.toLowerCase() });
          if (mU) mStudentId = mU._id;
        }

        if (mMentorId && mStudentId) {
          const mongoReq = await MentorshipRequest.create({
            studentId: mStudentId,
            mentorId: mMentorId,
            topic: newRequest.topic,
            contextType: newRequest.contextType,
            message: newRequest.message,
            preferredSlot: newRequest.preferredSlot,
            studentPhone: effectivePhone,
            status: 'pending',
            meetingLink: '',
            notesFromMentor: '',
          });
          if (mongoReq && (!newRequest.id || newRequest.id.startsWith('req-'))) {
            newRequest._id = mongoReq._id.toString();
            newRequest.id = mongoReq._id.toString();
          }
        }
      } catch (mErr) {
        console.warn('Mongo request create warning:', mErr);
      }
    }

    // Automated Email Communication: Deliver professional booking notice to the mentor
    try {
      let resolvedMentorEmail = '';

      if (isSupabaseConfigured() && supabase) {
        const { data: mentorProfiles } = await supabase
          .from('profiles')
          .select('email, full_name, role')
          .or('role.eq.mentor,role.eq.super_admin,role.eq.admin');

        if (mentorProfiles && mentorProfiles.length > 0) {
          const cleanTarget = (targetMentorName || '').toLowerCase().trim();
          const pMatch = mentorProfiles.find((p: any) => {
            const pName = (p.full_name || '').toLowerCase().trim();
            return pName === cleanTarget || pName.includes(cleanTarget) || cleanTarget.includes(pName.split(' ')[0]);
          });
          if (pMatch?.email) {
            resolvedMentorEmail = pMatch.email;
          }
        }
      }

      if (!resolvedMentorEmail && mongoose.connection.readyState === 1) {
        const u = await User.findOne({
          $or: [
            { name: new RegExp(targetMentorName || String(mentorId), 'i'), role: 'mentor' },
            { name: new RegExp(targetMentorName || String(mentorId), 'i') },
          ]
        });
        if (u?.email) resolvedMentorEmail = u.email;
      }

      if (!resolvedMentorEmail) {
        resolvedMentorEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'rishabhlabs@vrindopnishad.in';
      }

      const bookingCode = newRequest.id && !newRequest.id.startsWith('req-')
        ? `BK-${newRequest.id.slice(0, 6).toUpperCase()}`
        : `BK-${newRequestId.slice(-6).toUpperCase()}`;

      // Dispatch asynchronously without blocking API response
      sendMentorBookingNotificationEmail({
        mentorEmail: resolvedMentorEmail,
        mentorName: targetMentorName || 'Technical Mentor',
        studentName: user.name || user.email.split('@')[0] || 'Learner',
        studentEmail: user.email,
        studentPhone: effectivePhone,
        studentCollege: (user as any).college || '',
        topic: newRequest.topic,
        preferredSlot: newRequest.preferredSlot,
        requirements: newRequest.message,
        bookingCode,
        sessionId: newRequest.id,
      }).catch((emailErr) => {
        console.warn('Mentor booking notification email delivery notice:', emailErr.message);
      });
    } catch (e) {
      console.warn('Error resolving mentor email for notification:', e);
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
    let myRequests: any[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        let studentId: string = (user as any).id || (user as any)._id?.toString() || '';
        const isStudentUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);
        if (!isStudentUUID && user.email) {
          const { data: p } = await supabase.from('profiles').select('id').eq('email', user.email.toLowerCase()).maybeSingle();
          if (p?.id) studentId = p.id;
        }

        if (studentId) {
          const { data: requests } = await supabase
            .from('mentorship_requests')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

          if (requests && requests.length > 0) {
            const { data: mentorsList } = await supabase.from('mentors').select('id, name, title, company, avatar');
            const mentorMap = new Map((mentorsList || []).map((m: any) => [m.id, m]));

            myRequests = requests.map((r: any) => {
              const rawNote = r.student_note || '';
              let noteFromMentor = '';
              if (rawNote.includes('\n\n[Mentor Notes]: ')) {
                noteFromMentor = rawNote.split('\n\n[Mentor Notes]: ')[1] || '';
              }
              return {
                _id: r.id,
                id: r.id,
                topic: r.topic,
                preferredSlot: r.requested_date
                  ? new Date(r.requested_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
                  : 'Flexible Timing',
                status: r.status,
                meetingLink: r.meeting_link || '',
                notesFromMentor: noteFromMentor,
                mentorId: mentorMap.get(r.mentor_id) || { name: 'Senior Mentor' },
                createdAt: r.created_at,
              };
            });
          }
        }
      } catch (e) {
        console.warn('Supabase my-requests warning:', e);
      }
    }

    // Mongo fallback
    if (myRequests.length === 0 && mongoose.connection.readyState === 1) {
      try {
        let mUser = null;
        if (mongoose.Types.ObjectId.isValid(user._id)) {
          mUser = await User.findById(user._id);
        }
        if (!mUser && user.email) {
          mUser = await User.findOne({ email: user.email.toLowerCase() });
        }
        if (mUser) {
          const mRequests = await MentorshipRequest.find({ studentId: mUser._id })
            .populate('mentorId', 'name title company avatar')
            .sort({ createdAt: -1 });
          if (mRequests && mRequests.length > 0) {
            myRequests = mRequests.map((r: any) => ({
              _id: r._id.toString(),
              id: r._id.toString(),
              topic: r.topic,
              preferredSlot: r.preferredSlot,
              status: r.status,
              meetingLink: r.meetingLink || '',
              notesFromMentor: r.notesFromMentor || '',
              mentorId: r.mentorId || { name: 'Senior Mentor' },
              createdAt: r.createdAt,
            }));
          }
        }
      } catch (mErr) {
        console.warn('Mongo my-requests notice:', mErr);
      }
    }

    res.json(myRequests);
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
          const cleanUserName = (user.name || '').toLowerCase().trim();
          const cleanUserEmail = (user.email || '').toLowerCase().trim();
          const emailPrefix = cleanUserEmail.split('@')[0].replace(/[._-]/g, '');

          let matchedMentor = (mentorsList || []).find((m: any) => {
            const cleanMentorName = (m.name || '').toLowerCase().trim();
            const mentorNameNoSpace = cleanMentorName.replace(/\s+/g, '');
            if (cleanMentorName === cleanUserName) return true;
            if (cleanMentorName.includes(cleanUserName) || cleanUserName.includes(cleanMentorName)) return true;
            if (cleanMentorName.split(' ')[0] && cleanUserName.includes(cleanMentorName.split(' ')[0])) return true;
            if (emailPrefix && (mentorNameNoSpace.includes(emailPrefix) || emailPrefix.includes(mentorNameNoSpace))) return true;
            return false;
          });

          // Auto-sync mentor into mentors table if not yet created
          if (!matchedMentor && user.role === 'mentor') {
            try {
              const { data: newMentor } = await supabase.from('mentors').insert({
                name: user.name || cleanUserEmail.split('@')[0] || 'Technical Mentor',
                title: (user as any).targetGoal || (user as any).fieldOfInterest || 'Technical Specialist & Mentor',
                company: (user as any).college || 'RishabhLabs',
                avatar: user.avatar || '/avatars/default.webp',
                topics: ['Roadmap', 'Code Review', 'System Design'],
                experience_years: 4,
                rating: 5.0,
                bio: (user as any).bio || 'Experienced engineering mentor at RishabhLabs.',
                hourly_rate_inr: 0,
                available_days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
                domain: (user as any).fieldOfInterest || 'Full-Stack Development',
              }).select().single();

              if (newMentor) {
                matchedMentor = newMentor;
                mentorMap.set(newMentor.id, newMentor);
              }
            } catch (createErr) {
              console.warn('Auto-provision mentor notice:', createErr);
            }
          }

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

          // STRICT REAL DATA: Include all genuine student inquiries (do not drop if student profile is resolving)
          sessionsList = sbRequests.map((req: any) => {
            const student = req.student_id ? profileMap.get(req.student_id) : null;
            const mentor = mentorMap.get(req.mentor_id);
            const rawNote = req.student_note || '';
            let studentMessage = rawNote;
            let mentorPrepNote = '';
            let extractedPhone = '';

            if (studentMessage.includes('\n\n[Contact Mobile/WhatsApp]: ')) {
              const parts = studentMessage.split('\n\n[Contact Mobile/WhatsApp]: ');
              studentMessage = parts[0];
              const phonePart = parts.slice(1).join('\n\n[Contact Mobile/WhatsApp]: ');
              extractedPhone = phonePart.split('\n')[0].trim();
            }

            if (studentMessage.includes('\n\n[Mentor Notes]: ')) {
              const parts = studentMessage.split('\n\n[Mentor Notes]: ');
              studentMessage = parts[0];
              mentorPrepNote = parts.slice(1).join('\n\n[Mentor Notes]: ');
            }

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
              message: studentMessage,
              status: req.status || 'pending',
              meetingLink: req.meeting_link || '',
              notesFromMentor: mentorPrepNote,
              createdAt: req.created_at,
              mentorName: mentor?.name || 'Assigned Mentor',
              mentorAvatar: sanitizeAvatar(mentor?.avatar) || '',
              mentorTitle: mentor?.title || '',
              mentorId: req.mentor_id,
              studentId: req.student_id,
              studentName: student?.full_name || student?.email?.split('@')[0] || 'Verified Learner',
              studentEmail: student?.email || '',
              studentPhone: extractedPhone || '',
              studentAvatar: sanitizeAvatar(student?.avatar_url) || '',
              studentCollege: student?.college_name || '',
              studentTrack: student?.target_goal || student?.field_of_interest || '',
            };
          });
        }
      } catch (e) {
        console.warn('Supabase mentor sessions error:', e);
      }
    }

    // Fallback to MongoDB if Supabase returned 0
    if (sessionsList.length === 0 && mongoose.connection.readyState === 1) {
      try {
        let mQuery: any = {};
        if (!isSuperAdmin) {
          const mM = await Mentor.findOne({
            $or: [
              { name: new RegExp(user.name || '', 'i') },
              { userId: user._id }
            ]
          });
          if (mM) {
            mQuery.mentorId = mM._id;
          }
        }
        const mRequests = await MentorshipRequest.find(mQuery)
          .populate('studentId', 'name email avatar college fieldOfInterest targetGoal phone')
          .populate('mentorId', 'name title company avatar')
          .sort({ createdAt: -1 });

        if (mRequests && mRequests.length > 0) {
          sessionsList = mRequests.map((r: any) => ({
            _id: r._id.toString(),
            id: r._id.toString(),
            bookingCode: `BK-${r._id.toString().slice(-6).toUpperCase()}`,
            topic: r.topic,
            preferredSlot: r.preferredSlot,
            message: r.message,
            status: r.status,
            meetingLink: r.meetingLink || '',
            notesFromMentor: r.notesFromMentor || '',
            createdAt: r.createdAt,
            mentorName: r.mentorId?.name || 'Assigned Mentor',
            mentorAvatar: sanitizeAvatar(r.mentorId?.avatar) || '',
            mentorTitle: r.mentorId?.title || '',
            mentorId: r.mentorId?._id?.toString(),
            studentId: r.studentId?._id?.toString(),
            studentName: r.studentId?.name || 'Verified Learner',
            studentEmail: r.studentId?.email || '',
            studentPhone: r.studentPhone || (r.studentId as any)?.phone || '',
            studentAvatar: sanitizeAvatar(r.studentId?.avatar) || '',
            studentCollege: r.studentId?.college || '',
            studentTrack: r.studentId?.targetGoal || r.studentId?.fieldOfInterest || '',
          }));
        }
      } catch (mErr) {
        console.warn('Mongo mentor sessions notice:', mErr);
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
        if (preferredSlot !== undefined) updatePayload.requested_date = preferredSlot;

        if (notesFromMentor !== undefined) {
          const { data: existing } = await supabase
            .from('mentorship_requests')
            .select('student_note')
            .eq('id', id)
            .maybeSingle();

          let origMessage = existing?.student_note || '';
          if (origMessage.includes('\n\n[Mentor Notes]: ')) {
            origMessage = origMessage.split('\n\n[Mentor Notes]: ')[0];
          }
          updatePayload.student_note = notesFromMentor ? `${origMessage}\n\n[Mentor Notes]: ${notesFromMentor}` : origMessage;
        }

        let query = supabase.from('mentorship_requests').update(updatePayload);
        if (isUUID) {
          query = query.eq('id', id);
        } else {
          query = query.eq('id', id);
        }

        const { data: updatedSb, error: sbErr } = await query.select().single();

        if (updatedSb && !sbErr) {
          const rawNote = updatedSb.student_note || '';
          let msg = rawNote;
          let note = '';
          if (rawNote.includes('\n\n[Mentor Notes]: ')) {
            const parts = rawNote.split('\n\n[Mentor Notes]: ');
            msg = parts[0];
            note = parts.slice(1).join('\n\n[Mentor Notes]: ');
          }

          updatedSession = {
            _id: updatedSb.id,
            id: updatedSb.id,
            bookingCode: `BK-${updatedSb.id.slice(0, 6).toUpperCase()}`,
            topic: updatedSb.topic,
            preferredSlot: updatedSb.requested_date
              ? new Date(updatedSb.requested_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : (updatedSb.preferred_slot || 'Flexible Slot'),
            requestedDate: updatedSb.requested_date,
            message: msg,
            status: updatedSb.status,
            meetingLink: updatedSb.meeting_link,
            notesFromMentor: note,
            createdAt: updatedSb.created_at,
            studentId: updatedSb.student_id,
            mentorId: updatedSb.mentor_id,
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
              studentId: mUpdated.studentId?.toString(),
              mentorId: mUpdated.mentorId?.toString(),
            };
          }
        }
      } catch (mErr) {
        console.warn('Mongo update session warning:', mErr);
      }
    }

    // Automated Email Communication: When mentor accepts/confirms session or adds video meeting link, notify student
    try {
      let studentEmail = '';
      let studentName = '';
      let mentorName = user.name || 'Your Mentor';
      let mentorTitle = '';

      if (isSupabaseConfigured() && supabase) {
        if (updatedSession.studentId) {
          const { data: stProf } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', updatedSession.studentId)
            .maybeSingle();
          if (stProf) {
            studentEmail = stProf.email;
            studentName = stProf.full_name || stProf.email.split('@')[0];
          }
        }

        if (updatedSession.mentorId) {
          const { data: mRow } = await supabase
            .from('mentors')
            .select('name, title')
            .eq('id', updatedSession.mentorId)
            .maybeSingle();
          if (mRow) {
            mentorName = mRow.name || mentorName;
            mentorTitle = mRow.title || '';
          }
        }
      }

      if (!studentEmail && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
        const mReq = await MentorshipRequest.findById(id).populate('studentId').populate('mentorId');
        if (mReq) {
          if ((mReq.studentId as any)?.email) {
            studentEmail = (mReq.studentId as any).email;
            studentName = (mReq.studentId as any).name || studentName;
          }
          if ((mReq.mentorId as any)?.name) {
            mentorName = (mReq.mentorId as any).name;
            mentorTitle = (mReq.mentorId as any).title || mentorTitle;
          }
        }
      }

      // If status is confirmed/accepted or a new meeting link has been provided
      const isConfirmedState = status === 'confirmed' || status === 'accepted' || updatedSession.status === 'confirmed';
      if (studentEmail && (isConfirmedState || meetingLink)) {
        sendStudentBookingAcceptedEmail({
          studentEmail,
          studentName: studentName || 'Learner',
          mentorName,
          mentorTitle,
          topic: updatedSession.topic || '1:1 Technical Mentorship',
          confirmedSlot: updatedSession.preferredSlot || 'Scheduled Time',
          meetingLink: updatedSession.meetingLink || meetingLink,
          mentorNotes: updatedSession.notesFromMentor,
          bookingCode: updatedSession.bookingCode || `BK-${id.slice(0, 6).toUpperCase()}`,
          sessionId: id,
        }).catch((emailErr) => {
          console.warn('Student booking confirmation email delivery notice:', emailErr.message);
        });
      }
    } catch (e) {
      console.warn('Error resolving student email for acceptance notification:', e);
    }

    res.json(updatedSession);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 6. IN-PLATFORM COMMUNICATION: REPLIES & MESSAGES BETWEEN MENTOR & STUDENT
// ============================================================================
router.post('/sessions/:id/message', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { message, subject: customSubject } = req.body;
    const user = req.user!;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    let studentEmail = '';
    let studentName = '';
    let mentorEmail = '';
    let mentorName = '';
    let topic = '1:1 Technical Consultation';
    let slot = '';
    const bookingCode = `BK-${id.slice(0, 6).toUpperCase()}`;

    // 1. Fetch from Supabase
    if (isSupabaseConfigured() && supabase) {
      const { data: sbReq } = await supabase
        .from('mentorship_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (sbReq) {
        topic = sbReq.topic || topic;
        slot = sbReq.requested_date
          ? new Date(sbReq.requested_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
          : (sbReq.preferred_slot || '');

        if (sbReq.student_id) {
          const { data: sp } = await supabase.from('profiles').select('email, full_name').eq('id', sbReq.student_id).maybeSingle();
          if (sp) {
            studentEmail = sp.email;
            studentName = sp.full_name || sp.email.split('@')[0];
          }
        }

        if (sbReq.mentor_id) {
          const { data: mp } = await supabase.from('mentors').select('name, id').eq('id', sbReq.mentor_id).maybeSingle();
          if (mp) {
            mentorName = mp.name;
            const { data: mentorUser } = await supabase.from('profiles').select('email').ilike('full_name', `%${mp.name}%`).maybeSingle();
            if (mentorUser?.email) mentorEmail = mentorUser.email;
          }
        }

        // Append message to student_note for permanent record
        const isMentorSender = user.role === 'mentor' || (user.role as string) === 'super_admin' || (user.role as string) === 'admin';
        const senderTag = isMentorSender ? `[Mentor ${user.name || 'Mentor'}]:` : `[Student ${user.name || 'Student'}]:`;
        const updatedNote = sbReq.student_note
          ? `${sbReq.student_note}\n\n${senderTag} ${message.trim()}`
          : `${senderTag} ${message.trim()}`;

        await supabase.from('mentorship_requests').update({ student_note: updatedNote }).eq('id', id);
      }
    }

    // 2. Fetch from MongoDB
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const mReq = await MentorshipRequest.findById(id).populate('studentId').populate('mentorId');
        if (mReq) {
          if (!studentEmail && (mReq.studentId as any)?.email) {
            studentEmail = (mReq.studentId as any).email;
            studentName = (mReq.studentId as any).name || studentName;
          }
          if (!mentorName && (mReq.mentorId as any)?.name) {
            mentorName = (mReq.mentorId as any).name;
          }
          topic = mReq.topic || topic;
          slot = mReq.preferredSlot || slot;

          const isMentorSender = user.role === 'mentor' || (user.role as string) === 'super_admin' || (user.role as string) === 'admin';
          const senderTag = isMentorSender ? `[Mentor ${user.name || 'Mentor'}]:` : `[Student ${user.name || 'Student'}]:`;
          const currNotes = mReq.notesFromMentor || '';
          await MentorshipRequest.findByIdAndUpdate(id, {
            notesFromMentor: currNotes ? `${currNotes}\n\n${senderTag} ${message.trim()}` : `${senderTag} ${message.trim()}`
          });
        }
      }
    }

    // Determine sender and recipient
    const isSenderMentor = user.role === 'mentor' || (user.role as string) === 'super_admin' || (user.role as string) === 'admin';
    let targetRecipientEmail = '';
    let targetRecipientName = '';
    let senderRole: 'mentor' | 'student' = 'student';

    if (isSenderMentor) {
      // Mentor replying to student
      targetRecipientEmail = studentEmail;
      targetRecipientName = studentName || 'Learner';
      senderRole = 'mentor';
    } else {
      // Student sending inquiry to mentor
      targetRecipientEmail = mentorEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'rishabhlabs@vrindopnishad.in';
      targetRecipientName = mentorName || 'Mentor';
      senderRole = 'student';
    }

    if (!targetRecipientEmail) {
      targetRecipientEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'rishabhlabs@vrindopnishad.in';
    }

    const emailSent = await sendMentorshipCommunicationEmail({
      toEmail: targetRecipientEmail,
      recipientName: targetRecipientName,
      senderName: user.name || (isSenderMentor ? 'Your Mentor' : 'Learner'),
      senderRole,
      bookingCode,
      topic,
      slot,
      message: message.trim(),
    });

    res.json({
      success: true,
      delivered: emailSent,
      message: `Message transmitted and delivered via email to ${targetRecipientName} (${targetRecipientEmail}).`,
    });
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

// ============================================================================
// 7. GET / UPDATE MENTOR'S OWN PROFILE DETAILS (from Mentor Dashboard)
// ============================================================================
router.get('/mentor/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const isSuperAdmin = (user.role as string) === 'super_admin' || (user.role as string) === 'admin';

    if (!isSuperAdmin && user.role !== 'mentor') {
      return res.status(403).json({ message: 'Access denied: Mentor privileges required' });
    }

    let mentorProfile: any = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: allMentors } = await supabase.from('mentors').select('*');
        const cleanUserName = (user.name || '').toLowerCase().trim();
        const cleanUserEmail = (user.email || '').toLowerCase().trim();
        const emailPrefix = cleanUserEmail.split('@')[0].replace(/[._-]/g, '');

        let matched = (allMentors || []).find((m: any) => {
          const cleanMentorName = (m.name || '').toLowerCase().trim();
          const mentorNameNoSpace = cleanMentorName.replace(/\s+/g, '');
          if (cleanMentorName === cleanUserName) return true;
          if (cleanMentorName.includes(cleanUserName) || cleanUserName.includes(cleanMentorName)) return true;
          if (cleanMentorName.split(' ')[0] && cleanUserName.includes(cleanMentorName.split(' ')[0])) return true;
          if (emailPrefix && (mentorNameNoSpace.includes(emailPrefix) || emailPrefix.includes(mentorNameNoSpace))) return true;
          return false;
        });

        if (!matched && user.role === 'mentor') {
          // Auto-provision mentor row
          const { data: created } = await supabase.from('mentors').insert({
            name: user.name || cleanUserEmail.split('@')[0] || 'Technical Mentor',
            title: (user as any).targetGoal || (user as any).fieldOfInterest || 'Technical Specialist & Mentor',
            company: (user as any).college || 'RishabhLabs',
            avatar: user.avatar || '/avatars/default.webp',
            topics: ['Roadmap', 'Code Review', 'System Design'],
            experience_years: 4,
            rating: 5.0,
            bio: (user as any).bio || 'Experienced engineering mentor at RishabhLabs.',
            hourly_rate_inr: 0,
            available_days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
            domain: (user as any).fieldOfInterest || 'Full-Stack Development',
          }).select().single();
          matched = created;
        }

        if (matched) {
          mentorProfile = {
            id: matched.id,
            _id: matched.id,
            name: matched.name,
            title: matched.title || 'Technical Specialist',
            company: matched.company || 'RishabhLabs',
            domain: matched.domain || 'Full-Stack Development',
            avatar: sanitizeAvatar(matched.avatar) || '/avatars/default.webp',
            rating: Number(matched.rating) || 5.0,
            bio: matched.bio || '',
            hourlyRate: matched.hourly_rate || (matched.hourly_rate_inr ? `₹${matched.hourly_rate_inr}` : 'Free for Students'),
            topics: Array.isArray(matched.topics) ? matched.topics : ['Roadmap', 'System Design'],
            availability: Array.isArray(matched.availability)
              ? matched.availability
              : (Array.isArray(matched.available_days) && matched.available_days.length > 0
                ? matched.available_days.map((d: string) => `${d}, 7:00 PM IST`)
                : ['Today, 7:00 PM IST', 'Tomorrow, 6:00 PM IST']),
            isAvailableToday: matched.is_available_today !== undefined ? Boolean(matched.is_available_today) : true,
          };
        }
      } catch (sbErr) {
        console.warn('Supabase get mentor profile notice:', sbErr);
      }
    }

    if (!mentorProfile && mongoose.connection.readyState === 1) {
      try {
        const mM = await Mentor.findOne({
          $or: [{ userId: user._id }, { name: new RegExp(user.name || '', 'i') }],
        });
        if (mM) {
          mentorProfile = {
            id: mM._id.toString(),
            _id: mM._id.toString(),
            name: mM.name,
            title: mM.title,
            company: mM.company,
            domain: mM.domain || 'General',
            avatar: mM.avatar || '/avatars/default.webp',
            rating: mM.rating,
            bio: mM.bio,
            hourlyRate: mM.hourlyRate,
            topics: mM.topics,
            availability: mM.availability,
            isAvailableToday: mM.isAvailableToday,
          };
        }
      } catch (mErr) {
        console.warn('Mongo get mentor profile notice:', mErr);
      }
    }

    res.json(mentorProfile || {
      name: user.name || 'Mentor',
      title: 'Technical Specialist & Mentor',
      company: (user as any).college || 'RishabhLabs',
      domain: 'Full-Stack Development',
      avatar: user.avatar || '/avatars/default.webp',
      rating: 5.0,
      bio: 'Experienced engineering mentor at RishabhLabs.',
      hourlyRate: 'Free for Students',
      topics: ['Roadmap', 'System Design'],
      availability: ['Today, 7:00 PM IST', 'Tomorrow, 6:00 PM IST'],
      isAvailableToday: true,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/mentor/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const isSuperAdmin = (user.role as string) === 'super_admin' || (user.role as string) === 'admin';

    if (!isSuperAdmin && user.role !== 'mentor') {
      return res.status(403).json({ message: 'Access denied: Mentor privileges required' });
    }

    const {
      title,
      company,
      domain,
      avatar,
      bio,
      hourlyRate,
      topics,
      availability,
      isAvailableToday,
    } = req.body;

    const topicsArr = Array.isArray(topics)
      ? topics
      : (topics ? String(topics).split(',').map((t: string) => t.trim()).filter(Boolean) : undefined);

    const availArr = Array.isArray(availability)
      ? availability
      : (availability ? String(availability).split(',').map((t: string) => t.trim()).filter(Boolean) : undefined);

    let updatedMentor: any = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: allMentors } = await supabase.from('mentors').select('*');
        const cleanUserName = (user.name || '').toLowerCase().trim();
        const cleanUserEmail = (user.email || '').toLowerCase().trim();
        const emailPrefix = cleanUserEmail.split('@')[0].replace(/[._-]/g, '');

        let matched = (allMentors || []).find((m: any) => {
          const cleanMentorName = (m.name || '').toLowerCase().trim();
          const mentorNameNoSpace = cleanMentorName.replace(/\s+/g, '');
          if (cleanMentorName === cleanUserName) return true;
          if (cleanMentorName.includes(cleanUserName) || cleanUserName.includes(cleanMentorName)) return true;
          if (cleanMentorName.split(' ')[0] && cleanUserName.includes(cleanMentorName.split(' ')[0])) return true;
          if (emailPrefix && (mentorNameNoSpace.includes(emailPrefix) || emailPrefix.includes(mentorNameNoSpace))) return true;
          return false;
        });

        const updatePayload: any = {};
        if (title !== undefined) updatePayload.title = title;
        if (company !== undefined) updatePayload.company = company;
        if (domain !== undefined) updatePayload.domain = domain;
        if (avatar !== undefined) updatePayload.avatar = avatar;
        if (bio !== undefined) updatePayload.bio = bio;
        if (hourlyRate !== undefined) updatePayload.hourly_rate = hourlyRate;
        if (topicsArr !== undefined) updatePayload.topics = topicsArr;
        if (availArr !== undefined) {
          updatePayload.availability = availArr;
          updatePayload.available_days = availArr.map((a: string) => a.split(',')[0].trim());
        }
        if (isAvailableToday !== undefined) updatePayload.is_available_today = Boolean(isAvailableToday);

        if (matched) {
          const { data: upd } = await supabase.from('mentors').update(updatePayload).eq('id', matched.id).select().single();
          if (upd) matched = upd;
        } else {
          const { data: ins } = await supabase.from('mentors').insert({
            name: user.name || cleanUserEmail.split('@')[0] || 'Technical Mentor',
            ...updatePayload,
          }).select().single();
          if (ins) matched = ins;
        }

        if (matched) {
          updatedMentor = {
            id: matched.id,
            _id: matched.id,
            name: matched.name,
            title: matched.title,
            company: matched.company,
            domain: matched.domain,
            avatar: matched.avatar,
            bio: matched.bio,
            topics: matched.topics,
            availability: matched.availability || matched.available_days,
            hourlyRate: matched.hourly_rate || (matched.hourly_rate_inr ? `₹${matched.hourly_rate_inr}` : 'Free for Students'),
            isAvailableToday: matched.is_available_today !== undefined ? Boolean(matched.is_available_today) : true,
          };
        }

        // Also sync profile fields
        if (user.email) {
          const profUpdates: any = {};
          if (domain) profUpdates.field_of_interest = domain;
          if (company) profUpdates.college_name = company;
          if (avatar) profUpdates.avatar_url = avatar;
          if (Object.keys(profUpdates).length > 0) {
            await supabase.from('profiles').update(profUpdates).eq('email', user.email.toLowerCase());
          }
        }
      } catch (sbErr) {
        console.warn('Supabase update mentor profile error:', sbErr);
      }
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const mUpdates: any = {};
        if (title !== undefined) mUpdates.title = title;
        if (company !== undefined) mUpdates.company = company;
        if (domain !== undefined) mUpdates.domain = domain;
        if (avatar !== undefined) mUpdates.avatar = avatar;
        if (bio !== undefined) mUpdates.bio = bio;
        if (hourlyRate !== undefined) mUpdates.hourlyRate = hourlyRate;
        if (topicsArr !== undefined) mUpdates.topics = topicsArr;
        if (availArr !== undefined) mUpdates.availability = availArr;
        if (isAvailableToday !== undefined) mUpdates.isAvailableToday = Boolean(isAvailableToday);

        const mMentor = await Mentor.findOneAndUpdate(
          { $or: [{ userId: user._id }, { name: new RegExp(user.name || '', 'i') }] },
          mUpdates,
          { new: true, upsert: true }
        );
        if (mMentor && !updatedMentor) {
          updatedMentor = {
            id: mMentor._id.toString(),
            _id: mMentor._id.toString(),
            name: mMentor.name,
            title: mMentor.title,
            company: mMentor.company,
            domain: mMentor.domain,
            avatar: mMentor.avatar,
            bio: mMentor.bio,
            topics: mMentor.topics,
            availability: mMentor.availability,
            hourlyRate: mMentor.hourlyRate,
            isAvailableToday: mMentor.isAvailableToday,
          };
        }
      } catch (mErr) {
        console.warn('Mongo update mentor profile error:', mErr);
      }
    }

    res.json({
      success: true,
      message: 'Mentor profile updated successfully!',
      mentor: updatedMentor,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
