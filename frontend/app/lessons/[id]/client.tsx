'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  getLesson,
  getLessonSections,
  getSectionProgress,
  submitSectionQuiz,
  updateProgress,
  evaluatePrompt,
} from '@/services/api';
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Lightbulb,
  Send,
  Lock,
  RotateCcw,
  ChevronRight,
  Award,
  XCircle,
} from 'lucide-react';

interface SectionQuiz {
  id: number;
  section_id: number;
  question: string;
  options: string[];
  order: number;
}

interface Section {
  id: number;
  lesson_id: number;
  title: string;
  content: string;
  order: number;
  section_quizzes: SectionQuiz[];
}

interface SectionProg {
  section_id: number;
  score: number;
  passed: boolean;
  attempts: number;
}

interface QuizResultItem {
  quiz_id: number;
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

interface QuizResult {
  score: number;
  passed: boolean;
  total_questions: number;
  correct_count: number;
  attempts: number;
  results: QuizResultItem[];
}

export default function LessonPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [lesson, setLesson] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, SectionProg>>({});
  const [loading, setLoading] = useState(true);

  // Current section state
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // Legacy quiz state (for lesson-level quizzes)
  const [legacyQuizAnswers, setLegacyQuizAnswers] = useState<Record<number, string>>({});
  const [legacyQuizResults, setLegacyQuizResults] = useState<Record<number, boolean>>({});

