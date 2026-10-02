import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Mentor, MentorshipRequest } from '../models/Mentorship';

const router = Router();

// GET /api/mentors
router.get('/', async (req, res) => {
  try {
    const { topic, domain } = req.query;
    const filter: any = {};
    if (topic) filter.topics = topic;
    if (domain && domain !== 'All') {
      filter.domain = domain;
    }
    const mentors = await Mentor.find(filter);
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

// GET /api/mentorship/my-requests
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

export default router;
