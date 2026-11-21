'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { API_URL } from '@/lib/api';

// Eric: "I want to know the number of people who visit the page." Records
// one anonymous page view each time a visitor opens a public page; the
// totals show in Admin → Visitors. The only thing stored about the visitor
// is a random ID this browser makes up and keeps, so the same person on
// the same phone counts as one visitor however many pages they open — no
// name, email or other personal detail. Fire-and-forget: a failure here
// never affects the page.
const KEY = 'rolen_visitor_id';

function visitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null; // storage blocked (e.g. some private modes) — skip counting
  }
}

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    const id = visitorId();
    if (!id) return;
    fetch(`${API_URL}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: id, path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
