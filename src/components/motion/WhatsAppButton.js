'use client';

import { motion } from 'framer-motion';
import { splitNumbers, waHref } from '@/lib/phone';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

/**
 * Fixed-position "Chat on WhatsApp" button, always available site-wide —
 * mirrors BackToTop's fixed positioning (safe alongside the sticky navbar).
 * Links to the first number in Settings.whatsapp — a separate field from
 * Settings.phone, since the WhatsApp number isn't necessarily one of the
 * school's phone numbers. Renders nothing if no WhatsApp number is set.
 */
export default function WhatsAppButton({ settings }) {
  const numbers = splitNumbers(settings?.whatsapp);
  if (numbers.length === 0) return null;

  return (
    <motion.a
      href={waHref(numbers[0])}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.3, delay: 0.6 }}
      className="fixed bottom-6 left-6 z-[150] w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:brightness-105 transition-[filter]"
    >
      <WhatsAppIcon className="w-6 h-6" />
    </motion.a>
  );
}
