'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { BookOpen, LayoutDashboard, FlaskConical, GraduationCap, LogOut, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
              PromptEng LMS
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition-colors">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link href="/baskets" className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition-colors">
              <BookOpen size={18} />
              Courses
            </Link>
            <Link href="/prompt-playground" className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition-colors">
              <FlaskConical size={18} />
              Playground
            </Link>
            <Link href="/progress" className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition-colors">
              <GraduationCap size={18} />
              Progress
            </Link>
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition-colors">
                <Shield size={18} />
                Admin
              </Link>
            )}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <span className="text-sm text-gray-500">{user.full_name || user.username}</span>
              <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-700">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 pb-4 px-4">
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 hover:text-indigo-600">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link href="/baskets" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 hover:text-indigo-600">
              <BookOpen size={18} /> Courses
            </Link>
            <Link href="/prompt-playground" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 hover:text-indigo-600">
              <FlaskConical size={18} /> Playground
            </Link>
            <Link href="/progress" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 hover:text-indigo-600">
              <GraduationCap size={18} /> Progress
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 hover:text-indigo-600">
                <Shield size={18} /> Admin
              </Link>
            )}
            <button onClick={logout} className="flex items-center gap-2 py-2 text-red-500">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
