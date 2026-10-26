import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { CodingProblem, Submission } from '../models/CodingProblem';
import { codeExecutionService } from '../services/codeExecutionService';
import { aiService } from '../services/aiService';
import { StudentProfile } from '../models/StudentProfile';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const router = Router();

// Helper to resolve problem across Supabase and MongoDB
async function resolveProblem(idOrSlug: string): Promise<any | null> {
  // 1. Try Mongo if valid ObjectId
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const mongoProb = await CodingProblem.findById(idOrSlug);
    if (mongoProb) return mongoProb;
  }

  // 2. Try Mongo by slug
  const mongoProbBySlug = await CodingProblem.findOne({ slug: idOrSlug });
  if (mongoProbBySlug) return mongoProbBySlug;

  // 3. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const query = isUuid
      ? supabase.from('coding_problems').select('*').eq('id', idOrSlug).maybeSingle()
      : supabase.from('coding_problems').select('*').eq('slug', idOrSlug).maybeSingle();

    const { data: p, error } = await query;
    if (!error && p) {
      return {
        _id: p.id,
        id: p.id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        category: p.category,
        isDebuggingChallenge: p.is_debugging_challenge,
        brokenBugExplanation: p.broken_bug_explanation,
        descriptionMarkdown: p.description_markdown,
        examples: p.examples || [],
        constraints: p.constraints || [],
        starterCode: p.starter_code || {},
        hints: p.hints || {},
        testCases: p.test_cases || [],
        acceptanceRate: p.acceptance_rate,
      };
    }
  }

  return null;
}

// GET /api/problems
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, type } = req.query;

    // 1. Check live Supabase first if available
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('coding_problems').select('*').order('created_at', { ascending: true });
      if (category && typeof category === 'string') {
        query = query.ilike('category', `%${category}%`);
      }
      if (difficulty && typeof difficulty === 'string') {
        query = query.eq('difficulty', difficulty);
      }
      if (type === 'debugging') {
        query = query.eq('is_debugging_challenge', true);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const formatted = data.map((p) => ({
          id: p.id,
          _id: p.id,
          title: p.title,
          slug: p.slug,
          difficulty: p.difficulty,
          category: p.category,
          isDebuggingChallenge: p.is_debugging_challenge,
          brokenBugExplanation: p.broken_bug_explanation,
          descriptionMarkdown: p.description_markdown,
          examples: p.examples || [],
          constraints: p.constraints || [],
          starterCode: p.starter_code || {},
          hints: p.hints || {},
          publicTestCases: (p.test_cases || [])
            .filter((tc: any) => !tc.isHidden)
            .map((tc: any) => ({
              testCaseId: tc.testCaseId,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: false,
            })),
          tags: [p.category, p.difficulty],
          acceptanceRate: p.acceptance_rate,
        }));
        return res.json(formatted);
      }
    }

    // 2. Fallback to MongoDB
    const filter: any = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (type === 'debugging') filter.isDebuggingChallenge = true;

    const problems = await CodingProblem.find(filter).select('-testCases.expectedOutput');
    res.json(problems);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/problems/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await resolveProblem(slug);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const testCases = problem.testCases || [];
    const publicTestCases = testCases
      .filter((tc: any) => !tc.isHidden)
      .map((tc: any) => ({
        testCaseId: tc.testCaseId,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: false,
      }));

    res.json({
      id: problem.id || problem._id,
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      category: problem.category,
      isDebuggingChallenge: problem.isDebuggingChallenge,
      brokenBugExplanation: problem.brokenBugExplanation,
      descriptionMarkdown: problem.descriptionMarkdown,
      examples: problem.examples,
      constraints: problem.constraints,
      starterCode: problem.starterCode,
      publicTestCases,
      tags: problem.tags || [problem.category, problem.difficulty],
      acceptanceRate: problem.acceptanceRate,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/code/run - runs code ONLY on public test cases
router.post('/run', async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    const problem = await resolveProblem(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const allTests = problem.testCases || [];
    const publicTests = allTests.filter((tc: any) => !tc.isHidden);

    const result = await codeExecutionService.executeTestCases({
      code,
      language: language || 'javascript',
      testCases: publicTests,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Execution error: ' + err.message });
  }
});

// POST /api/code/submit - runs code on ALL test cases including hidden
router.post('/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { problemId, code, language } = req.body;

    const problem = await resolveProblem(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Execute complete test suite with hidden test cases
    const result = await codeExecutionService.executeTestCases({
      code,
      language: language || 'javascript',
      testCases: problem.testCases || [],
    });

    // Record submission in Mongo if user is mongo user
    let submissionId: any = 'sub-' + Date.now();
    try {
      if (user._id && mongoose.Types.ObjectId.isValid(user._id.toString())) {
        const mongoProbId = mongoose.Types.ObjectId.isValid(problem._id?.toString())
          ? problem._id
          : undefined;

        const submission = await Submission.create({
          userId: user._id,
          problemId: mongoProbId,
          code,
          language: language || 'javascript',
          status: result.status,
          passedTestCases: result.passedTestCases,
          totalTestCases: result.totalTestCases,
          runtimeMs: result.runtimeMs,
          testResults: result.testResults,
        });
        submissionId = submission._id;
      }
    } catch {
      // Non-blocking submission logging
    }

    // If accepted, reward user in StudentProfile
    if (result.status === 'Accepted' && user._id) {
      try {
        await StudentProfile.findOneAndUpdate(
          { userId: user._id },
          {
            $inc: {
              totalPoints: problem.difficulty === 'Hard' ? 100 : problem.difficulty === 'Medium' ? 50 : 25,
              skillsCompleted: 1,
            },
          }
        );
      } catch { }
    }

    res.json({
      submissionId,
      status: result.status,
      passedTestCases: result.passedTestCases,
      totalTestCases: result.totalTestCases,
      runtimeMs: result.runtimeMs,
      summaryMessage: result.summaryMessage,
      testResults: result.testResults,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Submission error: ' + err.message });
  }
});

// POST /api/code/hint - progressive AI guidance ("I'm Stuck")
router.post('/hint', async (req, res) => {
  try {
    const { problemTitle, level = 1, studentCode } = req.body;
    const hint = await aiService.generateProgressiveHint(level, problemTitle, studentCode);
    res.json(hint);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
