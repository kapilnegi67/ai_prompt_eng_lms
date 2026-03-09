'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getAssignment, submitAssignment } from '@/services/api';
import { ArrowLeft, Loader2, Send, FileText } from 'lucide-react';

export default function AssignmentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [promptUsed, setPromptUsed] = useState('');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) {
      getAssignment(Number(params.id)).then(setAssignment).catch(() => router.push('/baskets')).finally(() => setLoading(false));
    }
  }, [user, authLoading, params.id, router]);

  const handleSubmit = async () => {
    if (!content.trim() || !assignment) return;
    setSubmitting(true);
    try {
      await submitAssignment({
        assignment_id: assignment.id,
        content,
        prompt_used: promptUsed,
        explanation,
      });
      setSubmitted(true);
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!assignment) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/baskets" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 p-3 rounded-lg"><FileText className="h-6 w-6 text-amber-600" /></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="text-gray-500">{assignment.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
        <div className="text-gray-700 whitespace-pre-wrap">{assignment.instructions}</div>
      </div>

      {assignment.rubric && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Evaluation Rubric</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(assignment.rubric).map(([key, value]) => (
              <div key={key} className="flex justify-between bg-white px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium text-indigo-600">{String(value)} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!submitted ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Submission</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Design</label>
              <textarea
                value={promptUsed}
                onChange={(e) => setPromptUsed(e.target.value)}
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                placeholder="Paste or write the prompt(s) you designed..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output / Result</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                placeholder="Paste the AI output or your results..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Explanation of Approach</label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                placeholder="Explain your prompt design choices..."
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Submit Assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 rounded-xl p-8 border border-green-200 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Assignment Submitted!</h3>
          <p className="text-green-600">Your submission has been recorded successfully.</p>
        </div>
      )}
    </div>
  );
}
