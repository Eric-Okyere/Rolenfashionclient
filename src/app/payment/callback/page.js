import { Suspense } from 'react';
import PaymentCallback from '@/components/PaymentCallback';

export const metadata = { title: 'Payment Status' };

export default function PaymentCallbackPage() {
  return (
    <div className="container-page py-16">
      <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
        <PaymentCallback />
      </Suspense>
    </div>
  );
}
