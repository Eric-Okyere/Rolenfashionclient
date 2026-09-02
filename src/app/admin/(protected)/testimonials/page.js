'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const empty = { name: '', role: '', quote: '', rating: 5 };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);

  async function load() {
    const data = await apiFetch('/api/testimonials?all=1');
    setItems(data.testimonials);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('/api/testimonials', { method: 'POST', body: JSON.stringify(form) });
      setForm(empty);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function togglePublish(t) {
    await apiFetch(`/api/testimonials/${t._id}`, { method: 'PUT', body: JSON.stringify({ isPublished: !t.isPublished }) });
    await load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this testimonial?')) return;
    await apiFetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Testimonials</h1>

      <form onSubmit={handleCreate} className="card p-6 mb-8 space-y-4">
        <h2 className="font-display text-lg">Add Testimonial</h2>
        {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Role (e.g. Alumna, Diploma 2024)</span>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
        </div>
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Quote</span>
          <textarea required rows={3} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
        </label>
        <label className="text-sm block w-32">
          <span className="block mb-1 font-medium">Rating</span>
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="w-full rounded-lg border border-black/15 p-2.5 bg-white">
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
          </select>
        </label>
        <button type="submit" className="btn-gold">Add Testimonial</button>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((t) => (
          <div key={t._id} className="card p-5">
            <p className="text-sm text-ink/80 mb-2">&ldquo;{t.quote}&rdquo;</p>
            <p className="text-sm font-semibold">{t.name}</p>
            {t.role && <p className="text-xs text-muted">{t.role}</p>}
            <div className="flex gap-3 mt-3 text-xs">
              <button onClick={() => togglePublish(t)} className="text-gold-dark hover:underline">
                {t.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
