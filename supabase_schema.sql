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
    avatar_url TEXT DEFAULT NULL,
    college_name TEXT DEFAULT NULL,
    degree TEXT DEFAULT NULL,
    year_of_study TEXT DEFAULT NULL,
    target_goal TEXT DEFAULT NULL,
    field_of_interest TEXT DEFAULT NULL,
    verification_status TEXT DEFAULT 'approved' CHECK (verification_status IN ('approved', 'pending', 'rejected')),
    mentor_organization TEXT,
    mentor_experience_years INTEGER DEFAULT 0,
    mentor_expertise JSONB DEFAULT '[]'::jsonb,
    mentor_linkedin TEXT,
    is_onboarded BOOLEAN DEFAULT FALSE,
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
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
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
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    avatar TEXT NOT NULL,
    topics JSONB DEFAULT '[]'::jsonb,
    experience_years INTEGER DEFAULT 5,
    rating NUMERIC(3,2) DEFAULT 4.90,
    reviews_count INTEGER DEFAULT 48,
    bio TEXT NOT NULL,
    hourly_rate TEXT DEFAULT 'Free for Pro',
    hourly_rate_inr INTEGER DEFAULT 0,
    availability JSONB DEFAULT '["Tomorrow, 6:00 PM IST"]'::jsonb,
    available_days JSONB DEFAULT '[]'::jsonb,
    is_available_today BOOLEAN DEFAULT TRUE,
    domain TEXT DEFAULT 'Full-Stack Development',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    context_type TEXT DEFAULT 'general' CHECK (context_type IN ('general', 'stuck_in_coding', 'roadmap_review', 'hackathon_mvp', 'project_review')),
    message TEXT,
    student_note TEXT,
    preferred_slot TEXT DEFAULT 'Tomorrow, 6:00 PM IST',
    requested_date TEXT DEFAULT (CURRENT_DATE::TEXT),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'confirmed', 'completed', 'cancelled')),
    meeting_link TEXT,
    notes_from_mentor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow public read of lessons, problems, projects, mentors, pricing
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read lessons" ON public.lessons;
CREATE POLICY "Public read lessons" ON public.lessons FOR SELECT USING (true);

ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read problems" ON public.coding_problems;
CREATE POLICY "Public read problems" ON public.coding_problems FOR SELECT USING (true);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read mentors" ON public.mentors;
CREATE POLICY "Public read mentors" ON public.mentors FOR SELECT USING (true);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pricing" ON public.pricing_plans;
CREATE POLICY "Public read pricing" ON public.pricing_plans FOR SELECT USING (true);

-- Allow users to manage their own learning and progress artifacts
DROP POLICY IF EXISTS "Users can manage own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can manage own roadmaps" ON public.roadmaps FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own missions" ON public.daily_missions;
CREATE POLICY "Users can manage own missions" ON public.daily_missions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own submissions" ON public.submissions;
CREATE POLICY "Users can manage own submissions" ON public.submissions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own projects" ON public.student_projects;
CREATE POLICY "Users can manage own projects" ON public.student_projects FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own reviews" ON public.weekly_reviews;
CREATE POLICY "Users can manage own reviews" ON public.weekly_reviews FOR ALL USING (auth.uid() = user_id);

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


-- ============================================================================
-- 12. CODING PROBLEMS SEED DATA
-- ============================================================================
-- ============================================================================
-- RISHABH LABS — CODING SANDBOX & PRACTICE PROBLEMS SEED QUERY
-- Run this query in Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'dom-event-debounce',
    'DOM Event Debounce with Immediate Execution Option',
    'Easy',
    'Web Development',
    FALSE,
    NULL,
    '## DOM Event Debounce
Implement a debouncing function `debounce(fn, delayMs, immediate)` that delays invoking `fn` until after `delayMs` milliseconds have elapsed since the last time the debounced function was invoked.

### Requirements:
- If `immediate` is `true`, invoke `fn` on the leading edge rather than the trailing edge.
- Return the wrapped function maintaining correct arguments and return values.
- Subsequent calls within the window reset the delay timer.',
    '[{"input":"fn=searchApi, delayMs=300, calls=[0ms, 100ms, 250ms]","output":"Invoked once at 550ms with arguments from 250ms call","explanation":"Each call resets the 300ms countdown until calls cease."}]'::jsonb,
    '["1 <= delayMs <= 10,000","fn is a valid callable function","Memory leaks from un-cleared timers must be prevented"]'::jsonb,
    '{"javascript":"function debounce(fn, delayMs = 300, immediate = false) {\n  let timerId = null;\n  return function(...args) {\n    const callNow = immediate && !timerId;\n    clearTimeout(timerId);\n    timerId = setTimeout(() => {\n      timerId = null;\n      if (!immediate) fn.apply(this, args);\n    }, delayMs);\n    if (callNow) fn.apply(this, args);\n  };\n}","python":"import threading\n\ndef debounce(fn, delay_sec=0.3, immediate=False):\n    timer = None\n    def wrapper(*args, **kwargs):\n        nonlocal timer\n        call_now = immediate and timer is None\n        if timer is not None:\n            timer.cancel()\n        timer = threading.Timer(delay_sec, lambda: fn(*args, **kwargs))\n        timer.start()\n        if call_now:\n            fn(*args, **kwargs)\n    return wrapper","cpp":"// C++ Debounce utility","java":"// Java ScheduledExecutorService Debounce utility"}'::jsonb,
    '{"level1Concept":"Maintain a timer variable in closure and call clearTimeout whenever a new invocation occurs.","level2Stronger":"For immediate execution, check if timer is currently null; invoke immediately if true.","level3Approach":"Store timerId in lexical scope, reset with clearTimeout(timerId), schedule trailing dispatch if !immediate."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"debounce(add, 100)([1, 2])","expectedOutput":"3","isHidden":false},{"testCaseId":"tc-2","input":"rapid 5 calls within 50ms (delay 100ms)","expectedOutput":"callCount === 1","isHidden":false},{"testCaseId":"tc-3","input":"immediate=true on single burst","expectedOutput":"executed instantly on leading edge","isHidden":true}]'::jsonb,
    '84%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'array-groupby-polyfill',
    'Array GroupBy & Key Aggregator Polyfill',
    'Easy',
    'Web Development',
    FALSE,
    NULL,
    '## Array GroupBy Polyfill
Implement a function `groupBy(items, keySelector)` that groups elements of an array according to the string key returned by the `keySelector` callback function.

### Requirements:
- Returns an object where each property is a key and its value is an array of items with that key.
- The relative ordering of elements inside each group must be preserved.',
    '[{"input":"items=[6.1, 4.2, 6.3], keySelector=Math.floor","output":"{\"4\": [4.2], \"6\": [6.1, 6.3]}","explanation":"Math.floor categorizes elements into groups \"4\" and \"6\"."}]'::jsonb,
    '["0 <= items.length <= 10^5","keySelector will return a string or number convertable to string","Must run in O(n) linear time"]'::jsonb,
    '{"javascript":"function groupBy(items, keySelector) {\n  return items.reduce((acc, item) => {\n    const key = keySelector(item);\n    if (!acc[key]) acc[key] = [];\n    acc[key].push(item);\n    return acc;\n  }, {});\n}","python":"def group_by(items, key_selector):\n    res = {}\n    for item in items:\n        key = str(key_selector(item))\n        if key not in res:\n            res[key] = []\n        res[key].append(item)\n    return res","cpp":"// C++ std::unordered_map grouping implementation","java":"// Java Collectors.groupingBy implementation"}'::jsonb,
    '{"level1Concept":"Loop through the input array once using reduce or for..of and maintain a dictionary/object.","level2Stronger":"Initialize an empty array on the object if the key has not been encountered yet.","level3Approach":"acc[key] = acc[key] || []; acc[key].push(item); return acc;"}'::jsonb,
    '[{"testCaseId":"tc-1","input":"groupBy([6.1, 4.2, 6.3], Math.floor)","expectedOutput":"{\"4\":[4.2],\"6\":[6.1,6.3]}","isHidden":false},{"testCaseId":"tc-2","input":"groupBy([\"one\", \"two\", \"three\"], s => s.length)","expectedOutput":"{\"3\":[\"one\",\"two\"],\"5\":[\"three\"]}","isHidden":false},{"testCaseId":"tc-3","input":"groupBy([], x => x)","expectedOutput":"{}","isHidden":true}]'::jsonb,
    '89%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'high-throughput-in-memory-cache',
    'High-Throughput In-Memory LRU Cache with TTL',
    'Medium',
    'Web Development',
    FALSE,
    NULL,
    '## High-Throughput In-Memory LRU Cache with TTL
Design an in-memory key-value cache engine supporting **TTL (Time-To-Live) expiration**, thread-safe **LRU (Least Recently Used) eviction**, and $O(1)$ lookups.

