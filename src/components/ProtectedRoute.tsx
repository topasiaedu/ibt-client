// This is the protected route component that will be used to protect the routes that require authentication which utilizes supabase's auth state to determine if the user is authenticated or not.

import React from 'react';
import { Navigate, Route, RouteProps } from 'react-router-dom';
import { useSupabaseAuth } from '../hooks/supabase/useSupabaseAuth';

export const ProtectedRoute: React.FC<RouteProps> = ({ ...props }) => {
  const { user } = useSupabaseAuth();

  if (!user) {
    return <Navigate to="/authentication/sign-in" />;
  }

  return <Route {...props} />;
};