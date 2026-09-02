'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { apiFetch, API_URL } from '@/lib/api';

const STATUS_LABEL = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  admitted: { label: 'Admitted 🎉', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Not Admitted', color: 'bg-red-100 text-red-800' },
  waitlisted: { label: 'Waitlisted', color: 'bg-purple-100 text-purple-800' },
};

export default function StatusChecker() {
  const searchParams = useSearchParams();
  const [applicationNumber, setApplicationNumber] = useState(searchParams.get('ref') || '');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);

  async function check(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setApplication(null);
    try {
      const data = await apiFetch(
        `/api/applications/track/${encodeURIComponent(applicationNumber)}?email=${encodeURIComponent(email)}`
      );
      setApplication(data.application);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={check} className="card p-6 space-y-4">
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Application Number</span>
          <input
            required
            value={applicationNumber}
            onChange={(e) => setApplicationNumber(e.target.value)}
            placeholder="ROLEN-2026-00001"
            className="w-full rounded-lg border border-black/15 p-2.5 outline-none focus:border-gold-dark"
          />
        </label>
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Email used to apply</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-black/15 p-2.5 outline-none focus:border-gold-dark"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-gold w-full">
          {loading ? 'Checking…' : 'Check Status'}
        </button>
      </form>

      {error && <p className="text-center text-red-600 text-sm mt-6">{error}</p>}

      <AnimatePresence>
        {application && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="card p-6 mt-6 text-center"
          >
            <p className="text-sm text-muted mb-1">
              {application.firstName} {application.lastName} — {application.course?.title}
            </p>
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium my-3 ${STATUS_LABEL[application.status]?.color}`}>
              {STATUS_LABEL[application.status]?.label || application.status}
            </span>
            <p className="text-xs text-muted mb-4">Submitted {new Date(application.submittedAt).toLocaleDateString()}</p>

            {application.canDownloadLetter && (
              <a
                href={`${API_URL}/api/applications/track/${application.applicationNumber}/letter?email=${encodeURIComponent(email)}`}
                className="btn-gold"
              >
                Download Admission Letter (PDF)
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
