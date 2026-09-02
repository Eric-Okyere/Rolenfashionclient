'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/api/newsletter');
        setSubscribers(data.subscribers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function downloadCsv() {
    const rows = [['Email', 'Subscribed'], ...subscribers.map((s) => [s.email, new Date(s.createdAt).toLocaleDateString()])];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rolen-newsletter-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Newsletter</h1>
          <p className="text-muted text-sm mt-1">{subscribers.length} subscriber{subscribers.length === 1 ? '' : 's'}</p>
        </div>
        <button onClick={downloadCsv} disabled={subscribers.length === 0} className="btn-outline disabled:opacity-40">
          Export CSV
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 mb-6">{error}</div>}

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted">Loading…</p>
        ) : subscribers.length === 0 ? (
          <p className="p-6 text-sm text-muted">No subscribers yet — the signup form is live on the public site.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-black/5">
                <th className="p-4">Email</th>
                <th className="p-4">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s._id} className="border-b border-black/5 last:border-0">
                  <td className="p-4">{s.email}</td>
                  <td className="p-4 text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
