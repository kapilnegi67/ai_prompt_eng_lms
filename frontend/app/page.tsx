'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { GraduationCap, BookOpen, FlaskConical, Award } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Don't redirect to dashboard if the browser URL is a different page
      // (happens with SPA fallback on static hosting)
      const browserPath = window.location.pathname;
      if (browserPath === '/' || browserPath === '') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Prompt Engineering<br />Learning Platform
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
              Master the art of prompt engineering through interactive lessons,
              hands-on practice, and AI-powered feedback. Earn a 24-credit minor degree.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">What You Will Learn</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <BookOpen className="h-10 w-10 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Interactive Lessons</h3>
            <p className="text-gray-600">
              Learn through video lessons, guided exercises, and real-time AI feedback
              on your prompt writing skills.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <FlaskConical className="h-10 w-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">AI Playground</h3>
            <p className="text-gray-600">
              Practice prompt engineering in our interactive playground with real-time
              evaluation and improvement suggestions.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <Award className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">24-Credit Degree</h3>
            <p className="text-gray-600">
              Complete baskets of courses to earn credits toward a minor degree
              in Prompt Engineering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
