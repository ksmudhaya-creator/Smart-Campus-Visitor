import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import VisitorRegistrationPage from './pages/VisitorRegistrationPage';
import VisitorManagementPage from './pages/VisitorManagementPage';
import PendingVerificationPage from './pages/PendingVerificationPage';
import EntryApprovalPage from './pages/EntryApprovalPage';
import CheckInOutPage from './pages/CheckInOutPage';
import FsmEnginePage from './pages/FsmEnginePage';
import VisitorHistoryPage from './pages/VisitorHistoryPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import ReportsPage from './pages/ReportsPage';
import UserManagementPage from './pages/UserManagementPage';
import LoginPage from './pages/LoginPage';
import PublicVisitorPortal from './pages/PublicVisitorPortal';

// Protected Route Guard
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span>Verifying authentication credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/portal" element={<PublicVisitorPortal />} />

          {/* Authenticated Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="register-visitor" element={<VisitorRegistrationPage />} />
            <Route path="visitors" element={<VisitorManagementPage />} />
            <Route path="pending-verification" element={<PendingVerificationPage />} />
            <Route path="entry-approval" element={<EntryApprovalPage />} />
            <Route path="check-in-out" element={<CheckInOutPage />} />
            <Route path="fsm-engine" element={<FsmEnginePage />} />
            <Route path="visitor-history" element={<VisitorHistoryPage />} />
            <Route path="activity-logs" element={<ActivityLogsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route
              path="user-management"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
