# ⚡ Rishabh Labs — Supabase Production Setup Guide

Rishabh Labs is architected to run on **Supabase (PostgreSQL)** for production authentication, relational data persistence, and row-level security (RLS).

---

## 🚀 3-Step Setup Guide

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**.
3. Choose your organization, project name (`rishabh-labs`), and database password.
4. Select your preferred region (e.g., *Mumbai / ap-south-1* for India).

---

### Step 2: Run the Database Schema (1-Click)
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Copy the entire contents of the file:
   [`supabase_schema.sql`](./supabase_schema.sql)
4. Paste it into the SQL Editor and click **Run** (or `Ctrl+Enter`).
5. This automatically creates:
   * `public.profiles` (linked to `auth.users` with automatic signup triggers)
   * `public.roadmaps` & `public.roadmap_nodes`
   * `public.daily_missions` & `public.mission_tasks`
   * `public.lessons` (with seeded interactive JavaScript & DOM lessons)
   * `public.coding_problems` & `public.submissions` (with unit test suites)
   * `public.projects` & `public.student_projects`
   * `public.hackathons` (sprint timeline & countdown)
   * `public.mentors` & `public.mentorship_requests`
   * `public.weekly_reviews`
   * `public.colleges` (GLA University analytics)
   * `public.pricing_plans` (Free, Pro, Mentorship)
   * Row-Level Security (RLS) policies for data isolation.

---

### Step 3: Add Credentials to `.env` Files

In your Supabase Dashboard, go to **Project Settings** ➔ **API**.
Copy your **Project URL**, **anon / public key**, and **service_role key**.

#### A. Configure Frontend (`client/.env`)
Edit `/home/rishabh/Downloads/rishabhlabs/client/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=/api
```

#### B. Configure Backend (`server/.env`)
Edit `/home/rishabh/Downloads/rishabhlabs/server/.env`:
```env
PORT=5000
NODE_ENV=production

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key

JWT_SECRET=rishabhlabs_jwt_secret_production_2026
```

---

## 🔑 Authentication Capabilities
* **Email & Password:** Native Supabase Auth with auto-sync into `public.profiles`.
* **Google OAuth:** To enable Google sign-in:
  1. Go to Supabase Dashboard ➔ **Authentication** ➔ **Providers**.
  2. Enable **Google**.
  3. Add your Google Cloud OAuth Client ID & Secret.
  4. Students can now click **"Continue with Google (Supabase Auth)"** on the Login/Register screens.
* **Role-Based Security:** Students, Mentors, College Admins, and Super Admins have granular permissions.

---

## 🧪 Verifying Connection
Once credentials are set, restart the servers:
```bash
# In server directory:
npm run build && node dist/index.js

# In client directory:
npm run dev
```
You will see:
`⚡ [Supabase] Connected to live Supabase project: https://your-project-id.supabase.co`
`🌱 [Supabase Seed] Seeding Supabase database with production data...`
