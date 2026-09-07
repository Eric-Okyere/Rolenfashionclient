'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

// Paystack redirects the browser back here after checkout (see
// PAYSTACK_CALLBACK_URL / the default in paymentController.js's
// callbackUrl()), with the transaction reference in the query string —
// either `?reference=` (Paystack's own param) or `?trxref=` (an alias
// Paystack also sends). Whichever the payer actually completed (Mobile
// Money approval on their phone, or a card charge), this is what confirms
// it really went through: `verifyPayment` re-checks the real, current status
// directly with Paystack rather than trusting anything in the URL itself.
export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  // No `reference`/`trxref` in the URL at all is known synchronously on first
  // render (it never changes without a navigation), so it's captured as a
  // lazy initial state instead of a setState call inside the effect below —
  // the effect itself is reserved solely for the actual async verification
  // call against Paystack.
  const [state, setState] = useState(reference ? 'checking' : 'error'); // checking | success | failed | error
  const [message, setMessage] = useState(reference ? '' : 'No payment reference was provided.');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch(`/api/payments/verify/${encodeURIComponent(reference)}`);
        if (cancelled) return;
        setResult(data);
        setState(data.status === 'success' ? 'success' : 'failed');
      } catch (err) {
        if (cancelled) return;
        setState('error');
        setMessage(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [reference]);

  return (
    <div className="max-w-md mx-auto card p-8 text-center">
      {state === 'checking' && (
        <>
          <p className="text-lg font-medium mb-2">Confirming your payment…</p>
          <p className="text-sm text-muted">This only takes a moment — please don&apos;t close this page.</p>
        </>
      )}

      {state === 'success' && (
        <>
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-medium mb-2">Payment Successful</p>
          <p className="text-sm text-muted mb-1">
            GHS {Number(result.amount).toLocaleString()} received.
          </p>
          <p className="text-xs text-muted mb-6">Reference: {result.reference}</p>
          {result.type === 'admission_fee' ? (
            <Link href="/admissions/status" className="btn-gold">Back to My Application</Link>
          ) : (
            <Link href="/" className="btn-gold">Back to Shop</Link>
          )}
        </>
      )}

      {state === 'failed' && (
        <>
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-lg font-medium mb-2">Payment Not Completed</p>
          <p className="text-sm text-muted mb-6">
            This transaction was not successful ({result?.status || 'unknown'}). No money was deducted if you
            cancelled or didn&apos;t approve it on your phone. You can try again.
          </p>
          <Link href="/admissions/status" className="btn-outline">Back</Link>
        </>
      )}

      {state === 'error' && (
        <>
          <p className="text-4xl mb-3">❗</p>
          <p className="text-lg font-medium mb-2">Couldn&apos;t Confirm Payment</p>
          <p className="text-sm text-muted mb-6">{message}</p>
          <Link href="/admissions/status" className="btn-outline">Back</Link>
        </>
      )}
    </div>
  );
}
