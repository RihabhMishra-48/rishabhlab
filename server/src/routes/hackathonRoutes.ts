import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Hackathon } from '../models/Hackathon';
import { aiService } from '../services/aiService';

const router = Router();

// GET /api/hackathon
router.get('/', async (req, res) => {
  try {
    let hackathon = await Hackathon.findOne({});
    if (!hackathon) {
      // Seed default hackathon instance
      hackathon = await Hackathon.create({
        hackathonName: 'Smart India Hackathon & InnovateX',
        targetEventDate: new Date(Date.now() + 12 * 24 * 3600 * 1000 + 4 * 3600 * 1000 + 32 * 60 * 1000),
        daysRemaining: 12,
        hoursRemaining: 4,
        problemStatement:
          'Build an AI-powered diagnostic and execution tool that evaluates codebase health, identifies missing edge-case test suites, and enables fast student iteration.',
        selectedTrack: 'Smart Education & Developer Productivity',
        teamMembers: [
          { name: 'Rishabh Mishra', role: 'Full-Stack Lead', avatar: '/avatars/rishabh.png' },
          { name: 'Ananya Sharma', role: 'AI / Data Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop' },
          { name: 'Devendra Verma', role: 'DevOps & Systems', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop' },
        ],
        phases: [
          {
            phaseId: 'p1',
            name: 'Problem Discovery',
            daysRange: 'Day 14 – 12',
            status: 'completed',
            description: 'Define target persona, core bottlenecks, and validate real-world user friction.',
            deliverables: ['Problem 1-pager', 'Persona mapping'],
          },
          {
            phaseId: 'p2',
            name: 'Idea Validation',
            daysRange: 'Day 11 – 9',
            status: 'completed',
            description: 'Evaluate technical feasibility, data schemas, API contracts, and user flow wireframes.',
            deliverables: ['System architecture diagram', 'DB schema schema.prisma/mongoose'],
          },
          {
            phaseId: 'p3',
            name: 'MVP',
            daysRange: 'Day 8 – 5',
            status: 'active',
            description: 'Rapid sprint on the core 80% feature set: authentication, algorithm execution, and UI dashboard.',
            deliverables: ['Functional frontend', 'Backend endpoints running', 'Core algorithm working'],
          },
          {
            phaseId: 'p4',
            name: 'Testing + Polish',
            daysRange: 'Day 4 – 2',
            status: 'upcoming',
            description: 'Load testing, edge-case hardening, dark/light theme polish, and responsive validation.',
            deliverables: ['Zero critical bugs', 'Mobile-friendly screens'],
          },
          {
            phaseId: 'p5',
            name: 'Pitch + Demo',
            daysRange: 'Day 1',
            status: 'upcoming',
            description: '7-slide pitch deck creation, rehearsed 3-minute presentation, recorded fallback backup video.',
            deliverables: ['Pitch deck PDF', 'Backup demo video MP4'],
          },
          {
            phaseId: 'p6',
            name: 'SHIP 🚀',
            daysRange: 'Day 0',
            status: 'upcoming',
            description: 'Deploy to production cloud URL, finalize README documentation, and submit to judges portal.',
            deliverables: ['Live domain URL', 'GitHub repo link', 'Judge evaluation form'],
          },
        ],
      });
    }

    res.json(hackathon);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/hackathon/ai-tool - Run specialized Hackathon AI generator
router.post('/ai-tool', async (req, res) => {
  try {
    const { toolName, problemStatement } = req.body;
    const analysis = await aiService.analyzeHackathonProblem(
      problemStatement || 'AI Execution Platform for Engineering Students'
    );

    if (toolName === 'ideas') {
      return res.json({
        type: 'ideas',
        items: [
          {
            title: 'Automated Edge-Case Synthesizer',
            pitch: 'Injects synthetic boundary values and concurrency race condition tests into student code.',
            viability: '94% feasibility in 48 hours',
          },
          {
            title: 'Collaborative Sandbox Debugger',
            pitch: 'Live multiplayer pair-programming environment with contextual AI hints that never leak solutions.',
            viability: '91% feasibility in 48 hours',
          },
          {
            title: 'Verified Proof of Work Ledger',
            pitch: 'Cryptographically timestamped GitHub commit and code execution verification badge for hackathons.',
            viability: '88% feasibility in 48 hours',
          },
        ],
      });
    }

    if (toolName === 'techStack') {
      return res.json({
        type: 'techStack',
        recommended: ['React 18 + Vite', 'TypeScript', 'Tailwind CSS', 'Node.js + Express', 'MongoDB / Mongoose'],
        reasoning: 'Maximum development velocity, zero compile friction, type-safety, and instant cloud deployment.',
      });
    }

    if (toolName === 'mvpPlan') {
      return res.json({
        type: 'mvpPlan',
        checklist: analysis.mvpScopeIn48Hours,
      });
    }

    if (toolName === 'pitchDeck') {
      return res.json({
        type: 'pitchDeck',
        slides: [
          { slide: '1. Title & Hook', content: 'Rishabh Labs: Stop asking "What should I learn?", know what to do next.' },
          { slide: '2. The Problem', content: 'College students waste 6+ months watching tutorial hell without shipping.' },
          { slide: '3. The Solution', content: 'Adaptive roadmaps + daily missions + sandboxed code practice + verified proof of work.' },
          { slide: '4. Live Product Demo', content: 'Execute Day 17 mission, run LeetCode test suite, inspect Hackathon Mode countdown.' },
          { slide: '5. Architecture & Tech', content: 'React/Vite, Express/TypeScript, MongoDB, sandboxed isolated code runner.' },
          { slide: '6. Traction & Feedback', content: 'Piloted with GLA University student developers; 64% daily execution rate.' },
          { slide: '7. The Ask / Future', content: 'Rollout across 10 partner engineering colleges; open for mentor signups.' },
        ],
      });
    }

    if (toolName === 'judgeQuestions') {
      return res.json({
        type: 'judgeQuestions',
        questions: analysis.judgeQuestions,
      });
    }

    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
