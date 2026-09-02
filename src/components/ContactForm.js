'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      await apiFetch('/api/messages', { method: 'POST', body: JSON.stringify(form) });
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus(err.message);
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card p-8 text-center"
      >
        <p className="text-2xl mb-2">✉️</p>
        <h3 className="font-display text-xl mb-2">Message sent!</h3>
        <p className="text-sm text-ink/70">Thanks for reaching out — our team will get back to you soon.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {status && status !== 'loading' && <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{status}</div>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" required value={form.name} onChange={(v) => update('name', v)} />
        <Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} />
        <Field label="Subject" value={form.subject} onChange={(v) => update('subject', v)} />
      </div>
      <label className="text-sm block">
        <span className="block mb-1 font-medium text-ink/80">Message *</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          className="w-full rounded-lg border border-black/15 p-3 outline-none focus:border-gold-dark"
        />
      </label>
      <button type="submit" disabled={status === 'loading'} className="btn-gold w-full">
        {status === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <label className="text-sm block">
      <span className="block mb-1 font-medium text-ink/80">
        {label} {required && <span className="text-gold-dark">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-black/15 p-2.5 outline-none focus:border-gold-dark"
      />
    </label>
  );
}
