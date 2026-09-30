'use client';

import { useEffect, useState } from 'react';
import { apiFetch, mediaUrl } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function load() {
    const data = await apiFetch('/api/settings');
    setForm(data.settings);
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
  useEffect(() => { load(); }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(form) });
      if (logoFile) {
        const fd = new FormData();
        fd.append('file', logoFile);
        await apiFetch('/api/settings/logo', { method: 'POST', body: fd });
      }
      if (sigFile) {
        const fd = new FormData();
        fd.append('file', sigFile);
        await apiFetch('/api/settings/signature', { method: 'POST', body: fd });
      }
      await load();
      setLogoFile(null);
      setSigFile(null);
      setMessage({ type: 'success', text: 'Settings saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="text-muted">Loading…</p>;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-6">School Settings</h1>
      {!isAdmin && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          You&apos;re viewing settings as staff. Only admin accounts can save changes here.
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {message && (
          <div className={`rounded-lg p-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-lg">School Identity</h2>
          <Field label="School Name" value={form.schoolName} onChange={(v) => update('schoolName', v)} />
          <Field label="Tagline" value={form.tagline} onChange={(v) => update('tagline', v)} />
          <label className="text-sm block">
            <span className="block mb-1 font-medium">About Text</span>
            <textarea rows={3} value={form.aboutText} onChange={(e) => update('aboutText', e.target.value)} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <div className="flex items-center gap-4">
            {form.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(form.logoUrl)} alt="Logo" className="w-16 h-16 object-contain border rounded-lg p-1" />
            )}
            <label className="text-sm block">
              <span className="block mb-1 font-medium">Upload New Logo</span>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
            </label>
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-lg">Contact &amp; Location</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Email" value={form.email} onChange={(v) => update('email', v)} />
            <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} />
            <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => update('whatsapp', v)} />
            <Field label="Office Hours" value={form.officeHours} onChange={(v) => update('officeHours', v)} />
          </div>
          <Field label="Campus Address" value={form.address} onChange={(v) => update('address', v)} />
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="City" value={form.city} onChange={(v) => update('city', v)} />
            <Field label="Country" value={form.country} onChange={(v) => update('country', v)} />
          </div>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Campus Map</span>
            <input
              value={form.mapEmbedUrl || ''}
              placeholder="Paste a Google Maps link (Share button in the app works fine) or just type the address"
              onChange={(e) => update('mapEmbedUrl', e.target.value)}
              className="w-full rounded-lg border border-black/15 p-2.5"
            />
            <span className="block mt-1 text-xs text-muted">
              Any Google Maps link works here — including a share link copied from the Maps app — or you can
              just type the campus address. It&apos;s converted into a working embedded map automatically when
              you save.
            </span>
          </label>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-lg">Social Media</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Facebook URL" value={form.facebookUrl} onChange={(v) => update('facebookUrl', v)} />
            <Field label="Instagram URL" value={form.instagramUrl} onChange={(v) => update('instagramUrl', v)} />
            <Field label="TikTok URL" value={form.tiktokUrl} onChange={(v) => update('tiktokUrl', v)} />
            <Field label="X (Twitter) URL" value={form.twitterUrl} onChange={(v) => update('twitterUrl', v)} />
            <Field label="YouTube URL" value={form.youtubeUrl} onChange={(v) => update('youtubeUrl', v)} />
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-lg">Admission Letter &amp; CEO Signature</h2>
          <p className="text-sm text-muted">
            This name, title and signature image are stamped on every generated admission letter.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="CEO Full Name" value={form.ceoName} onChange={(v) => update('ceoName', v)} />
            <Field label="CEO Title" value={form.ceoTitle} onChange={(v) => update('ceoTitle', v)} />
          </div>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Admission Letter Intro Paragraph</span>
            <textarea rows={3} value={form.admissionLetterIntro} onChange={(e) => update('admissionLetterIntro', e.target.value)} className="w-full rounded-lg border border-black/15 p-2.5" />
          </label>
          <div className="flex items-center gap-4">
            {form.ceoSignatureUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(form.ceoSignatureUrl)} alt="CEO signature" className="h-16 border rounded-lg p-1 bg-white" />
            )}
            <label className="text-sm block">
              <span className="block mb-1 font-medium">Upload CEO Signature (PNG with transparent background works best)</span>
              <input type="file" accept="image/*" onChange={(e) => setSigFile(e.target.files[0])} />
            </label>
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-lg">List of Materials &amp; Fabrics Needed</h2>
          <p className="text-sm text-muted">
            Printed as a second page on every admitted student&apos;s admission letter, so it comes out together
            in one print. One item per line. Leave both lists empty to skip this page entirely.
          </p>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Materials (one per line)</span>
            <textarea
              rows={8}
              value={(form.materialsList || []).join('\n')}
              onChange={(e) => update('materialsList', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
              placeholder={'A set of curves\nGray baft\nSketch pads\n…'}
              className="w-full rounded-lg border border-black/15 p-2.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Fabrics Needed (one per line)</span>
            <textarea
              rows={4}
              value={(form.fabricsList || []).join('\n')}
              onChange={(e) => update('fabricsList', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
              placeholder={'Cotton\nRayon\nChiffon\n…'}
              className="w-full rounded-lg border border-black/15 p-2.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Note (e.g. when fabrics are needed)</span>
            <textarea
              rows={2}
              value={form.materialsNote || ''}
              onChange={(e) => update('materialsNote', e.target.value)}
              placeholder="NB: Fabrics should be brought as and when they will be needed."
              className="w-full rounded-lg border border-black/15 p-2.5"
            />
          </label>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-lg">Tuition &amp; Payment Schedule</h2>
          <p className="text-sm text-muted">
            Printed near the top of every admission letter. Free text, so it can cover more than one track&apos;s
            pricing (e.g. Beginner vs. Advanced) — leave blank to fall back to a single auto-generated line based
            on the admitted course&apos;s published fee.
          </p>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Tuition</span>
            <textarea
              rows={3}
              value={form.tuitionText || ''}
              onChange={(e) => update('tuitionText', e.target.value)}
              placeholder={'Tuition for the Beginner class (6 months) is GH¢ 7,000. Tuition for the Advanced class (3 months) is GH¢ 10,000.'}
              className="w-full rounded-lg border border-black/15 p-2.5"
            />
          </label>
          <p className="text-sm text-muted">
            Printed on admission-letter page 2, under &ldquo;FEES AND PAYMENT SCHEDULE.&rdquo; Leave blank to
            skip it.
          </p>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Fees &amp; Payment Schedule Text</span>
            <textarea
              rows={5}
              value={form.paymentScheduleText || ''}
              onChange={(e) => update('paymentScheduleText', e.target.value)}
              placeholder={
                'For Beginners, the duration is Six (6) months. The cost is Seven Thousand Ghana Cedis (GH¢7,000.00).\n\nPayment Schedule: GH¢5,000.00 payable before commencement of class and the balance paid within a scheduled 3-month installments.'
              }
              className="w-full rounded-lg border border-black/15 p-2.5"
            />
          </label>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-lg">Class Schedule &amp; Academic Terms</h2>
          <p className="text-sm text-muted">
            Printed on admission-letter page 2, under &ldquo;CLASS SCHEDULE &amp; ACADEMIC TERMS.&rdquo; Leave
            blank to skip it.
          </p>
          <label className="text-sm block">
            <span className="block mb-1 font-medium">Class Schedule &amp; Academic Terms Text</span>
            <textarea
              rows={5}
              value={form.scheduleText || ''}
              onChange={(e) => update('scheduleText', e.target.value)}
              placeholder={
                'Beginner class: Monday – Wednesday, 9:00am – 2:00pm.\nAdvanced class: Thursday – Friday, 9:00am – 2:00pm.\n\nAcademic terms: March – September and September – March.'
              }
              className="w-full rounded-lg border border-black/15 p-2.5"
            />
          </label>
        </section>

        {isAdmin && (
          <button type="submit" disabled={saving} className="btn-gold">{saving ? 'Saving…' : 'Save Settings'}</button>
        )}
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="text-sm block">
      <span className="block mb-1 font-medium">{label}</span>
      <input value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-black/15 p-2.5" />
    </label>
  );
}
