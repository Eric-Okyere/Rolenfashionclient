import BespokeForm from '@/components/BespokeForm';
import Reveal from '@/components/motion/Reveal';

export const metadata = {
  title: { absolute: 'Request a Bespoke Outfit | Rolen Garments' },
  description: 'Tell us what you want to wear. Share inspiration photos and your measurements — Rolen Garments will sew it for you.',
};

export default function BespokePage() {
  return (
    <div className="container-page py-16 max-w-3xl">
      <Reveal as="p" className="uppercase tracking-[0.2em] text-xs text-gold-dark mb-3">Rolen Garments</Reveal>
      <Reveal as="h1" delay={0.05} className="font-display text-4xl mb-3">Bespoke tailoring</Reveal>
      <Reveal as="p" delay={0.1} className="text-ink/70 mb-10">
        Tell us what you want to wear. Share inspiration photos and your measurements — we&apos;ll handle the rest.
      </Reveal>
      <BespokeForm />
    </div>
  );
}
