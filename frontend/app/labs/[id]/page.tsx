'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getLab, submitAssignment } from '@/services/api';
import { ArrowLeft, Loader2, Send, FlaskConical } from 'lucide-react';

export default function LabPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [lab, setLab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [promptUsed, setPromptUsed] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) {
      getLab(Number(params.id)).then(setLab).catch(() => router.push('/baskets')).finally(() => setLoading(false));
    }
  }, [user, authLoading, params.id, router]);

  const handleSubmit = async () => {
    if (!content.trim() || !lab) return;
    setSubmitting(true);
    try {
      await submitAssignment({ lab_id: lab.id, content, prompt_used: promptUsed });
      setSubmitted(true);
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!lab) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/baskets" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-lg"><FlaskConical className="h-6 w-6 text-purple-600" /></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{lab.title}</h1>
          <p className="text-gray-500">{lab.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
        <div className="text-gray-700 whitespace-pre-wrap">{lab.instructions}</div>
      </div>

      {lab.starter_prompt && (
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 mb-8">
          <h3 className="font-semibold text-indigo-900 mb-2">Starter Prompt</h3>
          <p className="text-sm text-indigo-700 font-mono">{lab.starter_prompt}</p>
        </div>
      )}

      {!submitted ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Submission</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Used</label>
              <textarea
                value={promptUsed}
                onChange={(e) => setPromptUsed(e.target.value)}
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                placeholder="Paste the prompt you created..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Solution / Explanation</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                placeholder="Describe your approach and solution..."
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Submit Lab
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 rounded-xl p-8 border border-green-200 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Lab Submitted!</h3>
          <p className="text-green-600">Your submission has been recorded. Great work!</p>
        </div>
      )}
    </div>
  );
}
