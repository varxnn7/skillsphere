import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  MessageSquare,
  CreditCard,
  User,
  Settings
} from 'lucide-react';

const ClientLayout = () => {
  const clientLinks = [
    { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { name: 'Post Gig', path: '/client/post-gig', icon: PlusCircle },
    { name: 'My Gigs', path: '/client/my-gigs', icon: Briefcase },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Payments', path: '/client/payments', icon: CreditCard },
    { name: 'Profile', path: '/client/profile', icon: User },
    { name: 'Settings', path: '/client/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bgLight">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar links={clientLinks} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
