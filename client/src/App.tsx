import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { useAuthStore } from './stores/authStore';

// Pages
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import ParticipantLogin from './pages/ParticipantLogin';
import VoterLogin from './pages/VoterLogin';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminParticipants from './pages/admin/AdminParticipants';
import AdminStartups from './pages/admin/AdminStartups';
import AdminVoters from './pages/admin/AdminVoters';
import AdminVoting from './pages/admin/AdminVoting';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import AdminResults from './pages/admin/AdminResults';
import AdminSettings from './pages/admin/AdminSettings';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';

// Participant Pages
import ParticipantDashboard from './pages/ParticipantDashboard';

// Voter Pages
import VoterDashboard from './pages/VoterDashboard';
import VoterInvest from './pages/VoterInvest';

// Public Pages
import PublicLeaderboard from './pages/PublicLeaderboard';
import PublicResults from './pages/PublicResults';

// Protected Route Component
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div></div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/participant/login" element={<ParticipantLogin />} />
          <Route path="/voter/login" element={<VoterLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/participants" element={<ProtectedRoute role="admin"><AdminParticipants /></ProtectedRoute>} />
          <Route path="/admin/startups" element={<ProtectedRoute role="admin"><AdminStartups /></ProtectedRoute>} />
          <Route path="/admin/voters" element={<ProtectedRoute role="admin"><AdminVoters /></ProtectedRoute>} />
          <Route path="/admin/voting" element={<ProtectedRoute role="admin"><AdminVoting /></ProtectedRoute>} />
          <Route path="/admin/leaderboard" element={<ProtectedRoute role="admin"><AdminLeaderboard /></ProtectedRoute>} />
          <Route path="/admin/results" element={<ProtectedRoute role="admin"><AdminResults /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/activity-logs" element={<ProtectedRoute role="admin"><AdminActivityLogs /></ProtectedRoute>} />
          
          {/* Participant Routes */}
          <Route path="/participant/dashboard" element={<ProtectedRoute role="participant"><ParticipantDashboard /></ProtectedRoute>} />
          
          {/* Voter Routes */}
          <Route path="/voter/dashboard" element={<ProtectedRoute role="voter"><VoterDashboard /></ProtectedRoute>} />
          <Route path="/voter/invest" element={<ProtectedRoute role="voter"><VoterInvest /></ProtectedRoute>} />
          
          {/* Public Routes */}
          <Route path="/leaderboard" element={<PublicLeaderboard />} />
          <Route path="/results" element={<PublicResults />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
