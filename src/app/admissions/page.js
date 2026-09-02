import { Suspense } from 'react';
import { safeFetch } from '@/lib/api';
import AdmissionsForm from '@/components/AdmissionsForm';
import Reveal from '@/components/motion/Reveal';

export const metadata = { title: 'Admissions' };

export default async function AdmissionsPage() {
  const { courses } = await safeFetch('/api/courses', { courses: [] });

  return (
    <div className="container-page py-16">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <p className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">Admissions</p>
        <h1 className="font-display text-4xl mb-4">Apply to Rolen</h1>
        <p className="text-ink/70">
          Fill out the form below to apply. You&apos;ll receive an application number immediately — use it to track your
          status and, once admitted, download your signed admission letter.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <Suspense fallback={<p className="text-center text-muted">Loading form…</p>}>
          <AdmissionsForm courses={courses || []} />
        </Suspense>
      </Reveal>
    </div>
  );
}
