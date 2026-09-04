'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HeroVisual from '@/components/motion/HeroVisual';

const AUTOPLAY_MS = 5000;

// The hero's product showcase — a small rotating carousel of the shop's own
// photos and videos (Eric: "carousel showcasing both videos and picture of
// the products"), styled to match the single floating HeroVisual card it
// replaces rather than a full-bleed slider, so it still fits the site's
// existing "floating card on a soft glow" look. Falls back to the plain
// HeroVisual (the bundled logo) when there isn't at least one published
// product with a photo yet — a shop with zero products shouldn't show an
// empty/broken carousel.
export default function HeroCarousel({ slides, fallbackSrc, fallbackAlt }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides?.length || 0;

  const goTo = useCallback((i) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (!count) {
    return <HeroVisual src={fallbackSrc} alt={fallbackAlt} />;
  }

  const slide = slides[index];

  return (
    <motion.div
      className="relative flex justify-center"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="absolute inset-0 bg-gold/10 blur-3xl rounded-full"
        animate={{ scale: [1, 1.08, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative w-72 md:w-80 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-ink/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {slide.type === 'video' ? (
              <video
                src={slide.src}
                poster={slide.poster}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.src} alt={slide.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <Link href={slide.href} className="absolute bottom-0 left-0 right-0 p-4 text-cream">
              {slide.type === 'video' && (
                <span className="inline-block text-[10px] font-semibold bg-black/60 px-2 py-0.5 rounded-full mb-1.5">
                  ▶ Video
                </span>
              )}
              <p className="text-[11px] uppercase tracking-[0.15em] text-gold-light">{slide.category}</p>
              <p className="font-display text-lg leading-tight">{slide.title}</p>
              {slide.price && (
                <p className="text-sm text-gold-light">GHS {Number(slide.price).toLocaleString()}</p>
              )}
            </Link>
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous piece"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next piece"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to piece ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-cream/30'}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
