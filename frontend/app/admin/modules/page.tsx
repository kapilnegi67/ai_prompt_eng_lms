'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getBaskets, createModule, deleteModule } from '@/services/api';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminModulesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [baskets, setBaskets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ basket_id: 0, title: '', description: '', order: 0 });
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
      // Load each basket detail to get modules
      const details = await Promise.all(
        b.map((basket: any) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/baskets/${basket.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }).then(r => r.json())
        )
      );
      setBaskets(details);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createModule(form);
      setForm({ basket_id: 0, title: '', description: '', order: 0 });
      setShowForm(false);
      loadData();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this module?')) return;
    try { await deleteModule(id); loadData(); } catch { /* ignore */ }
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Modules</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={16} /> New Module
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
          <select value={form.basket_id} onChange={(e) => setForm({ ...form, basket_id: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required>
            <option value={0}>Select Basket</option>
            {baskets.map((b: any) => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Module Title" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-20" />
          <button type="submit" disabled={saving || !form.basket_id} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="animate-spin" size={16} />} Create Module
          </button>
        </form>
      )}

      {baskets.map((basket: any) => (
        <div key={basket.id} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{basket.title}</h2>
          <div className="space-y-2">
            {(basket.modules || []).map((mod: any) => (
              <div key={mod.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{mod.title}</h3>
                  <p className="text-sm text-gray-500">{mod.description}</p>
                </div>
                <button onClick={() => handleDelete(mod.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
              </div>
            ))}
            {(!basket.modules || basket.modules.length === 0) && (
              <p className="text-sm text-gray-400 italic">No modules yet</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
