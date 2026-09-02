'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * A subtle fade on every route change — remounts (via the `pathname` key)
 * so it replays on each navigation.
 *
 * Deliberately opacity-only (no x/y/scale): this wraps every page's content,
 * including ones with `position: sticky` elements (e.g. the course detail
 * sidebar), and an animated transform on an ancestor breaks sticky
 * positioning in every browser. Opacity doesn't have that problem.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
