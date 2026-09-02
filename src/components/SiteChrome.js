'use client';

import { usePathname } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import PageTransition from './motion/PageTransition';
import RouteProgressBar from './motion/RouteProgressBar';
import BackToTop from './motion/BackToTop';
import WhatsAppButton from './motion/WhatsAppButton';

// The admin console has its own sidebar/shell — skip the public site's
// navbar and footer there instead of stacking both.
export default function SiteChrome({ settings, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return children;

  return (
    // reducedMotion="user" makes every motion component below automatically
    // honor the visitor's OS-level "reduce motion" accessibility setting.
    <MotionConfig reducedMotion="user">
      <RouteProgressBar />
      <Navbar settings={settings} />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer settings={settings} />
      <BackToTop />
      <WhatsAppButton settings={settings} />
    </MotionConfig>
  );
}
