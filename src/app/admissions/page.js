import { Suspense } from 'react';
import Link from 'next/link';
import { safeFetch } from '@/lib/api';
import { splitNumbers, telHref, waHref } from '@/lib/phone';
import AdmissionsForm from '@/components/AdmissionsForm';
import Reveal from '@/components/motion/Reveal';
import PhoneIcon from '@/components/icons/PhoneIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

export const metadata = { title: 'Admissions' };

export default async function AdmissionsPage() {
  const [{ courses }, { settings }] = await Promise.all([
    safeFetch('/api/courses', { courses: [] }),
    safeFetch('/api/settings', { settings: {} }),
  ]);
  // Eric: "one of the contacts is whatsapp contact... separate them" —
  // Settings.phone and Settings.whatsapp are genuinely different numbers
  // (024 344 2262 is WhatsApp-only), same split already used on the
  // Contact page, so each renders under its own label with its own link
  // type (tel: vs. wa.me) below instead of both being lumped under "Call".
  const phoneNumbers = splitNumbers(settings?.phone);
  const whatsappNumbers = splitNumbers(settings?.whatsapp);

  return (
    <div className="container-page py-16">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <p className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">Admissions</p>
        <h1 className="font-display text-4xl mb-4">Apply to Rolen</h1>
        <p className="text-ink/70 mb-6">
          Fill out the form below to apply. You&apos;ll receive an application number immediately — use it to track your
          status and, once admitted, download your signed admission letter.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-ink/60">
          <span>Already applied?</span>
          <Link href="/admissions/status" className="btn-outline text-sm">
            Track My Application Status
          </Link>
          {/* Eric: "Put the payment of fees in the admission page in the form
              of a button." The actual MoMo checkout needs to know which
              application is paying and its deposit amount (see
              StatusChecker.js's "Pay Deposit via MoMo" button, which only
              appears once an admitted applicant's own record is loaded), so
              this button leads straight into that same tracker rather than
              duplicating the lookup form here — the real Pay button shows up
              the instant their application is found. */}
          <Link href="/admissions/status" className="btn-gold text-sm">
            💳 Pay Fees via MoMo
          </Link>
        </div>
        {/* Eric: "add the school second number to the form" — the apply form
            itself had no phone number at all before this, on a page where a
            prospective student is most likely to want to reach out with a
            question. Phone and WhatsApp are shown as separate, clearly
            labeled groups (same tel:/wa.me split as the Contact page) since
            they're genuinely different numbers, not two ways to reach the
            same line. */}
        {(phoneNumbers.length > 0 || whatsappNumbers.length > 0) && (
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 text-sm text-ink/60">
            <span>Need help applying?</span>
            {phoneNumbers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-muted">Call</span>
                {phoneNumbers.map((num) => (
                  <a
                    key={num}
                    href={telHref(num)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/15 text-ink/70 hover:border-gold-dark hover:text-gold-dark transition-colors"
                  >
                    <PhoneIcon className="w-3.5 h-3.5" />
                    {num}
                  </a>
                ))}
              </div>
            )}
            {whatsappNumbers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-muted">WhatsApp</span>
                {whatsappNumbers.map((num) => (
                  <a
                    key={num}
                    href={waHref(num)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/15 text-ink/70 hover:border-[#25D366] hover:text-[#128C4A] transition-colors"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    {num}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
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
