'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getBaskets } from '@/services/api';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function BasketsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [baskets, setBaskets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) {
      getBaskets().then(setBaskets).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Course Baskets</h1>
        <p className="text-gray-500 mt-1">24-credit minor degree program in Prompt Engineering</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {baskets.map((basket: any, index: number) => {
          const colors = [
            'from-indigo-500 to-blue-600',
            'from-purple-500 to-pink-600',
            'from-emerald-500 to-teal-600',
          ];
          return (
            <Link
              key={basket.id}
              href={`/baskets/${basket.id}`}
              className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all"
            >
              <div className={`bg-gradient-to-br ${colors[index % 3]} p-8 text-white`}>
                <div className="flex items-center gap-2 text-sm opacity-80 mb-3">
                  <BookOpen size={16} />
                  Basket {basket.order}
                </div>
                <h3 className="text-xl font-bold mb-3">{basket.title}</h3>
                <p className="text-sm opacity-90 mb-6 line-clamp-3">{basket.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    {basket.credits} Credits
                  </span>
                  <ArrowRight className="opacity-70 group-hover:translate-x-1 transition-transform" size={20} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
