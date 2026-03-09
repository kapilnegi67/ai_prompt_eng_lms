'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getLesson, updateProgress, evaluatePrompt } from '@/services/api';
import { ArrowLeft, CheckCircle, Loader2, Lightbulb, Send } from 'lucide-react';

export default function LessonPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [promptResult, setPromptResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) {
      getLesson(Number(params.id)).then(setLesson).catch(() => router.push('/baskets')).finally(() => setLoading(false));
    }
  }, [user, authLoading, params.id, router]);

  const handleComplete = async () => {
    if (!lesson) return;
    setCompleting(true);
    try {
      await updateProgress({ lesson_id: lesson.id, completed: true, time_spent_minutes: lesson.duration_minutes || 15 });
      setCompleted(true);
    } catch { /* ignore */ }
    setCompleting(false);
  };

  const handleEvaluate = async () => {
    if (!promptText.trim()) return;
    setEvaluating(true);
    try {
      const result = await evaluatePrompt({ prompt_text: promptText });
      setPromptResult(result);
    } catch { setPromptResult({ score: 0, feedback: 'Evaluation failed. Please try again.' }); }
    setEvaluating(false);
  };

  const handleQuizAnswer = (quizId: number, answer: string, correct: string) => {
    setQuizAnswers({ ...quizAnswers, [quizId]: answer });
    setQuizResults({ ...quizResults, [quizId]: answer === correct });
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!lesson) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/modules/${lesson.module_id}`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft size={16} /> Back to Module
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">{lesson.title}</h1>

      {/* Lesson Cover Image */}
      {lesson.video_url && (
        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-8 relative">
          <img
            src={lesson.video_url}
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <p className="text-white text-sm font-medium">{lesson.duration_minutes} min lesson</p>
          </div>
        </div>
      )}

      {/* Lesson Content */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lesson Content</h2>
        <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap">{lesson.content}</div>
      </div>

      {/* Notes */}
      {lesson.notes && (
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="text-amber-500" size={18} />
            <h3 className="font-semibold text-amber-800">Notes</h3>
          </div>
          <p className="text-amber-700 text-sm">{lesson.notes}</p>
        </div>
      )}

      {/* Practice Exercises */}
      {lesson.exercises && lesson.exercises.length > 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Exercises</h2>
          {lesson.exercises.map((exercise: any) => (
            <div key={exercise.id} className="mb-6 last:mb-0">
              <h3 className="font-medium text-gray-900 mb-1">{exercise.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
              {exercise.prompt_template && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-600">
                  Template: {exercise.prompt_template}
                </div>
              )}
              {exercise.hints && (
                <p className="text-sm text-indigo-500 mt-2">Hint: {exercise.hints}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Prompt Playground */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Prompt Playground</h2>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Write your prompt here and get AI feedback..."
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
        />
        <button
          onClick={handleEvaluate}
          disabled={evaluating || !promptText.trim()}
          className="mt-3 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {evaluating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          Evaluate Prompt
        </button>

        {promptResult && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-indigo-600">{promptResult.score}/10</span>
              <span className="text-sm text-gray-500">Prompt Score</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-1">AI Response</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{promptResult.ai_response}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="font-medium text-indigo-900 mb-1">Feedback</h4>
              <p className="text-sm text-indigo-700">{promptResult.feedback}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-1">Improved Prompt</h4>
              <p className="text-sm text-green-700 font-mono">{promptResult.improved_prompt}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quizzes */}
      {lesson.quizzes && lesson.quizzes.length > 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz</h2>
          {lesson.quizzes.map((quiz: any) => (
            <div key={quiz.id} className="mb-6 last:mb-0">
              <p className="font-medium text-gray-900 mb-3">{quiz.question}</p>
              <div className="space-y-2">
                {(quiz.options || []).map((option: string, idx: number) => {
                  const selected = quizAnswers[quiz.id] === option;
                  const isCorrect = quizResults[quiz.id];
                  const answered = quizAnswers[quiz.id] !== undefined;
                  let bgColor = 'bg-white hover:bg-gray-50';
                  if (answered && selected) {
                    bgColor = isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => !answered && handleQuizAnswer(quiz.id, option, quiz.correct_answer)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3 rounded-lg border ${bgColor} transition-colors disabled:cursor-default`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {quizAnswers[quiz.id] !== undefined && (
                <p className={`mt-2 text-sm ${quizResults[quiz.id] ? 'text-green-600' : 'text-red-600'}`}>
                  {quizResults[quiz.id] ? 'Correct!' : `Incorrect. ${quiz.explanation || ''}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Button */}
      <div className="flex justify-center">
        <button
          onClick={handleComplete}
          disabled={completing || completed}
          className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            completed
              ? 'bg-green-100 text-green-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } disabled:opacity-70`}
        >
          {completing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          {completed ? 'Lesson Completed!' : 'Mark as Complete'}
        </button>
      </div>
    </div>
  );
}
