'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { productNames } from '@/lib/product';

// Eric: "I want to know the number of people who visit the page." Counts
// come from the anonymous page-view tracking on the public site (see
// components/VisitTracker.js and the server's visit.routes.js). "Visitors"
// = different people (browsers); "page views" = every page they opened.
const PAGE_LABELS = {
  '/': 'Shop (home page)',
  '/school': 'School',
  '/about': 'About',
  '/courses': 'Courses',
  '/admissions': 'Admissions',
  '/admissions/status': 'Track application',
  '/contact': 'Contact',
};

function shortDate(day) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export default function VisitorsPage() {
  const [stats, setStats] = useState(null);
  const [productLabels, setProductLabels] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [data, gallery] = await Promise.all([apiFetch('/api/visits/stats'), apiFetch('/api/gallery?all=1').catch(() => ({ items: [] }))]);
        setStats(data);
        setProductLabels(Object.fromEntries((gallery.items || []).map((i) => [`/shop/${i._id}`, productNames(i).name])));
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  const label = (path) => PAGE_LABELS[path] || productLabels[path] || (path.startsWith('/shop/') ? 'A product page' : path);
  const peak = Math.max(1, ...(stats?.days || []).map((d) => d.visitors));

  const cards = [
    { title: 'Today', data: stats?.today },
    { title: 'Last 7 days', data: stats?.last7 },
    { title: 'Last 30 days', data: stats?.last30 },
    { title: 'All time', data: stats?.allTime },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Visitors</h1>
      <p className="text-muted mb-8">
        How many people visit the website. A visitor is one person (one phone or computer); page views count every page they open.
      </p>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 mb-6">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={c.title} className={`card p-5 ${i === 0 ? 'ring-2 ring-gold' : ''}`}>
            <p className="text-xs mb-1 text-muted">{c.title}</p>
            <p className="font-display text-3xl leading-none">{c.data ? c.data.visitors.toLocaleString() : '—'}</p>
            <p className="text-xs mt-1 text-muted">
              visitors · {c.data ? c.data.views.toLocaleString() : '—'} page views
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6 mb-8">
        <h2 className="font-display text-lg mb-4">Visitors per day — last 30 days</h2>
        {!stats && !error && <p className="text-sm text-muted">Loading…</p>}
        {stats && (
          <>
            <div className="flex items-end gap-1 h-48" role="img" aria-label="Daily visitors for the last 30 days">
              {stats.days.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <span className="absolute -top-6 hidden group-hover:block text-[10px] bg-ink text-cream px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    {shortDate(d.day)}: {d.visitors} visitor{d.visitors === 1 ? '' : 's'}, {d.views} views
                  </span>
                  <div
                    className="w-full rounded-t bg-gold group-hover:bg-gold-dark transition-colors"
                    style={{ height: `${(d.visitors / peak) * 100}%`, minHeight: d.visitors ? 3 : 0 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted mt-2">
              <span>{shortDate(stats.days[0].day)}</span>
              <span>Today</span>
            </div>
          </>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">Most visited pages — last 30 days</h2>
        {stats && stats.topPages.length === 0 && <p className="text-sm text-muted">No visits recorded yet — they&apos;ll appear here as people open the site.</p>}
        {stats && stats.topPages.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs">
                <th className="pb-2 font-normal">Page</th>
                <th className="pb-2 font-normal text-right">Visitors</th>
                <th className="pb-2 font-normal text-right">Page views</th>
              </tr>
            </thead>
            <tbody>
              {stats.topPages.map((p) => (
                <tr key={p.path} className="border-t border-black/5">
                  <td className="py-2">
                    <a href={p.path} target="_blank" rel="noreferrer" className="hover:text-gold-dark">{label(p.path)}</a>
                  </td>
                  <td className="py-2 text-right">{p.visitors.toLocaleString()}</td>
                  <td className="py-2 text-right">{p.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
