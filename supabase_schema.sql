-- ============================================================================
-- RISHABH LABS — PRODUCTION SUPABASE POSTGRESQL SCHEMA & INITIAL DATA
-- Philosophy: "Don't just learn. Know what to do next."
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES TABLE (Linked with Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'college_admin', 'super_admin')),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop',
    college_name TEXT DEFAULT 'GLA University',
    degree TEXT DEFAULT 'B.Tech Computer Science',
    year_of_study TEXT DEFAULT '3rd Year',
    target_goal TEXT DEFAULT NULL,
    current_level TEXT DEFAULT NULL,
    available_time TEXT DEFAULT '2 hours/day',
    desired_outcome TEXT DEFAULT 'Build projects',
    deadline DATE DEFAULT (CURRENT_DATE + INTERVAL '90 days'),
    github_username TEXT,
    portfolio_url TEXT,
    skills_completed INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation Trigger on Supabase Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. ROADMAPS & ROADMAP NODES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    track_title TEXT NOT NULL,
    description TEXT,
    total_estimated_hours INTEGER DEFAULT 120,
    progress_percentage INTEGER DEFAULT 0,
    current_node_id TEXT DEFAULT 'node-1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roadmap_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    node_key TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    order_index INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('completed', 'in_progress', 'locked')),
    estimated_hours INTEGER DEFAULT 15,
    skills JSONB DEFAULT '[]'::jsonb,
    is_milestone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. DAILY MISSIONS & TASKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    track_title TEXT NOT NULL,
    date_string TEXT NOT NULL,
    quote TEXT DEFAULT 'Small steps every day lead to big results.',
    is_fully_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mission_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES public.daily_missions(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('learn', 'practice', 'build', 'ship')),
    title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    description TEXT,
    action_url TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    proof_commit TEXT,
    proof_url TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. LEARNING PATHS & LESSONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Beginner',
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 20,
    markdown_content TEXT NOT NULL,
    key_takeaways JSONB DEFAULT '[]'::jsonb,
    code_example TEXT,
    quiz JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. CODING PROBLEMS & SUBMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coding_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    category TEXT NOT NULL,
    is_debugging_challenge BOOLEAN DEFAULT FALSE,
    broken_bug_explanation TEXT,
    description_markdown TEXT NOT NULL,
    examples JSONB DEFAULT '[]'::jsonb,
    constraints JSONB DEFAULT '[]'::jsonb,
    starter_code JSONB NOT NULL,
    hints JSONB DEFAULT '{}'::jsonb,
    test_cases JSONB NOT NULL,
    acceptance_rate TEXT DEFAULT '78%',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.coding_problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded')),
    passed_test_cases INTEGER NOT NULL,
    total_test_cases INTEGER NOT NULL,
    runtime_ms INTEGER DEFAULT 12,
    test_results JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. PROJECTS & WORKSPACE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    estimated_hours INTEGER DEFAULT 25,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '[]'::jsonb,
    milestones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'under_review')),
    progress_percentage INTEGER DEFAULT 40,
    github_repo_url TEXT,
    deployment_url TEXT,
    demo_video_url TEXT,
    milestones_progress JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ,
    mentor_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. HACKATHONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    hackathon_name TEXT NOT NULL DEFAULT 'Smart India Hackathon & InnovateX',
    target_event_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '12 days 4 hours 32 minutes'),
    problem_statement TEXT NOT NULL,
    selected_track TEXT DEFAULT 'Smart Education & AI',
    team_members JSONB DEFAULT '[]'::jsonb,
    phases JSONB DEFAULT '[]'::jsonb,
    ai_outputs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. MENTORS & MENTORSHIP REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    avatar TEXT NOT NULL,
    topics JSONB DEFAULT '[]'::jsonb,
    experience_years INTEGER DEFAULT 5,
    rating NUMERIC(2,1) DEFAULT 4.9,
    bio TEXT NOT NULL,
    hourly_rate_inr INTEGER DEFAULT 0,
    available_days JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    requested_date TEXT NOT NULL,
    student_note TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    meeting_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. WEEKLY REVIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL DEFAULT 2026,
    planned_hours NUMERIC(4,1) DEFAULT 8.0,
    completed_hours NUMERIC(4,1) DEFAULT 6.7,
    completion_rate INTEGER DEFAULT 84,
    skills_completed INTEGER DEFAULT 3,
    problems_solved INTEGER DEFAULT 7,
    obstacles_reflection TEXT,
    next_week_focus TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. COLLEGES & ANALYTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_name TEXT NOT NULL UNIQUE,
    short_code TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL,
    total_enrolled INTEGER DEFAULT 2450,
    active_students INTEGER DEFAULT 1980,
    average_execution_rate INTEGER DEFAULT 64,
    skill_distribution JSONB DEFAULT '{"Web Development": 42, "AI/ML": 31, "Data Science": 18, "Cybersecurity": 9}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. PRICING PLANS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pricing_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_monthly INTEGER NOT NULL,
    price_annual INTEGER NOT NULL,
    description TEXT NOT NULL,
    features JSONB NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Allow users to view & edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow public read of lessons, problems, projects, mentors, pricing
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lessons" ON public.lessons FOR SELECT USING (true);

ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read problems" ON public.coding_problems FOR SELECT USING (true);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read mentors" ON public.mentors FOR SELECT USING (true);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pricing" ON public.pricing_plans FOR SELECT USING (true);

-- ============================================================================
-- INITIAL SEED DATA FOR PRODUCTION
-- ============================================================================

INSERT INTO public.pricing_plans (id, name, price_monthly, price_annual, description, features, is_popular)
VALUES
('free', 'Free', 0, 0, 'Essential roadmap & daily missions for self-starters', '["Personalized Diagnostic Assessment", "Stepped Execution Roadmap", "Daily Missions (Learn/Practice/Build/Ship)", "Basic Sandboxed Code Practice", "Community Support"]'::jsonb, false),
('pro', 'Pro Developer', 499, 4990, 'Comprehensive execution suite with full AI accelerators and projects', '["Everything in Free", "Advanced Personalized AI Roadmaps", "Interactive Debugging Lab", "Full LeetCode-style Problem Test Suites", "Production Project Workspaces", "Hackathon Mode with AI Ideation & Pitch Simulator", "Verified Proof of Work Profile (/u/username)"]'::jsonb, true),
('mentorship', '1:1 Mentorship', 1999, 19990, 'Accelerate your career with elite FAANG/top-tier engineer mentors', '["Everything in Pro", "Two 1:1 Live Mentor Review Sessions / month", "Direct GitHub Code Architecture Reviews", "Mock Technical & System Design Interviews", "Hackathon Strategy Blueprinting", "Exclusive Placement & Internship Referrals"]'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    price_annual = EXCLUDED.price_annual,
    features = EXCLUDED.features;

INSERT INTO public.colleges (college_name, short_code, domain, total_enrolled, active_students, average_execution_rate)
VALUES
('GLA University', 'GLAU', 'gla.ac.in', 2450, 1980, 64)
ON CONFLICT (college_name) DO NOTHING;
