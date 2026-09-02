'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Fixed-position "scroll to top" button — fades/scales in once the visitor
 * has scrolled down a bit. Fixed positioning means it's not an ancestor of
 * anything, so it's safe alongside the site's sticky navbar/sidebar.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.2 }}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-[150] w-11 h-11 rounded-full bg-ink text-cream shadow-lg flex items-center justify-center hover:bg-gold-dark hover:text-ink transition-colors"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}
