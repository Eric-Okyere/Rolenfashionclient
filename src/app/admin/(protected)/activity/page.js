'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import ActivityRow from '@/components/ActivityRow';

const PAGE_SIZE = 25;

export default function AdminActivityPage() {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  async function loadFirstPage() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/activity?limit=${PAGE_SIZE}`);
      setItems(data.activity);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { loadFirstPage(); }, []);

  async function loadMore() {
    if (items.length === 0) return;
    setLoadingMore(true);
    try {
      const before = items[items.length - 1].createdAt;
      const data = await apiFetch(`/api/activity?limit=${PAGE_SIZE}&before=${encodeURIComponent(before)}`);
      setItems((prev) => [...prev, ...data.activity]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Activity Log</h1>
          <p className="text-muted text-sm mt-1">Everything happening across the site — applications, messages, courses, the shop, and staff actions.</p>
        </div>
        <button onClick={loadFirstPage} className="btn-outline text-sm">Refresh</button>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 mb-6">{error}</div>}

      <div className="card p-6">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">No activity recorded yet — it&apos;ll start filling in as people use the site.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <ActivityRow key={item._id} item={item} />
            ))}
          </ul>
        )}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button onClick={loadMore} disabled={loadingMore} className="btn-outline">
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
