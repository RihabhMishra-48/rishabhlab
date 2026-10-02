import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Lesson } from '../models/Lesson';
import { StudentProfile } from '../models/StudentProfile';

const router = Router();

// GET /api/lessons - list all lessons grouped by module and track
router.get('/', async (req, res) => {
  try {
    const { track } = req.query;
    const filter = track ? { track } : {};
    const lessons = await Lesson.find(filter).sort({ order: 1 });

    // Group by module
    const grouped = lessons.reduce((acc: any, l) => {
      const key = l.moduleTitle;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        id: l._id,
        title: l.title,
        slug: l.slug,
        readTime: l.readTime,
        order: l.order,
        track: l.track,
        overview: l.overview,
      });
      return acc;
    }, {});

    res.json({ lessons, grouped });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/lessons/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const lesson = await Lesson.findOne({ slug });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Find next and previous lesson
    const nextLesson = await Lesson.findOne({
      track: lesson.track,
      order: { $gt: lesson.order },
    }).sort({ order: 1 });

    const prevLesson = await Lesson.findOne({
      track: lesson.track,
      order: { $lt: lesson.order },
    }).sort({ order: -1 });

    // Find all lessons in this track/module for dynamic module navigation
    const moduleLessons = await Lesson.find({
      track: lesson.track,
    })
      .select('title slug order readTime track moduleTitle')
      .sort({ order: 1 });

    res.json({
      lesson,
      nextLesson: nextLesson ? { slug: nextLesson.slug, title: nextLesson.title } : null,
      prevLesson: prevLesson ? { slug: prevLesson.slug, title: prevLesson.title } : null,
      moduleLessons: moduleLessons || [],
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/lessons/:slug/complete
router.post('/:slug/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;
    const user = req.user!;

    const lesson = await Lesson.findOne({ slug });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    if (!lesson.isCompletedBy.includes(user._id)) {
      lesson.isCompletedBy.push(user._id);
      await lesson.save();

      // Update student points and skills
      await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        {
          $inc: { totalPoints: 30, skillsCompleted: 1 },
        }
      );
    }

    res.json({ success: true, message: 'Lesson marked as complete!' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/lessons/:slug/quiz
router.post('/:slug/quiz', async (req, res) => {
  try {
    const { slug } = req.params;
    const { answers } = req.body; // array of selected indices

    const lesson = await Lesson.findOne({ slug });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const results = lesson.quiz.map((q, idx) => {
      const selected = answers ? answers[idx] : undefined;
      const isCorrect = selected === q.correctIndex;
      return {
        questionIndex: idx,
        isCorrect,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      };
    });

    const score = results.filter((r) => r.isCorrect).length;
    res.json({
      score,
      total: lesson.quiz.length,
      passed: score === lesson.quiz.length,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