### Methods:
- `set(key, value, ttlMs)`: Stores value. If capacity exceeded, evicts the least recently used active key.
- `get(key)`: Returns value if present and unexpired, updating access recency. Returns `null` if missing/expired.
- `purge()`: Removes all expired entries, returning the count of purged items.
- `size()`: Returns count of active unexpired items.',
    '[{"input":"[\"CacheEngine\", 2], [\"set\", \"token\", \"xyz\", 5000], [\"get\", \"token\"]","output":"[null, null, \"xyz\"]","explanation":"Retrieves value within TTL and updates LRU order."}]'::jsonb,
    '["1 <= capacity <= 10,000","Average time complexity must be O(1) for get and set"]'::jsonb,
    '{"javascript":"class CacheEngine {\n  constructor(capacity = 1000) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  set(key, value, ttlMs) {\n    const expireAt = ttlMs ? Date.now() + ttlMs : null;\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    } else if (this.cache.size >= this.capacity) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n    this.cache.set(key, { val: value, expireAt });\n  }\n  get(key) {\n    if (!this.cache.has(key)) return null;\n    const item = this.cache.get(key);\n    if (item.expireAt && Date.now() > item.expireAt) {\n      this.cache.delete(key);\n      return null;\n    }\n    this.cache.delete(key);\n    this.cache.set(key, item);\n    return item.val;\n  }\n  purge() {\n    let count = 0;\n    const now = Date.now();\n    for (const [key, item] of this.cache.entries()) {\n      if (item.expireAt && now > item.expireAt) {\n        this.cache.delete(key);\n        count++;\n      }\n    }\n    return count;\n  }\n  size() {\n    this.purge();\n    return this.cache.size;\n  }\n}","python":"import time\nfrom collections import OrderedDict\n\nclass CacheEngine:\n    def __init__(self, capacity=1000):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n    def set(self, key: str, value, ttl_ms: int = None):\n        expire_at = (time.time() + ttl_ms / 1000.0) if ttl_ms else None\n        if key in self.cache:\n            del self.cache[key]\n        elif len(self.cache) >= self.capacity:\n            self.cache.popitem(last=False)\n        self.cache[key] = (value, expire_at)\n    def get(self, key: str):\n        if key not in self.cache:\n            return None\n        val, expire_at = self.cache[key]\n        if expire_at and time.time() > expire_at:\n            del self.cache[key]\n            return None\n        self.cache.move_to_end(key)\n        return val","cpp":"// C++ LRU CacheEngine with std::list and unordered_map","java":"// Java LinkedHashMap LRU CacheEngine"}'::jsonb,
    '{"level1Concept":"JavaScript Map preserves insertion order. Deleting and re-inserting moves a key to the most-recent position.","level2Stronger":"Store expireAt alongside value. On get(), if Date.now() > expireAt, delete and return null.","level3Approach":"Combine capacity checks with LRU key eviction using this.cache.keys().next().value."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"set(\"a\", 1), set(\"b\", 2), set(\"c\", 3) on capacity=2 -> get(\"a\")","expectedOutput":"null","isHidden":false},{"testCaseId":"tc-2","input":"set(\"auth\", \"tok\", 5000) -> get(\"auth\")","expectedOutput":"\"tok\"","isHidden":false},{"testCaseId":"tc-3","input":"eviction respects access refresh","expectedOutput":"least recent evicted first","isHidden":true}]'::jsonb,
    '68%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'deep-clone-circular',
    'Deep Object Clone with Circular Reference Resolution',
    'Medium',
    'Web Development',
    FALSE,
    NULL,
    '## Deep Object Clone with Circular Reference Handling
Implement a function `deepClone(value)` that creates a deep copy of any JavaScript object or array without infinite recursion when objects contain circular references to themselves or ancestors.

### Requirements:
- Handles nested objects, arrays, primitives, Dates, and RegExps.
- Resolves circular references by reusing the previously cloned instance from a WeakMap.',
    '[{"input":"const a = { name: \"node\" }; a.self = a;","output":"Clone maintains identical structure where cloned.self === cloned","explanation":"Deep clone must not exceed call stack or crash on circular pointers."}]'::jsonb,
    '["Input can be nested up to 500 levels deep","Cannot use structuredClone or JSON.parse(JSON.stringify())"]'::jsonb,
    '{"javascript":"function deepClone(target, hash = new WeakMap()) {\n  if (target === null || typeof target !== ''object'') return target;\n  if (target instanceof Date) return new Date(target);\n  if (target instanceof RegExp) return new RegExp(target);\n  if (hash.has(target)) return hash.get(target);\n\n  const clone = Array.isArray(target) ? [] : {};\n  hash.set(target, clone);\n\n  for (const key of Object.keys(target)) {\n    clone[key] = deepClone(target[key], hash);\n  }\n  return clone;\n}","python":"def deep_clone(target, memo=None):\n    if memo is None:\n        memo = {}\n    if target is None or not isinstance(target, (dict, list)):\n        return target\n    obj_id = id(target)\n    if obj_id in memo:\n        return memo[obj_id]\n    if isinstance(target, list):\n        clone = []\n        memo[obj_id] = clone\n        for item in target:\n            clone.append(deep_clone(item, memo))\n        return clone\n    clone = {}\n    memo[obj_id] = clone\n    for k, v in target.items():\n        clone[k] = deep_clone(v, memo)\n    return clone","cpp":"// C++ deep clone","java":"// Java deep clone"}'::jsonb,
    '{"level1Concept":"Use a WeakMap to track visited objects and their corresponding newly cloned instances.","level2Stronger":"Before recursing into an object property, check if it already exists in the WeakMap.","level3Approach":"hash.set(target, clone); then recurse over child keys."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"{ a: 1, b: { c: 2 } }","expectedOutput":"deeply cloned independent object","isHidden":false},{"testCaseId":"tc-2","input":"circular object referencing itself","expectedOutput":"cloned.self === cloned without stack overflow","isHidden":false},{"testCaseId":"tc-3","input":"array of nested objects with shared sub-branches","expectedOutput":"preserved branch identities","isHidden":true}]'::jsonb,
    '62%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'fix-the-bug-async-drop',
    'Fix the Bug: Race Condition in Concurrent Async Fetch Queue',
    'Medium',
    'Web Development',
    TRUE,
    'The asynchronous search handler triggers multiple parallel requests as the user types, but updates UI state with whichever request completes first. When an earlier, slower request finishes after a subsequent request, obsolete results overwrite fresh state.',
    '## Fix the Bug: Concurrent Async State Race Condition
In an interactive search filter, typing rapidly fires off asynchronous API queries.

### The Bug:
When network latencies fluctuate, Request A (sent for "re") might take 400ms, while Request B (sent for "react") takes 100ms. Request B finishes first and displays "react" results; then Request A finishes 300ms later and overwrites the screen with stale "re" results!

### Your Task:
Inspect the buggy `SearchQueueManager` implementation and fix it using a request ID sequence counter or AbortController so that only the latest active query updates the final result state.',
    '[{"input":"query(\"re\") [takes 300ms], query(\"react\") [takes 50ms]","output":"Final state contains results for \"react\"","explanation":"The stale response from \"re\" must be discarded."}]'::jsonb,
    '["Must handle out-of-order response arrivals gracefully","Discarded responses must not trigger callback or state updates"]'::jsonb,
    '{"javascript":"class SearchQueueManager {\n  constructor(fetchFn, onResult) {\n    this.fetchFn = fetchFn;\n    this.onResult = onResult;\n    // BUGGY: Does not track request IDs or abort stale inflight calls!\n  }\n\n  async search(query) {\n    // FIX THIS: Ensure stale queries cannot overwrite newer results\n    const results = await this.fetchFn(query);\n    this.onResult(results);\n  }\n}","python":"class SearchQueueManager:\n    def __init__(self, fetch_fn, on_result):\n        self.fetch_fn = fetch_fn\n        self.on_result = on_result\n        self.current_id = 0\n\n    async def search(self, query):\n        self.current_id += 1\n        req_id = self.current_id\n        results = await self.fetch_fn(query)\n        if req_id == self.current_id:\n            self.on_result(results)","cpp":"// C++ async queue","java":"// Java CompletableFuture queue"}'::jsonb,
    '{"level1Concept":"Maintain an incrementing sequence integer this.latestRequestId.","level2Stronger":"Capture the local requestId before awaiting fetchFn. After resolution, compare localId === this.latestRequestId.","level3Approach":"const reqId = ++this.latestRequestId; const res = await this.fetchFn(query); if (reqId === this.latestRequestId) this.onResult(res);"}'::jsonb,
    '[{"testCaseId":"tc-1","input":"stale 300ms request arrives after 100ms request","expectedOutput":"100ms request remains active","isHidden":false},{"testCaseId":"tc-2","input":"single search query finishes normally","expectedOutput":"onResult invoked once with payload","isHidden":false},{"testCaseId":"tc-3","input":"rapid typing burst of 10 requests","expectedOutput":"only request #10 updates state","isHidden":true}]'::jsonb,
    '71%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'reactive-virtual-dom-diff',
    'Virtual DOM Tree Reconciliation & Minimal Patch Engine',
    'Hard',
    'Web Development',
    FALSE,
    NULL,
    '## Minimal Virtual DOM Diffing Engine
Build a lightweight tree reconciliation function `diff(oldTree, newTree)` that compares two VNode representations and outputs an array of mutation instructions.

