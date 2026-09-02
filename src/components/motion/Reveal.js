'use client';

import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Fades (and gently rises) an element into view as the user scrolls to it.
 * Wrap any section, heading, or block with this for a subtle scroll-reveal.
 *
 * Respects the visitor's OS-level "reduce motion" setting automatically —
 * see <MotionConfig reducedMotion="user"> in SiteChrome, which applies to
 * every motion component in the tree, including this one.
 *
 * NOTE: don't wrap a `position: sticky` element (or an ancestor of one) with
 * this — an animated transform on an ancestor breaks sticky positioning in
 * every browser. See the course detail page sidebar for the one place we
 * deliberately skip animation for that reason.
 */
export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  y = 18,
  scale = 1,
  duration = 0.6,
  once = true,
  className = '',
  ...rest
}) {
  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
