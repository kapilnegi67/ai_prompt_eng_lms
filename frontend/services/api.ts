/**
 * API service layer for communicating with the FastAPI backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Helper ───────────────────────────────────────────────────────────────────

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function signup(data: {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}) {
  return fetchAPI('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
}

export async function login(data: { email: string; password: string }) {
  return fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) });
}

export async function getMe() {
  return fetchAPI('/auth/me');
}

// ── Courses ──────────────────────────────────────────────────────────────────

export async function getBaskets() {
  return fetchAPI('/baskets');
}

export async function getBasket(id: number) {
  return fetchAPI(`/baskets/${id}`);
}

export async function getModule(id: number) {
  return fetchAPI(`/modules/${id}`);
}

export async function getLesson(id: number) {
  return fetchAPI(`/lessons/${id}`);
}

export async function getLabs(moduleId?: number) {
  const query = moduleId ? `?module_id=${moduleId}` : '';
  return fetchAPI(`/labs${query}`);
}

export async function getLab(id: number) {
  return fetchAPI(`/labs/${id}`);
}

export async function getAssignments(moduleId?: number) {
  const query = moduleId ? `?module_id=${moduleId}` : '';
  return fetchAPI(`/assignments${query}`);
}

export async function getAssignment(id: number) {
  return fetchAPI(`/assignments/${id}`);
}

// ── Prompt Playground ────────────────────────────────────────────────────────

export async function evaluatePrompt(data: {
  prompt_text: string;
  task_description?: string;
  expected_format?: string;
}) {
  return fetchAPI('/prompt/evaluate', { method: 'POST', body: JSON.stringify(data) });
}

export async function askTutor(data: {
  question: string;
  context?: string;
  lesson_id?: number;
}) {
  return fetchAPI('/tutor/ask', { method: 'POST', body: JSON.stringify(data) });
}

// ── Assignments / Submissions ────────────────────────────────────────────────

export async function submitAssignment(data: {
  assignment_id?: number;
  lab_id?: number;
  content: string;
  prompt_used?: string;
  ai_output?: string;
  explanation?: string;
}) {
  return fetchAPI('/assignment/submit', { method: 'POST', body: JSON.stringify(data) });
}

export async function getMySubmissions() {
  return fetchAPI('/submissions');
}

// ── Progress ─────────────────────────────────────────────────────────────────

export async function updateProgress(data: {
  lesson_id?: number;
  module_id?: number;
  basket_id?: number;
  completed?: boolean;
  time_spent_minutes?: number;
}) {
  return fetchAPI('/progress', { method: 'POST', body: JSON.stringify(data) });
}

export async function getProgress(userId: number) {
  return fetchAPI(`/progress/${userId}`);
}

export async function getMyCredits() {
  return fetchAPI('/credits');
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function createBasket(data: { title: string; description?: string; credits?: number; order?: number }) {
  return fetchAPI('/admin/basket', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBasket(id: number, data: { title: string; description?: string; credits?: number; order?: number }) {
  return fetchAPI(`/admin/basket/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteBasket(id: number) {
  return fetchAPI(`/admin/basket/${id}`, { method: 'DELETE' });
}

export async function createModule(data: { basket_id: number; title: string; description?: string; order?: number }) {
  return fetchAPI('/admin/module', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateModule(id: number, data: { basket_id: number; title: string; description?: string; order?: number }) {
  return fetchAPI(`/admin/module/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteModule(id: number) {
  return fetchAPI(`/admin/module/${id}`, { method: 'DELETE' });
}

export async function createLesson(data: {
  module_id: number; title: string; content?: string; transcript?: string;
  notes?: string; video_url?: string; order?: number; duration_minutes?: number;
}) {
  return fetchAPI('/admin/lesson', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateLesson(id: number, data: {
  module_id: number; title: string; content?: string; transcript?: string;
  notes?: string; video_url?: string; order?: number; duration_minutes?: number;
}) {
  return fetchAPI(`/admin/lesson/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteLesson(id: number) {
  return fetchAPI(`/admin/lesson/${id}`, { method: 'DELETE' });
}

export async function createLab(data: {
  module_id?: number; title: string; description?: string;
  instructions?: string; starter_prompt?: string; expected_output?: string; max_score?: number;
}) {
  return fetchAPI('/admin/lab', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateLab(id: number, data: {
  module_id?: number; title: string; description?: string;
  instructions?: string; starter_prompt?: string; expected_output?: string; max_score?: number;
}) {
  return fetchAPI(`/admin/lab/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteLab(id: number) {
  return fetchAPI(`/admin/lab/${id}`, { method: 'DELETE' });
}

export async function createAssignment(data: {
  module_id?: number; title: string; description?: string;
  instructions?: string; rubric?: Record<string, number>; max_score?: number; due_hours?: number;
}) {
  return fetchAPI('/admin/assignment', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateAssignment(id: number, data: {
  module_id?: number; title: string; description?: string;
  instructions?: string; rubric?: Record<string, number>; max_score?: number; due_hours?: number;
}) {
  return fetchAPI(`/admin/assignment/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteAssignment(id: number) {
  return fetchAPI(`/admin/assignment/${id}`, { method: 'DELETE' });
}

export async function getStudents() {
  return fetchAPI('/admin/students');
}

export async function getAnalytics() {
  return fetchAPI('/admin/analytics');
}
