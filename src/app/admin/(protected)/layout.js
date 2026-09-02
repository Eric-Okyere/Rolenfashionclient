'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';

export default function ProtectedAdminLayout({ children }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace('/admin/login');
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading admin console…</p>
      </div>
    );
  }

  if (!user) return null; // redirecting

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen bg-[#f6f3ec]">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <main className="p-6 md:p-10 max-w-6xl">{children}</main>
        </div>
      </div>
    </MotionConfig>
  );
}
