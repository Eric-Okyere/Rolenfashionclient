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
  // Eric: "Students must pay their fees through Momo on 0209317581", then
  // asked for students to enter their phone number and have the money
  // deducted directly — built via Paystack's Mobile Money checkout (see
  // server's paymentController.js). `payLoading`/`payError` are local to
  // this button so a payment hiccup never disturbs the status lookup above.
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState(null);

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

  // The deposit amount comes from the admitted course's own depositAmount
  // (falls back to the full fee if a deposit amount was never set — see
  // Course.depositAmount's comment). Deliberately requires `application`'s
  // course to actually carry an amount before showing the button at all —
  // nothing worse than a "Pay" button that then fails because no price was
  // ever configured for it.
  const depositAmount = application?.course?.depositAmount || application?.course?.fee;
  const canPayDeposit =
    application?.status === 'admitted' && application?.feePaymentStatus !== 'paid' && !!depositAmount;

  async function payDeposit() {
    setPayLoading(true);
    setPayError(null);
    try {
      const data = await apiFetch('/api/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          type: 'admission_fee',
          applicationId: application._id,
          email,
          name: `${application.firstName} ${application.lastName}`,
        }),
      });
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setPayError(err.message);
      setPayLoading(false);
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
              <>
                <a
                  href={`${API_URL}/api/applications/track/${application.applicationNumber}/letter?email=${encodeURIComponent(email)}`}
                  className="btn-gold"
                >
                  Download &amp; Print Admission Letter
                </a>
                <p className="text-xs text-muted mt-2">Opens as a PDF — open it and use your browser or PDF viewer&apos;s Print option.</p>
              </>
            )}

            {application.status === 'admitted' && application.feePaymentStatus === 'paid' && (
              <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                ✅ Fee deposit received — see your admission letter for the remaining balance and schedule.
              </p>
            )}

            {canPayDeposit && (
              <div className="mt-4 pt-4 border-t border-black/10">
                <p className="text-sm text-ink/80 mb-1">
                  Fee deposit due: <span className="font-semibold">GHS {Number(depositAmount).toLocaleString()}</span>
                </p>
                <p className="text-xs text-muted mb-3">
                  Pay securely by Mobile Money — you&apos;ll enter your MoMo number and approve the payment on your
                  own phone.
                </p>
                {payError && <p className="text-xs text-red-600 mb-2">{payError}</p>}
                <button type="button" onClick={payDeposit} disabled={payLoading} className="btn-gold w-full">
                  {payLoading ? 'Starting payment…' : 'Pay Deposit via MoMo'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