### Patch Operation Types:
- `{ type: ''CREATE'', node: newTree }`
- `{ type: ''REMOVE'' }`
- `{ type: ''REPLACE'', node: newTree }`
- `{ type: ''UPDATE_TEXT'', text: newText }`
- `{ type: ''UPDATE_PROPS'', props: diffProps }`
- `{ type: ''CHILDREN'', diffs: [...] }`',
    '[{"input":"old={ tag: \"h1\", text: \"Hello\" }, new={ tag: \"h1\", text: \"World\" }","output":"[{ type: \"UPDATE_TEXT\", text: \"World\" }]","explanation":"Tags match; only inner text changed."}]'::jsonb,
    '["Trees may have arbitrary child depth up to 50","Execution must be O(n) using keyless single-pass comparison"]'::jsonb,
    '{"javascript":"function diff(oldNode, newNode) {\n  if (!oldNode) return [{ type: ''CREATE'', node: newNode }];\n  if (!newNode) return [{ type: ''REMOVE'' }];\n  if (typeof oldNode === ''string'' || typeof newNode === ''string'') {\n    if (oldNode !== newNode) return [{ type: ''UPDATE_TEXT'', text: newNode }];\n    return [];\n  }\n  if (oldNode.tag !== newNode.tag) {\n    return [{ type: ''REPLACE'', node: newNode }];\n  }\n  const patches = [];\n  // Compare props and children\n  return patches;\n}","python":"def diff(old_node, new_node):\n    if old_node is None:\n        return [{''type'': ''CREATE'', ''node'': new_node}]\n    if new_node is None:\n        return [{''type'': ''REMOVE''}]\n    if isinstance(old_node, str) or isinstance(new_node, str):\n        if old_node != new_node:\n            return [{''type'': ''UPDATE_TEXT'', ''text'': new_node}]\n        return []\n    if old_node.get(''tag'') != new_node.get(''tag''):\n        return [{''type'': ''REPLACE'', ''node'': new_node}]\n    return []","cpp":"// C++ VNode diffing","java":"// Java VNode diffing"}'::jsonb,
    '{"level1Concept":"Base conditions: check for node creation, removal, and tag mismatch replacement first.","level2Stronger":"If tags match, compare props objects for changed or removed keys.","level3Approach":"Recursively diff children arrays up to Math.max(old.children.length, new.children.length)."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"old=\"A\", new=\"B\"","expectedOutput":"[{ type: \"UPDATE_TEXT\", text: \"B\" }]","isHidden":false},{"testCaseId":"tc-2","input":"different tags div -> span","expectedOutput":"[{ type: \"REPLACE\", node: { tag: \"span\" } }]","isHidden":false},{"testCaseId":"tc-3","input":"nested child mutation","expectedOutput":"patches generated at correct child index","isHidden":true}]'::jsonb,
    '48%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'tensor-reshape-normalization',
    'NumPy Tensor Reshape & Min-Max Vectorized Normalization',
    'Easy',
    'AI & Machine Learning',
    FALSE,
    NULL,
    '## NumPy Tensor Reshape & Min-Max Normalization
Given a 2D matrix representing feature vectors, write a function `minMaxScale(matrix)` that normalizes each column independently to the range $[0.0, 1.0]$ using:
$$x_{\text{norm}} = \frac{x - \min(X)}{\max(X) - \min(X)}$$

If a column has equal min and max, set all values in that column to `0.0` to avoid division by zero. Round answers to 2 decimal places.',
    '[{"input":"[[10, 200], [20, 300], [30, 400]]","output":"[[0.0, 0.0], [0.5, 0.5], [1.0, 1.0]]","explanation":"Col 0 scaled across [10, 30], Col 1 across [200, 400]."}]'::jsonb,
    '["1 <= rows <= 1000","1 <= cols <= 100","All matrix values are real numbers"]'::jsonb,
    '{"python":"def min_max_scale(matrix):\n    if not matrix or not matrix[0]:\n        return []\n    cols = len(matrix[0])\n    col_min = [min(row[c] for row in matrix) for c in range(cols)]\n    col_max = [max(row[c] for row in matrix) for c in range(cols)]\n    res = []\n    for row in matrix:\n        norm_row = []\n        for c in range(cols):\n            diff = col_max[c] - col_min[c]\n            norm_row.append(round((row[c] - col_min[c]) / diff, 2) if diff != 0 else 0.0)\n        res.append(norm_row)\n    return res","javascript":"function minMaxScale(matrix) {\n  if (!matrix.length) return [];\n  const cols = matrix[0].length;\n  const colMin = Array.from({ length: cols }, (_, c) => Math.min(...matrix.map(r => r[c])));\n  const colMax = Array.from({ length: cols }, (_, c) => Math.max(...matrix.map(r => r[c])));\n  return matrix.map(row => row.map((val, c) => {\n    const diff = colMax[c] - colMin[c];\n    return diff !== 0 ? +( (val - colMin[c]) / diff ).toFixed(2) : 0.0;\n  }));\n}","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Find the minimum and maximum for each column index first.","level2Stronger":"Watch out for division by zero when column maximum equals minimum.","level3Approach":"Calculate diff = max - min. If diff === 0, use 0.0; else (x - min) / diff."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"[[10, 200], [20, 300], [30, 400]]","expectedOutput":"[[0.0, 0.0], [0.5, 0.5], [1.0, 1.0]]","isHidden":false},{"testCaseId":"tc-2","input":"[[5], [15]]","expectedOutput":"[[0.0], [1.0]]","isHidden":false},{"testCaseId":"tc-3","input":"[[7, 10], [7, 20]]","expectedOutput":"[[0.0, 0.0], [0.0, 1.0]]","isHidden":true}]'::jsonb,
    '86%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'cosine-similarity-vector-search',
    'Cosine Similarity Engine for Embedding Retrieval',
    'Easy',
    'AI & Machine Learning',
    FALSE,
    NULL,
    '## Cosine Similarity Embedding Search
Implement `cosineSimilarity(vecA, vecB)` to calculate the semantic similarity between two embedding vectors:
$$\cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum A_i B_i}{\sqrt{\sum A_i^2} \sqrt{\sum B_i^2}}$$

Return the score rounded to 4 decimal places. If either vector has zero magnitude, return `0.0`.',
    '[{"input":"vecA=[1, 2, 3], vecB=[2, 4, 6]","output":"1.0","explanation":"vecB is a direct positive scalar multiple of vecA, giving exact cosine similarity of 1.0."}]'::jsonb,
    '["len(vecA) == len(vecB) >= 1","-100.0 <= vecA[i], vecB[i] <= 100.0"]'::jsonb,
    '{"python":"import math\n\ndef cosine_similarity(vec_a, vec_b):\n    dot = sum(a * b for a, b in zip(vec_a, vec_b))\n    mag_a = math.sqrt(sum(a * a for a in vec_a))\n    mag_b = math.sqrt(sum(b * b for b in vec_b))\n    if mag_a == 0 or mag_b == 0:\n        return 0.0\n    return round(dot / (mag_a * mag_b), 4)","javascript":"function cosineSimilarity(vecA, vecB) {\n  let dot = 0, magA = 0, magB = 0;\n  for (let i = 0; i < vecA.length; i++) {\n    dot += vecA[i] * vecB[i];\n    magA += vecA[i] * vecA[i];\n    magB += vecB[i] * vecB[i];\n  }\n  const denom = Math.sqrt(magA) * Math.sqrt(magB);\n  return denom === 0 ? 0.0 : +(dot / denom).toFixed(4);\n}","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Compute the dot product (sum of pairwise multiplications) and the Euclidean norms of both vectors.","level2Stronger":"Divide dot product by the product of both magnitudes.","level3Approach":"Check for zero denominator before dividing to prevent NaN."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"vecA=[1, 0], vecB=[0, 1]","expectedOutput":"0.0","isHidden":false},{"testCaseId":"tc-2","input":"vecA=[1, 2, 3], vecB=[2, 4, 6]","expectedOutput":"1.0","isHidden":false},{"testCaseId":"tc-3","input":"vecA=[1, 2], vecB=[-1, -2]","expectedOutput":"-1.0","isHidden":true}]'::jsonb,
    '82%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'linear-regression-gradient-step',
    'Linear Regression Gradient Descent Step',
    'Medium',
    'AI & Machine Learning',
    FALSE,
    NULL,
    '## Linear Regression Gradient Descent Step
Implement a single parameter update step for univariate linear regression:
$$\hat{y} = w \cdot x + b$$
Using Mean Squared Error (MSE) loss:
$$L = \frac{1}{N} \sum (\hat{y}_i - y_i)^2$$

Compute gradients $\frac{\partial L}{\partial w}$ and $\frac{\partial L}{\partial b}$, then return the updated parameters `[new_w, new_b]` rounded to 4 decimal places.',
    '[{"input":"x=[1, 2, 3], y=[2, 4, 6], w=0.0, b=0.0, lr=0.1","output":"[1.8667, 0.8]","explanation":"Gradients: dw = -18.667, db = -8.0; updated with lr=0.1."}]'::jsonb,
    '["len(x) == len(y) >= 1","0.0001 <= lr <= 1.0"]'::jsonb,
    '{"python":"def gradient_descent_step(x, y, w, b, lr):\n    n = len(x)\n    dw = 0.0\n    db = 0.0\n    for i in range(n):\n        y_pred = w * x[i] + b\n        diff = y_pred - y[i]\n        dw += (2.0 / n) * diff * x[i]\n        db += (2.0 / n) * diff\n    new_w = round(w - lr * dw, 4)\n    new_b = round(b - lr * db, 4)\n    return [new_w, new_b]","javascript":"function gradientDescentStep(x, y, w, b, lr) {\n  const n = x.length;\n  let dw = 0, db = 0;\n  for (let i = 0; i < n; i++) {\n    const diff = (w * x[i] + b) - y[i];\n    dw += (2 / n) * diff * x[i];\n    db += (2 / n) * diff;\n  }\n  return [+(w - lr * dw).toFixed(4), +(b - lr * db).toFixed(4)];\n}","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Compute predictions y_pred = w * x + b for all points.","level2Stronger":"Gradient for w: (2/N) * sum((y_pred - y) * x). Gradient for b: (2/N) * sum(y_pred - y).","level3Approach":"Update: w_new = w - lr * dw; b_new = b - lr * db."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"x=[1, 2, 3], y=[2, 4, 6], w=0.0, b=0.0, lr=0.1","expectedOutput":"[1.8667, 0.8]","isHidden":false},{"testCaseId":"tc-2","input":"x=[2], y=[4], w=1.0, b=0.0, lr=0.05","expectedOutput":"[1.4, 0.2]","isHidden":false},{"testCaseId":"tc-3","input":"exact fit produces zero gradients","expectedOutput":"[w, b] unchanged","isHidden":true}]'::jsonb,
    '71%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'softmax-activation-numerical-stability',
    'Numerically Stable Softmax & Cross-Entropy Loss',
    'Medium',
    'AI & Machine Learning',
    FALSE,
    NULL,
    '## Numerically Stable Softmax
