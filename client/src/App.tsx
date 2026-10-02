import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { PricingPage } from './pages/public/PricingPage';
import { AboutPage } from './pages/public/AboutPage';

// Auth & Onboarding
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';

// Application Workspaces
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { RoadmapPage } from './pages/roadmap/RoadmapPage';
import { DailyMissionPage } from './pages/mission/DailyMissionPage';
import { LearnCatalogPage } from './pages/learn/LearnCatalogPage';
import { LessonDetailPage } from './pages/learn/LessonDetailPage';
import { ProblemListPage } from './pages/practice/ProblemListPage';
import { ProblemWorkspacePage } from './pages/practice/ProblemWorkspacePage';
import { DebuggingLabPage } from './pages/practice/DebuggingLabPage';
import { ProjectsCatalogPage } from './pages/projects/ProjectsCatalogPage';
import { ProjectWorkspacePage } from './pages/projects/ProjectWorkspacePage';
import { HackathonModePage } from './pages/hackathon/HackathonModePage';
import { MentorshipPage } from './pages/mentorship/MentorshipPage';
import { WeeklyReviewPage } from './pages/weekly-review/WeeklyReviewPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { PublicPortfolioPage } from './pages/profile/PublicPortfolioPage';
import { CollegeDashboardPage } from './pages/college/CollegeDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Marketing */}
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Auth Flow */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Onboarding (requires authenticated user, but not yet onboarded) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarded={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Public Proof of Work Showcase */}
          <Route path="/u/:username" element={<PublicPortfolioPage />} />

          {/* Authenticated Workspace with Sidebar & Command Palette */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/missions" element={<DailyMissionPage />} />
            <Route path="/learn" element={<LearnCatalogPage />} />
            <Route path="/learn/:track/:slug" element={<LessonDetailPage />} />
            <Route path="/practice" element={<ProblemListPage />} />
            <Route path="/practice/:slug" element={<ProblemWorkspacePage />} />
            <Route path="/debugging-lab" element={<DebuggingLabPage />} />
            <Route path="/projects" element={<ProjectsCatalogPage />} />
            <Route path="/projects/:slug" element={<ProjectWorkspacePage />} />
            <Route path="/hackathon" element={<HackathonModePage />} />
            <Route path="/mentorship" element={<MentorshipPage />} />
            <Route path="/weekly-review" element={<WeeklyReviewPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/college" element={<CollegeDashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
