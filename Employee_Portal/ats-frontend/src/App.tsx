import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Candidates from "./pages/Candidates";
import AddCandidate from "./pages/AddCandidate";
import CandidateDetail from "./pages/CandidateDetail";
import Applications from "./pages/Applications";
import AddApplication from "./pages/AddApplication";
import ApplicationDetail from "./pages/ApplicationDetail";

import Interview from "./pages/Interview";
import ReadyToInterview from "./pages/ReadyToInterview";
import SelectedCandidates from "./pages/SelectedCandidates";
import Joined from "./pages/Joined";
import LockInTracking from "./pages/LockInTracking";
import Performance from "./pages/Performance";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import AddJob from "./pages/AddJob";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminSignup from "./pages/AdminSignup";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ResetPassword from "./pages/ResetPassword";
import AdminSettings from "./pages/AdminSettings";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>

          {/* ROUTES */}
          <Routes>
            {/* LOGIN PAGE */}
            <Route path="/login" element={<Login />} />

            {/* ADMIN SIGNUP PAGE */}
            <Route path="/dhi-admin" element={<AdminSignup />} />

            {/* PASSWORD RESET PAGE */}
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* REDIRECT ROOT TO /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* DASHBOARD NOW AT /dashboard */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />

            {/* OTHER PROTECTED ROUTES */}
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/jobs/add" element={<ProtectedRoute><AddJob /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
            <Route path="/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
            <Route path="/candidates/add" element={<ProtectedRoute><AddCandidate /></ProtectedRoute>} />
            <Route path="/candidates/:id" element={<ProtectedRoute><CandidateDetail /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
            <Route path="/add-application" element={<ProtectedRoute><AddApplication /></ProtectedRoute>} />
            <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />

            <Route path="/ready-to-interview" element={<ProtectedRoute><ReadyToInterview /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
            <Route path="/selected" element={<ProtectedRoute><SelectedCandidates /></ProtectedRoute>} />
            <Route path="/joined" element={<ProtectedRoute><Joined /></ProtectedRoute>} />
            <Route path="/recruiter-dashboard" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
            <Route path="/admin-settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/lockin" element={<ProtectedRoute><LockInTracking /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />



            {/* NOT FOUND */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