Directly computing $\frac{e^{z_i}}{\sum e^{z_j}}$ overflows into `Infinity` when logits $z_i > 710$.

Implement `stableSoftmax(logits)` that prevents overflow by subtracting the maximum logit before exponentiating:
$$S(z_i) = \frac{e^{z_i - \max(z)}}{\sum_j e^{z_j - \max(z)}}$$

Return probabilities rounded to 4 decimal places. Sum of probabilities must equal 1.0.',
    '[{"input":"logits=[1000, 1001, 1002]","output":"[0.0900, 0.2447, 0.6652]","explanation":"Subtracting max (1002) yields [-2, -1, 0], avoiding overflow."}]'::jsonb,
    '["1 <= len(logits) <= 10,000","-10^6 <= logits[i] <= 10^6"]'::jsonb,
    '{"python":"import math\n\ndef stable_softmax(logits):\n    if not logits:\n        return []\n    max_logit = max(logits)\n    exp_shifted = [math.exp(x - max_logit) for x in logits]\n    total = sum(exp_shifted)\n    return [round(val / total, 4) for val in exp_shifted]","javascript":"function stableSoftmax(logits) {\n  if (!logits.length) return [];\n  const maxLogit = Math.max(...logits);\n  const expShifted = logits.map(x => Math.exp(x - maxLogit));\n  const total = expShifted.reduce((a, b) => a + b, 0);\n  return expShifted.map(v => +(v / total).toFixed(4));\n}","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Standard exp() blows up to infinity on large positive floats.","level2Stronger":"e^(z - M) / sum(e^(z - M)) is mathematically identical to standard softmax.","level3Approach":"Subtract Math.max(...logits), calculate exp(), divide by total."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"[1000, 1001, 1002]","expectedOutput":"[0.09, 0.2447, 0.6652]","isHidden":false},{"testCaseId":"tc-2","input":"[0, 0]","expectedOutput":"[0.5, 0.5]","isHidden":false},{"testCaseId":"tc-3","input":"extreme negative logits [-1000, -998]","expectedOutput":"[0.1192, 0.8808]","isHidden":true}]'::jsonb,
    '66%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'fix-the-bug-vanishing-gradient',
    'Fix the Bug: Gradient Saturation & Exploding Tensor Norm',
    'Medium',
    'AI & Machine Learning',
    TRUE,
    'During deep neural network backpropagation, sigmoid activation saturation squashes gradients to near-zero ($< 10^{-12}$) across 5 layers, halting learning. The derivative formula in backward pass also fails to clip maximum gradient norms, causing NaN exploding oscillations.',
    '## Fix the Bug: Vanishing & Exploding Gradients
In a multi-layer perceptron training loop, loss diverges to `NaN` after 3 iterations.

### The Problem:
1. Sigmoid derivatives saturated to zero on large inputs.
2. Gradients accumulated without norm thresholding (gradient clipping).

### Your Task:
Inspect `backpropStep` and introduce gradient clipping so that if $\|g\| > \text{maxNorm}$, the gradient is scaled down proportionally by $\frac{\text{maxNorm}}{\|g\|}$.',
    '[{"input":"gradients=[15.0, 20.0], maxNorm=10.0","output":"[6.0, 8.0]","explanation":"Norm is sqrt(225+400)=25.0. Scaled by 10/25 = 0.4."}]'::jsonb,
    '["Gradients must maintain relative directional proportions","If norm <= maxNorm, gradients remain untouched"]'::jsonb,
    '{"python":"import math\n\ndef clip_gradients(gradients, max_norm=5.0):\n    norm = math.sqrt(sum(g * g for g in gradients))\n    if norm > max_norm:\n        scale = max_norm / norm\n        return [round(g * scale, 4) for g in gradients]\n    return [round(g, 4) for g in gradients]","javascript":"function clipGradients(gradients, maxNorm = 5.0) {\n  const norm = Math.sqrt(gradients.reduce((sum, g) => sum + g * g, 0));\n  if (norm > maxNorm) {\n    const scale = maxNorm / norm;\n    return gradients.map(g => +(g * scale).toFixed(4));\n  }\n  return gradients.map(g => +g.toFixed(4));\n}","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Compute the L2 Euclidean norm of the entire gradient vector.","level2Stronger":"If norm exceeds maxNorm, multiply each component by (maxNorm / norm).","level3Approach":"norm = sqrt(sum(g^2)); if (norm > maxNorm) g = g * (maxNorm / norm)."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"gradients=[3.0, 4.0], maxNorm=10.0","expectedOutput":"[3.0, 4.0]","isHidden":false},{"testCaseId":"tc-2","input":"gradients=[15.0, 20.0], maxNorm=10.0","expectedOutput":"[6.0, 8.0]","isHidden":false},{"testCaseId":"tc-3","input":"gradients=[100.0], maxNorm=5.0","expectedOutput":"[5.0]","isHidden":true}]'::jsonb,
    '74%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'mobile-safe-area-calculator',
    'Mobile Viewport Safe Area & Gesture Pill Insets Calculator',
    'Easy',
    'Mobile App Development',
    FALSE,
    NULL,
    '## Mobile Safe Area Insets Calculator
Given a device screen dimension `{ width, height, orientation }` and hardware cutout specifications `{ notchHeight, gestureBarHeight, hasIsland }`, compute the usable safe layout rectangle `{ top, right, bottom, left, safeWidth, safeHeight }`.

### Rules:
- In portrait: `top` inset is determined by notch or dynamic island; `bottom` by gesture home bar.
- In landscape: `left` or `right` inset accommodates the camera cutout. Usable width shrinks accordingly.',
    '[{"input":"screen={ width: 393, height: 852, orientation: \"portrait\" }, hardware={ notchHeight: 47, gestureBarHeight: 34 }","output":"{ top: 47, bottom: 34, left: 0, right: 0, safeWidth: 393, safeHeight: 771 }","explanation":"Safe height is 852 - 47 - 34 = 771px."}]'::jsonb,
    '["Screen dimensions are positive integers","Orientation is either \"portrait\" or \"landscape\""]'::jsonb,
    '{"javascript":"function computeSafeArea(screen, hardware) {\n  const { width, height, orientation } = screen;\n  const { notchHeight = 0, gestureBarHeight = 0 } = hardware;\n\n  if (orientation === ''portrait'') {\n    return {\n      top: notchHeight,\n      bottom: gestureBarHeight,\n      left: 0,\n      right: 0,\n      safeWidth: width,\n      safeHeight: height - notchHeight - gestureBarHeight\n    };\n  } else {\n    return {\n      top: 0,\n      bottom: gestureBarHeight,\n      left: notchHeight,\n      right: 0,\n      safeWidth: width - notchHeight,\n      safeHeight: height - gestureBarHeight\n    };\n  }\n}","python":"def compute_safe_area(screen, hardware):\n    w, h, orient = screen[''width''], screen[''height''], screen[''orientation'']\n    notch = hardware.get(''notchHeight'', 0)\n    bar = hardware.get(''gestureBarHeight'', 0)\n    if orient == ''portrait'':\n        return {\n            ''top'': notch, ''bottom'': bar, ''left'': 0, ''right'': 0,\n            ''safeWidth'': w, ''safeHeight'': h - notch - bar\n        }\n    return {\n        ''top'': 0, ''bottom'': bar, ''left'': notch, ''right'': 0,\n        ''safeWidth'': w - notch, ''safeHeight'': h - bar\n    }","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Subtract top and bottom insets from total height in portrait mode.","level2Stronger":"In landscape mode, cutouts shift to horizontal edges (left or right).","level3Approach":"safeHeight = height - top - bottom; safeWidth = width - left - right."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"portrait 393x852 notch=47 bar=34","expectedOutput":"safeHeight === 771","isHidden":false},{"testCaseId":"tc-2","input":"landscape 852x393 notch=47 bar=21","expectedOutput":"safeWidth === 805","isHidden":false},{"testCaseId":"tc-3","input":"tablet with zero notch","expectedOutput":"safeHeight === height - bar","isHidden":true}]'::jsonb,
    '85%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'touch-hit-slop-expansion',
    'Touch HitSlop Target Boundary Expander',
    'Easy',
    'Mobile App Development',
    FALSE,
    NULL,
    '## Touch HitSlop Boundary Expander
Mobile accessibility guidelines require touch targets to be at least $48 \times 48\text{ dp}$. Small icon buttons (e.g. $24 \times 24$) must use `hitSlop` to artificially expand their clickable surface without altering visual layout.

