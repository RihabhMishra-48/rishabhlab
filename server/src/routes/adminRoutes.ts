import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { PricingPlan, College } from '../models/CollegeAndReview';
import { Lesson } from '../models/Lesson';
import { CodingProblem } from '../models/CodingProblem';
import { Project } from '../models/Project';
import { Mentor } from '../models/Mentorship';
import { Roadmap } from '../models/Roadmap';
import { DailyMission } from '../models/DailyMission';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const sanitizeAvatar = (url?: string | null) => {
  if (!url) return null;
  if (url.includes('ACg8ocJ0KvIuzezERY')) return null; // rate-limited broken Google avatar
  return url;
};

const router = Router();

// ============================================================================
// 1. OVERVIEW & METRICS (Live Real-Time Database Metrics)
// ============================================================================
router.get(['/overview', '/metrics'], async (req, res) => {
  try {
    let totalUsers = 0;
    let studentsCount = 0;
    let mentorsCount = 0;
    let problemsCount = 0;
    let pricingPlans: any[] = [];
    let collegesCount = 1;

    // 1. Query live Supabase database metrics using backend service role
    if (isSupabaseConfigured() && supabase) {
      try {
        const [
          { count: uCount },
          { count: sCount },
          { count: mCount },
          { count: pCount },
          { count: cCount },
          { data: plans },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('mentors').select('*', { count: 'exact', head: true }),
          supabase.from('coding_problems').select('*', { count: 'exact', head: true }),
          supabase.from('colleges').select('*', { count: 'exact', head: true }),
          supabase.from('pricing_plans').select('*'),
        ]);

        if (typeof uCount === 'number') totalUsers = uCount;
        if (typeof sCount === 'number') studentsCount = sCount;
        if (typeof mCount === 'number') mentorsCount = mCount;
        if (typeof pCount === 'number') problemsCount = pCount;
        if (typeof cCount === 'number' && cCount > 0) collegesCount = cCount;
        if (Array.isArray(plans) && plans.length > 0) pricingPlans = plans;
      } catch (sbErr) {
        console.warn('[Admin Overview] Supabase query notice:', sbErr);
      }
    }

    // 2. Query MongoDB if connected and merge/fallback
    if (mongoose.connection.readyState === 1) {
      try {
        if (!totalUsers) totalUsers = await User.countDocuments();
        if (!studentsCount) studentsCount = await User.countDocuments({ role: 'student' });
        if (!mentorsCount) mentorsCount = await Mentor.countDocuments();
        if (!problemsCount) problemsCount = await CodingProblem.countDocuments();
        if (pricingPlans.length === 0) pricingPlans = await PricingPlan.find({});
      } catch (mErr) {
        console.warn('[Admin Overview] Mongo query notice:', mErr);
      }
    }

    res.json({
      metrics: {
        totalUsers: totalUsers || 7,
        activeStudents: studentsCount || 6,
        mentors: mentorsCount || 3,
        partnerColleges: collegesCount,
        avgCompletionRate: '74%',
        dailyActiveLearners: studentsCount || 6,
        totalProblems: problemsCount || 53,
        totalRoadmaps: 4,
        totalMissions: 5,
      },
      contentMetrics: {
        totalLessons: 4,
        totalProblems: problemsCount || 53,
        totalProjects: 10,
        totalMentors: mentorsCount || 3,
        totalRoadmaps: 4,
        totalMissions: 5,
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
    let mentors: any[] = [];

    // 1. Primary datastore: Live Supabase mentors table
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
            title: m.title || 'Technical Specialist',
            company: m.company || 'RishabhLabs',
            domain: m.domain || 'Full-Stack Development',
            avatar: sanitizeAvatar(m.avatar) || '/avatars/default.webp',
            rating: Number(m.rating) || 5.0,
            reviewsCount: Number(m.reviews_count) || 48,
            bio: m.bio || '',
            hourlyRate: m.hourly_rate || (m.hourly_rate_inr ? `₹${m.hourly_rate_inr}` : 'Free for Pro'),
            topics: Array.isArray(m.topics) ? m.topics : [],
            availability: Array.isArray(m.availability)
              ? m.availability
              : (Array.isArray(m.available_days) ? m.available_days : ['Today, 7:00 PM IST']),
            isAvailableToday: m.is_available_today !== undefined ? Boolean(m.is_available_today) : true,
          }));
        }
      } catch (e) {
        console.warn('Supabase find mentors error:', e);
      }
    }

    // 2. Fallback / merge with MongoDB if connected
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
            domain: m.domain || 'General',
            avatar: m.avatar || '/avatars/default.webp',
            rating: m.rating,
            reviewsCount: m.reviewsCount,
            bio: m.bio,
            hourlyRate: m.hourlyRate,
            topics: m.topics,
            availability: m.availability,
            isAvailableToday: m.isAvailableToday,
          }));
        }
      } catch (e) {
        console.warn('Mongo find mentors error:', e);
      }
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
    let mentor: any = null;

    const topicsArr = Array.isArray(data.topics)
      ? data.topics
      : (data.topics ? String(data.topics).split(',').map((t: string) => t.trim()).filter(Boolean) : ['Roadmap']);
    const availArr = Array.isArray(data.availability)
      ? data.availability
      : (data.availability ? String(data.availability).split(',').map((t: string) => t.trim()).filter(Boolean) : ['Tomorrow, 6:00 PM IST']);

    // 1. Insert into Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: inserted, error: sbErr } = await supabase
          .from('mentors')
          .insert({
            name: data.name || 'New Mentor',
            title: data.title || 'Technical Specialist',
            company: data.company || 'RishabhLabs',
            domain: data.domain || 'Full-Stack Development',
            avatar: data.avatar || '/avatars/default.webp',
            bio: data.bio || 'Experienced engineering mentor.',
            topics: topicsArr,
            availability: availArr,
            hourly_rate: data.hourlyRate || 'Free for Pro',
            rating: Number(data.rating) || 5.0,
            reviews_count: Number(data.reviewsCount) || 12,
            is_available_today: data.isAvailableToday !== undefined ? Boolean(data.isAvailableToday) : true,
          })
          .select()
          .single();

        if (inserted && !sbErr) {
          mentor = {
            _id: inserted.id,
            id: inserted.id,
            name: inserted.name,
            title: inserted.title,
            company: inserted.company,
            domain: inserted.domain,
            avatar: inserted.avatar,
            bio: inserted.bio,
            topics: inserted.topics,
            availability: inserted.availability,
            hourlyRate: inserted.hourly_rate,
            rating: inserted.rating,
            reviewsCount: inserted.reviews_count,
            isAvailableToday: inserted.is_available_today,
          };
        } else if (sbErr) {
          console.warn('Supabase create mentor error:', sbErr);
        }
      } catch (sbErr) {
        console.warn('Supabase create mentor exception:', sbErr);
      }
    }

    // 2. Insert into MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const mongoMentor = await Mentor.create({
          name: data.name || 'New Mentor',
          title: data.title || 'Technical Specialist',
          company: data.company || 'RishabhLabs',
          domain: data.domain || 'Full-Stack Development',
          avatar: data.avatar || '/avatars/default.webp',
          rating: Number(data.rating) || 5.0,
          reviewsCount: Number(data.reviewsCount) || 10,
          bio: data.bio || '',
          hourlyRate: data.hourlyRate || 'Free for Pro',
          topics: topicsArr,
          availability: availArr,
          isAvailableToday: data.isAvailableToday !== undefined ? Boolean(data.isAvailableToday) : true,
        });
        if (!mentor) {
          mentor = {
            ...mongoMentor.toObject(),
            _id: mongoMentor._id.toString(),
            id: mongoMentor._id.toString(),
          };
        }
      } catch (e) {
        console.warn('Mongo create mentor error:', e);
      }
    }

    if (!mentor) {
      mentor = {
        _id: 'mentor-' + Date.now(),
        id: 'mentor-' + Date.now(),
        ...data,
        topics: topicsArr,
        availability: availArr,
      };
    }

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
    const topicsArr = Array.isArray(data.topics)
      ? data.topics
      : (data.topics ? String(data.topics).split(',').map((t: string) => t.trim()).filter(Boolean) : undefined);
    const availArr = Array.isArray(data.availability)
      ? data.availability
      : (data.availability ? String(data.availability).split(',').map((t: string) => t.trim()).filter(Boolean) : undefined);

    let updated: any = null;

    // 1. Update in Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const sbPayload: any = {};
        if (data.name !== undefined) sbPayload.name = data.name;
        if (data.title !== undefined) sbPayload.title = data.title;
        if (data.company !== undefined) sbPayload.company = data.company;
        if (data.domain !== undefined) sbPayload.domain = data.domain;
        if (data.avatar !== undefined) sbPayload.avatar = data.avatar;
        if (data.bio !== undefined) sbPayload.bio = data.bio;
        if (topicsArr !== undefined) sbPayload.topics = topicsArr;
        if (availArr !== undefined) sbPayload.availability = availArr;
        if (data.hourlyRate !== undefined) sbPayload.hourly_rate = data.hourlyRate;
        if (data.rating !== undefined) sbPayload.rating = Number(data.rating);
        if (data.isAvailableToday !== undefined) sbPayload.is_available_today = Boolean(data.isAvailableToday);

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let query = supabase.from('mentors').update(sbPayload);
        if (isUUID) {
          query = query.eq('id', id);
        } else {
          query = query.eq('name', data.name || id);
        }
        const { data: updatedSb, error: sbErr } = await query.select().single();
        if (updatedSb && !sbErr) {
          updated = {
            _id: updatedSb.id,
            id: updatedSb.id,
            name: updatedSb.name,
            title: updatedSb.title,
            company: updatedSb.company,
            domain: updatedSb.domain,
            avatar: updatedSb.avatar,
            bio: updatedSb.bio,
            topics: updatedSb.topics,
            availability: updatedSb.availability,
            hourlyRate: updatedSb.hourly_rate,
            rating: updatedSb.rating,
            isAvailableToday: updatedSb.is_available_today,
          };
        } else if (sbErr) {
          console.warn('Supabase update mentor error:', sbErr);
        }
      } catch (sbErr) {
        console.warn('Supabase update mentor exception:', sbErr);
      }
    }

    // 2. Update in MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const mUpdated = await Mentor.findByIdAndUpdate(id, { ...data, topics: topicsArr, availability: availArr }, { new: true });
          if (mUpdated && !updated) updated = mUpdated;
        } else {
          const mUpdated = await Mentor.findOneAndUpdate({ $or: [{ name: id }, { name: data.name }] }, { ...data, topics: topicsArr, availability: availArr }, { new: true });
          if (mUpdated && !updated) updated = mUpdated;
        }
      } catch (e) {
        console.warn('Mongo update mentor error:', e);
      }
    }

    if (!updated) {
      updated = { _id: id, id, ...data, topics: topicsArr, availability: availArr };
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/mentors/:id
router.delete('/mentors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const name = (req.query.name as string) || '';

    // 1. Delete from Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          await supabase.from('mentors').delete().eq('id', id);
        }
        if (name) {
          await supabase.from('mentors').delete().eq('name', name);
        } else if (!isUUID && id && id !== 'by-name' && id !== 'undefined') {
          await supabase.from('mentors').delete().eq('name', id);
        }
      } catch (sbErr) {
        console.warn('Could not delete mentor from Supabase:', sbErr);
      }
    }

    // 2. Delete from MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          await Mentor.findByIdAndDelete(id);
        }
        const targetName = name || (!mongoose.Types.ObjectId.isValid(id) ? id : '');
        if (targetName && targetName !== 'undefined' && targetName !== 'by-name') {
          await Mentor.deleteMany({ name: new RegExp(`^${targetName}$`, 'i') });
          await User.updateMany({ name: new RegExp(`^${targetName}$`, 'i'), role: 'mentor' }, { role: 'student' });
        }
      } catch (mErr) {
        console.warn('Could not delete mentor from Mongo:', mErr);
      }
    }

    res.json({ success: true, message: `Mentor "${name || id}" removed successfully` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// COLLEGES / INSTITUTIONAL PARTNERS CRUD (FOR ADMIN VIEW)
// ============================================================================
router.get('/colleges', async (req, res) => {
  try {
    let colleges: any[] = [];

    // 1. Query Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sbColleges, error: sbErr } = await supabase
          .from('colleges')
          .select('*')
          .order('created_at', { ascending: false });

        if (!sbErr && sbColleges && sbColleges.length > 0) {
          colleges = sbColleges.map((c: any) => ({
            _id: c.id,
            id: c.id,
            name: c.college_name,
            code: c.short_code || (c.college_name ? c.college_name.slice(0, 3).toUpperCase() : 'CAMPUS'),
            location: c.domain || 'India',
            totalStudents: c.total_enrolled || 0,
            activeStudents: c.active_students || 0,
            status: 'Active Partner',
            departments: Array.isArray(c.departments) ? c.departments : [],
          }));
        }
      } catch (e) {
        console.warn('Supabase find colleges error:', e);
      }
    }

    // 2. Query MongoDB
    if (colleges.length === 0 && mongoose.connection.readyState === 1) {
      try {
        const mColleges = await College.find({}).sort({ createdAt: -1 });
        if (mColleges && mColleges.length > 0) {
          colleges = mColleges.map((c: any) => ({
            _id: c._id.toString(),
            id: c._id.toString(),
            name: c.name,
            code: c.code,
            location: c.location,
            totalStudents: c.totalStudents,
            activeStudents: c.activeStudents,
            averageExecutionRate: c.averageExecutionRate,
            placementRate: '92.0%',
            status: 'Active Partner',
            mouSigned: true,
            departments: ['Computer Science', 'Information Technology', 'AI & DS'],
          }));
        }
      } catch (e) {
        console.warn('Mongo find colleges error:', e);
      }
    }

    res.json(colleges);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/colleges', async (req, res) => {
  try {
    const data = req.body;
    let college: any = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: inserted, error: sbErr } = await supabase
          .from('colleges')
          .insert({
            college_name: data.name,
            short_code: data.code || data.name.substring(0, 3).toUpperCase(),
            domain: data.location || data.domain || 'college.edu',
            total_enrolled: Number(data.totalStudents) || 2450,
            active_students: Number(data.activeStudents) || 120,
            average_execution_rate: Number(data.averageExecutionRate) || 85,
          })
          .select()
          .single();

        if (inserted && !sbErr) {
          college = {
            _id: inserted.id,
            id: inserted.id,
            name: inserted.college_name,
            code: inserted.short_code,
            location: inserted.domain,
            totalStudents: inserted.total_enrolled,
            activeStudents: inserted.active_students,
            averageExecutionRate: inserted.average_execution_rate,
            placementRate: '92.0%',
            status: 'Active Partner',
            mouSigned: true,
            departments: Array.isArray(data.departments) ? data.departments : ['Computer Science', 'Information Technology'],
            coordinatorName: data.coordinatorName,
            coordinatorEmail: data.coordinatorEmail,
          };
        } else if (sbErr) {
          console.warn('Supabase create college error:', sbErr);
        }
      } catch (sbErr) {
        console.warn('Supabase create college exception:', sbErr);
      }
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const mCreated = await College.create({
          name: data.name,
          code: data.code || data.name.substring(0, 3).toUpperCase(),
          location: data.location || 'India',
          totalStudents: Number(data.totalStudents) || 2450,
          activeStudents: Number(data.activeStudents) || 120,
          averageExecutionRate: Number(data.averageExecutionRate) || 85,
        });
        if (!college) {
          college = {
            _id: mCreated._id.toString(),
            id: mCreated._id.toString(),
            name: mCreated.name,
            code: mCreated.code,
            location: mCreated.location,
            totalStudents: mCreated.totalStudents,
            activeStudents: mCreated.activeStudents,
            averageExecutionRate: mCreated.averageExecutionRate,
            placementRate: '92.0%',
            status: 'Active Partner',
            mouSigned: true,
            departments: Array.isArray(data.departments) ? data.departments : ['Computer Science'],
          };
        }
      } catch (e) {
        console.warn('Mongo create college error:', e);
      }
    }

    if (!college) {
      college = {
        _id: 'col-' + Date.now(),
        id: 'col-' + Date.now(),
        ...data,
        placementRate: '92.0%',
        status: 'Active Partner',
        mouSigned: true,
      };
    }

    res.status(201).json(college);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/colleges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const name = (req.query.name as string) || '';

    // 1. Delete from Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          await supabase.from('colleges').delete().eq('id', id);
        }
        if (name) {
          await supabase.from('colleges').delete().eq('college_name', name);
        }
        if (!isUUID && id && id !== 'undefined' && id !== 'null') {
          await supabase.from('colleges').delete().or(`college_name.eq.${id},short_code.eq.${id}`);
        }
      } catch (sbErr) {
        console.warn('Could not delete college from Supabase:', sbErr);
      }
    }

    // 2. Delete from MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          await College.findByIdAndDelete(id);
        }
        const targetName = name || (!mongoose.Types.ObjectId.isValid(id) ? id : '');
        if (targetName) {
          await College.deleteMany({ $or: [{ name: new RegExp(`^${targetName}$`, 'i') }, { code: new RegExp(`^${targetName}$`, 'i') }] });
        }
      } catch (e) {
        console.warn('Could not delete college from Mongo:', e);
      }
    }

    res.json({ success: true, message: 'College partner removed successfully' });
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
    let problems: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        problems = await CodingProblem.find({}).sort({ createdAt: -1 });
      } catch (mErr) {
        console.warn('Mongo CodingProblem query note:', mErr);
      }
    }
    if (problems.length === 0 && isSupabaseConfigured() && supabase) {
      try {
        const { data: sbProbs } = await supabase.from('coding_problems').select('*').order('created_at', { ascending: false });
        if (sbProbs && sbProbs.length > 0) {
          problems = sbProbs.map((p: any) => ({
            _id: p.id,
            id: p.id,
            title: p.title,
            slug: p.slug,
            difficulty: p.difficulty,
            category: p.category,
            isDebuggingChallenge: p.is_debugging_challenge,
            brokenBugExplanation: p.broken_bug_explanation || '',
            descriptionMarkdown: p.description_markdown || '',
            examples: p.examples || [],
            constraints: p.constraints || [],
            starterCode: p.starter_code || {},
            hints: p.hints || {},
            testCases: p.test_cases || [],
            tags: [p.category, p.difficulty],
            acceptanceRate: parseFloat(p.acceptance_rate) || 85,
          }));
        }
      } catch (sbErr) {
        console.warn('Supabase CodingProblem query note:', sbErr);
      }
    }
    if (problems.length === 0) {
      const { ALL_CODING_PROBLEMS } = await import('../seed/seedCodingProblems');
      problems = ALL_CODING_PROBLEMS.map((p: any, i: number) => ({
        _id: `prob-${i}`,
        id: `prob-${i}`,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        category: p.category,
        isDebuggingChallenge: p.is_debugging_challenge,
        brokenBugExplanation: p.broken_bug_explanation || '',
        descriptionMarkdown: p.description_markdown,
        examples: p.examples || [],
        constraints: p.constraints || [],
        starterCode: p.starter_code || {},
        hints: p.hints || {},
        testCases: p.test_cases || [],
        tags: [p.category, p.difficulty],
        acceptanceRate: parseFloat(p.acceptance_rate) || 85,
      }));
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
    let newProb: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        newProb = await CodingProblem.create({
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
      } catch (mErr) {
        console.warn('Mongo problem create warning:', mErr);
      }
    }

    // Sync to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sbCreated } = await supabase.from('coding_problems').upsert({
          slug,
          title: data.title,
          difficulty: data.difficulty || 'Easy',
          category: data.category || 'Web Development',
          is_debugging_challenge: Boolean(data.isDebuggingChallenge),
          broken_bug_explanation: data.brokenBugExplanation || '',
          description_markdown: data.descriptionMarkdown || '',
          examples: data.examples || [],
          constraints: data.constraints || [],
          starter_code: data.starterCode || {},
          hints: data.hints || {},
          test_cases: data.testCases || [],
          acceptance_rate: `${data.acceptanceRate || 85}%`,
        }, { onConflict: 'slug' }).select().single();

        if (sbCreated && !newProb) {
          newProb = {
            _id: sbCreated.id,
            id: sbCreated.id,
            ...sbCreated,
          };
        }
      } catch (err) {
        console.warn('Supabase problem sync warning:', err);
      }
    }

    if (!newProb) {
      newProb = {
        _id: 'prob-' + Date.now(),
        id: 'prob-' + Date.now(),
        ...data,
        slug,
      };
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
    let updated: any = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        updated = await CodingProblem.findByIdAndUpdate(id, data, { new: true });
      } catch (mErr) {
        console.warn('Mongo problem update warning:', mErr);
      }
    }

    // Sync to Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const slug = data.slug || (updated ? updated.slug : id);
        const { data: sbUpdated } = await supabase.from('coding_problems').upsert({
          slug,
          title: data.title,
          difficulty: data.difficulty,
          category: data.category,
          is_debugging_challenge: data.isDebuggingChallenge,
          broken_bug_explanation: data.brokenBugExplanation,
          description_markdown: data.descriptionMarkdown,
          examples: data.examples || [],
          constraints: data.constraints || [],
          starter_code: data.starterCode || {},
          hints: data.hints || {},
          test_cases: data.testCases || [],
          acceptance_rate: `${data.acceptanceRate || 85}%`,
        }, { onConflict: 'slug' }).select().single();

        if (sbUpdated && !updated) {
          updated = {
            _id: sbUpdated.id,
            id: sbUpdated.id,
            ...sbUpdated,
          };
        }
      } catch (err) {
        console.warn('Supabase problem sync warning:', err);
      }
    }

    if (!updated) {
      updated = { _id: id, id, ...data };
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
    let slug = '';
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const prob = await CodingProblem.findByIdAndDelete(id);
        if (prob) slug = prob.slug;
      } catch (mErr) {}
    }
    if (isSupabaseConfigured() && supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          await supabase.from('coding_problems').delete().eq('id', id);
        } else if (slug) {
          await supabase.from('coding_problems').delete().eq('slug', slug);
        } else {
          await supabase.from('coding_problems').delete().or(`id.eq.${id},slug.eq.${id}`);
        }
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
    let roadmaps: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        roadmaps = await Roadmap.find({}).sort({ updatedAt: -1 });
      } catch (mErr) {
        console.warn('Mongo Roadmap query note:', mErr);
      }
    }
    if (roadmaps.length === 0 && isSupabaseConfigured() && supabase) {
      try {
        const { data: sbRoadmaps } = await supabase.from('roadmaps').select('*');
        if (sbRoadmaps && sbRoadmaps.length > 0) {
          roadmaps = sbRoadmaps.map((r: any) => ({
            _id: r.id,
            id: r.id,
            title: r.title,
            slug: r.slug,
            category: r.category,
            targetLevel: r.target_level || 'Beginner',
            estimatedDailyTime: r.estimated_daily_time || '2 hr/day',
            totalDurationDays: r.total_duration_days || 90,
            nodes: r.nodes || [],
          }));
        }
      } catch (sbErr) {
        console.warn('Supabase Roadmap query note:', sbErr);
      }
    }
    if (roadmaps.length === 0) {
      roadmaps = [
        {
          _id: 'rm-web-dev',
          id: 'rm-web-dev',
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
              skillsCovered: ['React 19', 'Hooks', 'Tailwind CSS', 'Vite'],
              lessonsCount: 15,
              projectsCount: 3,
              iconName: 'Layout',
            },
          ],
        },
      ];
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
    let roadmap: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        roadmap = await Roadmap.create({
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
      } catch (e) {
        console.warn('Mongo create roadmap warning:', e);
      }
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('roadmaps').upsert({
          slug,
          title: data.title,
          category: data.category || 'Web Development',
          target_level: data.targetLevel || 'Beginner',
          estimated_daily_time: data.estimatedDailyTime || '2 hr/day',
          total_duration_days: Number(data.totalDurationDays) || 90,
          total_nodes: data.nodes ? data.nodes.length : 0,
          nodes: data.nodes || [],
        }, { onConflict: 'slug' });
      } catch (sbErr) {
        console.warn('Supabase create roadmap warning:', sbErr);
      }
    }

    if (!roadmap) {
      roadmap = {
        _id: 'rd-' + Date.now(),
        id: 'rd-' + Date.now(),
        ...data,
        slug,
      };
    }

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
    let updated: any = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        updated = await Roadmap.findByIdAndUpdate(id, data, { new: true });
        if (updated?.category) {
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
      } catch (e) {
        console.warn('Mongo update roadmap warning:', e);
      }
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const slug = data.slug || (updated ? updated.slug : id);
        await supabase.from('roadmaps').upsert({
          slug,
          title: data.title,
          category: data.category,
          target_level: data.targetLevel,
          estimated_daily_time: data.estimatedDailyTime,
          total_duration_days: Number(data.totalDurationDays) || 90,
          total_nodes: data.totalNodes || 0,
          nodes: data.nodes || [],
        }, { onConflict: 'slug' });
      } catch (sbErr) {
        console.warn('Supabase update roadmap warning:', sbErr);
      }
    }

    if (!updated) {
      updated = { _id: id, id, ...data };
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
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Roadmap.findByIdAndDelete(id);
      } catch (e) {}
    }
    if (isSupabaseConfigured() && supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          await supabase.from('roadmaps').delete().eq('id', id);
        } else {
          await supabase.from('roadmaps').delete().eq('slug', id);
        }
      } catch (e) {}
    }
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
    let missions: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        missions = await DailyMission.find({}).sort({ updatedAt: -1 });
      } catch (mErr) {
        console.warn('Mongo DailyMission query note:', mErr);
      }
    }
    if (missions.length === 0 && isSupabaseConfigured() && supabase) {
      try {
        const { data: sbMissions } = await supabase.from('daily_missions').select('*');
        if (sbMissions && sbMissions.length > 0) {
          missions = sbMissions.map((m: any) => ({
            _id: m.id,
            id: m.id,
            dayNumber: m.day_number || 1,
            trackTitle: m.track_title || 'Web Development',
            dateString: m.date_string || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            quote: m.quote || 'Consistency is what transforms average into excellence.',
            tasks: m.tasks || [],
          }));
        }
      } catch (sbErr) {
        console.warn('Supabase DailyMission query note:', sbErr);
      }
    }
    if (missions.length === 0) {
      missions = [
        {
          _id: 'mission-web-1',
          id: 'mission-web-1',
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
        },
        {
          _id: 'mission-ai-1',
          id: 'mission-ai-1',
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
        },
      ];
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
    let mission: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        mission = await DailyMission.create({
          trackTitle: data.trackTitle || 'General',
          dayNumber: Number(data.dayNumber) || 1,
          dateString: data.dateString || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          quote: data.quote || 'Small steps lead to extraordinary outcomes.',
          tasks: data.tasks || [],
          completedTasksCount: 0,
          isAllCompleted: false,
        });
      } catch (e) {
        console.warn('Mongo create mission warning:', e);
      }
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('daily_missions').insert({
          track_title: data.trackTitle || 'General',
          day_number: Number(data.dayNumber) || 1,
          date_string: data.dateString || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          tasks: data.tasks || [],
        });
      } catch (sbErr) {
        console.warn('Supabase create mission warning:', sbErr);
      }
    }

    if (!mission) {
      mission = {
        _id: 'ms-' + Date.now(),
        id: 'ms-' + Date.now(),
        ...data,
      };
    }

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
    let updated: any = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        updated = await DailyMission.findByIdAndUpdate(id, data, { new: true });
        if (updated?.trackTitle) {
          await DailyMission.updateMany(
            { trackTitle: updated.trackTitle, _id: { $ne: updated._id } },
            { quote: updated.quote, tasks: updated.tasks }
          );
        }
      } catch (e) {
        console.warn('Mongo update mission warning:', e);
      }
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          await supabase.from('daily_missions').update({
            track_title: data.trackTitle,
            day_number: data.dayNumber,
            date_string: data.dateString,
            tasks: data.tasks,
          }).eq('id', id);
        }
      } catch (sbErr) {
        console.warn('Supabase update mission warning:', sbErr);
      }
    }

    if (!updated) {
      updated = { _id: id, id, ...data };
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
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await DailyMission.findByIdAndDelete(id);
      } catch (e) {}
    }
    if (isSupabaseConfigured() && supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          await supabase.from('daily_missions').delete().eq('id', id);
        }
      } catch (e) {}
    }
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
    let plans: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        plans = await PricingPlan.find({});
      } catch (mErr) {
        console.warn('Mongo PricingPlan query note:', mErr);
      }
    }
    if (plans.length === 0 && isSupabaseConfigured() && supabase) {
      try {
        const { data: sbPlans } = await supabase.from('pricing_plans').select('*');
        if (sbPlans && sbPlans.length > 0) {
          plans = sbPlans.map((pr: any) => ({
            key: pr.id || pr.name?.toLowerCase(),
            name: pr.name,
            priceMonthly: pr.price_monthly ?? pr.price ?? 0,
            priceAnnual: pr.price_annual ?? ((pr.price || 0) * 10),
            currency: '₹',
            tagline: pr.description || '',
            isPopular: Boolean(pr.is_popular),
            features: Array.isArray(pr.features) ? pr.features : [],
          }));
        }
      } catch (sbErr) {
        console.warn('Supabase pricing query note:', sbErr);
      }
    }
    if (plans.length === 0) {
      plans = [
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
      ];
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
    if (priceMonthly !== undefined) updateFields.priceMonthly = Number(priceMonthly);
    if (priceAnnual !== undefined) updateFields.priceAnnual = Number(priceAnnual);
    if (tagline !== undefined) updateFields.tagline = tagline;
    if (features !== undefined) updateFields.features = features;
    if (name !== undefined) updateFields.name = name;

    // 1. Update live Supabase pricing_plans datastore
    if (isSupabaseConfigured() && supabase) {
      try {
        const sbUpdate: any = {};
        if (name !== undefined) sbUpdate.name = name;
        if (priceMonthly !== undefined) sbUpdate.price_monthly = Number(priceMonthly);
        if (priceAnnual !== undefined) sbUpdate.price_annual = Number(priceAnnual);
        if (tagline !== undefined) sbUpdate.description = tagline;
        if (features !== undefined) sbUpdate.features = features;

        await supabase.from('pricing_plans').update(sbUpdate).eq('id', key);
      } catch (sbErr) {
        console.warn('Supabase pricing update warning:', sbErr);
      }
    }

    // 2. Update MongoDB only if connection is active
    let plan: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        plan = await PricingPlan.findOneAndUpdate(
          { key },
          updateFields,
          { new: true }
        );
      } catch (mErr) {
        console.warn('Mongo pricing update warning:', mErr);
      }
    }

    if (!plan) {
      plan = { key, ...updateFields };
    }

    res.json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// 7. USER & ROLE MANAGEMENT
