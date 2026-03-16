'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getBasket } from '@/services/api';
import { ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';

export default function BasketDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [basket, setBasket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) {
      getBasket(Number(params.id)).then(setBasket).catch(() => router.push('/baskets')).finally(() => setLoading(false));
    }
  }, [user, authLoading, params.id, router]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!basket) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/baskets" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft size={16} /> Back to Baskets
      </Link>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">{basket.title}</h1>
        <p className="text-indigo-100 mb-4">{basket.description}</p>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{basket.credits} Credits</span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Modules</h2>
      <div className="space-y-4">
        {(basket.modules || [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((module: any) => (
            <Link
              key={module.id}
              href={`/modules/${module.id}`}
              className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{module.description}</p>
                </div>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-indigo-600 transition-colors" size={20} />
            </Link>
          ))}
      </div>
    </div>
  );
}
