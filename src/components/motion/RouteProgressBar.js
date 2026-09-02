'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * A slim gold progress bar that sweeps across the top of the viewport on
 * every route change — the same idea as YouTube/GitHub's loading bar.
 * Purely decorative and self-contained (fixed positioning, not wrapping
 * any page content), so it can't interfere with sticky elements elsewhere.
 */
export default function RouteProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- replaying the sweep on every route change is the point
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 450);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="route-progress"
          className="fixed top-0 left-0 right-0 z-[200] h-[3px] bg-gradient-to-r from-gold-dark via-gold to-gold-light origin-left"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </AnimatePresence>
  );
}
