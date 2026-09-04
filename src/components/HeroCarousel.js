'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const AUTOPLAY_MS = 6000;

// The homepage's big advertisement banner. Eric: "Carousel post should be
// different from product post. Carousels should be very big to be used for
// advertisement showing videos and pictures of the products of the
// business." Slides come from the admin-managed "Ad Carousel" content type
// (CarouselPost — see server/src/models/CarouselPost.js), a separate thing
// from the product catalog, so Eric decides exactly what the banner shows
// rather than it being auto-picked from whatever's in stock.
//
// Renders as a full-bleed background filling the whole hero section (see
// page.js, which layers its own static eyebrow/headline/CTA text on top via
// a sibling element, and gives the section its height) — a small floating
// card doesn't read as an "advertisement," so this is deliberately not the
// same component/style as the old product-driven hero card.
//
// With zero active slides, falls back to a plain on-brand gradient with a
// faint centered logo watermark rather than an empty/broken carousel.
export default function HeroCarousel({ slides, fallbackSrc }) {
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
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-ink to-[#241c10] overflow-hidden">
        {fallbackSrc && (
          // Decorative watermark only — the real logo already lives in the
          // navbar, so this carries no meaningful alt text of its own.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fallbackSrc} alt="" className="absolute inset-0 m-auto w-40 h-40 object-contain opacity-10" />
        )}
      </div>
    );
  }

  const slide = slides[index];

  return (
    <div className="absolute inset-0" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
            <img src={slide.src} alt={slide.title || 'Rolen'} className="w-full h-full object-cover" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Darkens the media so both the static headline (top, laid over this
          by page.js) and this slide's own caption (bottom) stay legible
          regardless of what the photo/video looks like underneath. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/55" />

      <div className="absolute bottom-16 md:bottom-20 left-0 right-0 px-6 text-center text-cream">
        {slide.type === 'video' && (
          <span className="inline-block text-[10px] font-semibold bg-black/60 px-2 py-0.5 rounded-full mb-2">▶ Video</span>
        )}
        {slide.title && <p className="font-display text-2xl md:text-4xl mb-1.5">{slide.title}</p>}
        {slide.caption && <p className="text-cream/80 text-sm md:text-base max-w-xl mx-auto mb-4">{slide.caption}</p>}
        <Link href={slide.href} className="inline-block btn-gold">
          {slide.ctaLabel}
        </Link>
      </div>

      {count > 1 && (
        <>
          {/* Arrow buttons are hidden below `sm`: on a narrow screen the
              section is tall enough that a vertically-centered arrow lands
              on top of the headline's own CTA buttons above. Autoplay plus
              the dot indicators (always shown) still give mobile visitors a
              way to browse and see how many slides there are. */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60 transition-colors text-xl"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60 transition-colors text-xl"
          >
            ›
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-cream/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
