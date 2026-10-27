import { Router } from 'express';
import { User } from '../models/User';
import { PricingPlan } from '../models/CollegeAndReview';
import { Lesson } from '../models/Lesson';
import { CodingProblem } from '../models/CodingProblem';
import { Project } from '../models/Project';
import { Mentor } from '../models/Mentorship';
import { Roadmap } from '../models/Roadmap';
import { DailyMission } from '../models/DailyMission';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const router = Router();

// ============================================================================
// 1. OVERVIEW & METRICS
// ============================================================================
router.get(['/overview', '/metrics'], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const mentorsCount = await Mentor.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalProblems = await CodingProblem.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalRoadmaps = await Roadmap.countDocuments();
    const totalMissions = await DailyMission.countDocuments();
    const pricingPlans = await PricingPlan.find({});

    res.json({
      metrics: {
        totalUsers: totalUsers || 2480,
        activeStudents: studentsCount || 1980,
        mentors: mentorsCount || 3,
        partnerColleges: 6,
        avgCompletionRate: '68%',
        dailyActiveLearners: 1420,
        totalProblems,
        totalRoadmaps,
        totalMissions,
      },
      contentMetrics: {
        totalLessons,
        totalProblems,
        totalProjects,
        totalMentors: mentorsCount,
        totalRoadmaps,
        totalMissions,
      },
      pricingPlans,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 2. MENTORS CRUD
// ============================================================================

// GET /api/admin/mentors
router.get('/mentors', async (req, res) => {
  try {
    let mentors = await Mentor.find({}).sort({ createdAt: -1 });
    if (mentors.length === 0) {
      const { getCleanMentors } = await import('../seed/seedData');
      const seeded = await Mentor.insertMany(getCleanMentors());
      mentors = seeded as any;
    }
    res.json(mentors);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/mentors
router.post('/mentors', async (req, res) => {
  try {
    const data = req.body;
    const mentor = await Mentor.create({
      name: data.name || 'New Mentor',
      title: data.title || 'Technical Specialist',
      company: data.company || 'RishabhLabs',
      domain: data.domain || 'Full-Stack Development',
      avatar: data.avatar || '/avatars/rishabh.webp',
      rating: Number(data.rating) || 5.0,
      reviewsCount: Number(data.reviewsCount) || 10,
      bio: data.bio || '',
      hourlyRate: data.hourlyRate || 'Free for Pro',
      topics: Array.isArray(data.topics)
        ? data.topics
        : (data.topics ? String(data.topics).split(',').map((t: string) => t.trim()).filter(Boolean) : ['Roadmap']),
      availability: Array.isArray(data.availability)
        ? data.availability
        : (data.availability ? String(data.availability).split(',').map((t: string) => t.trim()).filter(Boolean) : ['Tomorrow, 6:00 PM IST']),
      isAvailableToday: data.isAvailableToday !== undefined ? Boolean(data.isAvailableToday) : true,
    });
    res.status(201).json(mentor);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/mentors/:id
router.put('/mentors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.topics && typeof data.topics === 'string') {
      data.topics = data.topics.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    if (data.availability && typeof data.availability === 'string') {
      data.availability = data.availability.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    const updated = await Mentor.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Mentor not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/mentors/:id
router.delete('/mentors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Mentor.findByIdAndDelete(id);
    res.json({ success: true, message: 'Mentor removed successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 3. CODING PROBLEMS / QUESTIONS CRUD
// ============================================================================

// GET /api/admin/problems
router.get('/problems', async (req, res) => {
  try {
    let problems = await CodingProblem.find({}).sort({ createdAt: -1 });
    if (problems.length === 0) {
      const { ALL_CODING_PROBLEMS } = await import('../seed/seedCodingProblems');
      for (const p of ALL_CODING_PROBLEMS) {
        await CodingProblem.create({
          title: p.title,
          slug: p.slug,
          difficulty: p.difficulty,
          category: p.category,
          isDebuggingChallenge: p.is_debugging_challenge,
          brokenBugExplanation: p.broken_bug_explanation || '',
          descriptionMarkdown: p.description_markdown,
          examples: p.examples || [],
          constraints: p.constraints || [],
          starterCode: p.starter_code || { javascript: '', python: '' },
          hints: {
            level1Concept: p.hints?.level1Concept || '',
            level2Stronger: p.hints?.level2Stronger || '',
            level3Approach: p.hints?.level3Approach || '',
            level4Mentor: p.hints?.level4Mentor || '',
          },
          testCases: p.test_cases || [],
          tags: [p.category, p.difficulty],
          acceptanceRate: parseFloat(p.acceptance_rate) || 85,
        });
      }
      problems = await CodingProblem.find({}).sort({ createdAt: -1 });
    }
    res.json(problems);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/problems
router.post('/problems', async (req, res) => {
  try {
    const data = req.body;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProb = await CodingProblem.create({
      title: data.title,
      slug,
      difficulty: data.difficulty || 'Easy',
      category: data.category || 'Web Development',
      isDebuggingChallenge: Boolean(data.isDebuggingChallenge),
      brokenBugExplanation: data.brokenBugExplanation || '',
      descriptionMarkdown: data.descriptionMarkdown || '',
      examples: data.examples || [],
      constraints: data.constraints || [],
      starterCode: data.starterCode || {
        javascript: '// Write your code here\n',
        python: '# Write your code here\n',
      },
      hints: data.hints || {
        level1Concept: '',
        level2Stronger: '',
        level3Approach: '',
        level4Mentor: '',
      },
      testCases: data.testCases || [],
      tags: data.tags || [data.category || 'Web Development', data.difficulty || 'Easy'],
      acceptanceRate: Number(data.acceptanceRate) || 85,
    });

    // Sync to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('coding_problems').upsert({
          slug: newProb.slug,
          title: newProb.title,
          difficulty: newProb.difficulty,
          category: newProb.category,
          is_debugging_challenge: newProb.isDebuggingChallenge,
          broken_bug_explanation: newProb.brokenBugExplanation,
          description_markdown: newProb.descriptionMarkdown,
          examples: newProb.examples || [],
          constraints: newProb.constraints || [],
          starter_code: newProb.starterCode || {},
          hints: newProb.hints || {},
          test_cases: newProb.testCases || [],
          acceptance_rate: `${newProb.acceptanceRate || 85}%`,
        }, { onConflict: 'slug' });
      } catch (err) {
        console.warn('Supabase problem sync warning:', err);
      }
    }

    res.status(201).json(newProb);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/problems/:id
router.put('/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await CodingProblem.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Problem not found' });

    // Sync to Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('coding_problems').upsert({
          slug: updated.slug,
          title: updated.title,
          difficulty: updated.difficulty,
          category: updated.category,
          is_debugging_challenge: updated.isDebuggingChallenge,
          broken_bug_explanation: updated.brokenBugExplanation,
          description_markdown: updated.descriptionMarkdown,
          examples: updated.examples || [],
          constraints: updated.constraints || [],
          starter_code: updated.starterCode || {},
          hints: updated.hints || {},
          test_cases: updated.testCases || [],
          acceptance_rate: `${updated.acceptanceRate || 85}%`,
        }, { onConflict: 'slug' });
      } catch (err) {
        console.warn('Supabase problem sync warning:', err);
      }
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/problems/:id
router.delete('/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prob = await CodingProblem.findByIdAndDelete(id);
    if (prob && isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('coding_problems').delete().eq('slug', prob.slug);
      } catch (err) {
        console.warn('Supabase problem delete warning:', err);
      }
    }
    res.json({ success: true, message: 'Problem deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 4. ROADMAPS & ROADMAP NODES CRUD
// ============================================================================

// GET /api/admin/roadmaps
router.get('/roadmaps', async (req, res) => {
  try {
    let roadmaps = await Roadmap.find({}).sort({ updatedAt: -1 });
    if (roadmaps.length === 0) {
      // Seed default roadmap track
      const seeded = await Roadmap.create({
        title: 'Web Development Execution Track',
        slug: 'web-development',
        category: 'Web Development',
        targetLevel: 'Beginner',
        estimatedDailyTime: '2 hr/day',
        totalDurationDays: 90,
        totalNodes: 6,
        completedNodes: 1,
        nodes: [
          {
            nodeId: 'node-1',
            stepNumber: 1,
            title: 'Foundations & Architecture',
            subtitle: 'Terminal, Git, Modern Web Architecture',
            description: 'Build terminal fluency, configure Git remote workflows, understand DNS, client-server models, and HTTP headers.',
            category: 'Core',
            status: 'completed',
            estimatedHours: 15,
            skillsCovered: ['Git', 'GitHub', 'CLI', 'HTTP Basics'],
            lessonsCount: 6,
            projectsCount: 1,
            iconName: 'Terminal',
          },
          {
            nodeId: 'node-2',
            stepNumber: 2,
            title: 'HTML5, CSS & ES6+ JavaScript',
            subtitle: 'Modern ES6+, DOM & Responsive Systems',
            description: 'Master semantic HTML5, CSS Grid/Flexbox layouts, array methods, asynchronous promises, and real-time DOM updates.',
            category: 'Frontend Core',
            status: 'in_progress',
            estimatedHours: 35,
            skillsCovered: ['HTML5', 'CSS Grid', 'ES6+ JavaScript', 'Array Methods', 'DOM APIs'],
            lessonsCount: 12,
            projectsCount: 2,
            iconName: 'Code',
          },
          {
            nodeId: 'node-3',
            stepNumber: 3,
            title: 'React 19 & Component Architecture',
            subtitle: 'Hooks, State Management & Tailwind CSS',
            description: 'Build modular user interfaces with React 19 hooks, component composition, and responsive Tailwind design tokens.',
            category: 'Frontend Framework',
            status: 'locked',
            estimatedHours: 40,
            skillsCovered: ['React 19', 'Tailwind CSS', 'Custom Hooks', 'State Management'],
            lessonsCount: 14,
            projectsCount: 3,
            iconName: 'Layout',
          },
        ],
      });
      roadmaps = [seeded];
    }
    res.json(roadmaps);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/roadmaps
router.post('/roadmaps', async (req, res) => {
  try {
    const data = req.body;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const roadmap = await Roadmap.create({
      title: data.title,
      slug,
      category: data.category || 'Web Development',
      targetLevel: data.targetLevel || 'Beginner',
      estimatedDailyTime: data.estimatedDailyTime || '2 hr/day',
      totalDurationDays: Number(data.totalDurationDays) || 90,
      totalNodes: data.nodes ? data.nodes.length : 0,
      completedNodes: 0,
      nodes: data.nodes || [],
    });
    res.status(201).json(roadmap);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/roadmaps/:id
router.put('/roadmaps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.nodes && Array.isArray(data.nodes)) {
      data.totalNodes = data.nodes.length;
      data.completedNodes = data.nodes.filter((n: any) => n.status === 'completed').length;
    }
    const updated = await Roadmap.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Roadmap not found' });

    // Also sync nodes to active user roadmaps in the same category
    if (updated.category) {
      await Roadmap.updateMany(
        { category: updated.category, _id: { $ne: updated._id } },
        {
          title: updated.title,
          targetLevel: updated.targetLevel,
          estimatedDailyTime: updated.estimatedDailyTime,
          totalDurationDays: updated.totalDurationDays,
          nodes: updated.nodes,
          totalNodes: updated.totalNodes,
        }
      );
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/roadmaps/:id
router.delete('/roadmaps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Roadmap.findByIdAndDelete(id);
    res.json({ success: true, message: 'Roadmap deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 5. DAILY TASKS & MISSIONS CRUD
// ============================================================================

// GET /api/admin/missions
router.get('/missions', async (req, res) => {
  try {
    let missions = await DailyMission.find({}).sort({ updatedAt: -1 });
    if (missions.length === 0) {
      // Seed default missions
      const defaultMissions = [
        {
          dayNumber: 1,
          trackTitle: 'Web Development',
          dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          quote: 'Consistency is what transforms average into excellence.',
          tasks: [
            {
              taskId: 'task-web-learn',
              type: 'learn',
              title: 'Learn: Modern ES6+ JavaScript & Functional Immutability',
              durationMinutes: 25,
              durationText: '25 min',
              description: 'Master map(), filter(), reduce() and functional programming paradigms in modern JavaScript.',
              isCompleted: false,
              actionUrl: '/learn',
              proofRequired: false,
            },
            {
              taskId: 'task-web-practice',
              type: 'practice',
              title: 'Practice: Solve "Filter Active Users" algorithmic problem',
              durationMinutes: 20,
              durationText: '20 min',
              description: 'Write pure functions filtering objects by boolean states in the interactive browser sandbox.',
              isCompleted: false,
              actionUrl: '/practice/filter-active-users',
              proofRequired: false,
            },
            {
              taskId: 'task-web-build',
              type: 'build',
              title: 'Build: Construct dynamic DOM event delegation listener',
              durationMinutes: 35,
              durationText: '35 min',
              description: 'Implement a high-performance single-listener list container with event bubbling.',
              isCompleted: false,
              actionUrl: '/projects',
              proofRequired: false,
            },
            {
              taskId: 'task-web-ship',
              type: 'ship',
              title: 'Ship: Commit code and push clean verified changes to GitHub',
              durationMinutes: 10,
              durationText: '10 min',
              description: 'Push your daily work to your remote Git repository and tag your submission.',
              isCompleted: false,
              actionUrl: '/projects',
              proofRequired: true,
            },
          ],
          completedTasksCount: 0,
          isAllCompleted: false,
        },
        {
          dayNumber: 1,
          trackTitle: 'AI & Machine Learning',
          dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          quote: 'Small steps every day lead to massive neural insights.',
          tasks: [
            {
              taskId: 'task-ai-learn',
              type: 'learn',
              title: 'Learn: NumPy Vectorization & SIMD Array Optimization',
              durationMinutes: 30,
              durationText: '30 min',
              description: 'Master fast SIMD array operations, broadcasting rules, and memory layout in NumPy.',
              isCompleted: false,
              actionUrl: '/learn',
              proofRequired: false,
            },
            {
              taskId: 'task-ai-practice',
              type: 'practice',
              title: 'Practice: Implement Cosine Similarity & Vector Normalization',
              durationMinutes: 25,
              durationText: '25 min',
              description: 'Calculate vector angles and dot products in pure Python with unit test validation.',
              isCompleted: false,
              actionUrl: '/practice',
              proofRequired: false,
            },
            {
              taskId: 'task-ai-build',
              type: 'build',
              title: 'Build: Scaffold customer churn prediction dataset pipeline',
              durationMinutes: 45,
              durationText: '45 min',
              description: 'Clean tabular records, handle categorical encoding, and verify baseline ROC-AUC.',
              isCompleted: false,
              actionUrl: '/projects',
              proofRequired: false,
            },
            {
              taskId: 'task-ai-ship',
              type: 'ship',
              title: 'Ship: Push Day 1 pipeline to GitHub repository',
              durationMinutes: 10,
              durationText: '10 min',
              description: 'Publish your notebook / training script and log baseline metrics.',
              isCompleted: false,
              actionUrl: '/projects',
              proofRequired: true,
            },
          ],
          completedTasksCount: 0,
          isAllCompleted: false,
        },
      ];

      for (const m of defaultMissions) {
        await DailyMission.create(m as any);
      }
      missions = await DailyMission.find({}).sort({ updatedAt: -1 });
    }
    res.json(missions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/missions
router.post('/missions', async (req, res) => {
  try {
    const data = req.body;
    const mission = await DailyMission.create({
      trackTitle: data.trackTitle || 'General',
      dayNumber: Number(data.dayNumber) || 1,
      dateString: data.dateString || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      quote: data.quote || 'Small steps lead to extraordinary outcomes.',
      tasks: data.tasks || [],
      completedTasksCount: 0,
      isAllCompleted: false,
    });
    res.status(201).json(mission);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/missions/:id
router.put('/missions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await DailyMission.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Daily Mission not found' });

    // Propagate updated tasks and quote to all active student missions matching this track
    if (updated.trackTitle) {
      await DailyMission.updateMany(
        {
          trackTitle: updated.trackTitle,
          _id: { $ne: updated._id },
        },
        {
          quote: updated.quote,
          tasks: updated.tasks,
        }
      );
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/missions/:id
router.delete('/missions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await DailyMission.findByIdAndDelete(id);
    res.json({ success: true, message: 'Daily Mission removed successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 6. DYNAMIC PRICING MANAGEMENT
// ============================================================================

// GET /api/admin/pricing (Public / Pricing Page)
router.get('/pricing', async (req, res) => {
  try {
    let plans = await PricingPlan.find({});
    if (plans.length === 0) {
      plans = await PricingPlan.create([
        {
          key: 'free',
          name: 'Free',
          priceMonthly: 0,
          priceAnnual: 0,
          currency: '₹',
          tagline: 'Foundations for every ambitious student.',
          features: [
            'Basic diagnostic assessment',
            'Personalized learning roadmap',
            'Daily missions & streak tracking',
            'Core learning curriculum',
            'Basic coding practice sandbox',
            'Community forum access',
          ],
        },
        {
          key: 'pro',
          name: 'Pro',
          priceMonthly: 799,
          priceAnnual: 6999,
          currency: '₹',
          tagline: 'Fast-track your skills, projects & hackathons.',
          isPopular: true,
          features: [
            'All Free features',
            'Advanced AI personalization engine',
            'Full project workspaces with GitHub push',
            'Hackathon Mode with 48h MVP planner',
            'LeetCode-style code editor & multi-language test suites',
            'Debugging lab challenges',
            'Progressive AI hints ("I\'m Stuck")',
            'Verified public Proof of Work portfolio',
          ],
        },
        {
          key: 'mentorship',
          name: 'Mentorship',
          priceMonthly: 2499,
          priceAnnual: 22999,
          currency: '₹',
          tagline: '1:1 guidance from industry engineers & leaders.',
          features: [
            'All Pro features',
            'Two 1:1 mentor sessions per month',
            'Codebase & architecture review',
            'Hackathon pitch & prototype teardown',
            'Direct resume & portfolio critique',
            'Internship & placement interview drills',
          ],
        },
      ]);
    }
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/pricing/:key - update pricing from admin panel
router.put('/pricing/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { priceMonthly, priceAnnual, tagline, features, name } = req.body;

    const updateFields: any = {};
    if (priceMonthly !== undefined) updateFields.priceMonthly = priceMonthly;
    if (priceAnnual !== undefined) updateFields.priceAnnual = priceAnnual;
    if (tagline !== undefined) updateFields.tagline = tagline;
    if (features !== undefined) updateFields.features = features;
    if (name !== undefined) updateFields.name = name;

    const plan = await PricingPlan.findOneAndUpdate(
      { key },
      updateFields,
      { new: true }
    );

    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