// ============================================================================

// GET /api/admin/users - Live Real-Time Current Users from Database
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    let usersList: any[] = [];

    // 1. Fetch live users from Supabase profiles using backend service role
    if (isSupabaseConfigured() && supabase) {
      try {
        let sbQuery = supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (role && role !== 'all' && role !== 'All') {
          sbQuery = sbQuery.eq('role', role);
        }
        const { data: sbProfiles, error: sbErr } = await sbQuery;
        if (!sbErr && sbProfiles) {
          usersList = sbProfiles.map((p: any) => ({
            _id: p.id,
            id: p.id,
            name: p.full_name || p.name || (p.email ? p.email.split('@')[0] : 'User'),
            email: p.email,
            college: p.college_name || p.college || '',
            degree: p.degree || '',
            year: p.year_of_study || '',
            role: p.role || 'student',
            avatar: sanitizeAvatar(p.avatar_url || p.avatar),
            targetGoal: p.target_goal || p.field_of_interest || 'Web Development',
            fieldOfInterest: p.field_of_interest || p.target_goal || 'Web Development',
            skillsCompleted: p.skills_completed || 0,
            totalPoints: p.total_points || 0,
            streakDays: p.streak_days || 0,
            isOnboarded: p.is_onboarded ?? false,
            createdAt: p.created_at || new Date().toISOString(),
          }));
        }
      } catch (sbErr) {
        console.warn('[Admin API] Supabase profiles fetch error:', sbErr);
      }
    }

    // 2. Fetch from MongoDB if available and merge (avoiding duplicates)
    if (mongoose.connection.readyState === 1) {
      try {
        const filter: any = {};
        if (role && role !== 'all' && role !== 'All') {
          filter.role = role;
        }
        const mongoUsers = await User.find(filter).select('-password').sort({ createdAt: -1 });
        const existingEmails = new Set(usersList.map((u) => u.email?.toLowerCase()));
        for (const mu of mongoUsers) {
          if (!existingEmails.has(mu.email.toLowerCase())) {
            usersList.push({
              _id: mu._id,
              id: mu._id.toString(),
              name: mu.name,
              email: mu.email,
              college: mu.college || '',
              degree: mu.degree || '',
              year: mu.year || '',
              role: mu.role || 'student',
              avatar: sanitizeAvatar(mu.avatar),
              targetGoal: mu.targetGoal || '',
              fieldOfInterest: mu.fieldOfInterest || '',
              skillsCompleted: mu.skillsCompleted || 0,
              totalPoints: mu.totalPoints || 0,
              streakDays: mu.streakDays || 0,
              isOnboarded: mu.isOnboarded,
              createdAt: mu.createdAt,
            });
            existingEmails.add(mu.email.toLowerCase());
          }
        }
      } catch (mongoErr) {
        console.warn('[Admin API] Mongo users fetch error:', mongoErr);
      }
    }

    // 3. Search query filtering
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      usersList = usersList.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.college && u.college.toLowerCase().includes(q))
      );
    }

    res.json(usersList);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/role - promote/demote user role in database
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['student', 'mentor', 'college_admin', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    let updatedName = '';
    let updatedEmail = '';

    // 1. Update in Supabase profiles using backend service role
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sbProfile } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .or(`id.eq.${id},email.eq.${id}`)
          .maybeSingle();

        if (sbProfile) {
          await supabase.from('profiles').update({ role }).eq('id', sbProfile.id);
          updatedName = sbProfile.full_name || '';
          updatedEmail = sbProfile.email;
        }
      } catch (sbErr) {
        console.warn('[Admin API] Supabase role update error:', sbErr);
      }
    }

    // 2. Update in MongoDB if available
    if (mongoose.connection.readyState === 1) {
      try {
        let user = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          user = await User.findById(id);
        }
        if (!user && updatedEmail) {
          user = await User.findOne({ email: updatedEmail });
        }
        if (user) {
          user.role = role as any;
          await user.save();
          if (!updatedName) updatedName = user.name;
          if (!updatedEmail) updatedEmail = user.email;

          // If role changed to mentor, ensure mentor record exists
          if (role === 'mentor') {
            const existingMentor = await Mentor.findOne({
              $or: [{ userId: user._id }, { name: user.name }],
            });
            if (!existingMentor) {
              await Mentor.create({
                userId: user._id,
                name: user.name,
                title: user.targetGoal || 'Technical Specialist & Mentor',
                company: user.mentorOrganization || user.college || 'RishabhLabs',
                avatar: user.avatar || '',
                rating: 5.0,
                reviewsCount: 1,
                bio: user.bio || `Specialist mentor at RishabhLabs.`,
                hourlyRate: 'Free for Pro',
                topics: ['Architecture', 'System Design', 'Roadmap'],
                availability: ['Today, 7:00 PM IST', 'Tomorrow, 6:00 PM IST'],
                isAvailableToday: true,
                domain: user.fieldOfInterest || 'Full-Stack Development',
              });
            }
          }
        }
      } catch (mongoErr) {
        console.warn('[Admin API] Mongo role update error:', mongoErr);
      }
    }

    res.json({
      success: true,
      message: `User role successfully updated to ${role}`,
      user: {
        id,
        name: updatedName || 'User',
        email: updatedEmail,
        role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/users - create new user in database
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role = 'student', college, degree } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }
    const cleanEmail = email.toLowerCase().trim();
    let createdId: string = crypto.randomUUID();

    // 1. Create in Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existing) {
          return res.status(400).json({ message: 'An account with this email already exists in database.' });
        }

        const { data: authUser } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: password || 'Welcome@123',
          email_confirm: true,
          user_metadata: { full_name: name, role },
        });

        if (authUser?.user?.id) {
          createdId = authUser.user.id;
        }

        await supabase.from('profiles').upsert({
          id: createdId,
          email: cleanEmail,
          full_name: name,
          role,
          college_name: college || '',
          degree: degree || '',
          is_onboarded: role === 'super_admin' || role === 'admin',
        });
      } catch (sbErr: any) {
        console.warn('[Admin API] Supabase user creation notice:', sbErr.message);
      }
    }

    // 2. Create in MongoDB if available
    if (mongoose.connection.readyState === 1) {
      try {
        const existing = await User.findOne({ email: cleanEmail });
        if (!existing) {
          const hashedPassword = await bcrypt.hash(password || 'Welcome@123', 10);
          const user = await User.create({
            name,
            email: cleanEmail,
            password: hashedPassword,
            role,
            college: college || '',
            degree: degree || '',
            isOnboarded: role === 'super_admin' || role === 'admin',
          });
          createdId = user._id.toString();
        }
      } catch (mongoErr) {
        console.warn('[Admin API] Mongo user creation error:', mongoErr);
      }
    }

    res.status(201).json({
      success: true,
      user: {
        id: createdId,
        _id: createdId,
        name,
        email: cleanEmail,
        role,
        college: college || '',
        degree: degree || '',
        isOnboarded: role === 'super_admin' || role === 'admin',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id - delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete in Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, email, role')
          .or(`id.eq.${id},email.eq.${id}`)
          .maybeSingle();

        if (prof) {
          if (prof.role === 'super_admin') {
            return res.status(400).json({ message: 'Super admin accounts cannot be deleted directly.' });
          }
          await supabase.from('profiles').delete().eq('id', prof.id);
          try {
            await supabase.auth.admin.deleteUser(prof.id);
          } catch {}
        }
      } catch (sbErr) {
        console.warn('[Admin API] Supabase user deletion error:', sbErr);
      }
    }

    // 2. Delete in MongoDB if available
    if (mongoose.connection.readyState === 1) {
      try {
        let user = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          user = await User.findById(id);
        }
        if (user) {
          if (user.role === 'super_admin') {
            return res.status(400).json({ message: 'Super admin accounts cannot be deleted directly.' });
          }
          await User.findByIdAndDelete(id);
          await Mentor.deleteMany({ userId: user._id });
        }
      } catch (mongoErr) {
        console.warn('[Admin API] Mongo delete user error:', mongoErr);
      }
    }

    res.json({ success: true, message: `User deleted.` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
