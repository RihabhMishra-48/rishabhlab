import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Mentor, MentorshipRequest } from '../models/Mentorship';

const router = Router();

// GET /api/mentors
router.get('/', async (req, res) => {
  try {
    const { topic, domain } = req.query;
    const filter: any = {};
    if (domain && domain !== 'All') {
      filter.domain = domain;
    } else if (topic && topic !== 'All') {
      filter.$or = [
        { domain: new RegExp(String(topic), 'i') },
        { topics: topic },
      ];
    }
    let mentors = await Mentor.find(filter);
    if (!mentors || mentors.length === 0) {
      const count = await Mentor.countDocuments();
      if (count === 0) {
        const { getCleanMentors } = await import('../seed/seedData');
        await Mentor.insertMany(getCleanMentors());
        mentors = await Mentor.find(filter);
      }
    }
    res.json(mentors);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/mentorship/request - book a session
router.post('/request', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { mentorId, topic, contextType, message, preferredSlot } = req.body;

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      // Find first available mentor
      const fallback = await Mentor.findOne({});
      if (!fallback) return res.status(404).json({ message: 'Mentor not found' });
    }

    const newRequest = await MentorshipRequest.create({
      studentId: user._id,
      mentorId: mentorId || (await Mentor.findOne({}))?._id,
      topic: topic || 'Roadmap & Career Strategy',
      contextType: contextType || 'general',
      message: message || 'Seeking guidance on full-stack architecture and hackathon MVP scaling.',
      preferredSlot: preferredSlot || 'Tomorrow, 6:00 PM IST',
      status: 'accepted',
      meetingLink: 'https://meet.google.com/rsh-labs-mentor',
      notesFromMentor: 'Session confirmed! Please have your GitHub repo and questions open.',
    });

    res.status(201).json({
      success: true,
      message: '1:1 Mentorship session confirmed! Check meeting details below.',
      request: newRequest,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/mentorship/my-requests (student's view)
router.get('/my-requests', requireAuth, async (req: AuthRequest, res) => {
  try {
    const requests = await MentorshipRequest.find({ studentId: req.user?._id })
      .populate('mentorId', 'name title company avatar')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/mentorship/mentor/sessions (mentor / admin workspace view)
router.get('/mentor/sessions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const isSuperAdmin = (user.role as string) === 'super_admin' || (user.role as string) === 'admin';

    let filter: any = {};
    if (!isSuperAdmin) {
      if (user.role !== 'mentor') {
        return res.status(403).json({ message: 'Access denied: Mentor privileges required' });
      }

      // Find mentor record for this user
      const mentorRecords = await Mentor.find({
        $or: [{ userId: user._id }, { name: user.name }]
      });
      const mentorIds = mentorRecords.map(m => m._id);

      // Mentor can view sessions requested to their mentor profile or directly to their user ID
      filter = {
        $or: [
          { mentorId: { $in: mentorIds } },
          { mentorId: user._id }
        ]
      };
    }

    const sessions = await MentorshipRequest.find(filter)
      .populate('studentId', 'name email avatar college degree year targetGoal githubUsername')
      .populate('mentorId', 'name title company avatar')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/mentorship/sessions/:id (update session status, meeting link, notes)
router.put('/sessions/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, meetingLink, notesFromMentor, preferredSlot } = req.body;
    const user = req.user!;
    const isSuperAdmin = (user.role as string) === 'super_admin' || (user.role as string) === 'admin';

    const session = await MentorshipRequest.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Mentorship session not found' });
    }

    if (!isSuperAdmin && user.role !== 'mentor') {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (meetingLink !== undefined) updateFields.meetingLink = meetingLink;
    if (notesFromMentor !== undefined) updateFields.notesFromMentor = notesFromMentor;
    if (preferredSlot !== undefined) updateFields.preferredSlot = preferredSlot;

    const updated = await MentorshipRequest.findByIdAndUpdate(id, updateFields, { new: true })
      .populate('studentId', 'name email avatar college degree year targetGoal githubUsername')
      .populate('mentorId', 'name title company avatar');

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
