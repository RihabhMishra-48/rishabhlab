import { Router } from 'express';
import mongoose from 'mongoose';
import { College } from '../models/CollegeAndReview';
import { User } from '../models/User';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const router = Router();

// GET /api/college/overview?identifier=...
router.get('/overview', async (req, res) => {
  try {
    const identifier = ((req.query.identifier || req.query.name || req.query.id || '') as string).trim().toLowerCase();
    let allColleges: any[] = [];

    // 1. Fetch real colleges from Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sbColleges, error: sbErr } = await supabase
          .from('colleges')
          .select('*')
          .order('created_at', { ascending: false });

        if (!sbErr && sbColleges && sbColleges.length > 0) {
          allColleges = sbColleges.map((c: any) => ({
            id: c.id,
            _id: c.id,
            name: c.college_name,
            code: c.short_code || (c.college_name ? c.college_name.slice(0, 3).toUpperCase() : 'CAMPUS'),
            location: c.domain || 'India',
            contactEmail: c.contact_email || '',
            departments: Array.isArray(c.departments) ? c.departments : [],
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch colleges error:', e);
      }
    }

    // 2. Fallback to MongoDB if Supabase returned 0 colleges
    if (allColleges.length === 0 && mongoose.connection.readyState === 1) {
      try {
        const mColleges = await College.find({}).sort({ createdAt: -1 });
        if (mColleges && mColleges.length > 0) {
          allColleges = mColleges.map((c: any) => ({
            id: c._id.toString(),
            _id: c._id.toString(),
            name: c.name,
            code: c.code || (c.name ? c.name.slice(0, 3).toUpperCase() : 'CAMPUS'),
            location: c.location || 'India',
            contactEmail: c.contactEmail || '',
            departments: c.departments || [],
          }));
        }
      } catch (e) {
        console.warn('Mongo fetch colleges error:', e);
      }
    }

    // Determine which college to display
    let selectedCollege: any = null;
    if (identifier) {
      selectedCollege = allColleges.find(
        (c) =>
          c.id?.toLowerCase() === identifier ||
          c.name?.toLowerCase() === identifier ||
          c.code?.toLowerCase() === identifier ||
          c.name?.toLowerCase().includes(identifier)
      );
    }
    if (!selectedCollege && allColleges.length > 0) {
      selectedCollege = allColleges[0];
    }

    // Strict Real Data Invariant: If no college is onboarded in the database, return clean empty response
    if (!selectedCollege) {
      return res.json({
        college: null,
        collegesList: [],
        totalEnrolled: 0,
        activeStudents: 0,
        skillDistribution: { webDev: 0, aiMl: 0, dataAnalytics: 0, cybersecurity: 0 },
        enrolledStudents: [],
      });
    }

    // 3. Query REAL enrolled students from profiles
    let enrolledProfiles: any[] = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, email, college_name, degree, year_of_study, target_goal, field_of_interest, created_at');

        if (profs) {
          const colName = selectedCollege.name?.toLowerCase() || '';
          const colCode = selectedCollege.code?.toLowerCase() || '';
          enrolledProfiles = profs.filter((p: any) => {
            const pCol = (p.college_name || '').toLowerCase();
            if (!pCol) return false;
            return (
              pCol === colName ||
              (colName && (pCol.includes(colName) || colName.includes(pCol))) ||
              (colCode && colCode.length > 1 && pCol.includes(colCode))
            );
          });
        }
      } catch (e) {
        console.warn('Supabase profiles query error:', e);
      }
    }

    if (enrolledProfiles.length === 0 && mongoose.connection.readyState === 1) {
      try {
        const colName = selectedCollege.name || '';
        const mUsers = await User.find({
          college: { $regex: new RegExp(colName, 'i') },
        }).select('name email college degree year targetGoal fieldOfInterest createdAt');

        if (mUsers && mUsers.length > 0) {
          enrolledProfiles = mUsers.map((u: any) => ({
            id: u._id.toString(),
            full_name: u.name,
            email: u.email,
            college_name: u.college,
            degree: u.degree,
            year_of_study: u.year,
            target_goal: u.targetGoal || u.fieldOfInterest,
            created_at: u.createdAt,
          }));
        }
      } catch (e) {
        console.warn('Mongo users query error:', e);
      }
    }

    const totalStudents = enrolledProfiles.length;

    // Calculate genuine skill / track distribution from real user profiles
    const tracks = { webDev: 0, aiMl: 0, dataAnalytics: 0, cybersecurity: 0 };
    enrolledProfiles.forEach((p: any) => {
      const g = (p.target_goal || p.field_of_interest || '').toLowerCase();
      if (g.includes('web') || g.includes('full') || g.includes('frontend') || g.includes('backend') || g.includes('software')) {
        tracks.webDev++;
      } else if (g.includes('ai') || g.includes('machine') || g.includes('ml') || g.includes('deep')) {
        tracks.aiMl++;
      } else if (g.includes('data') || g.includes('analytics')) {
        tracks.dataAnalytics++;
      } else if (g.includes('cyber') || g.includes('security')) {
        tracks.cybersecurity++;
      }
    });

    const skillDistribution = {
      webDev: totalStudents > 0 ? Math.round((tracks.webDev / totalStudents) * 100) : 0,
      aiMl: totalStudents > 0 ? Math.round((tracks.aiMl / totalStudents) * 100) : 0,
      dataAnalytics: totalStudents > 0 ? Math.round((tracks.dataAnalytics / totalStudents) * 100) : 0,
      cybersecurity: totalStudents > 0 ? Math.round((tracks.cybersecurity / totalStudents) * 100) : 0,
    };

    res.json({
      college: {
        ...selectedCollege,
        totalStudents,
        activeStudents: totalStudents,
        skillDistribution,
      },
      collegesList: allColleges.map((c) => ({
        id: c.id,
        _id: c.id,
        name: c.name,
        code: c.code,
        location: c.location,
      })),
      enrolledStudents: enrolledProfiles.slice(0, 15).map((p: any) => ({
        id: p.id,
        name: p.full_name || 'Student',
        email: p.email,
        degree: p.degree || 'Engineering',
        year: p.year_of_study || 'Student',
        track: p.target_goal || p.field_of_interest || 'General Track',
      })),
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