  // Prompt playground
  const [promptText, setPromptText] = useState('');
  const [promptResult, setPromptResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Completion
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const lessonId = Number(params.id);

  const loadData = useCallback(async () => {
    try {
      const [lessonData, sectionsData] = await Promise.all([
        getLesson(lessonId),
        getLessonSections(lessonId),
      ]);
      setLesson(lessonData);
      setSections(sectionsData);

      // Load progress
      try {
        const prog = await getSectionProgress(lessonId);
        const map: Record<number, SectionProg> = {};
        prog.forEach((p: SectionProg) => { map[p.section_id] = p; });
        setProgressMap(map);

        // Auto-advance to the first unlocked section
        if (sectionsData.length > 0) {
          let firstUnlocked = 0;
          for (let i = 0; i < sectionsData.length; i++) {
            const p = map[sectionsData[i].id];
            if (p && p.passed) {
              firstUnlocked = i + 1;
            } else {
              break;
            }
          }
          setCurrentSectionIdx(Math.min(firstUnlocked, sectionsData.length - 1));
        }
      } catch {
        // Progress load failed - default to section 0
      }
    } catch {
      router.push('/baskets');
    } finally {
      setLoading(false);
    }
  }, [lessonId, router]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.id) { loadData(); }
  }, [user, authLoading, params.id, router, loadData]);

  const isSectionUnlocked = (idx: number): boolean => {
    if (idx === 0) return true;
    const prevSection = sections[idx - 1];
    if (!prevSection) return false;
    const prog = progressMap[prevSection.id];
    return !!(prog && prog.passed);
  };

  const allSectionsPassed = sections.length > 0 && sections.every(s => {
    const p = progressMap[s.id];
    return p && p.passed;
  });

  const handleSelectAnswer = (quizId: number, answer: string) => {
    if (quizResult) return;
    setQuizAnswers(prev => ({ ...prev, [quizId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    const section = sections[currentSectionIdx];
    if (!section) return;
    setSubmittingQuiz(true);
    try {
      const result = await submitSectionQuiz(section.id, quizAnswers);
      setQuizResult(result);
      setProgressMap(prev => ({
        ...prev,
        [section.id]: {
          section_id: section.id,
          score: result.score,
          passed: result.passed,
          attempts: result.attempts,
        },
      }));
    } catch {
      // Handle error silently
    }
    setSubmittingQuiz(false);
  };

  const handleRetrySection = () => {
    setQuizAnswers({});
    setQuizResult(null);
    setShowQuiz(false);
  };

  const handleNextSection = () => {
    if (currentSectionIdx < sections.length - 1) {
      setCurrentSectionIdx(currentSectionIdx + 1);
      setQuizAnswers({});
      setQuizResult(null);
      setShowQuiz(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToSection = (idx: number) => {
    if (!isSectionUnlocked(idx)) return;
    setCurrentSectionIdx(idx);
    setQuizAnswers({});
    setQuizResult(null);
    setShowQuiz(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleLegacyQuizAnswer = (quizId: number, answer: string, correct: string) => {
    setLegacyQuizAnswers(prev => ({ ...prev, [quizId]: answer }));
    setLegacyQuizResults(prev => ({ ...prev, [quizId]: answer === correct }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!lesson) return null;

  const currentSection = sections[currentSectionIdx];
  const currentProgress = currentSection ? progressMap[currentSection.id] : null;
  const currentSectionPassed = !!(currentProgress && currentProgress.passed);
  const allQuizzesAnswered = currentSection
    ? currentSection.section_quizzes.every(q => quizAnswers[q.id] !== undefined)
    : false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/modules/${lesson.module_id}`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft size={16} /> Back to Module
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>

      {/* Section Progress Stepper */}
      {sections.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-sm text-gray-500">
              Section {currentSectionIdx + 1} of {sections.length}
            </span>
            {allSectionsPassed && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Award size={12} /> All Sections Complete
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {sections.map((section, idx) => {
              const prog = progressMap[section.id];
              const passed = !!(prog && prog.passed);
              const unlocked = isSectionUnlocked(idx);
              const isCurrent = idx === currentSectionIdx;

              return (
                <button
                  key={section.id}
                  onClick={() => handleGoToSection(idx)}
                  disabled={!unlocked}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    passed
                      ? 'bg-green-500'
                      : isCurrent
                        ? 'bg-indigo-500'
                        : unlocked
                          ? 'bg-gray-300 hover:bg-gray-400'
                          : 'bg-gray-200'
                  }`}
                  title={`${section.title}${passed ? ' (passed)' : unlocked ? '' : ' (locked)'}`}
                />
              );
            })}
          </div>
          <div className="flex gap-1 mt-1">
            {sections.map((section, idx) => {
              const unlocked = isSectionUnlocked(idx);
              const isCurrent = idx === currentSectionIdx;
              return (
                <button
                  key={`label-${section.id}`}
                  onClick={() => handleGoToSection(idx)}
                  disabled={!unlocked}
                  className={`flex-1 text-xs truncate px-1 py-1 rounded transition-colors ${
                    isCurrent
                      ? 'text-indigo-700 font-semibold'
                      : unlocked
                        ? 'text-gray-500 hover:text-gray-700 cursor-pointer'
                        : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {!unlocked && <Lock size={10} className="inline mr-0.5" />}
                  {section.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lesson Video */}
      {lesson.video_url && (
        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-8">
          <video
            src={lesson.video_url}
            controls
            className="w-full h-full object-cover"
            poster=""
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Interactive Section Content */}
      {currentSection && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentSectionIdx + 1}. {currentSection.title}
            </h2>
            {currentSectionPassed && (
              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle size={14} /> Passed
              </span>
            )}
          </div>

          <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap mb-6">
            {currentSection.content}
          </div>

          {/* Take Quiz Button */}
          {!showQuiz && !currentSectionPassed && currentSection.section_quizzes.length > 0 && (
            <button
              onClick={() => setShowQuiz(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              Take Section Quiz ({currentSection.section_quizzes.length} questions)
            </button>
          )}

          {/* Section Quiz */}
          {(showQuiz || currentSectionPassed) && currentSection.section_quizzes.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Section Quiz
                {currentProgress && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Attempt #{currentProgress.attempts + (quizResult ? 0 : 1)})
                  </span>
                )}
              </h3>

              {currentSection.section_quizzes.map((quiz: SectionQuiz, qIdx: number) => {
                const resultItem = quizResult?.results.find((r: QuizResultItem) => r.quiz_id === quiz.id);
                return (
                  <div key={quiz.id} className="mb-6 last:mb-0">
                    <p className="font-medium text-gray-900 mb-3">
                      {qIdx + 1}. {quiz.question}
                    </p>
                    <div className="space-y-2">
                      {(quiz.options || []).map((option: string, oIdx: number) => {
                        const selected = quizAnswers[quiz.id] === option;
                        let bgColor = 'bg-white hover:bg-gray-50 border-gray-200';

                        if (quizResult && resultItem) {
                          if (option === resultItem.correct_answer) {
                            bgColor = 'bg-green-50 border-green-300';
                          } else if (selected && !resultItem.is_correct) {
                            bgColor = 'bg-red-50 border-red-300';
                          }
                        } else if (selected) {
                          bgColor = 'bg-indigo-50 border-indigo-300';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(quiz.id, option)}
                            disabled={!!quizResult}
                            className={`w-full text-left px-4 py-3 rounded-lg border ${bgColor} transition-colors disabled:cursor-default`}
                          >
                            <span className="font-medium text-gray-500 mr-2">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {quizResult && resultItem && (
                      <p className={`mt-2 text-sm ${resultItem.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                        {resultItem.is_correct ? 'Correct!' : `Incorrect. ${resultItem.explanation || ''}`}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Submit Button */}
              {!quizResult && !currentSectionPassed && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submittingQuiz || !allQuizzesAnswered}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingQuiz ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Submit Answers
                </button>
              )}

              {/* Quiz Results */}
              {quizResult && (
                <div className={`mt-6 rounded-xl p-6 ${quizResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {quizResult.passed ? (
                      <CheckCircle className="text-green-600" size={28} />
                    ) : (
                      <XCircle className="text-red-600" size={28} />
                    )}
                    <div>
                      <p className={`text-2xl font-bold ${quizResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                        {quizResult.score}%
                      </p>
                      <p className={`text-sm ${quizResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {quizResult.correct_count}/{quizResult.total_questions} correct
                      </p>
                    </div>
                  </div>

                  {quizResult.passed ? (
                    <div>
                      <p className="text-green-700 font-medium mb-3">
                        You passed! You scored {quizResult.score}% (80% required).
                      </p>
                      {currentSectionIdx < sections.length - 1 ? (
                        <button
                          onClick={handleNextSection}
                          className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          Next Section <ChevronRight size={18} />
                        </button>
                      ) : (
                        <p className="text-green-700 font-medium">
                          You have completed all sections in this lesson!
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-700 font-medium mb-3">
                        You need 80% to pass. Review the material and try again.
                      </p>
                      <button
                        onClick={handleRetrySection}
                        className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <RotateCcw size={18} /> Review &amp; Retry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

      {/* Legacy Quizzes (lesson-level) */}
      {lesson.quizzes && lesson.quizzes.length > 0 && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lesson Quiz</h2>
          {lesson.quizzes.map((quiz: any) => (
            <div key={quiz.id} className="mb-6 last:mb-0">
              <p className="font-medium text-gray-900 mb-3">{quiz.question}</p>
              <div className="space-y-2">
                {(quiz.options || []).map((option: string, idx: number) => {
                  const selected = legacyQuizAnswers[quiz.id] === option;
                  const isCorrect = legacyQuizResults[quiz.id];
                  const answered = legacyQuizAnswers[quiz.id] !== undefined;
                  let bgColor = 'bg-white hover:bg-gray-50';
                  if (answered && selected) {
                    bgColor = isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => !answered && handleLegacyQuizAnswer(quiz.id, option, quiz.correct_answer)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3 rounded-lg border ${bgColor} transition-colors disabled:cursor-default`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {legacyQuizAnswers[quiz.id] !== undefined && (
                <p className={`mt-2 text-sm ${legacyQuizResults[quiz.id] ? 'text-green-600' : 'text-red-600'}`}>
                  {legacyQuizResults[quiz.id] ? 'Correct!' : `Incorrect. ${quiz.explanation || ''}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Button */}
      <div className="flex justify-center">
        {allSectionsPassed || sections.length === 0 ? (
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
        ) : (
          <div className="text-center text-gray-500">
            <Lock size={20} className="inline mr-2" />
            Complete all section quizzes (80%+ score) to unlock lesson completion
          </div>
        )}
      </div>
    </div>
  );
}
