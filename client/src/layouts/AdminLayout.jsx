import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Settings
} from 'lucide-react';

const AdminLayout = () => {
  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Gigs', path: '/admin/gigs', icon: Briefcase },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Disputes', path: '/admin/disputes', icon: AlertTriangle },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bgLight">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar links={adminLinks} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
