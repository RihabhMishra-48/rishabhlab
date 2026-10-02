import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { CodingProblem, Submission } from '../models/CodingProblem';
import { codeExecutionService } from '../services/codeExecutionService';
import { aiService } from '../services/aiService';
import { StudentProfile } from '../models/StudentProfile';

const router = Router();

// GET /api/problems
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, type } = req.query;
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
    const problem = await CodingProblem.findOne({ slug });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Only return public test cases to frontend!
    const publicTestCases = problem.testCases
      .filter((tc) => !tc.isHidden)
      .map((tc) => ({
        testCaseId: tc.testCaseId,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: false,
      }));

    res.json({
      id: problem._id,
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
      tags: problem.tags,
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

    const problem = await CodingProblem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const publicTests = problem.testCases.filter((tc) => !tc.isHidden);

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

    const problem = await CodingProblem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Execute complete test suite with hidden test cases
    const result = await codeExecutionService.executeTestCases({
      code,
      language: language || 'javascript',
      testCases: problem.testCases,
    });

    // Record submission
    const submission = await Submission.create({
      userId: user._id,
      problemId: problem._id,
      code,
      language: language || 'javascript',
      status: result.status,
      passedTestCases: result.passedTestCases,
      totalTestCases: result.totalTestCases,
      runtimeMs: result.runtimeMs,
      testResults: result.testResults,
    });

    // If accepted, reward user
    if (result.status === 'Accepted') {
      await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        {
          $inc: {
            totalPoints: problem.difficulty === 'Hard' ? 100 : problem.difficulty === 'Medium' ? 50 : 25,
            skillsCompleted: 1,
          },
        }
      );
    }

    res.json({
      submissionId: submission._id,
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
