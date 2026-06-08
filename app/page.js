'use client';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Briefcase,
  FileText,
  FolderOpen,
  ListChecks,
  MessageSquare,
  Star,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';

const dashboardCards = [
  { label: 'Services', key: 'services', icon: Briefcase, href: '/services', loader: api.getServices },
  { label: 'Projects', key: 'projects', icon: FolderOpen, href: '/projects', loader: api.getProjects },
  { label: 'Blogs', key: 'blogs', icon: FileText, href: '/blogs', loader: api.getBlogs },
  { label: 'Clients', key: 'clients', icon: Users, href: '/clients', loader: api.getClients },
  // { label: 'Skills', key: 'skills', icon: ListChecks, href: '/skills', loader: api.getSkills },
  // { label: 'Stats', key: 'stats', icon: BarChart3, href: '/stats', loader: api.getStats },
  { label: 'Testimonials', key: 'testimonials', icon: Star, href: '/testimonials', loader: api.getTestimonials },
  { label: 'Contacts', key: 'contacts', icon: MessageSquare, href: '/contacts', loader: api.getContacts },
];

export default function Dashboard() {
  const router = useRouter();
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadCounts = async () => {
      try {
        const entries = await Promise.all(
          dashboardCards.map(async (card) => {
            try {
              const res = await card.loader();
              return [card.key, res.data?.length || 0];
            } catch {
              return [card.key, '-'];
            }
          })
        );
        setCounts(Object.fromEntries(entries));
      } finally {
        setLoadingCounts(false);
      }
    };

    loadCounts();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="Dashboard" />
        <main className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600 mt-1">Manage the content that powers the LPR Agency website.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardCards.map((card) => {
              const Icon = card.icon;

              return (
                <a
                  key={card.label}
                  href={card.href}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon size={22} />
                    </span>
                    <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">
                      View all
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {loadingCounts ? '...' : counts[card.key]}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{card.label}</p>
                </a>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Manage Services', href: '/services' },
                  { label: 'Manage Projects', href: '/projects' },
                  { label: 'Manage Blogs', href: '/blogs' },
                  { label: 'Manage Hero', href: '/settings' },
                ].map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-center font-medium text-sm"
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Checklist</h3>
              <div className="space-y-3">
                {[
                  'Use Services to update service offerings',
                  'Use Projects to control portfolio visibility',
                  'Use Blogs to publish or draft articles',
                  'Use Contacts to review form submissions',
                ].map((activity) => (
                  <div key={activity} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <p className="text-sm text-gray-700">{activity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
