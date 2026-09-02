'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import ActivityRow from '@/components/ActivityRow';

const ACTIVITY_POLL_MS = 30000;

const EASE = [0.22, 1, 0.36, 1];

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  admitted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlisted: 'bg-purple-100 text-purple-800',
};

function statusLabel(status) {
  return status
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [courseCount, setCourseCount] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [testimonialCount, setTestimonialCount] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, messagesData, applicationsData, coursesData, galleryData, testimonialsData, newsletterData, activityData] =
          await Promise.all([
            apiFetch('/api/applications/stats/summary'),
            apiFetch('/api/messages'),
            apiFetch('/api/applications'),
            apiFetch('/api/courses?all=1'),
            apiFetch('/api/gallery?all=1'),
            apiFetch('/api/testimonials?all=1'),
            apiFetch('/api/newsletter'),
            apiFetch('/api/activity?limit=8'),
          ]);
        setStats(statsData);
        setMessages(messagesData.messages.slice(0, 5));
        setApplications(applicationsData.applications.slice(0, 5));
        setCourseCount(coursesData.courses.length);
        setProductCount(galleryData.items.length);
        setTestimonialCount(testimonialsData.testimonials.length);
        setSubscriberCount(newsletterData.subscribers.length);
        setActivity(activityData.activity);
      } catch (err) {
        setError(err.message);
      } finally {
        setActivityLoading(false);
      }
    })();
  }, []);

  // Light polling so the admin sees new activity land without a manual refresh.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await apiFetch('/api/activity?limit=8');
        setActivity(data.activity);
      } catch {
        // Silent — the next tick will retry; no need to surface transient poll errors.
      }
    }, ACTIVITY_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const unreadMessages = messages.filter((m) => !m.isRead).length;

  const statusCards = [
    { key: 'pending', label: 'Pending' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'admitted', label: 'Admitted' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'waitlisted', label: 'Waitlisted' },
  ];

  const overviewTiles = [
    { label: 'Courses', value: courseCount, href: '/admin/courses', icon: '🎓' },
    { label: 'Shop Products', value: productCount, href: '/admin/gallery', icon: '🖼️' },
    { label: 'Testimonials', value: testimonialCount, href: '/admin/testimonials', icon: '💬' },
    { label: 'Newsletter Subscribers', value: subscriberCount, href: '/admin/newsletter', icon: '📧' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <h1 className="font-display text-3xl mb-1">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted mb-8">Here&apos;s what&apos;s happening at Rolen right now.</p>
      </motion.div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 mb-6">{error}</div>}

      {/* Site overview */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {overviewTiles.map((t) => (
          <motion.div key={t.label} variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}>
            <Link href={t.href} className="card p-5 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 motion-reduce:hover:translate-y-0">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-display text-2xl leading-none">{t.value ?? '—'}</p>
                <p className="text-xs text-muted mt-1">{t.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Applications */}
      <div className="flex items-center justify-between mb-3 mt-10">
        <h2 className="font-display text-lg">Admissions</h2>
        <Link href="/admin/applications" className="text-sm text-gold-dark hover:underline">Review all</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <div className="card p-6 bg-ink text-cream">
          <p className="text-xs text-cream/60 mb-1">Total Applications</p>
          <p className="font-display text-3xl">{stats?.total ?? '—'}</p>
        </div>
        {statusCards.map((c) => (
          <div key={c.key} className="card p-6">
            <p className="text-xs text-muted mb-1">{c.label}</p>
            <div className="flex items-center gap-2">
              <p className="font-display text-3xl">{stats?.byStatus?.[c.key] ?? 0}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyles[c.key]}`}>{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Recent Applications</h2>
            <Link href="/admin/applications" className="text-sm text-gold-dark hover:underline">View all</Link>
          </div>
          {applications.length === 0 && <p className="text-sm text-muted">No applications yet.</p>}
          <ul className="space-y-3">
            {applications.map((a) => (
              <li key={a._id} className="text-sm border-b border-black/5 pb-3 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{a.firstName} {a.lastName}</p>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${statusStyles[a.status] || 'bg-black/5 text-ink/70'}`}>
                    {statusLabel(a.status)}
                  </span>
                </div>
                <p className="text-muted text-xs">{a.course?.title || 'Course removed'}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">
              Recent Messages
              {unreadMessages > 0 && (
                <span className="ml-2 text-[10px] align-middle bg-gold text-ink px-2 py-0.5 rounded-full">{unreadMessages} new</span>
              )}
            </h2>
            <Link href="/admin/messages" className="text-sm text-gold-dark hover:underline">View all</Link>
          </div>
          {messages.length === 0 && <p className="text-sm text-muted">No messages yet.</p>}
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m._id} className="text-sm border-b border-black/5 pb-3 last:border-0">
                <p className="font-medium">
                  {m.name} <span className="text-muted font-normal">— {m.subject || 'No subject'}</span>
                  {!m.isRead && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-gold-dark align-middle" />}
                </p>
                <p className="text-muted line-clamp-1">{m.message}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 md:col-span-1 space-y-3">
          <h2 className="font-display text-lg mb-1">Quick Actions</h2>
          <Link href="/admin/applications" className="block btn-outline w-full text-center">Review Applications</Link>
          <Link href="/admin/courses" className="block btn-outline w-full text-center">Manage Courses</Link>
          <Link href="/admin/gallery" className="block btn-outline w-full text-center">Post to Shop</Link>
          <Link href="/admin/newsletter" className="block btn-outline w-full text-center">Newsletter Subscribers</Link>
          <Link href="/admin/settings" className="block btn-outline w-full text-center">Edit School Settings</Link>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg">Recent Activity</h2>
            <p className="text-xs text-muted mt-0.5">Live feed of what&apos;s happening across the site — refreshes automatically.</p>
          </div>
          <Link href="/admin/activity" className="text-sm text-gold-dark hover:underline shrink-0">View all</Link>
        </div>
        {activityLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : activity.length === 0 ? (
          <p className="text-sm text-muted">No activity recorded yet — it&apos;ll start filling in as people use the site.</p>
        ) : (
          <ul className="space-y-3">
            {activity.map((item) => (
              <ActivityRow key={item._id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
