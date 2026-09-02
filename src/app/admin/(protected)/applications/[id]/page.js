'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, API_URL } from '@/lib/api';

const STATUSES = ['pending', 'under_review', 'admitted', 'rejected', 'waitlisted'];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    const data = await apiFetch(`/api/applications/${id}`);
    setApplication(data.application);
    setStatus(data.application.status);
    setNotes(data.application.reviewNotes || '');
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reviewNotes: notes }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!application) return <p className="text-muted">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <button onClick={() => router.push('/admin/applications')} className="text-sm text-gold-dark mb-4 hover:underline">
        ← Back to applications
      </button>
      <h1 className="font-display text-3xl mb-1">{application.firstName} {application.lastName}</h1>
      <p className="text-muted mb-6">{application.applicationNumber} · Applied {new Date(application.createdAt).toLocaleDateString()}</p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card p-6 space-y-2 text-sm">
          <h2 className="font-display text-lg mb-2">Applicant Details</h2>
          <Row label="Email" value={application.email} />
          <Row label="Phone" value={application.phone} />
          <Row label="Date of Birth" value={new Date(application.dateOfBirth).toLocaleDateString()} />
          <Row label="Gender" value={application.gender} />
          <Row label="Nationality" value={application.nationality} />
          <Row label="Address" value={application.address} />
          <Row label="Guardian" value={application.guardianName ? `${application.guardianName} (${application.guardianPhone || 'no phone'})` : ''} />
        </div>
        <div className="card p-6 space-y-2 text-sm">
          <h2 className="font-display text-lg mb-2">Program</h2>
          <Row label="Course" value={application.course?.title} />
          <Row label="Duration" value={application.course?.duration} />
          <Row label="Fee" value={application.course?.fee ? `${application.course.feeCurrency} ${application.course.fee}` : 'Contact us for pricing'} />
          <Row label="Intake" value={application.intakePeriod} />
          <Row label="Prior Education" value={application.priorEducation} />
        </div>
      </div>

      {application.statementOfPurpose && (
        <div className="card p-6 mb-6 text-sm">
          <h2 className="font-display text-lg mb-2">Statement of Purpose</h2>
          <p className="text-ink/70 whitespace-pre-line">{application.statementOfPurpose}</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="card p-6 space-y-4">
        <h2 className="font-display text-lg">Review Decision</h2>
        {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>}
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-black/15 p-2.5 bg-white">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Review Notes (internal)</span>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-black/15 p-2.5" />
        </label>
        {status === 'admitted' && (
          <p className="text-xs text-gold-dark bg-gold-light/10 border border-gold-light/40 rounded-lg p-3">
            Setting this application to &ldquo;admitted&rdquo; will automatically generate a signed PDF admission letter using the
            CEO name/signature configured in Settings.
          </p>
        )}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-gold">{saving ? 'Saving…' : 'Save Decision'}</button>
          {application.status === 'admitted' && application.admissionLetterPath && (
            <a href={`${API_URL}${application.admissionLetterPath}`} target="_blank" rel="noreferrer" className="btn-outline">
              View Admission Letter
            </a>
          )}
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-black/5 pb-2 last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
