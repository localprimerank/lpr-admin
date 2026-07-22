'use client';

import { useState, useEffect } from 'react';
import { User, Bell } from 'lucide-react';

export default function Header({ title }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.email || 'Admin'}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role || 'Administrator'}</p>
              </div>
              <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
                {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
