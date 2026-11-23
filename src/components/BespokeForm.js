'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '@/lib/api';

// Eric: "add Request a bespoke outfit form to the site" — modelled on the
// Euna site's /bespoke form. Sends to POST /api/bespoke as multipart form
// data (text fields + up to 4 inspiration photos); requests land in
// Admin → Bespoke Requests and trigger a WhatsApp alert.
const OUTFIT_TYPES = [
  'Bridal gown',
  'Engagement / Kente',
  'Evening / dinner gown',
  'Kaba & slit',
  'Corporate wear',
  'Party dress',
  'Bridesmaids',
  "Men's wear",
  'Other',
];
const BUDGETS = ['Under 500', '500 – 1,000', '1,000 – 2,500', '2,500 – 5,000', 'Above 5,000'];
const FABRIC_OPTIONS = ['I will bring my fabric', 'Please source fabric for me', 'Not sure yet'];
const MEASUREMENTS = [
  ['bust', 'Bust / chest'],
  ['waist', 'Waist'],
  ['hips', 'Hips'],
  ['shoulder', 'Shoulder'],
  ['sleeve', 'Sleeve length'],
  ['length', 'Dress / top length'],
  ['neck', 'Neck'],
  ['thigh', 'Thigh'],
  ['trouser', 'Trouser length'],
];
const MAX_PHOTOS = 4;
// Photos can take a while on mobile data — allow longer than the site's
// usual 8-second API timeout.
const UPLOAD_TIMEOUT_MS = 90 * 1000;

const EMPTY = {
  outfitType: '',
  occasion: '',
  eventDate: '',
  budget: '',
  fabric: FABRIC_OPTIONS[0],
  description: '',
  measurements: {},
  wantsFitting: false,
  name: '',
  phone: '',
  email: '',
};

const inputClass = 'w-full rounded-lg border border-black/15 p-2.5 bg-white outline-none focus:border-gold-dark';

function Label({ children, required }) {
  return (
    <span className="block mb-1 text-xs font-semibold uppercase tracking-wider text-ink/70">
      {children}
      {required && ' *'}
    </span>
  );
}

export default function BespokeForm() {
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState([]); // [{ file, url }]
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | { error, fields }

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateMeasurement = (key, value) => setForm((f) => ({ ...f, measurements: { ...f.measurements, [key]: value } }));

  // Free the in-browser photo previews when they're removed or the form goes away.
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  function addPhotos(e) {
    const files = [...e.target.files].filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    setPhotos((prev) => [...prev, ...files.slice(0, MAX_PHOTOS - prev.length).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  }

  function removePhoto(i) {
    setPhotos((prev) => prev.filter((_, j) => j !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.outfitType) {
      setStatus({ error: 'Please choose the type of outfit you want.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStatus('sending');
    const fd = new FormData();
    for (const [k, v] of Object.entries(form)) {
      if (k === 'measurements') {
        for (const [mk, mv] of Object.entries(v)) if (mv) fd.append(`measurements[${mk}]`, mv);
      } else fd.append(k, String(v));
    }
    photos.forEach((p) => fd.append('photos', p.file));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
    try {
      const res = await fetch(`${API_URL}/api/bespoke`, { method: 'POST', body: fd, signal: controller.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ error: data.message || 'Something went wrong. Please try again.', fields: data.errors });
        return;
      }
      setStatus('success');
      setForm(EMPTY);
      setPhotos([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatus({
        error:
          err.name === 'AbortError'
            ? 'This is taking too long — please check your connection and try again (or send fewer photos).'
            : 'Could not send your request. Please check your connection and try again.',
      });
    } finally {
      clearTimeout(timer);
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card p-10 text-center"
      >
        <p className="text-3xl mb-3">✂️</p>
        <h2 className="font-display text-2xl mb-2">Request received!</h2>
        <p className="text-ink/70 max-w-md mx-auto">
          Thank you. We&apos;ll review your design and reply with a quote within 24 hours, by phone or WhatsApp.
        </p>
        <button type="button" onClick={() => setStatus(null)} className="btn-outline mt-6">
          Send another request
        </button>
      </motion.div>
    );
  }

  const error = status && typeof status === 'object' ? status : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">
          {error.error}
          {error.fields?.length > 0 && (
            <ul className="list-disc ml-5 mt-1">
              {error.fields.map((f) => (
                <li key={f.field}>{f.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section className="card p-6 space-y-5">
        <h2 className="font-display text-xl">1. Your outfit</h2>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Type of outfit">
          {OUTFIT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={form.outfitType === t}
              onClick={() => {
                update('outfitType', t);
                if (error) setStatus(null);
              }}
              className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                form.outfitType === t ? 'bg-ink text-cream border-ink' : 'border-black/15 hover:border-gold-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <Label>Occasion</Label>
            <input value={form.occasion} onChange={(e) => update('occasion', e.target.value)} placeholder="Wedding, birthday, church…" className={inputClass} />
          </label>
          <label className="block text-sm">
            <Label>Event date</Label>
            <input type="date" value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm">
            <Label>Budget (GH₵)</Label>
            <select value={form.budget} onChange={(e) => update('budget', e.target.value)} className={inputClass}>
              <option value="">Select</option>
              {BUDGETS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <Label>Fabric</Label>
            <select value={form.fabric} onChange={(e) => update('fabric', e.target.value)} className={inputClass}>
              {FABRIC_OPTIONS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <Label>Describe your design</Label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Neckline, sleeves, length, colours, any details you love…"
            className={inputClass}
          />
        </label>
        <div className="text-sm">
          <Label>Inspiration photos (up to {MAX_PHOTOS})</Label>
          <div className="flex flex-wrap gap-3">
            {photos.map((p, i) => (
              <div key={p.url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={p.url} alt={`Inspiration photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/80 text-cream text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-black/20 hover:border-gold-dark flex flex-col items-center justify-center cursor-pointer text-ink/60">
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs">Add</span>
                <input type="file" accept="image/*" multiple onChange={addPhotos} className="sr-only" />
              </label>
            )}
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl">
            2. Measurements <span className="text-sm font-sans text-muted">(optional, in inches)</span>
          </h2>
          <p className="text-sm text-muted mt-1">Not sure? Skip this and we&apos;ll measure you at the fitting.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {MEASUREMENTS.map(([key, label]) => (
            <label key={key} className="block text-sm">
              <Label>{label}</Label>
              <input inputMode="decimal" value={form.measurements[key] || ''} onChange={(e) => updateMeasurement(key, e.target.value)} className={inputClass} />
            </label>
          ))}
        </div>
        <label className="block text-sm">
          <Label>Other notes</Label>
          <input value={form.measurements.notes || ''} onChange={(e) => updateMeasurement('notes', e.target.value)} className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.wantsFitting} onChange={(e) => update('wantsFitting', e.target.checked)} className="w-4 h-4 accent-[#b8860b]" />
          I would like an in-studio fitting
        </label>
      </section>

      <section className="card p-6 space-y-5">
        <h2 className="font-display text-xl">3. Contact</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block text-sm">
            <Label required>Full name</Label>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm">
            <Label required>Phone / WhatsApp</Label>
            <input required type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm">
            <Label>Email</Label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
          </label>
        </div>
      </section>

      <div className="flex flex-col items-center gap-2">
        <button type="submit" disabled={status === 'sending'} className="btn-gold disabled:opacity-60">
          {status === 'sending' ? 'Sending…' : 'Request a quote'}
        </button>
        <p className="text-xs text-muted">No payment now. We reply within 24 hours.</p>
      </div>
    </form>
  );
}
