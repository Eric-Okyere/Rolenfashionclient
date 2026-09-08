'use client';

import { motion } from 'framer-motion';

/**
 * A thin gold-gradient rule that draws itself in left-to-right, once, the
 * moment it scrolls into view — used under the "Simply Elegance." headline
 * on the Shop homepage hero (Eric: "Add a cool animation to this"). Kept as
 * its own tiny component rather than inline motion.div in page.js, since
 * page.js is an async server component and can't use framer-motion
 * directly. Respects the visitor's reduced-motion setting via the
 * <MotionConfig reducedMotion="user"> in SiteChrome.
 */
export default function HeroUnderline({ delay = 0.35, className = '' }) {
  return (
    <motion.div
      className={`h-[3px] rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark ${className}`}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      style={{ transformOrigin: 'left' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