Write `isTouchInside(touchPoint, elementBounds, hitSlop)` that returns `true` if `touchPoint {x, y}` falls inside the expanded touch boundary.',
    '[{"input":"touch={ x: 15, y: 15 }, bounds={ x: 20, y: 20, width: 24, height: 24 }, hitSlop={ top: 10, left: 10, bottom: 10, right: 10 }","output":"true","explanation":"Expanded bounds are [10, 10] to [54, 54]. (15, 15) is inside!"}]'::jsonb,
    '["hitSlop values default to 0 if not provided","Element coordinates and widths are non-negative"]'::jsonb,
    '{"javascript":"function isTouchInside(touch, bounds, hitSlop = {}) {\n  const top = bounds.y - (hitSlop.top || 0);\n  const bottom = bounds.y + bounds.height + (hitSlop.bottom || 0);\n  const left = bounds.x - (hitSlop.left || 0);\n  const right = bounds.x + bounds.width + (hitSlop.right || 0);\n\n  return touch.x >= left && touch.x <= right && touch.y >= top && touch.y <= bottom;\n}","python":"def is_touch_inside(touch, bounds, hit_slop=None):\n    if hit_slop is None:\n        hit_slop = {}\n    top = bounds[''y''] - hit_slop.get(''top'', 0)\n    bottom = bounds[''y''] + bounds[''height''] + hit_slop.get(''bottom'', 0)\n    left = bounds[''x''] - hit_slop.get(''left'', 0)\n    right = bounds[''x''] + bounds[''width''] + hit_slop.get(''right'', 0)\n    return left <= touch[''x''] <= right and top <= touch[''y''] <= bottom","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Expand boundary rect outward by subtracting top/left and adding bottom/right.","level2Stronger":"Check if touch.x is within [left, right] and touch.y is within [top, bottom].","level3Approach":"Expanded: minX = x - slop.left, maxX = x + width + slop.right."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"touch at 15,15 with slop=10 on 20,20 target","expectedOutput":"true","isHidden":false},{"testCaseId":"tc-2","input":"touch outside expanded boundary at 5,5","expectedOutput":"false","isHidden":false},{"testCaseId":"tc-3","input":"touch precisely on border edge","expectedOutput":"true","isHidden":true}]'::jsonb,
    '88%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'infinite-scroll-window-recycler',
    'Virtualized List Window Recycler & Memory Buffer',
    'Medium',
    'Mobile App Development',
    FALSE,
    NULL,
    '## Virtualized Mobile List Window Recycler
Rendering 10,000 DOM nodes on mobile causes memory crashes. Virtualized lists only render items currently visible in the viewport plus an overscan buffer.

Given `scrollTop`, `viewportHeight`, `itemHeight`, and `totalItems`, implement `computeVirtualWindow(scrollTop, viewportHeight, itemHeight, totalItems, overscan=2)` returning:
`{ startIndex, endIndex, offsetY, totalHeight }`',
    '[{"input":"scrollTop=500, viewportHeight=800, itemHeight=50, totalItems=1000, overscan=2","output":"{ startIndex: 8, endIndex: 28, offsetY: 400, totalHeight: 50000 }","explanation":"Visible items: 500/50 = 10 to (500+800)/50 = 26. With overscan 2: index 8 to 28."}]'::jsonb,
    '["startIndex >= 0","endIndex <= totalItems - 1","offsetY = startIndex * itemHeight"]'::jsonb,
    '{"javascript":"function computeVirtualWindow(scrollTop, viewportHeight, itemHeight, totalItems, overscan = 2) {\n  const visibleStart = Math.floor(scrollTop / itemHeight);\n  const visibleEnd = Math.floor((scrollTop + viewportHeight) / itemHeight);\n\n  const startIndex = Math.max(0, visibleStart - overscan);\n  const endIndex = Math.min(totalItems - 1, visibleEnd + overscan);\n  const offsetY = startIndex * itemHeight;\n  const totalHeight = totalItems * itemHeight;\n\n  return { startIndex, endIndex, offsetY, totalHeight };\n}","python":"import math\n\ndef compute_virtual_window(scroll_top, viewport_height, item_height, total_items, overscan=2):\n    visible_start = math.floor(scroll_top / item_height)\n    visible_end = math.floor((scroll_top + viewport_height) / item_height)\n    start_index = max(0, visible_start - overscan)\n    end_index = min(total_items - 1, visible_end + overscan)\n    return {\n        ''startIndex'': start_index,\n        ''endIndex'': end_index,\n        ''offsetY'': start_index * item_height,\n        ''totalHeight'': total_items * item_height\n    }","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Divide scrollTop by itemHeight to find the first visible index.","level2Stronger":"Apply overscan before clamp to 0 and totalItems - 1.","level3Approach":"offsetY = startIndex * itemHeight preserves correct scroll container spacer height."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"scrollTop=0, viewport=300, itemHeight=50, total=100","expectedOutput":"startIndex === 0, offsetY === 0","isHidden":false},{"testCaseId":"tc-2","input":"scrollTop=500, viewport=800, itemHeight=50, total=1000","expectedOutput":"startIndex === 8, endIndex === 28","isHidden":false},{"testCaseId":"tc-3","input":"scroll at bottom boundary","expectedOutput":"endIndex clamped to totalItems - 1","isHidden":true}]'::jsonb,
    '63%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'fix-the-bug-layout-flicker',
    'Fix the Bug: Cumulative Layout Shift in Dynamic List Rendering',
    'Medium',
    'Mobile App Development',
    TRUE,
    'Mobile list cells are rendered with dynamic auto-height before remote image assets finish decoding. When the images finally load, the cell heights jump from 40px to 220px, triggering jarring layout jumps and breaking touch scroll momentum.',
    '## Fix the Bug: Mobile Layout Shift
When rendering product cards with remote thumbnail images, the layout flickers as images load.

### The Problem:
Cards omit fixed aspect-ratio placeholders, causing cumulative layout shifts (CLS > 0.4).

### Your Task:
Fix `calculateCardLayout` to reserve aspect-ratio bounding box dimensions `{ reservedWidth, reservedHeight }` upfront so the layout never jumps when the image finishes loading.',
    '[{"input":"cardWidth=360, aspectRatio=\"16:9\", padding=16","output":"{ contentWidth: 328, reservedHeight: 184.5 }","explanation":"contentWidth = 360 - 32 = 328; 328 * (9/16) = 184.5px."}]'::jsonb,
    '["Calculations must be deterministic before network images arrive","Supports \"16:9\", \"4:3\", and \"1:1\" aspect ratio formats"]'::jsonb,
    '{"javascript":"function calculateCardLayout(cardWidth, aspectRatio = ''16:9'', padding = 16) {\n  const contentWidth = cardWidth - (padding * 2);\n  const [wRatio, hRatio] = aspectRatio.split('':'').map(Number);\n  const reservedHeight = +(contentWidth * (hRatio / wRatio)).toFixed(1);\n  return { contentWidth, reservedHeight };\n}","python":"def calculate_card_layout(card_width, aspect_ratio=''16:9'', padding=16):\n    content_width = card_width - (padding * 2)\n    w_ratio, h_ratio = map(float, aspect_ratio.split('':''))\n    reserved_height = round(content_width * (h_ratio / w_ratio), 1)\n    return {''contentWidth'': content_width, ''reservedHeight'': reserved_height}","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Subtract total horizontal padding from total cardWidth first.","level2Stronger":"Multiply contentWidth by (hRatio / wRatio) to obtain reserved image height.","level3Approach":"Always reserve the exact dimension space in CSS/Style before image loads."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"cardWidth=360, aspect=\"16:9\", padding=16","expectedOutput":"contentWidth: 328, reservedHeight: 184.5","isHidden":false},{"testCaseId":"tc-2","input":"cardWidth=200, aspect=\"1:1\", padding=10","expectedOutput":"contentWidth: 180, reservedHeight: 180.0","isHidden":false},{"testCaseId":"tc-3","input":"zero padding square card","expectedOutput":"reservedHeight === cardWidth","isHidden":true}]'::jsonb,
    '79%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'tcp-control-flag-validator',
    'TCP Control Flag Bitmask Validator',
    'Easy',
    'Cybersecurity',
    FALSE,
    NULL,
    '## TCP Packet Control Flag Validator
In network packet inspection and firewall analysis, TCP flags are encoded in an 8-bit mask:
- `FIN = 0x01` (bit 0)
- `SYN = 0x02` (bit 1)
- `RST = 0x04` (bit 2)
- `PSH = 0x08` (bit 3)
- `ACK = 0x10` (bit 4)
- `URG = 0x20` (bit 5)

