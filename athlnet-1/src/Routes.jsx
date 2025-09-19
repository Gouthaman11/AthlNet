import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import NotFound from "pages/NotFound";
import DashboardAnalytics from './pages/dashboard-analytics';
import HomeFeed from './pages/home-feed';
import LandingPage from './pages/landing-page';
import MessagingPage from './pages/messaging';
import SearchAndDiscovery from './pages/search-and-discovery';
import UserProfile from './pages/user-profile';
import UserLogin from './pages/user-login';
import UserRegistration from './pages/user-registration';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-registration" element={<UserRegistration />} />
        
        {/* Protected routes */}
        <Route path="/dashboard-analytics" element={
          <ProtectedRoute>
            <DashboardAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/home-feed" element={
          <ProtectedRoute>
            <HomeFeed />
          </ProtectedRoute>
        } />
        <Route path="/messaging" element={
          <ProtectedRoute>
            <MessagingPage />
          </ProtectedRoute>
        } />
        <Route path="/search-and-discovery" element={
          <ProtectedRoute>
            <SearchAndDiscovery />
          </ProtectedRoute>
        } />
        <Route path="/user-profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
