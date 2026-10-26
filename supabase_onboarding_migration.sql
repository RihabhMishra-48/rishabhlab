-- ============================================================================
-- RISHABH LABS — DYNAMIC ONBOARDING & ROLE MIGRATION SCRIPT
-- Execute this script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Ensure required extensions are active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Add dynamic onboarding and mentor advance verification columns to profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS field_of_interest TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'approved' CHECK (verification_status IN ('approved', 'pending', 'rejected')),
    ADD COLUMN IF NOT EXISTS mentor_organization TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS mentor_experience_years INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS mentor_expertise JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS mentor_linkedin TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Ensure mock defaults are dropped so only actual data is saved
ALTER TABLE public.profiles 
    ALTER COLUMN college_name DROP DEFAULT,
    ALTER COLUMN degree DROP DEFAULT,
    ALTER COLUMN year_of_study DROP DEFAULT,
    ALTER COLUMN avatar_url DROP DEFAULT;

-- Ensure check constraint on role includes both student and mentor
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('student', 'mentor', 'college_admin', 'super_admin'));

-- 3. Automatic Profile Creation Trigger on Supabase Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
    assigned_status TEXT;
BEGIN
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    IF assigned_role = 'mentor' THEN
        assigned_status := 'pending';
    ELSE
        assigned_status := 'approved';
    END IF;

    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role,
        avatar_url,
        verification_status, 
        is_onboarded,
        target_goal,
        field_of_interest
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        assigned_role,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
        assigned_status,
        FALSE,
        NULL,
        NULL
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable RLS and add update/read policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" 
    ON public.profiles FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 5. Create Onboarding Records table for history & analytics
CREATE TABLE IF NOT EXISTS public.onboarding_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student',
    field_of_interest TEXT NOT NULL,
    current_level TEXT NOT NULL DEFAULT 'Beginner',
    available_time TEXT NOT NULL DEFAULT '2 hours/day',
    desired_outcome TEXT NOT NULL DEFAULT 'Build projects',
    target_date TEXT DEFAULT '90 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.onboarding_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own onboarding" ON public.onboarding_records;
CREATE POLICY "Users can read own onboarding" 
    ON public.onboarding_records FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.onboarding_records;
CREATE POLICY "Users can insert own onboarding" 
    ON public.onboarding_records FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 6. Ensure Mentors Table exists with domain filtering
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
    domain TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'General';

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read mentors" ON public.mentors;
CREATE POLICY "Public read mentors" 
    ON public.mentors FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Mentors can update own profile" ON public.mentors;
CREATE POLICY "Mentors can update own profile" 
    ON public.mentors FOR ALL 
    USING (true);

-- 7. Seed Initial Domain Mentors (Cybersecurity, Web Dev, AI/ML, App Dev)
INSERT INTO public.mentors (name, title, company, avatar, topics, experience_years, rating, bio, hourly_rate_inr, domain)
VALUES
(
    'Aryan Sharma',
    'Senior Security Architect',
    'Palo Alto Networks',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
    '["Network Penetration Testing", "SOC Analysis", "Linux Hardening", "Threat Modeling"]'::jsonb,
    7,
    4.9,
    'Ex-CERT lead. Specializes in defensive architecture, SIEM engineering, and guiding students into elite cybersecurity analyst roles.',
    0,
    'Cybersecurity'
),
(
    'Rishabh Mishra',
    'Lead Systems Architect',
    'Rishabh Labs',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
    '["Full-Stack Web", "Microservices", "System Design", "Database Optimization"]'::jsonb,
    6,
    5.0,
    'Building high-concurrency distributed platforms. Passionate about helping students ship production-grade architectures and crack tier-1 placement drives.',
    0,
    'Web Development'
),
(
    'Dr. Neha Verma',
    'AI Research Scientist',
    'Google DeepMind Affiliate',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop',
    '["Deep Learning", "PyTorch", "LLM Fine-Tuning", "Computer Vision"]'::jsonb,
    8,
    4.9,
    'Published author in NeurIPS & CVPR. Mentors students on applied GenAI, transformer models, and ML research internships.',
    0,
    'AI / ML'
),
(
    'Vikramaditya Rao',
    'Staff Mobile Architect',
    'Flipkart',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop',
    '["Flutter Engine", "React Native", "Offline-First Sync", "Mobile Security"]'::jsonb,
    6,
    4.8,
    'Shipped mobile apps with 20M+ active users. Passionate about performance tuning, custom animations, and cross-platform native plugins.',
    0,
    'App Development'
)
ON CONFLICT DO NOTHING;

-- Verification notification
DO $$
BEGIN
    RAISE NOTICE 'RishabhLabs dynamic onboarding schema & role migration executed successfully!';
END $$;