Implement `parseTcpFlags(byteVal)` that extracts an array of active flag strings and flags invalid/malicious combinations (such as **SYN+FIN** or **NULL scan**).',
    '[{"input":"0x12 (18 decimal)","output":"{ flags: [\"SYN\", \"ACK\"], isScan: false }","explanation":"0x10 (ACK) + 0x02 (SYN) = 0x12. Normal handshake response."},{"input":"0x03 (3 decimal)","output":"{ flags: [\"FIN\", \"SYN\"], isScan: true }","explanation":"SYN+FIN is an RFC 793 violation commonly used in port scanning."}]'::jsonb,
    '["0 <= byteVal <= 255","Must identify NULL (0x00), XMAS (FIN+PSH+URG), and SYN+FIN scans"]'::jsonb,
    '{"javascript":"function parseTcpFlags(byteVal) {\n  const flags = [];\n  if (byteVal & 0x01) flags.push(''FIN'');\n  if (byteVal & 0x02) flags.push(''SYN'');\n  if (byteVal & 0x04) flags.push(''RST'');\n  if (byteVal & 0x08) flags.push(''PSH'');\n  if (byteVal & 0x10) flags.push(''ACK'');\n  if (byteVal & 0x20) flags.push(''URG'');\n\n  const hasSyn = (byteVal & 0x02) !== 0;\n  const hasFin = (byteVal & 0x01) !== 0;\n  const isNullScan = byteVal === 0;\n  const isXmasScan = (byteVal & 0x29) === 0x29; // FIN + PSH + URG\n  const isSynFin = hasSyn && hasFin;\n\n  return {\n    flags,\n    isScan: isNullScan || isXmasScan || isSynFin\n  };\n}","python":"def parse_tcp_flags(byte_val):\n    flag_defs = [(''FIN'', 0x01), (''SYN'', 0x02), (''RST'', 0x04), (''PSH'', 0x08), (''ACK'', 0x10), (''URG'', 0x20)]\n    active = [name for name, mask in flag_defs if byte_val & mask]\n    is_null = (byte_val == 0)\n    is_xmas = (byte_val & 0x29) == 0x29\n    is_syn_fin = (byte_val & 0x03) == 0x03\n    return {''flags'': active, ''isScan'': is_null or is_xmas or is_syn_fin}","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Use bitwise AND (&) with flag masks to test if each specific bit is set.","level2Stronger":"SYN+FIN is illegal because a connection cannot simultaneously initiate and terminate.","level3Approach":"Flag XMAS scan when FIN (0x01), PSH (0x08), and URG (0x20) are simultaneously active."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"0x12","expectedOutput":"flags: [\"SYN\", \"ACK\"], isScan: false","isHidden":false},{"testCaseId":"tc-2","input":"0x03","expectedOutput":"flags: [\"FIN\", \"SYN\"], isScan: true","isHidden":false},{"testCaseId":"tc-3","input":"0x00 (NULL scan)","expectedOutput":"flags: [], isScan: true","isHidden":true}]'::jsonb,
    '87%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'base64url-jwt-decoder',
    'RFC 7519 Base64URL JWT Header & Payload Parser',
    'Easy',
    'Cybersecurity',
    FALSE,
    NULL,
    '## Base64URL JWT Parser
JSON Web Tokens (RFC 7519) encode header and payload segments using Base64URL formatting where `+` is replaced with `-`, `/` is replaced with `_`, and trailing `=` padding is omitted.

Implement `parseJwtPayload(tokenString)` that:
1. Validates that the token contains 3 period-separated sections (`header.payload.signature`).
2. Restores missing padding characters.
3. Decodes the payload into a parsed JSON object.',
    '[{"input":"\"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMDgiLCJyb2xlIjoiYWRtaW4ifQ.signature\"","output":"{ userId: \"108\", role: \"admin\" }","explanation":"Decodes middle segment into valid parsed object."}]'::jsonb,
    '["Input must be a valid 3-part JWT string or throw error","Base64URL padding calculation must be correct"]'::jsonb,
    '{"javascript":"function parseJwtPayload(token) {\n  const parts = token.split(''.'');\n  if (parts.length !== 3) throw new Error(''Invalid JWT format'');\n\n  let base64 = parts[1].replace(/-/g, ''+'').replace(/_/g, ''/'');\n  while (base64.length % 4 !== 0) {\n    base64 += ''='';\n  }\n  const decoded = atob(base64);\n  return JSON.parse(decoded);\n}","python":"import base64\nimport json\n\ndef parse_jwt_payload(token):\n    parts = token.split(''.'')\n    if len(parts) != 3:\n        raise ValueError(\"Invalid JWT format\")\n    payload_b64 = parts[1].replace(''-'', ''+'').replace(''_'', ''/'')\n    payload_b64 += ''='' * ((4 - len(payload_b64) % 4) % 4)\n    decoded = base64.b64decode(payload_b64).decode(''utf-8'')\n    return json.loads(decoded)","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Split the token by dot (.) to isolate header, payload, and signature.","level2Stronger":"Replace \"-\" with \"+\" and \"_\" with \"/\". Pad with \"=\" until length is divisible by 4.","level3Approach":"Decode with base64 decoder and pass to JSON.parse."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"\"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.sig\"","expectedOutput":"{\"sub\":\"1234567890\"}","isHidden":false},{"testCaseId":"tc-2","input":"invalid format with only 2 segments","expectedOutput":"throws Invalid JWT format","isHidden":false},{"testCaseId":"tc-3","input":"payload requiring 2 padding characters","expectedOutput":"correctly padded and decoded","isHidden":true}]'::jsonb,
    '81%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'rate-limiter-token-bucket',
    'Token Bucket Rate Limiter for API Flood Protection',
    'Medium',
    'Cybersecurity',
    FALSE,
    NULL,
    '## Token Bucket Rate Limiter
To defend APIs against brute-force attacks and volumetric DDoS, implement a `TokenBucketRateLimiter`:

### Algorithm:
- Bucket starts with `capacity` tokens.
- Tokens refill continuously at `refillRatePerSec` tokens/second.
- `allowRequest(tokensRequired=1)`: Returns `true` if enough tokens are available (and consumes them). Returns `false` if rate limited.',
    '[{"input":"capacity=5, refillRate=1.0 -> 5 consecutive requests allowed, 6th rejected","output":"[true, true, true, true, true, false]","explanation":"Initial capacity allows burst of 5 requests."}]'::jsonb,
    '["Refill calculation must be lazy (calculated on-demand based on elapsed time)","Tokens cannot exceed capacity"]'::jsonb,
    '{"javascript":"class TokenBucketRateLimiter {\n  constructor(capacity = 10, refillRatePerSec = 2) {\n    this.capacity = capacity;\n    this.refillRate = refillRatePerSec;\n    this.tokens = capacity;\n    this.lastRefill = Date.now();\n  }\n\n  refill() {\n    const now = Date.now();\n    const elapsedSec = (now - this.lastRefill) / 1000;\n    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);\n    this.lastRefill = now;\n  }\n\n  allowRequest(tokensRequired = 1) {\n    this.refill();\n    if (this.tokens >= tokensRequired) {\n      this.tokens -= tokensRequired;\n      return true;\n    }\n    return false;\n  }\n}","python":"import time\n\nclass TokenBucketRateLimiter:\n    def __init__(self, capacity=10, refill_rate_per_sec=2.0):\n        self.capacity = capacity\n        self.refill_rate = refill_rate_per_sec\n        self.tokens = float(capacity)\n        self.last_refill = time.time()\n\n    def refill(self):\n        now = time.time()\n        elapsed = now - self.last_refill\n        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)\n        self.last_refill = now\n\n    def allow_request(self, tokens=1):\n        self.refill()\n        if self.tokens >= tokens:\n            self.tokens -= tokens\n            return True\n        return False","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Do not use a background timer interval; calculate newly accumulated tokens whenever allowRequest() is invoked.","level2Stronger":"tokens = min(capacity, tokens + elapsedSec * refillRate).","level3Approach":"Subtract tokens only when available >= tokensRequired."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"burst of 3 with capacity 3","expectedOutput":"[true, true, true]","isHidden":false},{"testCaseId":"tc-2","input":"immediate 4th request on empty bucket","expectedOutput":"false","isHidden":false},{"testCaseId":"tc-3","input":"tokens replenish after simulated time delay","expectedOutput":"true","isHidden":true}]'::jsonb,
    '65%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'fix-the-bug-idor-access',
    'Fix the Bug: Insecure Direct Object Reference (IDOR) Bypass',
    'Medium',
    'Cybersecurity',
    TRUE,
    'The resource controller verifies that the incoming request has a valid session token, but reads the target resourceId directly from URL parameters without checking if the resource.ownerId matches the authenticated req.user.id. Any user can view or delete another user records simply by changing the ID number.',
    '## Fix the Bug: Insecure Direct Object Reference (IDOR)
In an API endpoint `GET /api/documents/:documentId`, users can view other students'' private assignments.

### The Bug:
The endpoint checks `req.user.isAuthenticated`, but does not enforce ownership or role checks before returning the database entity.

### Your Task:
Inspect `authorizeDocumentAccess(user, document)` and ensure access is only granted if:
1. `document.ownerId === user.id`, OR
2. `user.role === ''admin''`, OR
3. `document.isPublic === true`.
Otherwise, throw an unauthorized 403 Forbidden error!',
    '[{"input":"user={ id: \"u1\", role: \"student\" }, document={ id: \"d9\", ownerId: \"u2\", isPublic: false }","output":"false (Access Denied / 403)","explanation":"User u1 cannot read private document owned by u2."}]'::jsonb,
    '["Admins have universal read access regardless of ownerId","Public documents are accessible by any authenticated user"]'::jsonb,
    '{"javascript":"function authorizeDocumentAccess(user, document) {\n  if (!user || !user.isAuthenticated) {\n    throw new Error(''401 Unauthorized'');\n  }\n\n  // BUGGY: Lacks ownership verification!\n  // FIX THIS: Check ownerId, admin role, or isPublic flag\n  const isOwner = document.ownerId === user.id;\n  const isAdmin = user.role === ''admin'';\n  const isPublic = Boolean(document.isPublic);\n\n  if (isOwner || isAdmin || isPublic) {\n    return true;\n  }\n\n  throw new Error(''403 Forbidden: IDOR violation prevented'');\n}","python":"def authorize_document_access(user, document):\n    if not user or not user.get(''isAuthenticated''):\n        raise PermissionError(\"401 Unauthorized\")\n    is_owner = (document.get(''ownerId'') == user.get(''id''))\n    is_admin = (user.get(''role'') == ''admin'')\n    is_public = bool(document.get(''isPublic''))\n    if is_owner or is_admin or is_public:\n        return True\n    raise PermissionError(\"403 Forbidden\")","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Authentication (who you are) is distinct from Authorization (what you are allowed to access).","level2Stronger":"Compare document.ownerId strictly against the verified token identity user.id.","level3Approach":"if (!(isOwner || isAdmin || isPublic)) throw new Error(\"403 Forbidden\");"}'::jsonb,
    '[{"testCaseId":"tc-1","input":"owner accessing own document","expectedOutput":"true","isHidden":false},{"testCaseId":"tc-2","input":"stranger accessing private document","expectedOutput":"throws 403 Forbidden","isHidden":false},{"testCaseId":"tc-3","input":"admin accessing any document","expectedOutput":"true","isHidden":true}]'::jsonb,
    '76%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'sql-dense-rank-calculator',
    'SQL Dense Rank Window Function Calculator',
    'Easy',
    'Data & Analytics',
    FALSE,
    NULL,
    '## SQL DENSE_RANK() Calculator
