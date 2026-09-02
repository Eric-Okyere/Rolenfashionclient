'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Counts up from 0 to the numeric part of `value` when it scrolls into view.
 * Handles mixed values like "5+", "100%", "2" — the non-numeric suffix is
 * kept as-is and only the number animates. Purely non-numeric values (e.g.
 * "∞") have nothing to count, so they just render as given.
 */
export default function Counter({ value, duration = 1.4, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });
  const [display, setDisplay] = useState('0');

  const match = String(value).match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[1]) : null;
  const suffix = match ? match[2] : '';
  const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0;

  useEffect(() => {
    if (!inView) return;
    if (target === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- non-numeric value (e.g. "∞"): just render it once in view
      setDisplay(String(value));
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
