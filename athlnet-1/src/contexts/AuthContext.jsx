import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseClient';

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser?.uid || 'No user');
      setUser(currentUser);
      setLoading(false);
      
      // If user logs out, ensure they can't access protected routes via back button
      if (!currentUser && window.location.pathname !== '/' && 
          window.location.pathname !== '/user-login' && 
          window.location.pathname !== '/user-registration') {
        window.history.replaceState(null, '', '/');
        window.location.replace('/');
      }
    }, (error) => {
      console.error('Auth state change error:', error);
      setUser(null);
      setLoading(false);
    });

    // Handle browser back/forward navigation when not authenticated
    const handlePopState = () => {
      if (!loading && !user && window.location.pathname !== '/' && 
          window.location.pathname !== '/user-login' && 
          window.location.pathname !== '/user-registration') {
        window.location.replace('/');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loading, user]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;