In SQL analytics, `DENSE_RANK() OVER (ORDER BY score DESC)` assigns sequential integer ranks to rows without gaps:
- Equal scores receive the exact same rank.
- The next distinct score receives the immediately following consecutive integer (e.g. 1, 2, 2, 3 instead of 1, 2, 2, 4).

Implement `calculateDenseRank(scores)` returning an array of objects `[{ score, denseRank }]` sorted in descending score order.',
    '[{"input":"[100, 90, 90, 80]","output":"[{ score: 100, denseRank: 1 }, { score: 90, denseRank: 2 }, { score: 90, denseRank: 2 }, { score: 80, denseRank: 3 }]","explanation":"Rank does not skip 3 because of the tie at rank 2."}]'::jsonb,
    '["0 <= scores.length <= 10^5","Scores can be negative or decimal values"]'::jsonb,
    '{"javascript":"function calculateDenseRank(scores) {\n  const sorted = [...scores].sort((a, b) => b - a);\n  let currentRank = 1;\n  return sorted.map((score, i) => {\n    if (i > 0 && score < sorted[i - 1]) {\n      currentRank++;\n    }\n    return { score, denseRank: currentRank };\n  });\n}","python":"def calculate_dense_rank(scores):\n    sorted_scores = sorted(scores, reverse=True)\n    res = []\n    current_rank = 1\n    for i, s in enumerate(sorted_scores):\n        if i > 0 and s < sorted_scores[i - 1]:\n            current_rank += 1\n        res.append({''score'': s, ''denseRank'': current_rank})\n    return res","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Sort scores descending first.","level2Stronger":"Maintain currentRank = 1. Only increment currentRank when score < previousScore.","level3Approach":"Return sorted.map((score, i) => { if (score !== prev) rank++; return { score, rank }; })"}'::jsonb,
    '[{"testCaseId":"tc-1","input":"[100, 90, 90, 80]","expectedOutput":"dense ranks 1, 2, 2, 3","isHidden":false},{"testCaseId":"tc-2","input":"[50, 50, 50]","expectedOutput":"all receive rank 1","isHidden":false},{"testCaseId":"tc-3","input":"empty array","expectedOutput":"[]","isHidden":true}]'::jsonb,
    '84%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'pivot-sales-matrix',
    'Relational Transactions to Multi-Dimensional Pivot Matrix',
    'Easy',
    'Data & Analytics',
    FALSE,
    NULL,
    '## Relational Data Pivot Matrix
Transform an array of relational transaction rows `[{ date, region, amount }]` into a pivoted summary table where rows are distinct dates and columns are distinct regions.

### Requirements:
- If a date had no sales for a given region, fill with `0`.
- Total amounts for matching `(date, region)` pairs must be summed.',
    '[{"input":"[{ date: \"2026-03-01\", region: \"North\", amount: 100 }, { date: \"2026-03-01\", region: \"South\", amount: 150 }]","output":"{\"2026-03-01\": { \"North\": 100, \"South\": 150 }}","explanation":"Pivots normalized records into wide dictionary layout."}]'::jsonb,
    '["Amount is a positive number","Dates and regions are non-empty strings"]'::jsonb,
    '{"javascript":"function pivotTransactions(transactions) {\n  const result = {};\n  for (const { date, region, amount } of transactions) {\n    if (!result[date]) result[date] = {};\n    result[date][region] = (result[date][region] || 0) + amount;\n  }\n  return result;\n}","python":"def pivot_transactions(transactions):\n    res = {}\n    for tx in transactions:\n        d, r, a = tx[''date''], tx[''region''], tx[''amount'']\n        if d not in res:\n            res[d] = {}\n        res[d][r] = res[d].get(r, 0) + a\n    return res","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Group by date as top-level keys and region as nested sub-keys.","level2Stronger":"Accumulate amount into result[date][region].","level3Approach":"result[date][region] = (result[date][region] || 0) + amount;"}'::jsonb,
    '[{"testCaseId":"tc-1","input":"single day across North and South","expectedOutput":"nested object with summed numbers","isHidden":false},{"testCaseId":"tc-2","input":"multiple transactions on same region","expectedOutput":"amounts summed correctly","isHidden":false},{"testCaseId":"tc-3","input":"empty transactions","expectedOutput":"{}","isHidden":true}]'::jsonb,
    '80%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'moving-window-rolling-average',
    'Time-Series Rolling Window Average with Imputation',
    'Medium',
    'Data & Analytics',
    FALSE,
    NULL,
    '## Time-Series Rolling Window Average
Implement `rollingAverage(values, windowSize)` that computes the moving average over a sliding window of size `k`.

### Requirements:
- For the first $k - 1$ entries where fewer than $k$ data points are available, compute the average of all available points up to that index.
- Output values must be rounded to 2 decimal places.
- Must run in $O(n)$ time using a sliding window sum rather than re-summing inside a nested loop.',
    '[{"input":"values=[10, 20, 30, 40, 50], windowSize=3","output":"[10.0, 15.0, 20.0, 30.0, 40.0]","explanation":"Index 0: avg(10)=10; Index 1: avg(10,20)=15; Index 2: avg(10,20,30)=20; Index 3: avg(20,30,40)=30; Index 4: avg(30,40,50)=40."}]'::jsonb,
    '["1 <= windowSize <= values.length","Time complexity must be O(n)"]'::jsonb,
    '{"javascript":"function rollingAverage(values, windowSize) {\n  const result = [];\n  let windowSum = 0;\n\n  for (let i = 0; i < values.length; i++) {\n    windowSum += values[i];\n    if (i >= windowSize) {\n      windowSum -= values[i - windowSize];\n      result.push(+(windowSum / windowSize).toFixed(2));\n    } else {\n      result.push(+(windowSum / (i + 1)).toFixed(2));\n    }\n  }\n  return result;\n}","python":"def rolling_average(values, window_size):\n    res = []\n    window_sum = 0.0\n    for i, val in enumerate(values):\n        window_sum += val\n        if i >= window_size:\n            window_sum -= values[i - window_size]\n            res.append(round(window_sum / window_size, 2))\n        else:\n            res.append(round(window_sum / (i + 1), 2))\n    return res","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Add the incoming element and subtract the outgoing element values[i - windowSize].","level2Stronger":"Before i reaches windowSize, divide by (i + 1) to handle initial warmup points.","level3Approach":"Maintain running windowSum; subtract values[i - windowSize] once full window size is reached."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"values=[10, 20, 30, 40, 50], k=3","expectedOutput":"[10.0, 15.0, 20.0, 30.0, 40.0]","isHidden":false},{"testCaseId":"tc-2","input":"windowSize=1","expectedOutput":"identical to input values","isHidden":false},{"testCaseId":"tc-3","input":"constant values [5, 5, 5, 5]","expectedOutput":"[5.0, 5.0, 5.0, 5.0]","isHidden":true}]'::jsonb,
    '67%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'fix-the-bug-off-by-one-window',
    'Fix the Bug: Cumulative Window Aggregation Boundary Leak',
    'Medium',
    'Data & Analytics',
    TRUE,
    'In sliding window feature generation, the slice boundary used index + windowSize instead of inclusive horizon index + windowSize - 1, causing tomorrow data point to leak into today training features (data leakage).',
    '## Fix the Bug: Sliding Window Data Leakage
In machine learning time-series feature engineering, calculating moving statistics must never look ahead into future timesteps.

### The Bug:
A bug in `extractWindowFeatures` includes $T+1$ in $T$ calculations, causing catastrophic target leakage.

