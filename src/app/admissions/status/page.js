import { Suspense } from 'react';
import StatusChecker from '@/components/StatusChecker';
import Reveal from '@/components/motion/Reveal';

export const metadata = { title: 'Track My Application' };

export default function AdmissionStatusPage() {
  return (
    <div className="container-page py-16">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <p className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">Admissions</p>
        <h1 className="font-display text-4xl mb-4">Track My Application</h1>
        <p className="text-ink/70">
          Enter your application number and the email you applied with to check your status. Admitted students can
          download their signed admission letter here.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
          <StatusChecker />
        </Suspense>
      </Reveal>
    </div>
  );
}
