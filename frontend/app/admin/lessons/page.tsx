'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getBaskets, getModule, createLesson, deleteLesson } from '@/services/api';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [baskets, setBaskets] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ module_id: 0, title: '', content: '', video_url: '', duration_minutes: 15, order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/dashboard'); return; }
    if (user) loadData();
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const b = await getBaskets();
      setBaskets(b);
      const basketDetails = await Promise.all(
        b.map((basket: any) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/baskets/${basket.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }).then(r => r.json())
        )
      );
      const allModules: any[] = [];
      for (const bd of basketDetails) {
        for (const mod of bd.modules || []) {
          const moduleDetail = await getModule(mod.id);
          allModules.push(moduleDetail);
        }
      }
      setModules(allModules);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createLesson(form);
      setForm({ module_id: 0, title: '', content: '', video_url: '', duration_minutes: 15, order: 0 });
      setShowForm(false);
      loadData();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lesson?')) return;
    try { await deleteLesson(id); loadData(); } catch { /* ignore */ }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft size={16} /> Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Lessons</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={16} /> New Lesson
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
          <select value={form.module_id} onChange={(e) => setForm({ ...form, module_id: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required>
            <option value={0}>Select Module</option>
            {modules.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lesson Title" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Lesson Content" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-32" />
          <input type="text" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="Video URL (optional)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} placeholder="Duration (minutes)" className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          <button type="submit" disabled={saving || !form.module_id} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="animate-spin" size={16} />} Create Lesson
          </button>
        </form>
      )}

      {modules.map((mod: any) => (
        <div key={mod.id} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{mod.title}</h2>
          <div className="space-y-2">
            {(mod.lessons || []).map((lesson: any) => (
              <div key={lesson.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                  <p className="text-sm text-gray-500">{lesson.duration_minutes} min</p>
                </div>
                <button onClick={() => handleDelete(lesson.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
              </div>
            ))}
            {(!mod.lessons || mod.lessons.length === 0) && <p className="text-sm text-gray-400 italic">No lessons yet</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
