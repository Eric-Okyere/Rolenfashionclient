'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

// Eric: "Students must pay their fees through Momo on 0209317581", then
// asked for students/shoppers to be able to enter their phone number and
// have the money deducted directly — this is the ledger view so Eric can
// see who's actually paid without checking the Paystack dashboard
// separately. Read-only: payments are only ever created/updated by the
// checkout flow and Paystack's webhook (see paymentController.js).
const STATUS_COLOR = {
  success: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  abandoned: 'bg-black/10 text-ink/60',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/payments');
      setPayments(data.payments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  const totalReceived = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-3xl">Payments</h1>
        <button onClick={load} className="text-sm text-gold-dark hover:underline">Refresh</button>
      </div>
      <p className="text-sm text-muted mb-6">
        Mobile Money &amp; card payments taken via Paystack — admission fee deposits and shop orders.
      </p>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 mb-4">{error}</div>}

      <div className="card p-5 mb-6 inline-block">
        <p className="text-xs text-muted mb-1">Total received (successful payments)</p>
        <p className="text-2xl font-display">GHS {totalReceived.toLocaleString()}</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : payments.length === 0 ? (
        <p className="text-muted">No payments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm card">
            <thead>
              <tr className="text-left border-b border-black/10">
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">For</th>
                <th className="p-3">Payer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-black/5 last:border-0">
                  <td className="p-3 whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</td>
                  <td className="p-3">{p.type === 'admission_fee' ? 'Admission Fee' : 'Shop Order'}</td>
                  <td className="p-3">
                    {p.type === 'admission_fee'
                      ? p.application
                        ? `${p.application.firstName} ${p.application.lastName} (${p.application.applicationNumber})`
                        : '—'
                      : p.galleryItem?.title || '—'}
                  </td>
                  <td className="p-3">
                    <div>{p.name || '—'}</div>
                    <div className="text-xs text-muted">{p.email}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">GHS {Number(p.amount).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[p.status] || ''}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted">{p.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
