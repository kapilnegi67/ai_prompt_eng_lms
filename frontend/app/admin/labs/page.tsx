'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getLabs, createLab, deleteLab, getBaskets, getModule } from '@/services/api';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLabsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [labs, setLabs] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ module_id: 0, title: '', description: '', instructions: '', starter_prompt: '', max_score: 100 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/dashboard'); return; }
    if (user) loadData();
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const l = await getLabs();
      setLabs(l);
      const b = await getBaskets();
      const basketDetails = await Promise.all(
        b.map((basket: any) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/baskets/${basket.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }).then(r => r.json())
        )
      );
      const allMods: any[] = [];
      for (const bd of basketDetails) { for (const m of bd.modules || []) { allMods.push(m); } }
      setModules(allMods);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createLab({ ...form, module_id: form.module_id || undefined });
      setForm({ module_id: 0, title: '', description: '', instructions: '', starter_prompt: '', max_score: 100 });
      setShowForm(false);
      loadData();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lab?')) return;
    try { await deleteLab(id); loadData(); } catch { /* ignore */ }
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Labs</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={16} /> New Lab
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
          <select value={form.module_id} onChange={(e) => setForm({ ...form, module_id: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
            <option value={0}>Select Module (optional)</option>
            {modules.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lab Title" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-20" />
          <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Instructions" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-20" />
          <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="animate-spin" size={16} />} Create Lab
          </button>
        </form>
      )}

      <div className="space-y-3">
        {labs.map((lab: any) => (
          <div key={lab.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{lab.title}</h3>
              <p className="text-sm text-gray-500">{lab.description}</p>
            </div>
            <button onClick={() => handleDelete(lab.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
