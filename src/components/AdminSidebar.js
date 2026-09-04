'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const links = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/applications', label: 'Applications', icon: '📝' },
  { href: '/admin/courses', label: 'Courses', icon: '🎓' },
  { href: '/admin/gallery', label: 'Gallery & Shop', icon: '🖼️' },
  { href: '/admin/carousel', label: 'Ad Carousel', icon: '🎬' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '💬' },
  { href: '/admin/messages', label: 'Messages', icon: '✉️' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
  { href: '/admin/activity', label: 'Activity Log', icon: '🕒' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push('/admin/login');
  }

  return (
    <aside className="w-64 shrink-0 bg-ink text-cream min-h-screen flex flex-col">
      <div className="p-5 flex items-center gap-2 border-b border-cream/10">
        <Image src="/images/rolen-logo.png" alt="Rolen" width={32} height={32} />
        <span className="font-display text-sm">Rolen Admin</span>
      </div>
      <nav className="flex-1 py-4">
        {links.map((l) => {
          const active = pathname === l.href;
          if (l.href === '/admin/courses' && !['admin', 'staff'].includes(user?.role)) return null;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                active ? 'bg-gold-light/15 text-gold-light border-r-2 border-gold-light' : 'text-cream/70 hover:text-cream'
              }`}
            >
              <span>{l.icon}</span> {l.label}
            </Link>
          );
        })}
        {user?.role === 'admin' && (
          <Link
            href="/admin/users"
            className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
              pathname === '/admin/users' ? 'bg-gold-light/15 text-gold-light border-r-2 border-gold-light' : 'text-cream/70 hover:text-cream'
            }`}
          >
            <span>👤</span> Staff Accounts
          </Link>
        )}
      </nav>
      <div className="p-5 border-t border-cream/10">
        <p className="text-xs text-cream/50 mb-2">{user?.name} ({user?.role}{user?.isCEO ? ' · CEO' : ''})</p>
        <button onClick={handleLogout} className="text-sm text-gold-light hover:underline">
          Log out
        </button>
      </div>
    </aside>
  );
}
