import Image from 'next/image';
import { safeFetch } from '@/lib/api';
import Reveal from '@/components/motion/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/motion/Stagger';

// Statically cached and regenerated at most once every 60 seconds (ISR) —
// this page doesn't read searchParams/cookies/headers, so Next.js can serve
// it straight from cache for repeat visits instead of re-running this route
// as a Netlify serverless function every time. Eric: cut function-invocation
// usage after the site's traffic blew past Netlify's free-plan function
// limit and paused every project on the team.
export const revalidate = 60;

export const metadata = { title: 'About Us' };

export default async function AboutPage() {
  const { settings } = await safeFetch('/api/settings', { settings: {} }, { revalidate: 60 });

  return (
    <div className="container-page py-16 max-w-4xl">
      <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">About Us</Reveal>
      <Reveal as="h1" delay={0.05} className="font-display text-4xl mb-6">{settings?.schoolName || 'Rolen School of Fashion and Design'}</Reveal>
      <Reveal as="p" delay={0.1} className="text-ink/75 text-lg leading-relaxed mb-10">
        {settings?.aboutText ||
          'Rolen School of Fashion and Design trains designers, tailors and stylists with hands-on, industry-led programs.'}
      </Reveal>

      <StaggerGroup className="grid md:grid-cols-3 gap-8 mb-14">
        <StaggerItem className="h-full"><ValueCard title="Hands-on Studios" text="Every module pairs theory with real studio time — cutting, sewing and draping from day one." /></StaggerItem>
        <StaggerItem className="h-full"><ValueCard title="Industry Mentors" text="Working designers and tailors guide capstone collections and portfolio reviews." /></StaggerItem>
        <StaggerItem className="h-full"><ValueCard title="Career Pathways" text="From internships to entrepreneurship training, we prepare graduates to work or launch their own label." /></StaggerItem>
      </StaggerGroup>

      <Reveal className="card p-8 flex flex-col md:flex-row gap-8 items-center">
        <Image src="/images/rolen-logo.png" alt="Rolen" width={120} height={120} className="w-28 h-28 object-contain" />
        <div>
          <h2 className="font-display text-xl mb-2">A note from our CEO</h2>
          <p className="text-sm text-ink/70">
            &ldquo;We built Rolen to be the studio we wish we had as students — rigorous, creative, and connected to
            industry.&rdquo;
          </p>
          <p className="text-sm font-semibold mt-3">{settings?.ceoName || 'Chief Executive Officer'}</p>
          <p className="text-xs text-muted">{settings?.ceoTitle}</p>
        </div>
      </Reveal>
    </div>
  );
}

function ValueCard({ title, text }) {
  return (
    <div className="card p-6 h-full">
      <h3 className="font-display text-lg mb-2">{title}</h3>
      <p className="text-sm text-ink/70">{text}</p>
    </div>
  );
}
