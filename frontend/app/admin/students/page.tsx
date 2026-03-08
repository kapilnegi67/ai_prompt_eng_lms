'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getStudents, getProgress } from '@/services/api';
import { ArrowLeft, Users, Award, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminStudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/dashboard'); return; }
    if (user) loadData();
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const s = await getStudents();
      setStudents(s);
      const progressMap: Record<number, any> = {};
      for (const student of s) {
        try {
          const p = await getProgress(student.id);
          progressMap[student.id] = p;
        } catch { /* ignore */ }
      }
      setStudentProgress(progressMap);
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft size={16} /> Back to Admin
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Users className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Students ({students.length})</h1>
      </div>

      <div className="space-y-3">
        {students.map((student: any) => {
          const progress = studentProgress[student.id];
          return (
            <div key={student.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{student.full_name || student.username}</h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-indigo-600">
                    <Award size={16} />
                    <span>{(progress?.total_credits_earned || 0).toFixed(1)} credits</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={16} />
                    <span>{progress?.total_hours || 0} hrs</span>
                  </div>
                  <span className="text-gray-400">
                    {progress?.lessons_completed || 0} lessons
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {students.length === 0 && (
          <p className="text-center text-gray-400 py-8">No students enrolled yet</p>
        )}
      </div>
    </div>
  );
}
