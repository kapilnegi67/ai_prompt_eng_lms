'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getModule, getLabs, getAssignments } from '@/services/api';
import { ArrowLeft, Play, ArrowRight, FlaskConical, FileText } from 'lucide-react';

export default function ModuleDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [module_, setModule] = useState<any>(null);
  const [labs, setLabs] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) {
      const moduleId = Number(params.id);
      Promise.all([
        getModule(moduleId),
        getLabs(moduleId).catch(() => []),
        getAssignments(moduleId).catch(() => []),
      ]).then(([m, l, a]) => {
        setModule(m);
        setLabs(l);
        setAssignments(a);
      }).catch(() => router.push('/baskets')).finally(() => setLoading(false));
    }
  }, [user, authLoading, params.id, router]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!module_) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/baskets/${module_.basket_id}`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft size={16} /> Back to Basket
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{module_.title}</h1>
        <p className="text-gray-500 mt-2">{module_.description}</p>
      </div>

      {/* Lessons */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Lessons</h2>
      <div className="space-y-3 mb-10">
        {(module_.lessons || [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((lesson: any, idx: number) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="flex items-center justify-between bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{lesson.title}</h3>
                  <p className="text-sm text-gray-400">{lesson.duration_minutes} min</p>
                </div>
              </div>
              <Play className="text-gray-400 group-hover:text-indigo-600 transition-colors" size={18} />
            </Link>
          ))}
      </div>

      {/* Labs */}
      {labs.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Labs</h2>
          <div className="space-y-3 mb-10">
            {labs.map((lab: any) => (
              <Link
                key={lab.id}
                href={`/labs/${lab.id}`}
                className="flex items-center justify-between bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-2.5 rounded-lg">
                    <FlaskConical className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">{lab.title}</h3>
                    <p className="text-sm text-gray-400">{lab.description}</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-purple-600 transition-colors" size={18} />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Assignments */}
      {assignments.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignments</h2>
          <div className="space-y-3">
            {assignments.map((a: any) => (
              <Link
                key={a.id}
                href={`/assignments/${a.id}`}
                className="flex items-center justify-between bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 p-2.5 rounded-lg">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">{a.title}</h3>
                    <p className="text-sm text-gray-400">{a.description}</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-amber-600 transition-colors" size={18} />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
