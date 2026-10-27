import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireOnboarded?: boolean;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarded = true,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#212121]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 shadow-sm animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-current rotate-45"></div>
          </div>
          <p className="text-xs font-medium text-neutral-500">Loading RishabhLabs...</p>
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

  // Role-based authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const isSuperAdmin = user.role === 'super_admin' || user.role === 'admin' || user.email?.includes('admin');
    if (!isSuperAdmin && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
