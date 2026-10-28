import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Lesson } from '../models/Lesson';
import { StudentProfile } from '../models/StudentProfile';
import { getCleanLessons } from '../seed/seedData';

const router = Router();

// GET /api/lessons - list all lessons grouped by module and track
router.get('/', async (req, res) => {
  try {
    const { track } = req.query;
    const isMongoReady = mongoose.connection.readyState === 1;

    let lessons: any[] = [];
    if (isMongoReady) {
      try {
        const filter = track ? { track } : {};
        lessons = await Lesson.find(filter).sort({ order: 1 });
      } catch (e) {
        console.warn('Mongo find error in lessons:', e);
      }
    }

    if (!lessons || lessons.length === 0) {
      lessons = getCleanLessons();
      if (track) lessons = lessons.filter((l: any) => l.track === track);
    }

    // Group by module
    const grouped = lessons.reduce((acc: any, l: any) => {
      const key = l.moduleTitle || 'Core Concepts';
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        id: l._id || l.slug,
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
    const isMongoReady = mongoose.connection.readyState === 1;

    let lesson: any = null;
    let nextLesson: any = null;
    let prevLesson: any = null;
    let moduleLessons: any[] = [];

    if (isMongoReady) {
      try {
        lesson = await Lesson.findOne({ slug });
        if (lesson) {
          nextLesson = await Lesson.findOne({
            track: lesson.track,
            order: { $gt: lesson.order },
          }).sort({ order: 1 });

          prevLesson = await Lesson.findOne({
            track: lesson.track,
            order: { $lt: lesson.order },
          }).sort({ order: -1 });

          moduleLessons = await Lesson.find({
            track: lesson.track,
          })
            .select('title slug order readTime track moduleTitle')
            .sort({ order: 1 });
        }
      } catch (e) {
        console.warn('Mongo find error in lesson by slug:', e);
      }
    }

    if (!lesson) {
      const allClean = getCleanLessons();
      const idx = allClean.findIndex((l: any) => l.slug === slug);
      if (idx !== -1) {
        lesson = allClean[idx];
        nextLesson = idx < allClean.length - 1 ? allClean[idx + 1] : null;
        prevLesson = idx > 0 ? allClean[idx - 1] : null;
        moduleLessons = allClean.filter((l: any) => l.track === lesson.track);
      }
    }

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

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
