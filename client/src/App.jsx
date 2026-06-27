import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import FreelancerLayout from './layouts/FreelancerLayout';
import AdminLayout from './layouts/AdminLayout';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';
import ClientProfile from './pages/client/Profile';
import PostGig from './pages/client/PostGig';
import MyGigs from './pages/client/MyGigs';
import GigProposals from './pages/client/GigProposals';

// Freelancer Pages
import FreelancerDashboard from './pages/freelancer/Dashboard';
import FreelancerProfile from './pages/freelancer/Profile';
import BrowseGigs from './pages/freelancer/BrowseGigs';
import GigDetail from './pages/freelancer/GigDetail';
import MyProposals from './pages/freelancer/MyProposals';

// Search Page
import SearchPage from './pages/Search';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Placeholder Component for sub-routes
const Placeholder = ({ title }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
    <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
    <p className="text-slate-500 text-sm">
      This module is scheduled for development in subsequent sprint phases. Verify authentication, profile creation, and core dashboards in the current view.
    </p>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Client Routes */}
      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['client']}>
              <ClientLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="post-gig" element={<PostGig />} />
        <Route path="my-gigs" element={<MyGigs />} />
        <Route path="gigs/:id/proposals" element={<GigProposals />} />
        <Route path="messages" element={<Placeholder title="Real-time Chat Portal" />} />
        <Route path="payments" element={<Placeholder title="Escrow Payments Terminal" />} />
        <Route path="settings" element={<Placeholder title="Client Account Settings" />} />
      </Route>

      {/* Freelancer Routes */}
      <Route
        path="/freelancer"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['freelancer']}>
              <FreelancerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
        <Route path="dashboard" element={<FreelancerDashboard />} />
        <Route path="profile" element={<FreelancerProfile />} />
        <Route path="browse-gigs" element={<BrowseGigs />} />
        <Route path="my-proposals" element={<MyProposals />} />
        <Route path="messages" element={<Placeholder title="Real-time Chat Inbox" />} />
        <Route path="earnings" element={<Placeholder title="Earnings Ledger & Invoices" />} />
        <Route path="settings" element={<Placeholder title="Freelancer Settings" />} />
      </Route>

      {/* Gig Marketplace & Search Routes */}
      <Route
        path="/gigs"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['freelancer']}>
              <BrowseGigs />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gigs/:id"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['freelancer']}>
              <GigDetail />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Placeholder title="User Management Panel" />} />
        <Route path="gigs" element={<Placeholder title="Gig Moderation Queue" />} />
        <Route path="payments" element={<Placeholder title="Transaction Ledger Log" />} />
        <Route path="disputes" element={<Placeholder title="Dispute Resolution Room" />} />
        <Route path="analytics" element={<Placeholder title="Admin Stats Analytics" />} />
        <Route path="settings" element={<Placeholder title="Global System Settings" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
