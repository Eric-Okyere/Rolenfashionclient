'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { mediaUrl } from '@/lib/api';

// Eric: "let the shop be the main page and the school in the navbar" — the
// Shop now owns "/" (see app/page.js), and what used to be the homepage
// lives at /school. Kept an explicit "Shop" link here too (not just the
// logo) since a visitor browsing /school, /courses, etc. still needs one
// click back to the product catalog specifically.
// Eric: "If school clicked show courses, admission else hide them" —
// `schoolOnly` marks the two links that only make sense once a visitor is
// in the School side of the site; see `isSchoolSection` below for how
// that's decided and where these get filtered out on the Shop.
const links = [
  { href: '/', label: 'Shop' },
  { href: '/school', label: 'School' },
  { href: '/about', label: 'About' },
  { href: '/courses', label: 'Courses', schoolOnly: true },
  { href: '/admissions', label: 'Admissions', schoolOnly: true },
  { href: '/contact', label: 'Contact' },
];

const FALLBACK_LOGO = '/images/rolen-logo.png';
const SHOP_NAME = 'Rolen Fashion and Design';
const SCHOOL_NAME_FALLBACK = 'Rolen School of Fashion and Design';

export default function Navbar({ settings }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Tracks whether the Cloudinary-hosted logo failed to load, so the navbar
  // can fall back to the bundled static logo instead of showing a broken-
  // image icon — see the onError handler on the <Image> below. Covers any
  // reason the fetch through next/image's optimizer can fail (Cloudinary
  // asset briefly unreachable, deleted, a future remotePatterns mismatch,
  // etc.), not just the specific bug that was already fixed once here.
  const [logoError, setLogoError] = useState(false);
  // Tracks which logoUrl the error flag above applies to. Compared against
  // the current settings.logoUrl during render (not in an effect — this is
  // the "adjust state while rendering" pattern React recommends for
  // resetting state when a prop changes) so that uploading a new logo in
  // Admin → Settings re-arms the fallback immediately, instead of a stale
  // failure from a previous URL permanently sticking even after a working
  // logo is set.
  const [erroredLogoUrl, setErroredLogoUrl] = useState(settings?.logoUrl);
  if (settings?.logoUrl !== erroredLogoUrl && logoError) {
    setLogoError(false);
    setErroredLogoUrl(settings?.logoUrl);
  }
  const pathname = usePathname();
  const logo = settings?.logoUrl && !logoError ? mediaUrl(settings.logoUrl) : FALLBACK_LOGO;

  // Eric: "The name in the navbar should be 2. One for shop and other for
  // school." — the Shop only ever owns "/" (see app/page.js's comment on
  // why); every other public route (School, About, Courses, Admissions,
  // Contact) is School-side. The displayed name next to the logo, and
  // which nav links show at all (see `links`'s `schoolOnly` above), both
  // key off this same section split.
  const isSchoolSection = pathname !== '/';
  const displayName = isSchoolSection ? settings?.schoolName || SCHOOL_NAME_FALLBACK : SHOP_NAME;
  const visibleLinks = links.filter((l) => !l.schoolOnly || isSchoolSection);

  // Shrinks and gains a shadow once the page scrolls — a plain state/CSS
  // toggle rather than a framer-motion transform, since this header is
  // `position: sticky` and an animated transform on it (or an ancestor)
  // would break that positioning.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-cream/95 backdrop-blur border-b transition-shadow duration-300 ${
        scrolled ? 'border-black/10 shadow-md' : 'border-black/5'
      }`}
    >
      <nav
        className={`container-page flex items-center justify-between transition-[padding] duration-300 ${
          scrolled ? 'py-2' : 'py-3'
        }`}
      >
        <Link href="/" className="min-w-0 shrink mr-3">
          <motion.span
            className="flex items-center gap-2 min-w-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <Image
              src={logo}
              alt={displayName}
              width={40}
              height={40}
              className="h-9 w-9 md:h-10 md:w-10 object-contain shrink-0"
              priority
              onError={() => {
                setLogoError(true);
                setErroredLogoUrl(settings?.logoUrl);
              }}
            />
            <span className="font-display text-base md:text-lg font-semibold leading-tight truncate">
              {displayName}
            </span>
          </motion.span>
        </Link>

        <div className="hidden md:flex items-center gap-7 shrink-0">
          {visibleLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-gold-dark ${
                pathname === l.href ? 'text-gold-dark' : 'text-ink/80'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/admissions" className="btn-gold text-sm">
            Apply Now
          </Link>
        </div>

        <motion.button
          className="md:hidden p-2 rounded-md border border-black/10 shrink-0"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          whileTap={{ scale: 0.9 }}
        >
          <motion.span
            className="block w-5 h-0.5 bg-ink mb-1"
            animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-5 h-0.5 bg-ink mb-1"
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.span
            className="block w-5 h-0.5 bg-ink"
            animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-black/5 bg-cream overflow-hidden"
          >
            <div className="container-page py-3 flex flex-col gap-3">
              {visibleLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-ink/80">
                  {l.label}
                </Link>
              ))}
              <Link href="/admissions" onClick={() => setOpen(false)} className="btn-gold text-sm w-fit">
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
