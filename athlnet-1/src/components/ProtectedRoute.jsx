import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../pages/home-feed/components/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If user is not authenticated, prevent history back access
    if (!loading && !user) {
      // Replace the current history entry to prevent back button access
      window.history.replaceState(null, '', '/');
    }
  }, [user, loading, location]);

  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If no user, redirect to landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;