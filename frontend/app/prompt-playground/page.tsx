'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { evaluatePrompt, askTutor } from '@/services/api';
import { FlaskConical, Send, Loader2, BarChart3, Lightbulb, MessageSquare, RotateCcw } from 'lucide-react';

export default function PromptPlaygroundPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [promptText, setPromptText] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [expectedFormat, setExpectedFormat] = useState('');
  const [result, setResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorResponse, setTutorResponse] = useState<any>(null);
  const [askingTutor, setAskingTutor] = useState(false);
  const [activeTab, setActiveTab] = useState<'playground' | 'tutor'>('playground');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const handleEvaluate = async () => {
    if (!promptText.trim()) return;
    setEvaluating(true);
    setResult(null);
    try {
      const data = await evaluatePrompt({
        prompt_text: promptText,
        task_description: taskDescription || undefined,
        expected_format: expectedFormat || undefined,
      });
      setResult(data);
    } catch {
      setResult({ score: 0, feedback: 'Evaluation failed. Please try again.', ai_response: '', improved_prompt: '' });
    }
    setEvaluating(false);
  };

  const handleAskTutor = async () => {
    if (!tutorQuestion.trim()) return;
    setAskingTutor(true);
    try {
      const data = await askTutor({ question: tutorQuestion });
      setTutorResponse(data);
    } catch {
      setTutorResponse({ answer: 'Sorry, I could not process your question. Please try again.', suggestions: [] });
    }
    setAskingTutor(false);
  };

  const useImprovedPrompt = () => {
    if (result?.improved_prompt) {
      setPromptText(result.improved_prompt);
      setResult(null);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  const dimensions = result?.dimension_scores;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-100 p-3 rounded-lg">
          <FlaskConical className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Playground</h1>
          <p className="text-gray-500">Write, evaluate, and improve your prompts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'playground' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FlaskConical size={16} className="inline mr-1.5 -mt-0.5" />
          Playground
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tutor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare size={16} className="inline mr-1.5 -mt-0.5" />
          AI Tutor
        </button>
      </div>

      {activeTab === 'playground' ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Prompt Editor</h2>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Write your prompt here..."
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y font-mono text-sm"
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Description (optional)</label>
                <input
                  type="text"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="e.g., Summarize a news article"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Output Format (optional)</label>
                <input
                  type="text"
                  value={expectedFormat}
                  onChange={(e) => setExpectedFormat(e.target.value)}
                  placeholder="e.g., JSON, bullet points, paragraph"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              <button
                onClick={handleEvaluate}
                disabled={evaluating || !promptText.trim()}
                className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {evaluating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Evaluate Prompt
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Score */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Prompt Score</h2>
                    <span className="text-4xl font-bold text-indigo-600">{result.score}<span className="text-lg text-gray-400">/10</span></span>
                  </div>

                  {dimensions && (
                    <div className="space-y-2">
                      {Object.entries(dimensions).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-28 capitalize">{key.replace(/_/g, ' ')}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full transition-all"
                              style={{ width: `${(Number(value) / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-8">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Response */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">AI Response</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.ai_response}</p>
                </div>

                {/* Feedback */}
                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="text-indigo-500" size={18} />
                    <h3 className="font-semibold text-indigo-900">Feedback</h3>
                  </div>
                  <p className="text-sm text-indigo-700">{result.feedback}</p>
                </div>

                {/* Improved Prompt */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-900">Improved Prompt</h3>
                    <button onClick={useImprovedPrompt} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                      <RotateCcw size={14} /> Use This Prompt
                    </button>
                  </div>
                  <p className="text-sm text-green-700 font-mono">{result.improved_prompt}</p>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No evaluation yet</h3>
                <p className="text-sm text-gray-400">Write a prompt and click Evaluate to see AI feedback</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* AI Tutor Tab */
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ask the AI Tutor</h2>
            <textarea
              value={tutorQuestion}
              onChange={(e) => setTutorQuestion(e.target.value)}
              placeholder="Ask any question about prompt engineering..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
            />
            <button
              onClick={handleAskTutor}
              disabled={askingTutor || !tutorQuestion.trim()}
              className="mt-3 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {askingTutor ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
              Ask Tutor
            </button>

            {tutorResponse && (
              <div className="mt-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="font-medium text-gray-900 mb-2">Answer</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{tutorResponse.answer}</div>
                </div>
                {tutorResponse.suggestions?.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-5">
                    <h3 className="font-medium text-indigo-900 mb-2">Suggestions</h3>
                    <ul className="space-y-1">
                      {tutorResponse.suggestions.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-indigo-700">- {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
