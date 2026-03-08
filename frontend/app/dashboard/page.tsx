'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getBaskets, getProgress } from '@/services/api';
import { BookOpen, FlaskConical, Award, ArrowRight, GraduationCap, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [baskets, setBaskets] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      Promise.all([
        getBaskets().catch(() => []),
        getProgress(user.id).catch(() => null),
      ]).then(([b, p]) => {
        setBaskets(b);
        setProgress(p);
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalCredits = progress?.total_credits_earned || 0;
  const totalHours = progress?.total_hours || 0;
  const lessonsCompleted = progress?.lessons_completed || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name || user?.username}!
        </h1>
        <p className="text-gray-500 mt-1">Continue your prompt engineering journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Award className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-500">Credits Earned</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCredits.toFixed(1)} / 24</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Hours Spent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Lessons Done</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{lessonsCompleted}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Program</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">Minor Degree</p>
        </div>
      </div>

      {/* Course Baskets */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Baskets</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {baskets.map((basket: any) => {
          const bp = progress?.baskets_progress?.find((b: any) => b.basket_id === basket.id);
          return (
            <Link
              key={basket.id}
              href={`/baskets/${basket.id}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {basket.title}
                </h3>
                <ArrowRight className="text-gray-400 group-hover:text-indigo-600 transition-colors" size={20} />
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{basket.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-600 font-medium">{basket.credits} credits</span>
                <span className="text-gray-400">
                  {bp ? `${bp.earned_credits.toFixed(1)} earned` : 'Not started'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/prompt-playground"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          <FlaskConical className="h-8 w-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Prompt Playground</h3>
          <p className="text-indigo-100 text-sm">Practice writing prompts and get AI feedback</p>
        </Link>

        <Link
          href="/progress"
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white hover:from-emerald-700 hover:to-teal-700 transition-all"
        >
          <Award className="h-8 w-8 mb-3 opacity-90" />
          <h3 className="text-lg font-semibold mb-1">Track Progress</h3>
          <p className="text-emerald-100 text-sm">View your credits and course completion</p>
        </Link>
      </div>
    </div>
  );
}
