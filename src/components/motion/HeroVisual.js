'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

/**
 * The hero's showcase image: fades/scales in on load, then settles into a
 * slow, gentle float with a softly pulsing glow behind it — a common,
 * tasteful "alive" touch on modern landing pages. All motion here respects
 * the visitor's reduced-motion setting via the <MotionConfig> in SiteChrome.
 *
 * Sizing is overridable (Eric: "Add a cool animation to this" on the Shop
 * homepage's "Simply Elegance" hero, which sits beside a text block rather
 * than centered full-size like /school's hero) — `imgClassName`/`width`/
 * `height` size the image itself, `wrapperClassName` sizes/positions the
 * outer box the floating glow fills, and `center` (default true) toggles
 * the self-centering `flex justify-center` /school relies on, which would
 * otherwise fight a `shrink-0` slot in a flex row.
 */
export default function HeroVisual({
  src,
  alt,
  width = 340,
  height = 340,
  imgClassName = 'relative w-64 md:w-80 h-auto drop-shadow-2xl',
  wrapperClassName = '',
  center = true,
}) {
  return (
    <motion.div
      className={`relative ${center ? 'flex justify-center' : ''} ${wrapperClassName}`}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute inset-0 bg-gold/10 blur-3xl rounded-full"
        animate={{ scale: [1, 1.08, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <Image src={src} alt={alt} width={width} height={height} className={imgClassName} priority />
      </motion.div>
    </motion.div>
  );
}
