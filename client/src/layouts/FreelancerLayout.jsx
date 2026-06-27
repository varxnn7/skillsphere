import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  LayoutDashboard,
  Search,
  FileText,
  MessageSquare,
  TrendingUp,
  User,
  Settings
} from 'lucide-react';

const FreelancerLayout = () => {
  const freelancerLinks = [
    { name: 'Dashboard', path: '/freelancer/dashboard', icon: LayoutDashboard },
    { name: 'Browse Gigs', path: '/freelancer/browse-gigs', icon: Search },
    { name: 'My Proposals', path: '/freelancer/my-proposals', icon: FileText },
    { name: 'Messages', path: '/freelancer/messages', icon: MessageSquare },
    { name: 'Earnings', path: '/freelancer/earnings', icon: TrendingUp },
    { name: 'Profile', path: '/freelancer/profile', icon: User },
    { name: 'Settings', path: '/freelancer/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bgLight">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar links={freelancerLinks} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FreelancerLayout;
