import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';

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

// Week 3 Pages
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import FreelancerReviews from './pages/freelancer/Reviews';

import PageLoader from './components/ui/PageLoader';

// Week 4 Lazy Loaded Pages
const ClientPayments = React.lazy(() => import('./pages/client/Payments'));
const MakePayment = React.lazy(() => import('./pages/client/MakePayment'));
const FreelancerEarnings = React.lazy(() => import('./pages/freelancer/Earnings'));
const ProjectTracker = React.lazy(() => import('./pages/shared/ProjectTracker'));
const RaiseDispute = React.lazy(() => import('./pages/shared/RaiseDispute'));
const DisputeDetail = React.lazy(() => import('./pages/shared/DisputeDetail'));

const AdminUsers = React.lazy(() => import('./pages/admin/Users'));
const AdminGigs = React.lazy(() => import('./pages/admin/Gigs'));
const AdminDisputes = React.lazy(() => import('./pages/admin/Disputes'));
const AdminRevenue = React.lazy(() => import('./pages/admin/Revenue'));

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
    <ErrorBoundary>
      <React.Suspense fallback={<PageLoader />}>
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
            <Route path="messages" element={<Navigate to="/messages" replace />} />
            <Route path="payments" element={<ClientPayments />} />
            <Route path="pay/:proposalId" element={<MakePayment />} />
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
            <Route path="messages" element={<Navigate to="/messages" replace />} />
            <Route path="earnings" element={<FreelancerEarnings />} />
            <Route path="settings" element={<Placeholder title="Freelancer Settings" />} />
          </Route>

          {/* Gig Marketplace & Search Routes */}
          <Route
            path="/gigs"
            element={
              <Navigate to="/freelancer/browse-gigs" replace />
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
            <Route path="users" element={<AdminUsers />} />
            <Route path="gigs" element={<AdminGigs />} />
            <Route path="payments" element={<Placeholder title="Transaction Ledger Log" />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="settings" element={<Placeholder title="Global System Settings" />} />
          </Route>

          {/* Shared Tracker & Dispute Routes */}
          <Route
            path="/project/:gigId/tracker"
            element={
              <ProtectedRoute>
                <ProjectTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispute/raise/:paymentId"
            element={
              <ProtectedRoute>
                <RaiseDispute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispute/:id"
            element={
              <ProtectedRoute>
                <DisputeDetail />
              </ProtectedRoute>
            }
          />

          {/* Week 3 Routes */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/:id/reviews"
            element={
              <ProtectedRoute>
                <FreelancerReviews />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </ErrorBoundary>
  );
}


export default App;
