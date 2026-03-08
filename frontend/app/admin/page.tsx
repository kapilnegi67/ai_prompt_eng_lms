'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getAnalytics } from '@/services/api';
import { Shield, BookOpen, Layers, FileText, FlaskConical, ClipboardList, Users, BarChart3 } from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/dashboard'); return; }
    if (user) {
      getAnalytics().then(setAnalytics).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  const menuItems = [
    { href: '/admin/baskets', icon: BookOpen, label: 'Baskets', desc: 'Manage course baskets', color: 'bg-indigo-100 text-indigo-600' },
    { href: '/admin/modules', icon: Layers, label: 'Modules', desc: 'Manage course modules', color: 'bg-purple-100 text-purple-600' },
    { href: '/admin/lessons', icon: FileText, label: 'Lessons', desc: 'Manage lessons & content', color: 'bg-blue-100 text-blue-600' },
    { href: '/admin/labs', icon: FlaskConical, label: 'Labs', desc: 'Manage lab exercises', color: 'bg-green-100 text-green-600' },
    { href: '/admin/assignments', icon: ClipboardList, label: 'Assignments', desc: 'Manage assignments', color: 'bg-amber-100 text-amber-600' },
    { href: '/admin/students', icon: Users, label: 'Students', desc: 'View & track students', color: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-100 p-3 rounded-lg"><Shield className="h-6 w-6 text-indigo-600" /></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage courses, students, and platform analytics</p>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Students</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.total_students}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Prompt Attempts</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.total_prompt_attempts}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Submissions</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.total_submissions}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Lessons Done</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.completed_lessons}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Avg Prompt Score</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.average_prompt_score}</p>
          </div>
        </div>
      )}

      {/* Management Links */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Management</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className={`${item.color} p-3 rounded-lg w-fit mb-3`}>
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
