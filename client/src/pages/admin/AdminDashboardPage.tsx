import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, hasAuthToken } from '../../services/api';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../../components/common/UserAvatar';
import { CustomDropdown, DropdownOption } from '../../components/common/CustomDropdown';
import { PricingPlan } from '../../types';

const ROLE_OPTIONS: DropdownOption[] = [
  { value: 'student', label: 'Student (Standard Learner)' },
  { value: 'mentor', label: 'Mentor (1:1 Office Hours & Reviews)' },
  { value: 'college_admin', label: 'College Admin (Campus Portal)' },
  { value: 'super_admin', label: 'Super Admin (Full Authority)' },
];
import {
  ShieldAlert,
  Users,
  Code2,
  Compass,
  CheckCircle2,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Save,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  Clock,
  Star,
  FileCode,
  Tag,
  Calendar,
  AlertCircle,
  UserCog,
  GraduationCap,
  UserCheck,
  RefreshCw,
  Building2
} from 'lucide-react';

type AdminTab = 'users' | 'mentors' | 'colleges' | 'questions' | 'roadmaps' | 'tasks' | 'pricing' | 'overview';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Data states
  const [adminData, setAdminData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [collegeModalOpen, setCollegeModalOpen] = useState(false);
  const [newCollege, setNewCollege] = useState({
    name: '',
    code: '',
    location: '',
    coordinatorName: '',
    coordinatorEmail: '',
    activeStudents: 120,
    departments: 'Computer Science, Information Technology, AI & DS',
  });
  const [problems, setProblems] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // User management states
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState<string>('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    college: '',
    degree: '',
  });
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Modal states
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<any | null>(null);

  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any | null>(null);

  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<any | null>(null);
  const [editingNodeIndex, setEditingNodeIndex] = useState<number | null>(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<any | null>(null);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);

  // Pricing edit
  const [editingPlanKey, setEditingPlanKey] = useState<string | null>(null);
  const [editPriceMonthly, setEditPriceMonthly] = useState<number>(0);
  const [editPriceAnnual, setEditPriceAnnual] = useState<number>(0);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchAllData = async () => {
    const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin' || user?.email?.toLowerCase() === 'mishrarishabh2006@gmail.com';
    if (!user || !isSuperAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [overviewData, mentorsData, problemsData, roadmapsData, missionsData, pricingData, usersData, collegesData] = await Promise.all([
        api.getAdminOverview().catch(() => null),
        api.adminGetMentors().catch(() => []),
        api.adminGetProblems().catch(() => []),
        api.adminGetRoadmaps().catch(() => []),
        api.adminGetMissions().catch(() => []),
        api.getPricingPlans().catch(() => []),
        api.adminGetUsers().catch(() => []),
        api.adminGetColleges().catch(() => []),
      ]);

      let finalUsers = Array.isArray(usersData) && usersData.length > 0 ? usersData : [];
      let finalMentors = (Array.isArray(mentorsData) && mentorsData.length > 0 ? mentorsData : []).map((m: any) => ({
        ...m,
        _id: m._id || m.id || `mentor-${m.name?.replace(/\s+/g, '-').toLowerCase()}`,
        id: m.id || m._id || `mentor-${m.name?.replace(/\s+/g, '-').toLowerCase()}`,
      }));
      let finalProblems = Array.isArray(problemsData) && problemsData.length > 0 ? problemsData : [];
      let finalRoadmaps = Array.isArray(roadmapsData) && roadmapsData.length > 0 ? roadmapsData : [];
      let finalMissions = Array.isArray(missionsData) && missionsData.length > 0 ? missionsData : [];
      let finalPricing = Array.isArray(pricingData) && pricingData.length > 0 ? pricingData : [];

      // Direct Supabase Query Fallback for real-time cloud data
      if (isSupabaseConfigured && supabase) {
        const { data: sbProfiles, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!profErr && sbProfiles && sbProfiles.length > 0) {
          const sbUsers = sbProfiles.map((p: any) => ({
            _id: p.id,
            id: p.id,
            name: p.full_name || p.name || (p.email ? p.email.split('@')[0] : 'User'),
            email: p.email,
            college: p.college_name || p.college || 'GLA University',
            degree: p.degree || '',
            year: p.year_of_study || '',
            role: p.role || 'student',
            avatar: p.avatar_url || p.avatar || null,
            targetGoal: p.target_goal || p.field_of_interest || 'AI / Machine Learning',
            skillsCompleted: p.skills_completed || 0,
            totalPoints: p.total_points || 0,
            streakDays: p.streak_days || 0,
            isOnboarded: p.is_onboarded ?? true,
            createdAt: p.created_at || new Date().toISOString(),
          }));

          const sbEmailMap = new Map(sbUsers.map((u: any) => [u.email.toLowerCase(), u]));
          finalUsers = [
            ...sbUsers,
            ...finalUsers.filter((u: any) => u.email && !sbEmailMap.has(u.email.toLowerCase())),
          ];
        }

        if (finalMentors.length === 0) {
          const { data: sbMentors } = await supabase.from('mentors').select('*');
          if (sbMentors && sbMentors.length > 0) {
            finalMentors = sbMentors.map((m: any) => ({
              _id: m.id,
              id: m.id,
              name: m.name,
              title: m.role || m.title || 'Senior Mentor',
              company: m.company || m.organization || 'RishabhLabs',
              domain: m.domain || (Array.isArray(m.expertise) ? m.expertise[0] : 'Technology'),
              avatar: m.avatar || m.avatar_url || '',
              rating: m.rating || 4.9,
              reviewsCount: m.reviews_count || 50,
              bio: m.bio || '',
              hourlyRate: m.hourly_rate || 'Free for Pro',
              topics: Array.isArray(m.expertise) ? m.expertise.join(', ') : (m.topics || 'Roadmap, Career Direction'),
              availability: Array.isArray(m.availability) ? m.availability.join(', ') : (m.availability || 'Today, 7:00 PM IST'),
              isAvailableToday: m.is_available_today ?? true,
            }));
          }
        }

        if (finalProblems.length === 0) {
          const { data: sbProblems } = await supabase.from('coding_problems').select('*');
          if (sbProblems && sbProblems.length > 0) {
            finalProblems = sbProblems.map((p: any) => ({
              _id: p.id,
              id: p.id,
              title: p.title,
              slug: p.slug,
              difficulty: p.difficulty || 'Medium',
              category: p.category || 'Algorithms',
              description: p.description || '',
              acceptanceRate: p.acceptance_rate || '72%',
              submissionsCount: p.submissions_count || 120,
              points: p.points || 50,
              hints: p.hints || [],
            }));
          }
        }

        if (finalPricing.length === 0) {
          const { data: sbPricing } = await supabase.from('pricing_plans').select('*');
          if (sbPricing && sbPricing.length > 0) {
            finalPricing = sbPricing.map((pr: any) => ({
              id: pr.id,
              name: pr.name,
              price: pr.price || 0,
              interval: pr.interval || 'month',
              description: pr.description || '',
              features: Array.isArray(pr.features) ? pr.features : [],
              isPopular: pr.is_popular ?? false,
              ctaText: pr.cta_text || 'Get Started',
            }));
          }
        }
      }

      let finalColleges = Array.isArray(collegesData) && collegesData.length > 0 ? collegesData : [];

      if (finalColleges.length === 0 && isSupabaseConfigured && supabase) {
        const { data: sbColleges } = await supabase
          .from('colleges')
          .select('*')
          .order('created_at', { ascending: false });
        if (sbColleges && sbColleges.length > 0) {
          finalColleges = sbColleges.map((c: any) => ({
            _id: c.id,
            id: c.id,
            name: c.college_name || c.name,
            code: c.short_code || c.code || (c.college_name ? c.college_name.slice(0, 3).toUpperCase() : 'CAMPUS'),
            location: c.domain || c.location || 'India',
            totalStudents: c.total_enrolled || c.totalStudents || 0,
            activeStudents: c.active_students || c.activeStudents || 0,
            status: 'Active Partner',
            departments: Array.isArray(c.departments) ? c.departments : [],
            placementRate: '92.0%',
            mouSigned: true,
          }));
        }
      }

      // Keep all live database user records (students, mentors, college admins, and admins)
      // Guarantee current admin user is present if not already in the list
      if (user && !finalUsers.some((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase())) {
        finalUsers.unshift({
          _id: user.id || 'admin-root',
          id: user.id || 'admin-root',
          name: user.name || 'Admin Authority',
          email: user.email,
          college: 'RishabhLabs HQ',
          degree: 'Platform Infrastructure & Operations',
          role: user.role || 'super_admin',
          avatar: user.avatar || null,
          createdAt: new Date().toISOString(),
        });
      }

      // Preserve live mentors from Supabase if API returned empty
      if (finalMentors.length === 0 && Array.isArray(mentorsData) && mentorsData.length > 0) {
        finalMentors = mentorsData;
      }

      setUsers(finalUsers);
      setMentors(finalMentors);
      setColleges(finalColleges);
      setProblems(finalProblems);
      setRoadmaps(finalRoadmaps);
      setMissions(finalMissions);
      setPricingPlans(finalPricing);

      const calculatedOverview = {
        metrics: {
          totalUsers: overviewData?.metrics?.totalUsers || finalUsers.length,
          mentors: overviewData?.metrics?.mentors || finalMentors.length,
          partnerColleges: overviewData?.metrics?.partnerColleges || finalColleges.length,
          avgCompletionRate: overviewData?.metrics?.avgCompletionRate || '72%',
          totalProblems: overviewData?.metrics?.totalProblems || finalProblems.length,
          totalRoadmaps: overviewData?.metrics?.totalRoadmaps || finalRoadmaps.length,
          totalMissions: overviewData?.metrics?.totalMissions || finalMissions.length,
        },
        contentMetrics: {
          totalLessons: 4,
          totalProblems: finalProblems.length,
          totalProjects: 10,
          totalTracks: 5,
        },
      };

      setAdminData(calculatedOverview);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Real-time Supabase database listener for live database sync across tabs
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const channel = supabase
        .channel('admin-db-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAllData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mentors' }, () => fetchAllData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'colleges' }, () => fetchAllData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_requests' }, () => fetchAllData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pricing_plans' }, () => fetchAllData())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (subErr) {
      console.warn('Real-time subscription notice:', subErr);
    }
  }, []);

  // Close any open modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMentorModalOpen(false);
        setProblemModalOpen(false);
        setRoadmapModalOpen(false);
        setTaskModalOpen(false);
        setUserModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --------------------------------------------------------------------------
  // USER & ROLE HANDLERS
  // --------------------------------------------------------------------------
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingUserId(userId);

      // Persist directly to Supabase profiles
      if (isSupabaseConfigured && supabase) {
        if (userId) {
          const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
          if (error) {
            const foundUser = users.find((u) => u._id === userId || u.id === userId);
            if (foundUser?.email) {
              await supabase.from('profiles').update({ role: newRole }).eq('email', foundUser.email);
            }
          }
        }
      }

      // Sync with Express backend if active
      if (userId) {
        await api.adminUpdateUserRole(userId, newRole).catch(() => null);
      }

      setUsers((prev) => prev.map((u) => ((u._id === userId || u.id === userId) ? { ...u, role: newRole } : u)));
      if (newRole === 'mentor') {
        const freshMentors = await api.adminGetMentors().catch(() => []);
        if (freshMentors.length > 0) setMentors(freshMentors);
      }
      showNotification(`Role updated to ${newRole}`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    try {
      const res = await api.adminCreateUser(newUser);
      setUsers((prev) => [res.user, ...prev]);
      if (newUser.role === 'mentor') {
        const freshMentors = await api.adminGetMentors().catch(() => []);
        if (freshMentors.length > 0) setMentors(freshMentors);
      }
      setUserModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'student', college: '', degree: '' });
      showNotification(`User ${res.user.name} created successfully!`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}? This cannot be undone.`)) return;
    try {
      if (isSupabaseConfigured && supabase) {
        if (userId) {
          await supabase.from('profiles').delete().eq('id', userId);
        }
        if (email) {
          await supabase.from('profiles').delete().eq('email', email);
        }
      }
      if (userId) {
        await api.adminDeleteUser(userId).catch(() => null);
      }
      setUsers((prev) => prev.filter((u) => u._id !== userId && u.id !== userId && u.email !== email));
      showNotification(`User ${email} deleted.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete user');
    }
  };

  // --------------------------------------------------------------------------
  // MENTOR HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenMentorModal = (mentor?: any) => {
    if (mentor) {
      setEditingMentor({
        ...mentor,
        topics: Array.isArray(mentor.topics) ? mentor.topics.join(', ') : mentor.topics,
        availability: Array.isArray(mentor.availability) ? mentor.availability.join(', ') : mentor.availability,
      });
    } else {
      setEditingMentor({
        name: '',
        title: '',
        company: 'RishabhLabs',
        domain: 'Full-Stack Development',
        avatar: '',
        rating: 5.0,
        reviewsCount: 50,
        bio: '',
        hourlyRate: 'Free for Pro',
        topics: 'Roadmap, Project Review, Career Direction',
        availability: 'Today, 7:00 PM IST, Tomorrow, 6:00 PM IST',
        isAvailableToday: true,
      });
    }
    setMentorModalOpen(true);
  };

  const handleSaveMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor.name || !editingMentor.title) return;

    try {
      const payload = {
        ...editingMentor,
        topics: typeof editingMentor.topics === 'string'
          ? editingMentor.topics.split(',').map((t: string) => t.trim()).filter(Boolean)
          : editingMentor.topics,
        availability: typeof editingMentor.availability === 'string'
          ? editingMentor.availability.split(',').map((a: string) => a.trim()).filter(Boolean)
          : editingMentor.availability,
      };

      if (editingMentor._id || editingMentor.id) {
        const targetId = editingMentor._id || editingMentor.id;
        const updated = await api.adminUpdateMentor(targetId, payload).catch(() => ({ ...payload, _id: targetId, id: targetId }));
        const safeUpdated = {
          ...updated,
          _id: updated._id || targetId,
          id: updated.id || targetId,
        };
        setMentors((prev) => prev.map((m) => ((m._id === targetId || m.id === targetId) ? safeUpdated : m)));
        showNotification(`Mentor "${safeUpdated.name}" updated successfully!`);
      } else {
        const created = await api.adminCreateMentor(payload).catch(() => null);
        const safeCreated = created || {
          ...payload,
          _id: `mentor-${Date.now()}`,
          id: `mentor-${Date.now()}`,
        };
        safeCreated._id = safeCreated._id || safeCreated.id || `mentor-${Date.now()}`;
        safeCreated.id = safeCreated.id || safeCreated._id;
        setMentors((prev) => [safeCreated, ...prev]);
        showNotification(`Mentor "${safeCreated.name}" created successfully!`);
      }
      setMentorModalOpen(false);
    } catch (err: any) {
      showNotification('Error saving mentor: ' + err.message);
    }
  };

  const handleDeleteMentor = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove mentor "${name}"?`)) return;
    try {
      const safeId = (id && id !== 'undefined' && id !== 'null') ? id : name;
      await api.adminDeleteMentor(safeId, name);
      setMentors((prev) => prev.filter((m) => m._id !== id && m.id !== id && m.name !== name));
      showNotification(`Mentor "${name}" removed successfully.`);
    } catch (err: any) {
      setMentors((prev) => prev.filter((m) => m._id !== id && m.id !== id && m.name !== name));
      showNotification(`Mentor "${name}" removed.`);
    }
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollege.name) return;
    try {
      const depts = newCollege.departments.split(',').map(d => d.trim()).filter(Boolean);
      const res = await api.adminCreateCollege({
        name: newCollege.name,
        code: newCollege.code || newCollege.name.substring(0, 3).toUpperCase(),
        location: newCollege.location || 'India',
        coordinatorName: newCollege.coordinatorName || 'Campus Lead',
        coordinatorEmail: newCollege.coordinatorEmail || `contact@${(newCollege.code || 'college').toLowerCase()}.edu`,
        activeStudents: Number(newCollege.activeStudents) || 120,
        departments: depts.length > 0 ? depts : ['Computer Science'],
      }).catch(() => null);

      const created = res?.college || {
        _id: `col-${Date.now()}`,
        id: `col-${Date.now()}`,
        ...newCollege,
        departments: depts.length > 0 ? depts : ['Computer Science'],
        placementRate: '92.0%',
        status: 'Active Partner',
        mouSigned: true,
      };

      setColleges((prev) => [created, ...prev]);
      setCollegeModalOpen(false);
      setNewCollege({
        name: '',
        code: '',
        location: '',
        coordinatorName: '',
        coordinatorEmail: '',
        activeStudents: 120,
        departments: 'Computer Science, Information Technology, AI & DS',
      });
      showNotification(`College "${created.name}" onboarded successfully!`);
    } catch (err: any) {
      showNotification('Error onboarding college: ' + err.message);
    }
  };

  const handleDeleteCollege = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove partner institution "${name}"?`)) return;
    try {
      await api.adminDeleteCollege(id, name).catch(() => null);
      setColleges((prev) => prev.filter((c) => c._id !== id && c.id !== id && c.name !== name));
      showNotification(`College partner "${name}" removed.`);
    } catch (err: any) {
      setColleges((prev) => prev.filter((c) => c._id !== id && c.id !== id && c.name !== name));
      showNotification(`College partner "${name}" removed.`);
    }
  };

  // --------------------------------------------------------------------------
  // QUESTION / PROBLEM HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenProblemModal = (prob?: any) => {
    if (prob) {
      setEditingProblem({
        ...prob,
        constraints: Array.isArray(prob.constraints) ? prob.constraints.join('\n') : prob.constraints,
      });
    } else {
      setEditingProblem({
        title: '',
        slug: '',
        category: 'Web Development',
        difficulty: 'Easy',
        isDebuggingChallenge: false,
        brokenBugExplanation: '',
        descriptionMarkdown: 'Describe the problem statement, inputs, and expected output here.',
        starterCode: {
          javascript: 'function solve(input) {\n  // Write your code here\n  return input;\n}',
          python: 'def solve(input):\n    # Write your code here\n    return input',
        },
        constraints: '0 <= input.length <= 1000\nExecution time limit: 5000ms',
        hints: {
          level1Concept: 'Think about data structure efficiency and immutability.',
          level2Stronger: 'Consider using hash maps or two pointers.',
          level3Approach: 'Iterate once while storing seen values.',
          level4Mentor: 'Direct formula or O(N) linear solution.',
        },
        testCases: [
          { testCaseId: 'tc-1', input: '[1, 2, 3]', expectedOutput: '[1, 2, 3]', isHidden: false },
          { testCaseId: 'tc-2', input: '[]', expectedOutput: '[]', isHidden: true },
        ],
        acceptanceRate: 85,
      });
    }
    setProblemModalOpen(true);
  };

  const handleSaveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem.title) return;

    try {
      const payload = {
        ...editingProblem,
        slug: editingProblem.slug || editingProblem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        constraints: typeof editingProblem.constraints === 'string'
          ? editingProblem.constraints.split('\n').map((c: string) => c.trim()).filter(Boolean)
          : editingProblem.constraints,
      };

      const targetProbId = editingProblem._id || editingProblem.id;
      if (targetProbId) {
        const updated = await api.adminUpdateProblem(targetProbId, payload);
        setProblems((prev) => prev.map((p) => ((p._id === targetProbId || p.id === targetProbId) ? updated : p)));
        showNotification(`Problem "${updated.title}" updated successfully!`);
      } else {
        const created = await api.adminCreateProblem(payload);
        setProblems((prev) => [created, ...prev]);
        showNotification(`Problem "${created.title}" created successfully!`);
      }
      setProblemModalOpen(false);
    } catch (err: any) {
      showNotification('Error saving problem: ' + err.message);
    }
  };

  const handleDeleteProblem = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete problem "${title}"?`)) return;
    try {
      await api.adminDeleteProblem(id);
      setProblems((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      showNotification(`Problem "${title}" deleted.`);
    } catch (err: any) {
      showNotification('Error deleting problem: ' + err.message);
    }
  };

  // --------------------------------------------------------------------------
  // ROADMAP HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenRoadmapModal = (rm?: any) => {
    if (rm) {
      setEditingRoadmap(JSON.parse(JSON.stringify(rm)));
    } else {
      setEditingRoadmap({
        title: 'New Track Execution Roadmap',
        slug: 'new-track',
        category: 'Web Development',
        targetLevel: 'Beginner',
        estimatedDailyTime: '2 hr/day',
        totalDurationDays: 90,
        nodes: [
          {
            nodeId: 'node-1',
            stepNumber: 1,
            title: 'Foundations & Architecture',
            subtitle: 'Core concepts, tooling & environments',
            description: 'Master essential principles, setup local developer environments, and understand architecture basics.',
            category: 'Core',
            status: 'in_progress',
            estimatedHours: 20,
            skillsCovered: ['Basics', 'Tooling', 'Architecture'],
            lessonsCount: 6,
            projectsCount: 1,
            iconName: 'Terminal',
          },
        ],
      });
    }
    setEditingNodeIndex(null);
    setRoadmapModalOpen(true);
  };

  const handleSaveRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoadmap.title) return;

    try {
      const targetRmId = editingRoadmap._id || editingRoadmap.id;
      if (targetRmId) {
        const updated = await api.adminUpdateRoadmap(targetRmId, editingRoadmap);
        setRoadmaps((prev) => prev.map((r) => ((r._id === targetRmId || r.id === targetRmId) ? updated : r)));
        showNotification(`Roadmap "${updated.title}" updated successfully!`);
      } else {
        const created = await api.adminCreateRoadmap(editingRoadmap);
        setRoadmaps((prev) => [created, ...prev]);
        showNotification(`Roadmap "${created.title}" created successfully!`);
      }
      setRoadmapModalOpen(false);
    } catch (err: any) {
      showNotification('Error saving roadmap: ' + err.message);
    }
  };

  const handleAddRoadmapNode = () => {
    if (!editingRoadmap) return;
    const newStepNumber = (editingRoadmap.nodes?.length || 0) + 1;
    const newNode = {
      nodeId: `node-${Date.now()}`,
      stepNumber: newStepNumber,
      title: `Step ${newStepNumber}: New Phase`,
      subtitle: 'Phase objective and milestones',
      description: 'Comprehensive description of hands-on skills, tasks, and deliverables.',
      category: editingRoadmap.category || 'Core',
      status: 'locked',
      estimatedHours: 25,
      skillsCovered: ['Skill 1', 'Skill 2'],
      lessonsCount: 6,
      projectsCount: 1,
      iconName: 'Code',
    };
    setEditingRoadmap({
      ...editingRoadmap,
      nodes: [...(editingRoadmap.nodes || []), newNode],
    });
    setEditingNodeIndex((editingRoadmap.nodes?.length || 0));
  };

  const handleDeleteRoadmapNode = (idx: number) => {
    if (!editingRoadmap) return;
    const newNodes = editingRoadmap.nodes.filter((_: any, i: number) => i !== idx);
    setEditingRoadmap({
      ...editingRoadmap,
      nodes: newNodes.map((n: any, i: number) => ({ ...n, stepNumber: i + 1 })),
    });
    setEditingNodeIndex(null);
  };

  const handleDeleteRoadmap = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete roadmap "${title}"?`)) return;
    try {
      await api.adminDeleteRoadmap(id);
      setRoadmaps((prev) => prev.filter((r) => r._id !== id && r.id !== id));
      showNotification(`Roadmap "${title}" deleted.`);
    } catch (err: any) {
      showNotification('Error deleting roadmap: ' + err.message);
    }
  };

  // --------------------------------------------------------------------------
  // DAILY TASK / MISSION HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenMissionModal = (mission?: any) => {
    if (mission) {
      setEditingMission(JSON.parse(JSON.stringify(mission)));
    } else {
      setEditingMission({
        trackTitle: 'Web Development',
        dayNumber: 1,
        dateString: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        quote: 'Small steps every day lead to big results.',
        tasks: [
          {
            taskId: `task-${Date.now()}-learn`,
            type: 'learn',
            title: 'Learn: Module Overview & Core Architecture',
            durationMinutes: 20,
            durationText: '20 min',
            description: 'Read the interactive curriculum and complete comprehension quiz.',
            actionUrl: '/learn',
            proofRequired: false,
          },
          {
            taskId: `task-${Date.now()}-practice`,
            type: 'practice',
            title: 'Practice: Algorithmic sandbox challenge',
            durationMinutes: 25,
            durationText: '25 min',
            description: 'Solve problem in code editor and pass automated test suites.',
            actionUrl: '/practice',
            proofRequired: false,
          },
          {
            taskId: `task-${Date.now()}-build`,
            type: 'build',
            title: 'Build: Construct project milestone component',
            durationMinutes: 40,
            durationText: '40 min',
            description: 'Implement milestone features and verify behavior locally.',
            actionUrl: '/projects',
            proofRequired: false,
          },
          {
            taskId: `task-${Date.now()}-ship`,
            type: 'ship',
            title: 'Ship: Push commit & publish verified proof',
            durationMinutes: 10,
            durationText: '10 min',
            description: 'Push to remote repository and share your Proof of Work.',
            actionUrl: '/projects',
            proofRequired: true,
          },
        ],
      });
    }
    setEditingTaskIndex(null);
    setTaskModalOpen(true);
  };

  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission.trackTitle) return;

    try {
      const targetMissionId = editingMission._id || editingMission.id;
      if (targetMissionId) {
        const updated = await api.adminUpdateMission(targetMissionId, editingMission);
        setMissions((prev) => prev.map((m) => ((m._id === targetMissionId || m.id === targetMissionId) ? updated : m)));
        showNotification(`Daily Mission for "${updated.trackTitle}" updated!`);
      } else {
        const created = await api.adminCreateMission(editingMission);
        setMissions((prev) => [created, ...prev]);
        showNotification(`Daily Mission for "${created.trackTitle}" created!`);
      }
      setTaskModalOpen(false);
    } catch (err: any) {
      showNotification('Error saving daily mission: ' + err.message);
    }
  };

  const handleAddTaskToMission = () => {
    if (!editingMission) return;
    const newTask = {
      taskId: `task-${Date.now()}`,
      type: 'practice',
      title: 'Practice: New Task',
      durationMinutes: 20,
      durationText: '20 min',
      description: 'Task details and execution requirements.',
      actionUrl: '/practice',
      proofRequired: false,
    };
    setEditingMission({
      ...editingMission,
      tasks: [...(editingMission.tasks || []), newTask],
    });
    setEditingTaskIndex((editingMission.tasks?.length || 0));
  };

  const handleDeleteTaskFromMission = (idx: number) => {
    if (!editingMission) return;
    const newTasks = editingMission.tasks.filter((_: any, i: number) => i !== idx);
    setEditingMission({ ...editingMission, tasks: newTasks });
    setEditingTaskIndex(null);
  };

  const handleDeleteMission = async (id: string, track: string) => {
    if (!window.confirm(`Are you sure you want to remove daily mission for "${track}"?`)) return;
    try {
      await api.adminDeleteMission(id);
      setMissions((prev) => prev.filter((m) => m._id !== id && m.id !== id));
      showNotification(`Daily mission for "${track}" removed.`);
    } catch (err: any) {
      showNotification('Error deleting daily mission: ' + err.message);
    }
  };

  // --------------------------------------------------------------------------
  // PRICING HANDLERS
  // --------------------------------------------------------------------------
  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlanKey(plan.key);
    setEditPriceMonthly(plan.priceMonthly);
    setEditPriceAnnual(plan.priceAnnual);
  };

  const handleSavePlan = async (key: string) => {
    try {
      const res = await api.updatePricingPlan(key, {
        priceMonthly: editPriceMonthly,
        priceAnnual: editPriceAnnual,
      });
      setPricingPlans((prev) => prev.map((p) => (p.key === key ? res.plan : p)));
      setEditingPlanKey(null);
      showNotification(`Pricing for plan "${key}" updated live!`);
    } catch (err: any) {
      showNotification('Error saving pricing plan: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xl border border-neutral-700 dark:border-neutral-200 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Super Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Admin Control Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Full authority to modify mentors, coding questions, learning roadmaps, daily tasks & subscription tiers.
          </p>
        </div>

        {/* Global Action Button depending on tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'users' && (
            <button
              onClick={() => setUserModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          )}
          {activeTab === 'mentors' && (
            <button
              onClick={() => handleOpenMentorModal()}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Mentor</span>
            </button>
          )}
          {activeTab === 'colleges' && (
            <button
              onClick={() => setCollegeModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add College Partner</span>
            </button>
          )}
          {activeTab === 'questions' && (
            <button
              onClick={() => handleOpenProblemModal()}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          )}
          {activeTab === 'roadmaps' && (
            <button
              onClick={() => handleOpenRoadmapModal()}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Roadmap</span>
            </button>
          )}
          {activeTab === 'tasks' && (
            <button
              onClick={() => handleOpenMissionModal()}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Daily Mission</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200 dark:border-neutral-800 no-scrollbar">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'users'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
        >
          <UserCog className="w-4 h-4" />
          <span>Team & Member Roles</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-800/20 dark:bg-neutral-200/20">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'mentors'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Mentors</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-800/20 dark:bg-neutral-200/20">
            {mentors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('colleges')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'colleges'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Colleges & Partners</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-800/20 dark:bg-neutral-200/20">
            {colleges.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'questions'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Questions & Problems</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-800/20 dark:bg-neutral-200/20">
            {problems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roadmaps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'roadmaps'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
        >
          <Compass className="w-4 h-4" />
          <span>Roadmaps & Nodes</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-800/20 dark:bg-neutral-200/20">
            {roadmaps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'tasks'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Daily Tasks & Missions</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-800/20 dark:bg-neutral-200/20">
            {missions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'pricing'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pricing & Plans</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-800/20 dark:bg-neutral-200/20">
            {pricingPlans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'overview'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Platform Metrics</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 0: USERS & ROLES MANAGEMENT                                      */}
      {/* ==================================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar for Database Users & Roles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Registered Users</span>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">{users.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Students</span>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                {users.filter(u => !u.role || u.role === 'student').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Mentors & Campus</span>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                {users.filter(u => u.role === 'mentor' || u.role === 'college_admin').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Platform Admins</span>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                {users.filter(u => u.role === 'super_admin' || u.role === 'admin').length}
              </p>
            </div>
          </div>

          {/* Search & Filter Controls with Real-Time Database Sync Button */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search live users by name, email, or college..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-[#212121] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <button
                onClick={fetchAllData}
                disabled={loading}
                title="Refresh live user data directly from database"
                className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#212121] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Users' },
                { id: 'student', label: 'Students' },
                { id: 'mentor', label: 'Mentors' },
                { id: 'college_admin', label: 'College Admins' },
                { id: 'admin', label: 'Admins' },
                { id: 'super_admin', label: 'Super Admins' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setUserRoleFilter(rf.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${userRoleFilter === rf.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Members Table with Live Role Modification */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-[#222222] border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Team Member</th>
                    <th className="px-4 py-3">Department & Operations</th>
                    <th className="px-4 py-3">Platform Role</th>
                    <th className="px-4 py-3">Modify Role (Full Authority)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {users
                    .filter((u) => {
                      const effRole = u.role || 'student';
                      if (userRoleFilter !== 'all' && effRole !== userRoleFilter) return false;
                      if (userSearch.trim()) {
                        const q = userSearch.toLowerCase();
                        const n = (u.name || '').toLowerCase();
                        const e = (u.email || '').toLowerCase();
                        const c = (u.college || '').toLowerCase();
                        return n.includes(q) || e.includes(q) || c.includes(q);
                      }
                      return true;
                    })
                    .map((u) => {
                      const uId = u._id || u.id;
                      const isProtected = u.email === user?.email || u.email?.toLowerCase() === 'mishrarishabh2006@gmail.com';
                      const isUpdating = updatingUserId === uId;

                      return (
                        <tr key={uId || u.email} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                src={u.avatar}
                                name={u.name}
                                email={u.email}
                                size="sm"
                                roundedClassName="rounded-lg"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                                  {u.name}
                                  {isProtected && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold uppercase">
                                      Root Master
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-neutral-500 truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                              {u.college || 'Platform Administration'}
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate">
                              {u.degree || u.targetGoal || 'Infrastructure & Mentorship'}
                            </p>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${u.role === 'super_admin'
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                  : u.role === 'admin'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                    : u.role === 'mentor'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : u.role === 'college_admin'
                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                }`}
                            >
                              {u.role || 'student'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <CustomDropdown
                                value={u.role === 'admin' ? 'super_admin' : (u.role || 'student')}
                                onChange={(newRole) => handleUpdateUserRole(uId, newRole)}
                                options={ROLE_OPTIONS}
                                disabled={isUpdating}
                                className="min-w-[210px]"
                                size="sm"
                              />
                              {isUpdating && (
                                <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            {!isProtected ? (
                              <button
                                onClick={() => handleDeleteUser(uId, u.email)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-neutral-400 italic">Protected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: MENTORS MANAGEMENT                                            */}
      {/* ==================================================================== */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search mentors by name, company, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/mentor/sessions"
                className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Mentor Inquiries & Bookings</span>
              </Link>
              <div className="text-xs text-neutral-500 font-medium">
                Showing {mentors.filter((m) =>
                  m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.company?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length} verified mentors
              </div>
            </div>
          </div>

          {mentors.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
              <Users className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No mentors configured yet</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto mb-4">
                Add experienced engineering specialists to the platform to open 1:1 consultation slots for learners.
              </p>
              <button
                onClick={() => handleOpenMentorModal()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Mentor</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentors
                .filter((m) =>
                  m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.company?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((mentor) => (
                  <div
                    key={mentor._id || mentor.id || mentor.name}
                    className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={mentor.avatar}
                            name={mentor.name}
                            size="lg"
                            roundedClassName="rounded-full"
                          />
                          <div>
                            <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                              {mentor.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {mentor.title} @ {mentor.company}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{mentor.rating || 1.0}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {mentor.domain || 'General'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                          {mentor.hourlyRate || 'Free for Pro'}
                        </span>
                        {mentor.isAvailableToday && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Active Today
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                        {mentor.bio}
                      </p>

                      {mentor.topics && mentor.topics.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                            Focus Areas
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(mentor.topics) ? mentor.topics : []).map((topic: string) => (
                              <span
                                key={topic}
                                className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenMentorModal(mentor)}
                        className="flex-1 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Mentor</span>
                      </button>
                      <Link
                        to="/mentor/sessions"
                        className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-1"
                        title="View Sessions & Inquiries"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Bookings</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteMentor(mentor._id || mentor.id || mentor.name, mentor.name)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center justify-center"
                        title="Remove mentor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB: COLLEGES & INSTITUTIONAL PARTNERS                                */}
      {/* ==================================================================== */}
      {activeTab === 'colleges' && (
        <div className="space-y-5">
          {/* Colleges Header and Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search colleges by name, code or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                Showing {colleges.length} institutional partners
              </span>
            </div>
          </div>

          {/* Colleges Grid */}
          {colleges.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
              <Building2 className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No partner institutions yet</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto mb-4">
                Onboard universities and colleges to track enterprise student metrics, cohorts, and placement performance.
              </p>
              <button
                onClick={() => setCollegeModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard First College Partner</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colleges
                .filter((c) =>
                  c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.location?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((college) => (
                  <div
                    key={college._id || college.id || college.name}
                    className="p-5 rounded-2xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                            {college.code || college.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                              {college.name}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {college.location}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5" />
                          <span>MOU Active</span>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-medium">Registered Students</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {users.filter(u => u.college && college.name && (u.college.toLowerCase() === college.name.toLowerCase() || u.college.toLowerCase().includes(college.code?.toLowerCase() || ''))).length}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                          Active Campus
                        </span>
                      </div>

                      {college.departments && (
                        <div>
                          <span className="text-[10px] text-neutral-400 font-medium block mb-1">Affiliated Departments:</span>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(college.departments) ? college.departments : [college.departments]).map((dept: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                              >
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {college.coordinatorName && (
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">Lead Coordinator:</span> {college.coordinatorName} ({college.coordinatorEmail})
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                      <a
                        href={`/college?id=${encodeURIComponent(college.id || college._id || '')}&name=${encodeURIComponent(college.name || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Portal</span>
                      </a>
                      <button
                        onClick={() => handleDeleteCollege(college._id || college.id || college.name, college.name)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center justify-center"
                        title="Remove college partner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: QUESTIONS & PROBLEMS MANAGEMENT                               */}
      {/* ==================================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search problems by title, slug or track..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <CustomDropdown
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                options={[
                  { value: 'All', label: 'All Categories' },
                  { value: 'Web Development', label: 'Web Development' },
                  { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
                  { value: 'Cybersecurity', label: 'Cybersecurity' },
                  { value: 'Mobile App Development', label: 'Mobile App Development' },
                  { value: 'Data & Analytics', label: 'Data & Analytics' },
                ]}
                size="sm"
              />
              <div className="text-xs text-neutral-500 font-medium">
                {problems.length} problems loaded
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#212121] overflow-hidden">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {problems
                .filter((p) => {
                  const matchQuery =
                    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.category?.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchCategory =
                    categoryFilter === 'All' ||
                    p.category?.toLowerCase().includes(categoryFilter.toLowerCase());
                  return matchQuery && matchCategory;
                })
                .map((prob) => {
                  const diffColor =
                    prob.difficulty === 'Hard'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : prob.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

                  return (
                    <div
                      key={prob._id || prob.slug}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                            {prob.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${diffColor}`}>
                            {prob.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {prob.category}
                          </span>
                          {prob.isDebuggingChallenge && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              Bug Lab
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 font-mono">
                          /practice/{prob.slug}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenProblemModal(prob)}
                          className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProblem(prob._id || prob.id, prob.title)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold"
                          title="Delete problem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: ROADMAPS & ROADMAP NODES MANAGEMENT                           */}
      {/* ==================================================================== */}
      {activeTab === 'roadmaps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {roadmaps.map((rm) => (
              <div
                key={rm._id || rm.slug}
                className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
                        {rm.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {rm.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Target: {rm.targetLevel} • Daily Commitment: {rm.estimatedDailyTime} • Duration: {rm.totalDurationDays} days • {rm.nodes?.length || 0} Steps
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenRoadmapModal(rm)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Track & Nodes</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRoadmap(rm._id || rm.id, rm.title)}
                      className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete roadmap"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Steps / Nodes list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Execution Steps ({rm.nodes?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(rm.nodes || []).map((node: any, idx: number) => (
                      <div
                        key={node.nodeId || idx}
                        className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-neutral-400">
                            Step {node.stepNumber || idx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${node.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : node.status === 'in_progress'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                            }`}>
                            {node.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-neutral-900 dark:text-white">
                          {node.title}
                        </h5>
                        <p className="text-[11px] text-neutral-500 line-clamp-2">
                          {node.subtitle || node.description}
                        </p>
                        <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
                          {node.estimatedHours || 20} hrs • {node.lessonsCount || 6} lessons
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: DAILY TASKS & MISSIONS MANAGEMENT                             */}
      {/* ==================================================================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {missions.map((mission) => (
              <div
                key={mission._id || mission.trackTitle}
                className="p-6 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                        {mission.trackTitle}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        Day {mission.dayNumber || 1}
                      </span>
                    </div>
                    <p className="text-xs italic text-neutral-500 mt-1">
                      "{mission.quote || 'Consistency transforms average into excellence.'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenMissionModal(mission)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Mission & Tasks</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMission(mission._id || mission.id, mission.trackTitle)}
                      className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete mission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Daily Execution Tasks ({mission.tasks?.length || 0})
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(mission.tasks || []).map((t: any, idx: number) => {
                      const typeColors: Record<string, string> = {
                        learn: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                        practice: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                        build: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                        ship: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                      };

                      return (
                        <div
                          key={t.taskId || idx}
                          className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${typeColors[t.type] || 'bg-neutral-200 text-neutral-600'}`}>
                              {t.type}
                            </span>
                            <span className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {t.durationText || `${t.durationMinutes || 20} min`}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-neutral-900 dark:text-white">
                            {t.title}
                          </h5>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">
                            {t.description}
                          </p>
                          <div className="text-[10px] text-neutral-400 pt-1 font-mono">
                            Action: {t.actionUrl || '/learn'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: PRICING & PLANS MANAGEMENT                                    */}
      {/* ==================================================================== */}
      {activeTab === 'pricing' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Subscription Architecture
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
              Live Pricing Tier Rates & Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => {
              const isEditing = editingPlanKey === plan.key;

              return (
                <div
                  key={plan.key}
                  className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{plan.name}</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">
                      {plan.key}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[10px] font-semibold text-neutral-500">Monthly Price (₹)</label>
                        <input
                          type="number"
                          value={editPriceMonthly}
                          onChange={(e) => setEditPriceMonthly(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-neutral-500">Annual Price (₹)</label>
                        <input
                          type="number"
                          value={editPriceAnnual}
                          onChange={(e) => setEditPriceAnnual(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleSavePlan(plan.key)}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={() => setEditingPlanKey(null)}
                          className="flex-1 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-2xl font-extrabold text-neutral-900 dark:text-white font-mono">
                          ₹{plan.priceMonthly} <span className="text-xs text-neutral-400 font-sans font-normal">/ mo</span>
                        </p>
                        <p className="text-xs text-neutral-500 font-mono">
                          ₹{plan.priceAnnual} / year
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="w-full py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Rate</span>
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: OVERVIEW & PLATFORM METRICS                                   */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Users</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">
                {users.length || adminData?.metrics?.totalUsers || 0}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Verified Mentors</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-500 font-mono">
                {mentors.length}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Coding Problems</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-500 font-mono">
                {problems.length}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#212121] border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Active Roadmaps</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-500 font-mono">
                {roadmaps.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 0: COLLEGE ONBOARDING MODAL                                    */}
      {/* ==================================================================== */}
      {collegeModalOpen && (
        <div
          onClick={() => setCollegeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E1B1C] border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                  Onboard Partner College
                </h3>
              </div>
              <button
                onClick={() => setCollegeModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollege} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  College / University Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GLA University, Mathura"
                  value={newCollege.name}
                  onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Short Code / Acronym
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GLA"
                    value={newCollege.code}
                    onChange={(e) => setNewCollege({ ...newCollege, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Location / State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathura, UP"
                    value={newCollege.location}
                    onChange={(e) => setNewCollege({ ...newCollege, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Lead Coordinator Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. A. K. Sharma"
                    value={newCollege.coordinatorName}
                    onChange={(e) => setNewCollege({ ...newCollege, coordinatorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Coordinator Email
                  </label>
                  <input
                    type="email"
                    placeholder="campus.lead@college.edu"
                    value={newCollege.coordinatorEmail}
                    onChange={(e) => setNewCollege({ ...newCollege, coordinatorEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Estimated Active Students
                </label>
                <input
                  type="number"
                  min="1"
                  value={newCollege.activeStudents}
                  onChange={(e) => setNewCollege({ ...newCollege, activeStudents: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Departments (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Computer Science, Information Technology, AI & DS"
                  value={newCollege.departments}
                  onChange={(e) => setNewCollege({ ...newCollege, departments: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCollegeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  Onboard College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: MENTOR EDITOR MODAL                                         */}
      {/* ==================================================================== */}
      {mentorModalOpen && editingMentor && (
        <div
          onClick={() => setMentorModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E1B1C] border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                {(editingMentor._id || editingMentor.id) ? 'Edit Mentor Profile' : 'Add New Mentor'}
              </h3>
              <button
                onClick={() => setMentorModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMentor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMentor.name || ''}
                    onChange={(e) => setEditingMentor({ ...editingMentor, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="e.g. Rishabh Mishra"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMentor.title || ''}
                    onChange={(e) => setEditingMentor({ ...editingMentor, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="e.g. Founder & Full-Stack Lead"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={editingMentor.company || ''}
                    onChange={(e) => setEditingMentor({ ...editingMentor, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="e.g. RishabhLabs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Domain Specialization
                  </label>
                  <CustomDropdown
                    value={editingMentor.domain || 'Full-Stack Development'}
                    onChange={(val) => setEditingMentor({ ...editingMentor, domain: val })}
                    options={[
                      { value: 'Full-Stack Development', label: 'Full-Stack Development' },
                      { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
                      { value: 'Cybersecurity', label: 'Cybersecurity' },
                      { value: 'Mobile App Development', label: 'Mobile App Development' },
                      { value: 'Data & Analytics', label: 'Data & Analytics' },
                      { value: 'Systems & DevOps', label: 'Systems & DevOps' },
                    ]}
                    className="w-full"
                    size="sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="text"
                    value={editingMentor.avatar || ''}
                    onChange={(e) => setEditingMentor({ ...editingMentor, avatar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="e.g. https://example.com/photo.jpg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Hourly Rate / Badge
                  </label>
                  <input
                    type="text"
                    value={editingMentor.hourlyRate || 'Free for Pro'}
                    onChange={(e) => setEditingMentor({ ...editingMentor, hourlyRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="Free for Pro"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Rating (out of 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={editingMentor.rating || 5.0}
                    onChange={(e) => setEditingMentor({ ...editingMentor, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    value={editingMentor.reviewsCount || 48}
                    onChange={(e) => setEditingMentor({ ...editingMentor, reviewsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Mentor Bio
                </label>
                <textarea
                  rows={3}
                  value={editingMentor.bio || ''}
                  onChange={(e) => setEditingMentor({ ...editingMentor, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  placeholder="Professional background, expertise, and what sessions cover..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Topics / Focus Areas (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingMentor.topics || ''}
                  onChange={(e) => setEditingMentor({ ...editingMentor, topics: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  placeholder="Roadmap, Project Review, Career Direction, Web Development"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Available Slots (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingMentor.availability || ''}
                  onChange={(e) => setEditingMentor({ ...editingMentor, availability: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  placeholder="Today, 7:00 PM IST, Tomorrow, 6:00 PM IST"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAvailableToday"
                  checked={Boolean(editingMentor.isAvailableToday)}
                  onChange={(e) => setEditingMentor({ ...editingMentor, isAvailableToday: e.target.checked })}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isAvailableToday" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Mark mentor as Available Today for 1:1 bookings
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setMentorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Mentor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: QUESTION / PROBLEM EDITOR MODAL                             */}
      {/* ==================================================================== */}
      {problemModalOpen && editingProblem && (
        <div
          onClick={() => setProblemModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E1B1C] border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                {(editingProblem._id || editingProblem.id) ? 'Edit Coding Problem' : 'Create New Coding Problem'}
              </h3>
              <button
                onClick={() => setProblemModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProblem.title || ''}
                    onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="e.g. Filter Active Users"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Difficulty
                  </label>
                  <CustomDropdown
                    value={editingProblem.difficulty || 'Easy'}
                    onChange={(val) => setEditingProblem({ ...editingProblem, difficulty: val })}
                    options={[
                      { value: 'Easy', label: 'Easy' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Hard', label: 'Hard' },
                    ]}
                    className="w-full"
                    size="sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editingProblem.slug || ''}
                    onChange={(e) => setEditingProblem({ ...editingProblem, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
                    placeholder="e.g. filter-active-users"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Track / Category
                  </label>
                  <CustomDropdown
                    value={editingProblem.category || 'Web Development'}
                    onChange={(val) => setEditingProblem({ ...editingProblem, category: val })}
                    options={[
                      { value: 'Web Development', label: 'Web Development' },
                      { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
                      { value: 'Cybersecurity', label: 'Cybersecurity' },
                      { value: 'Mobile App Development', label: 'Mobile App Development' },
                      { value: 'Data & Analytics', label: 'Data & Analytics' },
                    ]}
                    className="w-full"
                    size="sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDebugging"
                  checked={Boolean(editingProblem.isDebuggingChallenge)}
                  onChange={(e) => setEditingProblem({ ...editingProblem, isDebuggingChallenge: e.target.checked })}
                  className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isDebugging" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  This problem is an interactive "Fix the Bug" Lab challenge
                </label>
              </div>

              {editingProblem.isDebuggingChallenge && (
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Broken Bug Explanation
                  </label>
                  <textarea
                    rows={2}
                    value={editingProblem.brokenBugExplanation || ''}
                    onChange={(e) => setEditingProblem({ ...editingProblem, brokenBugExplanation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
                    placeholder="Describe the subtle bug seeded in the starter code..."
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Description (Markdown)
                </label>
                <textarea
                  rows={5}
                  value={editingProblem.descriptionMarkdown || ''}
                  onChange={(e) => setEditingProblem({ ...editingProblem, descriptionMarkdown: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono"
                  placeholder="Markdown problem description..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Starter Code (JavaScript)
                  </label>
                  <textarea
                    rows={6}
                    value={editingProblem.starterCode?.javascript || ''}
                    onChange={(e) =>
                      setEditingProblem({
                        ...editingProblem,
                        starterCode: { ...editingProblem.starterCode, javascript: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Starter Code (Python)
                  </label>
                  <textarea
                    rows={6}
                    value={editingProblem.starterCode?.python || ''}
                    onChange={(e) =>
                      setEditingProblem({
                        ...editingProblem,
                        starterCode: { ...editingProblem.starterCode, python: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setProblemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Problem</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: ROADMAP & NODES EDITOR MODAL                                */}
      {/* ==================================================================== */}
      {roadmapModalOpen && editingRoadmap && (
        <div
          onClick={() => setRoadmapModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E1B1C] border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                {(editingRoadmap._id || editingRoadmap.id) ? 'Edit Roadmap & Execution Nodes' : 'Create New Roadmap Track'}
              </h3>
              <button
                onClick={() => setRoadmapModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoadmap} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Track Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRoadmap.title || ''}
                    onChange={(e) => setEditingRoadmap({ ...editingRoadmap, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="e.g. Web Development Execution Track"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingRoadmap.category || ''}
                    onChange={(e) => setEditingRoadmap({ ...editingRoadmap, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="e.g. Web Development"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Target Level
                  </label>
                  <input
                    type="text"
                    value={editingRoadmap.targetLevel || 'Beginner'}
                    onChange={(e) => setEditingRoadmap({ ...editingRoadmap, targetLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Daily Commitment
                  </label>
                  <input
                    type="text"
                    value={editingRoadmap.estimatedDailyTime || '2 hr/day'}
                    onChange={(e) => setEditingRoadmap({ ...editingRoadmap, estimatedDailyTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Total Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={editingRoadmap.totalDurationDays || 90}
                    onChange={(e) => setEditingRoadmap({ ...editingRoadmap, totalDurationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                </div>
              </div>

              {/* Step / Node List & Editor */}
              <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Track Milestones & Nodes ({editingRoadmap.nodes?.length || 0})
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Configure the sequential milestones students progress through.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRoadmapNode}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(editingRoadmap.nodes || []).map((node: any, idx: number) => (
                    <div
                      key={node.nodeId || idx}
                      className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          Step {node.stepNumber || idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoadmapNode(idx)}
                          className="text-rose-500 text-xs hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Step
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Title</label>
                          <input
                            type="text"
                            value={node.title || ''}
                            onChange={(e) => {
                              const updated = [...editingRoadmap.nodes];
                              updated[idx].title = e.target.value;
                              setEditingRoadmap({ ...editingRoadmap, nodes: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Status</label>
                          <CustomDropdown
                            value={node.status || 'locked'}
                            onChange={(val) => {
                              const updated = [...editingRoadmap.nodes];
                              updated[idx].status = val;
                              setEditingRoadmap({ ...editingRoadmap, nodes: updated });
                            }}
                            options={[
                              { value: 'in_progress', label: 'In Progress' },
                              { value: 'completed', label: 'Completed' },
                              { value: 'locked', label: 'Locked' },
                            ]}
                            className="w-full"
                            size="sm"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Description</label>
                          <textarea
                            rows={2}
                            value={node.description || ''}
                            onChange={(e) => {
                              const updated = [...editingRoadmap.nodes];
                              updated[idx].description = e.target.value;
                              setEditingRoadmap({ ...editingRoadmap, nodes: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Estimated Hours</label>
                          <input
                            type="number"
                            value={node.estimatedHours || 20}
                            onChange={(e) => {
                              const updated = [...editingRoadmap.nodes];
                              updated[idx].estimatedHours = Number(e.target.value);
                              setEditingRoadmap({ ...editingRoadmap, nodes: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Skills Covered (comma-separated)</label>
                          <input
                            type="text"
                            value={Array.isArray(node.skillsCovered) ? node.skillsCovered.join(', ') : node.skillsCovered || ''}
                            onChange={(e) => {
                              const updated = [...editingRoadmap.nodes];
                              updated[idx].skillsCovered = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
                              setEditingRoadmap({ ...editingRoadmap, nodes: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setRoadmapModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Roadmap</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: DAILY TASKS & MISSIONS EDITOR MODAL                         */}
      {/* ==================================================================== */}
      {taskModalOpen && editingMission && (
        <div
          onClick={() => setTaskModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E1B1C] border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                {(editingMission._id || editingMission.id) ? 'Edit Daily Mission & Tasks' : 'Create Daily Mission Track'}
              </h3>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMission} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Track Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMission.trackTitle || ''}
                    onChange={(e) => setEditingMission({ ...editingMission, trackTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="e.g. Web Development"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Day Number
                  </label>
                  <input
                    type="number"
                    value={editingMission.dayNumber || 1}
                    onChange={(e) => setEditingMission({ ...editingMission, dayNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Date Label
                  </label>
                  <input
                    type="text"
                    value={editingMission.dateString || ''}
                    onChange={(e) => setEditingMission({ ...editingMission, dateString: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Motivational Quote
                  </label>
                  <input
                    type="text"
                    value={editingMission.quote || ''}
                    onChange={(e) => setEditingMission({ ...editingMission, quote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                    placeholder="e.g. Small steps every day lead to big results."
                  />
                </div>
              </div>

              {/* Mission Tasks List */}
              <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Daily Tasks ({editingMission.tasks?.length || 0})
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Configure the tasks learners will complete today (Learn, Practice, Build, Ship).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTaskToMission}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(editingMission.tasks || []).map((t: any, idx: number) => (
                    <div
                      key={t.taskId || idx}
                      className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          Task #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTaskFromMission(idx)}
                          className="text-rose-500 text-xs hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Task
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Task Type</label>
                          <CustomDropdown
                            value={t.type || 'learn'}
                            onChange={(val) => {
                              const updated = [...editingMission.tasks];
                              updated[idx].type = val;
                              setEditingMission({ ...editingMission, tasks: updated });
                            }}
                            options={[
                              { value: 'learn', label: 'Learn' },
                              { value: 'practice', label: 'Practice' },
                              { value: 'build', label: 'Build' },
                              { value: 'ship', label: 'Ship' },
                            ]}
                            className="w-full"
                            size="sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Title</label>
                          <input
                            type="text"
                            value={t.title || ''}
                            onChange={(e) => {
                              const updated = [...editingMission.tasks];
                              updated[idx].title = e.target.value;
                              setEditingMission({ ...editingMission, tasks: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Description</label>
                          <textarea
                            rows={2}
                            value={t.description || ''}
                            onChange={(e) => {
                              const updated = [...editingMission.tasks];
                              updated[idx].description = e.target.value;
                              setEditingMission({ ...editingMission, tasks: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Duration (Minutes)</label>
                          <input
                            type="number"
                            value={t.durationMinutes || 20}
                            onChange={(e) => {
                              const updated = [...editingMission.tasks];
                              const min = Number(e.target.value);
                              updated[idx].durationMinutes = min;
                              updated[idx].durationText = `${min} min`;
                              setEditingMission({ ...editingMission, tasks: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 block mb-0.5">Action URL</label>
                          <input
                            type="text"
                            value={t.actionUrl || '/learn'}
                            onChange={(e) => {
                              const updated = [...editingMission.tasks];
                              updated[idx].actionUrl = e.target.value;
                              setEditingMission({ ...editingMission, tasks: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id={`proof-${idx}`}
                            checked={Boolean(t.proofRequired)}
                            onChange={(e) => {
                              const updated = [...editingMission.tasks];
                              updated[idx].proofRequired = e.target.checked;
                              setEditingMission({ ...editingMission, tasks: updated });
                            }}
                            className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <label htmlFor={`proof-${idx}`} className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Proof Required (GitHub Commit / PR)
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Mission & Tasks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform Member & Role Creation Modal */}
      {userModalOpen && (
        <div
          onClick={() => setUserModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <UserCog className="w-5 h-5 text-emerald-500" />
                Add Platform Team Member
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sengupta"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya@rishabhlab.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Initial Password</label>
                <input
                  type="text"
                  placeholder="Defaults to password123"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Platform Role</label>
                <CustomDropdown
                  value={newUser.role === 'admin' ? 'super_admin' : newUser.role}
                  onChange={(newRole) => setNewUser({ ...newUser, role: newRole })}
                  options={ROLE_OPTIONS}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Department / Org</label>
                  <input
                    type="text"
                    placeholder="e.g. Infrastructure / RishabhLabs"
                    value={newUser.college}
                    onChange={(e) => setNewUser({ ...newUser, college: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Designation / Focus</label>
                  <input
                    type="text"
                    placeholder="e.g. Systems Architecture"
                    value={newUser.degree}
                    onChange={(e) => setNewUser({ ...newUser, degree: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm"
                >
                  Create Member & Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
