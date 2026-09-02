'use client';

import { AuthProvider } from '@/lib/AuthContext';

export default function AdminRootLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
