'use client';

import { useEffect, useState } from 'react';
import { apiFetch, API_URL, mediaUrl } from '@/lib/api';
import MediaCover from '@/components/MediaCover';

const emptyCourse = {
  title: '', category: 'Fashion Design', summary: '', description: '', duration: '', level: 'All Levels',
  fee: '', feeCurrency: 'GHS', intakePeriods: '', curriculum: '', isPublished: true,
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [editing, setEditing] = useState(null); // course object or null
  const [form, setForm] = useState(emptyCourse);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await apiFetch('/api/courses?all=1');
    setCourses(data.courses);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing('new');
    setForm(emptyCourse);
    setFile(null);
  }

  function startEdit(course) {
    setEditing(course._id);
    setForm({
      ...course,
      intakePeriods: (course.intakePeriods || []).join(', '),
      curriculum: (course.curriculum || []).join('\n'),
    });
    setFile(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        fee: form.fee === '' || form.fee === null || form.fee === undefined ? null : Number(form.fee),
        intakePeriods: form.intakePeriods.split(',').map((s) => s.trim()).filter(Boolean),
        curriculum: form.curriculum.split('\n').map((s) => s.trim()).filter(Boolean),
      };
      let course;
      if (editing === 'new') {
        const data = await apiFetch('/api/courses', { method: 'POST', body: JSON.stringify(payload) });
        course = data.course;
      } else {
        const data = await apiFetch(`/api/courses/${editing}`, { method: 'PUT', body: JSON.stringify(payload) });
        course = data.course;
      }
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        await apiFetch(`/api/courses/${course._id}/image`, { method: 'POST', body: fd });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await apiFetch(`/api/courses/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Courses</h1>
        <button onClick={startCreate} className="btn-gold">+ New Course</button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="card p-6 mb-8 space-y-4">
          {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <SelectField
              label="Category"
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={['Fashion Design', 'Tailoring', 'Textiles', 'Business', 'Short Course', 'Other']}
            />
            <Field label="Duration (e.g. 6 months)" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} required />
            <SelectField
              label="Level"
              value={form.level}
              onChange={(v) => setForm({ ...form, level: v })}
              options={['Beginner', 'Intermediate', 'Advanced', 'All Levels']}
            />
            <Field label="Fee (optional — leave blank for &quot;Contact us&quot;)" type="number" value={form.fee} onChange={(v) => setForm({ ...form, fee: v })} />
            <Field label="Currency" value={form.feeCurrency} onChange={(v) => setForm({ ...form, feeCurrency: v })} />
            <Field label="Intake Periods (comma separated)" value={form.intakePeriods} onChange={(v) => setForm({ ...form, intakePeriods: v })} className="md:col-span-2" />
          </div>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Summary (short)</span>
            <textarea required rows={2} maxLength={300} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Full Description</span>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Curriculum (one item per line)</span>
            <textarea rows={4} value={form.curriculum} onChange={(e) => setForm({ ...form, curriculum: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Cover Image</span>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Published (visible to students)
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-gold">{loading ? 'Saving…' : 'Save Course'}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((c) => (
          <div key={c._id} className="card p-5 flex gap-4">
            {c.image && (
              // Matches the public course card — full uncropped photo.
              <MediaCover src={mediaUrl(c.image)} alt={c.title} className="w-20 h-20 rounded-lg shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{c.title}</p>
                {!c.isPublished && <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">Draft</span>}
              </div>
              <p className="text-xs text-muted">{c.category} · {c.duration} · {c.fee ? `${c.feeCurrency} ${c.fee}` : 'Contact us for pricing'}</p>
              <div className="flex gap-3 mt-2 text-sm">
                <button onClick={() => startEdit(c)} className="text-gold-dark hover:underline">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required, className = '' }) {
  return (
    <label className={`text-sm block ${className}`}>
      <span className="block mb-1 font-medium">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-black/15 p-2.5" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="text-sm block">
      <span className="block mb-1 font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-black/15 p-2.5 bg-white">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
