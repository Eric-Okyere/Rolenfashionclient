'use client';

import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Wraps a grid or list. Its direct <StaggerItem> children reveal one after
 * another (instead of all at once) as the group scrolls into view.
 * Use in place of the grid's own className wrapper — pass the same
 * className through (e.g. "grid sm:grid-cols-2 md:grid-cols-3 gap-6").
 */
export function StaggerGroup({ children, className = '', as = 'div', ...rest }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/** One item inside a <StaggerGroup> — e.g. a single course/gallery/testimonial card. */
export function StaggerItem({ children, className = '', as = 'div', ...rest }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag className={className} variants={itemVariants} {...rest}>
      {children}
    </MotionTag>
  );
}
