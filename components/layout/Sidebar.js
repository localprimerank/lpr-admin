'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Users, 
  Briefcase, 
  ListChecks, 
  MessageSquare, 
  Star,
  User,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Image,
  HelpCircle
} from 'lucide-react';
import { clearAuthSession } from '@/lib/api';

const navSections = [
  {
    title: 'Main',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Content',
    items: [
      { href: '/services', label: 'Services', icon: Briefcase },
      { href: '/projects', label: 'Projects', icon: FolderOpen },
      { href: '/about', label: 'About', icon: User },
      { href: '/blogs', label: 'Blogs', icon: FileText },
      { href: '/clients', label: 'Clients', icon: Users },
      { href: '/gallery', label: 'Gallery', icon: Image },
      { href: '/testimonials', label: 'Testimonials', icon: Star },
      { href: '/faq', label: 'FAQ', icon: HelpCircle },
    ]
  },
  {
    title: 'Settings',
    items: [
      { href: '/contacts', label: 'Contacts', icon: MessageSquare },
      { href: '/settings', label: 'Site Settings', icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-sidebar text-white p-2 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar text-gray-300 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-gray-700">
          <Link href="/" className="text-xl font-bold text-white">
            LPR Admin
          </Link>
          <p className="text-xs text-gray-400 mt-1">Content Management</p>
        </div>

        <nav className="p-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-white/10 text-white font-medium' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                      <span className="text-sm">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