### Your Task:
Inspect `extractWindowFeatures(series, currentIndex, windowSize)` and ensure that only past and current values $\{ i - \text{windowSize} + 1, \dots, i \}$ are included in the statistics window.',
    '[{"input":"series=[10, 20, 30, 40], currentIndex=2, windowSize=2","output":"window=[20, 30]","explanation":"At index 2 (value 30), a window of size 2 must contain [20, 30] and NEVER include index 3 (40)."}]'::jsonb,
    '["Must strictly satisfy upper index <= currentIndex","Lower index clamped to 0"]'::jsonb,
    '{"javascript":"function extractWindowFeatures(series, currentIndex, windowSize) {\n  // FIX THIS: Slice must only contain elements up to currentIndex\n  const start = Math.max(0, currentIndex - windowSize + 1);\n  const end = currentIndex + 1; // Array.prototype.slice is exclusive on end\n  return series.slice(start, end);\n}","python":"def extract_window_features(series, current_index, window_size):\n    start = max(0, current_index - window_size + 1)\n    end = current_index + 1\n    return series[start:end]","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Array.prototype.slice(start, end) stops before end.","level2Stronger":"To include currentIndex, pass end = currentIndex + 1.","level3Approach":"start = Math.max(0, currentIndex - windowSize + 1); return series.slice(start, currentIndex + 1);"}'::jsonb,
    '[{"testCaseId":"tc-1","input":"series=[10, 20, 30, 40], currentIndex=2, windowSize=2","expectedOutput":"[20, 30]","isHidden":false},{"testCaseId":"tc-2","input":"currentIndex=0 with windowSize=5","expectedOutput":"[10]","isHidden":false},{"testCaseId":"tc-3","input":"full window at final element","expectedOutput":"no overflow beyond series.length","isHidden":true}]'::jsonb,
    '78%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'two-sum',
    'Two Sum',
    'Easy',
    'Web Development',
    FALSE,
    NULL,
    '## Two Sum
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    '[{"input":"nums = [2, 7, 11, 15], target = 9","output":"[0, 1]","explanation":"Because nums[0] + nums[1] == 9, we return [0, 1]."}]'::jsonb,
    '["2 <= nums.length <= 10^4","-10^9 <= nums[i] <= 10^9","Only one valid answer exists"]'::jsonb,
    '{"javascript":"function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}","python":"def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []","cpp":"// C++ unordered_map solution","java":"// Java HashMap solution"}'::jsonb,
    '{"level1Concept":"A brute force checks every pair in O(n²). Can you use a hash map for O(n)?","level2Stronger":"For each number x, calculate complement = target - x.","level3Approach":"Store map[nums[i]] = i and check if target - nums[i] was already seen."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"nums=[2, 7, 11, 15], target=9","expectedOutput":"[0, 1]","isHidden":false},{"testCaseId":"tc-2","input":"nums=[3, 2, 4], target=6","expectedOutput":"[1, 2]","isHidden":false},{"testCaseId":"tc-3","input":"nums=[3, 3], target=6","expectedOutput":"[0, 1]","isHidden":true}]'::jsonb,
    '79%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'valid-palindrome',
    'Valid Palindrome',
    'Easy',
    'Web Development',
    FALSE,
    NULL,
    '## Valid Palindrome
A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Alphanumeric characters include letters and numbers. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
    '[{"input":"\"A man, a plan, a canal: Panama\"","output":"true","explanation":"\"amanaplanacanalpanama\" reads identically backwards."}]'::jsonb,
    '["1 <= s.length <= 2 * 10^5","s consists only of printable ASCII characters"]'::jsonb,
    '{"javascript":"function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '''');\n  let left = 0, right = clean.length - 1;\n  while (left < right) {\n    if (clean[left] !== clean[right]) return false;\n    left++;\n    right--;\n  }\n  return true;\n}","python":"def is_palindrome(s: str) -> bool:\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Filter out non-alphanumeric characters and convert everything to lowercase.","level2Stronger":"Use two pointers from left and right moving towards center.","level3Approach":"Compare clean[left] === clean[right]. If mismatch, return false immediately."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"\"A man, a plan, a canal: Panama\"","expectedOutput":"true","isHidden":false},{"testCaseId":"tc-2","input":"\"race a car\"","expectedOutput":"false","isHidden":false},{"testCaseId":"tc-3","input":"\" \"","expectedOutput":"true","isHidden":true}]'::jsonb,
    '88%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'longest-substring-without-repeating',
    'Longest Substring Without Repeating Characters',
    'Medium',
    'Web Development',
    FALSE,
    NULL,
    '## Longest Substring Without Repeating Characters
Given a string `s`, find the length of the longest substring without duplicate characters.',
    '[{"input":"s = \"abcabcbb\"","output":"3","explanation":"The answer is \"abc\", with length 3."}]'::jsonb,
    '["0 <= s.length <= 5 * 10^4","s consists of English letters, digits, symbols and spaces"]'::jsonb,
    '{"javascript":"function lengthOfLongestSubstring(s) {\n  const map = new Map();\n  let maxLen = 0;\n  let left = 0;\n  for (let right = 0; right < s.length; right++) {\n    const char = s[right];\n    if (map.has(char) && map.get(char) >= left) {\n      left = map.get(char) + 1;\n    }\n    map.set(char, right);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}","python":"def length_of_longest_substring(s: str) -> int:\n    seen = {}\n    max_len = 0\n    left = 0\n    for right, char in enumerate(s):\n        if char in seen and seen[char] >= left:\n            left = seen[char] + 1\n        seen[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Use sliding window with two pointers left and right.","level2Stronger":"Store last seen index of each character in a map.","level3Approach":"When duplicate encountered at or after left, advance left = lastSeen + 1."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"\"abcabcbb\"","expectedOutput":"3","isHidden":false},{"testCaseId":"tc-2","input":"\"bbbbb\"","expectedOutput":"1","isHidden":false},{"testCaseId":"tc-3","input":"\"pwwkew\"","expectedOutput":"3","isHidden":true}]'::jsonb,
    '55%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'merge-intervals',
    'Merge Overlapping Intervals',
    'Medium',
    'Web Development',
    FALSE,
    NULL,
    '## Merge Overlapping Intervals
Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of non-overlapping intervals that cover all intervals in the input.',
    '[{"input":"[[1, 3], [2, 6], [8, 10], [15, 18]]","output":"[[1, 6], [8, 10], [15, 18]]","explanation":"Intervals [1, 3] and [2, 6] overlap; merged into [1, 6]."}]'::jsonb,
    '["1 <= intervals.length <= 10^4","intervals[i].length == 2","0 <= start_i <= end_i <= 10^4"]'::jsonb,
    '{"javascript":"function merge(intervals) {\n  if (intervals.length <= 1) return intervals;\n  intervals.sort((a, b) => a[0] - b[0]);\n  const merged = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const current = intervals[i];\n    const last = merged[merged.length - 1];\n    if (current[0] <= last[1]) {\n      last[1] = Math.max(last[1], current[1]);\n    } else {\n      merged.push(current);\n    }\n  }\n  return merged;\n}","python":"def merge(intervals):\n    if len(intervals) <= 1:\n        return intervals\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for current in intervals[1:]:\n        last = merged[-1]\n        if current[0] <= last[1]:\n            last[1] = max(last[1], current[1])\n        else:\n            merged.append(current)\n    return merged","cpp":"// C++ implementation","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Sort intervals by starting coordinate intervals.sort((a, b) => a[0] - b[0]).","level2Stronger":"Compare current interval start against last merged interval end.","level3Approach":"If current[0] <= last[1], update last[1] = max(last[1], current[1]). Else push current."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"[[1, 3], [2, 6], [8, 10], [15, 18]]","expectedOutput":"[[1, 6], [8, 10], [15, 18]]","isHidden":false},{"testCaseId":"tc-2","input":"[[1, 4], [4, 5]]","expectedOutput":"[[1, 5]]","isHidden":false},{"testCaseId":"tc-3","input":"[[1, 4], [2, 3]]","expectedOutput":"[[1, 4]]","isHidden":true}]'::jsonb,
    '64%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

INSERT INTO public.coding_problems (
    slug, title, difficulty, category, is_debugging_challenge, broken_bug_explanation,
    description_markdown, examples, constraints, starter_code, hints, test_cases, acceptance_rate
) VALUES (
    'trapping-rain-water',
    'Trapping Rain Water Elevation Geometry',
    'Hard',
    'Web Development',
    FALSE,
    NULL,
    '## Trapping Rain Water
Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
    '[{"input":"[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]","output":"6","explanation":"6 total units of rain water trapped between the elevation walls."}]'::jsonb,
    '["n == height.length","1 <= n <= 2 * 10^4","0 <= height[i] <= 10^5"]'::jsonb,
    '{"javascript":"function trap(height) {\n  let left = 0, right = height.length - 1;\n  let leftMax = 0, rightMax = 0;\n  let water = 0;\n\n  while (left < right) {\n    if (height[left] < height[right]) {\n      if (height[left] >= leftMax) {\n        leftMax = height[left];\n      } else {\n        water += leftMax - height[left];\n      }\n      left++;\n    } else {\n      if (height[right] >= rightMax) {\n        rightMax = height[right];\n      } else {\n        water += rightMax - height[right];\n      }\n      right--;\n    }\n  }\n  return water;\n}","python":"def trap(height):\n    left, right = 0, len(height) - 1\n    left_max, right_max = 0, 0\n    water = 0\n    while left < right:\n        if height[left] < height[right]:\n            if height[left] >= left_max:\n                left_max = height[left]\n            else:\n                water += left_max - height[left]\n            left += 1\n        else:\n            if height[right] >= right_max:\n                right_max = height[right]\n            else:\n                water += right_max - height[right]\n            right -= 1\n    return water","cpp":"// C++ two-pointer O(1) space","java":"// Java implementation"}'::jsonb,
    '{"level1Concept":"Water trapped at index i is determined by min(max_left, max_right) - height[i].","level2Stronger":"Two pointers from both ends achieve O(1) auxiliary space without storing prefix arrays.","level3Approach":"Advance the pointer on the side with the smaller barrier height."}'::jsonb,
    '[{"testCaseId":"tc-1","input":"[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]","expectedOutput":"6","isHidden":false},{"testCaseId":"tc-2","input":"[4, 2, 0, 3, 2, 5]","expectedOutput":"9","isHidden":false},{"testCaseId":"tc-3","input":"[1, 2, 3, 4]","expectedOutput":"0","isHidden":true}]'::jsonb,
    '42%'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    is_debugging_challenge = EXCLUDED.is_debugging_challenge,
    broken_bug_explanation = EXCLUDED.broken_bug_explanation,
    description_markdown = EXCLUDED.description_markdown,
    examples = EXCLUDED.examples,
    constraints = EXCLUDED.constraints,
    starter_code = EXCLUDED.starter_code,
    hints = EXCLUDED.hints,
    test_cases = EXCLUDED.test_cases,
    acceptance_rate = EXCLUDED.acceptance_rate;

