'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MediaCover from '@/components/MediaCover';

const AUTOPLAY_MS = 6000;
const MAX_VISIBLE = 3;

// The homepage's big advertisement banner. Eric: "Carousel post should be
// different from product post. Carousels should be very big to be used for
// advertisement showing videos and pictures of the products of the
// business." Slides come from the admin-managed "Ad Carousel" content type
// (CarouselPost — see server/src/models/CarouselPost.js), a separate thing
// from the product catalog, so Eric decides exactly what the banner shows
// rather than it being auto-picked from whatever's in stock.
//
// Renders as a media-only row of cards — no title/caption/CTA text or
// badges drawn over a photo/video (Eric shared a reference site's banner and
// said "look at how this is appearing well... don't show any writings on
// the carousel"). page.js renders the site's own headline/CTA copy in its
// own band directly *below* this block instead of layered on top of it, so
// the carousel itself stays a clean, uncluttered showcase. Each card is
// still a real link (to its linked collection, or the shop) — clicking
// anywhere on a photo/video navigates there — so removing the visible
// button didn't remove the functionality, just the on-image text.
//
// Eric: "Show 3 products in the carousel at a time" — instead of one big
// slide, this now shows up to 3 slides side by side as a sliding window
// (autoplay/arrows shift the window by one slide, so the effect is a
// filmstrip advancing through the whole list rather than one full-screen
// slide swapping for the next). Fewer than 3 admin-posted slides just shows
// however many exist — never duplicated to pad out to 3 — and the row
// collapses to 1 card on phones / 2 on tablets so cards never get
// squeezed down to an unreadable sliver on a small screen.
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

  // The sliding window of up to 3 cards starting at `index`, wrapping
  // around the slide list. Never repeats a slide within the window (if
  // there are fewer than 3 slides total, the window is just that many
  // cards — no padding with duplicates).
  const visible = Math.min(MAX_VISIBLE, count);
  const windowSlides = Array.from({ length: visible }, (_, i) => slides[(index + i) % count]);
  const gridColsClass =
    visible === 1 ? 'grid-cols-1' : visible === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="absolute inset-0" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className={`grid ${gridColsClass} gap-3 h-full p-3 sm:p-4`}>
        {windowSlides.map((slide, slot) => (
          // Each card crossfades independently as the window slides past
          // it, rather than the whole row swapping at once. A grid with
          // fewer columns than slots doesn't remove the extra items from
          // the DOM by itself (they'd just wrap onto new rows) — the 2nd
          // and 3rd slots are explicitly hidden below the breakpoint where
          // the grid actually gives them a column, so mobile genuinely
          // shows only 1 card and tablets only 2.
          <div
            key={`slot-${slide.id}`}
            className={`relative h-full w-full overflow-hidden rounded-2xl ${slot === 1 ? 'hidden sm:block' : ''} ${slot === 2 ? 'hidden lg:block' : ''}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {/* MediaCover shows the whole photo/video uncropped (a tall
                    shot — a full gown, a standing couple — was getting cut
                    off by a plain `object-cover` fill: "the pictures in the
                    carousel is not showing well"). Wrapped in a Link so
                    each card is still clickable through to its collection
                    with no visible button. */}
                <Link href={slide.href} aria-label={slide.title || 'Shop this collection'} className="absolute inset-0 block">
                  <MediaCover
                    src={slide.src}
                    type={slide.type}
                    poster={slide.poster}
                    alt={slide.title || 'Rolen'}
                    className="absolute inset-0"
                  />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="flex absolute left-1 md:left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60 transition-colors text-xl z-10"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="flex absolute right-1 md:right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 text-white items-center justify-center hover:bg-black/60 transition-colors text-xl z-10"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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
