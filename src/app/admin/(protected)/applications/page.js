'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { apiFetch } from '@/lib/api';

const STATUS_COLOR = {
  pending: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  admitted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-purple-100 text-purple-800',
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const query = status ? `?status=${status}` : '';
      const data = await apiFetch(`/api/applications${query}`);
      setApplications(data.applications);
      setLoading(false);
    })();
  }, [status]);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Applications</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {['', 'pending', 'under_review', 'admitted', 'rejected', 'waitlisted'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`text-sm px-4 py-1.5 rounded-full border ${status === s ? 'bg-ink text-cream border-ink' : 'border-black/15 text-ink/70'}`}
          >
            {s === '' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-black/10">
              <th className="p-4">Applicant</th>
              <th className="p-4">Course</th>
              <th className="p-4">Submitted</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a._id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                <td className="p-4">
                  <p className="font-medium">{a.firstName} {a.lastName}</p>
                  <p className="text-xs text-muted">{a.applicationNumber}</p>
                </td>
                <td className="p-4">{a.course?.title}</td>
                <td className="p-4">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[a.status]}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/admin/applications/${a._id}`} className="text-gold-dark hover:underline">Review</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && applications.length === 0 && <p className="text-center text-muted p-8">No applications found.</p>}
      </div>
    </div>
  );
}
