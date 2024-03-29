import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useSupabaseAuth from '../hooks/supabase/useSupabaseAuth';
import LoadingPage from '../pages/pages/loading';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <LoadingPage />
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
