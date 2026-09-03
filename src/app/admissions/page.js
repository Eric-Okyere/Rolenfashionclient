import { Suspense } from 'react';
import Link from 'next/link';
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
        <p className="text-ink/70 mb-6">
          Fill out the form below to apply. You&apos;ll receive an application number immediately — use it to track your
          status and, once admitted, download your signed admission letter.
        </p>
        <div className="flex items-center justify-center gap-3 text-sm text-ink/60">
          <span>Already applied?</span>
          <Link href="/admissions/status" className="btn-outline text-sm">
            Track My Application Status
          </Link>
        </div>
      </Reveal>
      {courses?.length > 0 && (
        <Reveal delay={0.05} className="max-w-3xl mx-auto mb-12">
          <h2 className="font-display text-xl text-center mb-1">Choose Your Class</h2>
          <p className="text-sm text-ink/60 text-center mb-6">
            Every student covers all five subject areas — fashion theory, textiles, pattern drafting, garment
            construction and modern sewing. The choice below is which class track fits your schedule.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {courses.map((c) => (
              <div key={c._id} className="card p-5">
                <span className="inline-block bg-ink/85 text-cream text-[11px] px-2.5 py-1 rounded-full mb-3">
                  {c.level || c.title}
                </span>
                <h3 className="font-display text-lg font-semibold mb-1">{c.title}</h3>
                <p className="text-sm text-muted mb-3">{c.summary}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink/70">{c.duration}</span>
                  <span className="font-semibold text-gold-dark">
                    {c.fee ? `${c.feeCurrency || 'GHS'} ${Number(c.fee).toLocaleString()}` : 'Contact us'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}
      <Reveal delay={0.1}>
        <Suspense fallback={<p className="text-center text-muted">Loading form…</p>}>
          <AdmissionsForm courses={courses || []} />
        </Suspense>
      </Reveal>
    </div>
  );
}
