'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <form onSubmit={handleSubmit} className="card p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <Image src="/images/rolen-logo.png" alt="Rolen" width={56} height={56} className="mb-3" />
          <h1 className="font-display text-xl">Admin &amp; Staff Login</h1>
        </div>
        {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 mb-4">{error}</div>}
        <label className="text-sm block mb-4">
          <span className="block mb-1 font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-black/15 p-2.5 outline-none focus:border-gold-dark"
          />
        </label>
        <label className="text-sm block mb-6">
          <span className="block mb-1 font-medium">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-black/15 p-2.5 outline-none focus:border-gold-dark"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-gold w-full">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return <LoginForm />;
}
