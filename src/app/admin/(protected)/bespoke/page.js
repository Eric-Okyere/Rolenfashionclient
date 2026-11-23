'use client';

import { useEffect, useState } from 'react';
import { apiFetch, mediaUrl } from '@/lib/api';
import { splitNumbers, telHref, waHref } from '@/lib/phone';

// Requests sent from the public "Request a bespoke outfit" form (/bespoke).
const STATUSES = ['new', 'contacted', 'quoted', 'in progress', 'completed', 'declined'];
const STATUS_STYLES = {
  new: 'bg-gold text-ink',
  contacted: 'bg-blue-100 text-blue-800',
  quoted: 'bg-purple-100 text-purple-800',
  'in progress': 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  declined: 'bg-black/10 text-ink/60',
};
const MEASUREMENT_LABELS = {
  bust: 'Bust / chest',
  waist: 'Waist',
  hips: 'Hips',
  shoulder: 'Shoulder',
  sleeve: 'Sleeve',
  length: 'Dress / top length',
  neck: 'Neck',
  thigh: 'Thigh',
  trouser: 'Trouser length',
  notes: 'Notes',
};

export default function AdminBespokePage() {
  const [requests, setRequests] = useState(null);
  const [filter, setFilter] = useState('all');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const data = await apiFetch('/api/bespoke');
      setRequests(data.requests);
    } catch (err) {
      setError(err.message);
    }
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    await apiFetch(`/api/bespoke/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this request and its photos?')) return;
    await apiFetch(`/api/bespoke/${id}`, { method: 'DELETE' });
    await load();
  }

  const shown = (requests || []).filter((r) => filter === 'all' || r.status === filter);
  const newCount = (requests || []).filter((r) => r.status === 'new').length;

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Bespoke Requests</h1>
      <p className="text-muted mb-6">
        Custom outfit requests from the website&apos;s bespoke form{newCount ? ` — ${newCount} new` : ''}.
      </p>
      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 mb-4">{error}</div>}

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs capitalize border ${filter === s ? 'bg-ink text-cream border-ink' : 'border-black/15'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {requests && shown.length === 0 && <p className="text-sm text-muted">No requests here yet.</p>}

      <div className="space-y-4">
        {shown.map((r) => {
          const phone = splitNumbers(r.phone)[0] || r.phone;
          const measurements = Object.entries(r.measurements || {}).filter(([, v]) => v);
          return (
            <div key={r._id} className={`card p-5 ${r.status === 'new' ? 'border-l-4 border-l-gold' : ''}`}>
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <p className="font-display text-lg">{r.outfitType}{r.occasion ? ` — ${r.occasion}` : ''}</p>
                  <p className="text-sm">
                    <span className="font-semibold">{r.name}</span>
                    {' · '}
                    <a href={telHref(phone)} className="text-gold-dark hover:underline">{r.phone}</a>
                    {' · '}
                    <a href={waHref(phone, `Hi ${r.name}, this is Rolen Garments about your ${r.outfitType} request.`)} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">WhatsApp</a>
                    {r.email && <> · <a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a></>}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs capitalize ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                  <p className="text-xs text-muted mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-2 text-sm mt-4">
                <p><span className="text-muted">Event date:</span> {r.eventDate ? new Date(r.eventDate).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : '—'}</p>
                <p><span className="text-muted">Budget:</span> {r.budget ? `GH₵ ${r.budget}` : '—'}</p>
                <p><span className="text-muted">Fabric:</span> {r.fabric || '—'}</p>
              </div>
              {r.description && <p className="text-sm mt-3 whitespace-pre-line">{r.description}</p>}

              {r.photoUrls?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {r.photoUrls.map((u, i) => (
                    <button key={u} onClick={() => setPhoto(mediaUrl(u))} className="w-20 h-20 rounded-lg overflow-hidden border border-black/10">
                      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded media */}
                      <img src={mediaUrl(u)} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {(measurements.length > 0 || r.wantsFitting) && (
                <div className="mt-4 rounded-lg bg-cream/60 p-3 text-sm">
                  {measurements.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
                      {measurements.map(([k, v]) => (
                        <p key={k} className={k === 'notes' ? 'col-span-full' : ''}>
                          <span className="text-muted">{MEASUREMENT_LABELS[k] || k}:</span> {v}{k === 'notes' ? '' : '"'}
                        </p>
                      ))}
                    </div>
                  )}
                  {r.wantsFitting && <p className="mt-1 font-medium">✓ Wants an in-studio fitting</p>}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <label className="text-sm flex items-center gap-2">
                  <span className="text-muted">Status</span>
                  <select value={r.status} onChange={(e) => setStatus(r._id, e.target.value)} className="rounded-lg border border-black/15 p-1.5 text-sm capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <button onClick={() => handleDelete(r._id)} className="text-sm text-red-600 hover:underline ml-auto">Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {photo && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setPhoto(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded media */}
          <img src={photo} alt="Inspiration photo" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
