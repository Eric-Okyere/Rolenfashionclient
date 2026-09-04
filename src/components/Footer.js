'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Footer({ settings }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  async function subscribe(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      await apiFetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus(err.message || 'error');
    }
  }

  return (
    <footer className="mt-20 bg-ink text-cream">
      <div className="container-page py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-xl mb-3">{settings?.schoolName || 'Rolen School of Fashion and Design'}</h3>
          <p className="text-sm text-cream/70">{settings?.tagline || "Shaping Africa's next generation of fashion talent."}</p>
          <div className="flex gap-3 mt-4">
            {settings?.facebookUrl && <SocialLink href={settings.facebookUrl} label="Facebook" />}
            {settings?.instagramUrl && <SocialLink href={settings.instagramUrl} label="Instagram" />}
            {settings?.tiktokUrl && <SocialLink href={settings.tiktokUrl} label="TikTok" />}
            {settings?.twitterUrl && <SocialLink href={settings.twitterUrl} label="X" />}
            {settings?.youtubeUrl && <SocialLink href={settings.youtubeUrl} label="YouTube" />}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gold-light">Quick Links</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/" className="hover:text-gold-light">Shop</Link></li>
            <li><Link href="/school" className="hover:text-gold-light">The School</Link></li>
            <li><Link href="/courses" className="hover:text-gold-light">Courses</Link></li>
            <li><Link href="/admissions" className="hover:text-gold-light">Apply for Admission</Link></li>
            <li><Link href="/admissions/status" className="hover:text-gold-light">Track My Application</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gold-light">Visit Us</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>{settings?.address || 'Campus address coming soon'}</li>
            <li>{settings?.city}{settings?.city && settings?.country ? ', ' : ''}{settings?.country}</li>
            <li>{settings?.phone}</li>
            <li>{settings?.email}</li>
            <li>{settings?.officeHours}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gold-light">Stay Updated</h4>
          <p className="text-sm text-cream/70 mb-3">Get news on intakes, showcases and workshops.</p>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-0 rounded-full px-3 py-2 text-sm text-ink outline-none"
            />
            <button type="submit" className="btn-gold text-xs px-4 py-2" disabled={status === 'loading'}>
              {status === 'loading' ? '...' : 'Join'}
            </button>
          </form>
          {status === 'success' && <p className="text-xs text-gold-light mt-2">Subscribed — thank you!</p>}
          {status && status !== 'loading' && status !== 'success' && (
            <p className="text-xs text-red-300 mt-2">{status}</p>
          )}
        </div>
      </div>

      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {settings?.schoolName || 'Rolen School of Fashion and Design'}. All rights reserved.
      </div>
    </footer>
  );
}

function SocialLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-full border border-cream/20 flex items-center justify-center text-[10px] hover:border-gold-light hover:text-gold-light"
    >
      {label[0]}
    </a>
  );
}
