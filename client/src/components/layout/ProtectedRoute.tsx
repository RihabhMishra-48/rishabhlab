import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireOnboarded?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireOnboarded = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#070A0F]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 shadow-sm animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-current rotate-45"></div>
          </div>
          <p className="text-xs font-medium text-neutral-500">Loading Rishabh Labs...</p>
        </div>
      </div>
    );
  }

  // Not signed in -> Must go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in but haven't finished onboarding -> Force Onboarding first!
  if (requireOnboarded && !user.isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
