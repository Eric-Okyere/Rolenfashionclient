'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);

  async function load() {
    const data = await apiFetch('/api/messages');
    setMessages(data.messages);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  async function markRead(id) {
    await apiFetch(`/api/messages/${id}/read`, { method: 'PATCH' });
    await load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this message?')) return;
    await apiFetch(`/api/messages/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Messages</h1>
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m._id} className={`card p-5 ${!m.isRead ? 'border-l-4 border-l-gold' : ''}`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold">{m.name} <span className="text-muted font-normal text-sm">&lt;{m.email}&gt;</span></p>
                {m.phone && <p className="text-xs text-muted">{m.phone}</p>}
                <p className="text-sm font-medium mt-1">{m.subject || 'No subject'}</p>
              </div>
              <p className="text-xs text-muted shrink-0">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
            <p className="text-sm text-ink/70 mt-2 whitespace-pre-line">{m.message}</p>
            <div className="flex gap-3 mt-3 text-xs">
              {!m.isRead && <button onClick={() => markRead(m._id)} className="text-gold-dark hover:underline">Mark as read</button>}
              <a href={`mailto:${m.email}`} className="text-gold-dark hover:underline">Reply by email</a>
              <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-center text-muted py-8">No messages yet.</p>}
      </div>
    </div>
  );
}
