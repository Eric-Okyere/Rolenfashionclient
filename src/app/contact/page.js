import { safeFetch } from '@/lib/api';
import { splitNumbers, telHref, waHref } from '@/lib/phone';
import ContactForm from '@/components/ContactForm';
import Reveal from '@/components/motion/Reveal';
import PhoneIcon from '@/components/icons/PhoneIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

// Statically cached and regenerated at most once every 60 seconds (ISR) —
// this page doesn't read searchParams/cookies/headers, so Next.js can serve
// it straight from cache for repeat visits instead of re-running this route
// as a Netlify serverless function every time. Eric: cut function-invocation
// usage after the site's traffic blew past Netlify's free-plan function
// limit and paused every project on the team.
export const revalidate = 60;

export const metadata = { title: 'Contact & Location' };

export default async function ContactPage() {
  const { settings } = await safeFetch('/api/settings', { settings: {} }, { revalidate: 60 });

  return (
    <div className="container-page py-16">
      <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">Get in Touch</Reveal>
      <Reveal as="h1" delay={0.05} className="font-display text-4xl mb-10">Contact &amp; Location</Reveal>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <Reveal>
            <h2 className="font-display text-xl mb-3">Visit the Campus</h2>
            <p className="text-ink/70">{settings?.address}</p>
            <p className="text-ink/70">{settings?.city}{settings?.city && settings?.country ? ', ' : ''}{settings?.country}</p>
            <p className="text-ink/70 mt-2">{settings?.officeHours}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-xl mb-3">Reach Us</h2>

            {splitNumbers(settings?.phone).length > 0 && (
              <div className="mb-3">
                <p className="text-xs uppercase tracking-wide text-muted mb-1.5">Call</p>
                <div className="flex flex-wrap gap-2">
                  {splitNumbers(settings.phone).map((num) => (
                    <a
                      key={num}
                      href={telHref(num)}
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-black/15 text-ink/70 hover:border-gold-dark hover:text-gold-dark transition-colors"
                    >
                      <PhoneIcon className="w-3.5 h-3.5" />
                      {num}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {splitNumbers(settings?.whatsapp).length > 0 && (
              <div className="mb-3">
                <p className="text-xs uppercase tracking-wide text-muted mb-1.5">WhatsApp</p>
                <div className="flex flex-wrap gap-2">
                  {splitNumbers(settings.whatsapp).map((num) => (
                    <a
                      key={num}
                      href={waHref(num)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-black/15 text-ink/70 hover:border-[#25D366] hover:text-[#128C4A] transition-colors"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      {num}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <p className="text-ink/70">Email: {settings?.email}</p>
          </Reveal>
          <Reveal delay={0.16}>
            {settings?.mapEmbedUrl ? (
              <div className="rounded-2xl overflow-hidden border border-black/10 h-72">
                <iframe src={settings.mapEmbedUrl} className="w-full h-full" loading="lazy" title="Campus location map" />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-black/15 h-52 flex items-center justify-center text-sm text-muted text-center p-6">
                A campus map will appear here once added in Admin → Settings.
              </div>
            )}
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}
