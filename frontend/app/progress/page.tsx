'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getProgress } from '@/services/api';
import { Award, Clock, BookOpen, GraduationCap } from 'lucide-react';

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      getProgress(user.id).then(setProgress).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  const totalCredits = progress?.total_credits_earned || 0;
  const totalHours = progress?.total_hours || 0;
  const lessonsCompleted = progress?.lessons_completed || 0;
  const basketsProgress = progress?.baskets_progress || [];
  const creditPercentage = Math.min(100, (totalCredits / 24) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-500 mt-1">Track your journey toward the 24-credit minor degree</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Minor Degree Progress</h2>
          <span className="text-3xl font-bold">{totalCredits.toFixed(1)} / 24 Credits</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4 mb-2">
          <div
            className="bg-white h-4 rounded-full transition-all duration-500"
            style={{ width: `${creditPercentage}%` }}
          />
        </div>
        <p className="text-indigo-100 text-sm">{creditPercentage.toFixed(0)}% complete</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <Award className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalCredits.toFixed(1)}</p>
          <p className="text-sm text-gray-500">Credits Earned</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
          <p className="text-sm text-gray-500">Hours Invested</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{lessonsCompleted}</p>
          <p className="text-sm text-gray-500">Lessons Completed</p>
        </div>
      </div>

      {/* Basket Progress */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Basket Progress</h2>
      <div className="space-y-4">
        {basketsProgress.map((bp: any) => {
          const percentage = Math.min(100, (bp.earned_credits / bp.total_credits) * 100);
          return (
            <div key={bp.basket_id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <GraduationCap className="text-indigo-600" size={20} />
                  <h3 className="font-semibold text-gray-900">{bp.basket_title}</h3>
                </div>
                <span className="text-sm font-medium text-indigo-600">
                  {bp.earned_credits.toFixed(1)} / {bp.total_credits} credits
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Credit Calculation Info */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Credit Calculation</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>1 credit = 45 hours (15 hours lab/assignments + 30 hours self-study)</p>
          <p>Total program: 24 credits = 1,080 hours</p>
          <p>Each basket: 8 credits = 360 hours</p>
        </div>
      </div>
    </div>
  );
}
