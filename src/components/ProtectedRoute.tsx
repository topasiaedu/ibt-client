import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useSupabaseAuth from '../hooks/supabase/useSupabaseAuth';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center w-56 h-56 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">loading...</div>
      </div>
    )
  }

  if (!user) {
    // Redirect to the sign-in page if the user is not authenticated
    return <Navigate to="/authentication/sign-in" replace />;
  }

  // Render children routes if the user is authenticated
  return <Outlet />;
};

export default ProtectedRoute;
