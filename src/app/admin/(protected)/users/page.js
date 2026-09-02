'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

const empty = { name: '', email: '', password: '', role: 'staff' };

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);

  async function load() {
    const data = await apiFetch('/api/users');
    setUsers(data.users);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(form) });
      setForm(empty);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(u) {
    await apiFetch(`/api/users/${u._id}`, { method: 'PATCH', body: JSON.stringify({ active: !u.active }) });
    await load();
  }

  async function makeCEO(u) {
    if (!confirm(`Make ${u.name} the CEO of record for admission letters?`)) return;
    await apiFetch(`/api/users/${u._id}`, { method: 'PATCH', body: JSON.stringify({ isCEO: true }) });
    await load();
  }

  if (me?.role !== 'admin') {
    return <p className="text-muted">Only admin accounts can manage staff users.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Staff Accounts</h1>

      <form onSubmit={handleCreate} className="card p-6 mb-8 space-y-4 max-w-lg">
        <h2 className="font-display text-lg">Add Staff / Admin</h2>
        {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>}
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Name</span>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
        </label>
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Email</span>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
        </label>
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Temporary Password</span>
          <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5" />
        </label>
        <label className="text-sm block">
          <span className="block mb-1 font-medium">Role</span>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border border-black/15 p-2.5 bg-white">
            <option value="staff">Staff (courses, applications, gallery)</option>
            <option value="admin">Admin (full access)</option>
          </select>
        </label>
        <button type="submit" className="btn-gold">Create Account</button>
      </form>

      <div className="card divide-y divide-black/5">
        {users.map((u) => (
          <div key={u._id} className="p-4 flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{u.name} {u.isCEO && <span className="text-xs text-gold-dark">· CEO</span>}</p>
              <p className="text-muted text-xs">{u.email} · {u.role}{!u.active ? ' · deactivated' : ''}</p>
            </div>
            <div className="flex gap-3">
              {!u.isCEO && <button onClick={() => makeCEO(u)} className="text-gold-dark hover:underline">Set as CEO</button>}
              <button onClick={() => toggleActive(u)} className="text-ink/60 hover:underline">
                {u.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
