'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  nationality: 'Ghanaian',
  course: '',
  intakePeriod: '',
  priorEducation: '',
  guardianName: '',
  guardianPhone: '',
  statementOfPurpose: '',
};

export default function AdmissionsForm({ courses }) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get('course') || '';
  const [form, setForm] = useState({ ...initialState, course: preselected });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { applicationNumber } | { error }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Revokes the previous preview URL (if any) before creating the next one,
  // so switching or clearing the photo never leaks an object URL.
  function handlePhotoChange(file) {
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setPhotoFile(file || null);
  }

  const selectedCourse = courses.find((c) => c._id === form.course);

  // Printing the confirmation card (see the "print-receipt-mode" rule in
  // globals.css) so a student can keep a physical copy of their application
  // number — the credential they'll need to check their status later.
  useEffect(() => {
    function cleanup() {
      document.body.classList.remove('print-receipt-mode');
    }
    window.addEventListener('afterprint', cleanup);
    return () => {
      window.removeEventListener('afterprint', cleanup);
      cleanup();
    };
  }, []);

  function handlePrint() {
    document.body.classList.add('print-receipt-mode');
    window.print();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Belt-and-suspenders alongside the file input's native `required` —
    // catches the rare case that's bypassed (e.g. a very old browser) with
    // the same message the server would otherwise reject the request with.
    if (!photoFile) {
      setResult({ error: 'A passport photo is required.' });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      // multipart/form-data (not JSON) so the required photo can ride along
      // with the text fields in a single request — apiFetch already skips
      // setting a Content-Type header for a FormData body, letting the
      // browser set the correct multipart boundary itself.
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) fd.append(key, value);
      });
      if (photoFile) fd.append('photo', photoFile);

      const data = await apiFetch('/api/applications', { method: 'POST', body: fd });
      setResult({
        applicationNumber: data.applicationNumber,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        courseTitle: selectedCourse?.title || '',
        submittedAt: new Date().toISOString(),
      });
      setForm(initialState);
      handlePhotoChange(null);
    } catch (err) {
      setResult({ error: err.message, fieldErrors: err.errors });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.applicationNumber) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card p-8 text-center max-w-lg mx-auto"
      >
        <div id="printable-receipt">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="font-display text-2xl mb-2">Application submitted!</h2>
          <p className="text-ink/70 mb-4">
            Save your application number to check your status and download your admission letter later.
          </p>
          <p className="text-2xl font-semibold tracking-wide text-gold-dark mb-1">{result.applicationNumber}</p>
          <p className="text-sm text-ink/60 mb-6">
            {result.firstName} {result.lastName}
            {result.courseTitle && ` — ${result.courseTitle}`}
            <br />
            {result.email}
            <br />
            Submitted {new Date(result.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            <br />
            <span className="text-xs">
              To check your status later, you&apos;ll need both your application number and this email.
            </span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={`/admissions/status?ref=${result.applicationNumber}`} className="btn-gold">
            Track My Application
          </a>
          <button type="button" onClick={handlePrint} className="btn-outline">
            Print This Slip
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-10 space-y-8 max-w-3xl mx-auto">
      {result?.error && (
        <div className="rounded-lg bg-red-50 text-red-700 text-sm p-4">{result.error}</div>
      )}

      <fieldset className="grid md:grid-cols-2 gap-5">
        <legend className="font-display text-xl mb-2 md:col-span-2">Personal Information</legend>
        <Field label="First Name" required value={form.firstName} onChange={(v) => update('firstName', v)} />
        <Field label="Last Name" required value={form.lastName} onChange={(v) => update('lastName', v)} />
        <Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} />
        <Field label="Phone" required value={form.phone} onChange={(v) => update('phone', v)} />
        <Field label="Date of Birth" type="date" required value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} />
        <SelectField
          label="Gender"
          value={form.gender}
          onChange={(v) => update('gender', v)}
          options={['Female', 'Male', 'Other', 'Prefer not to say']}
        />
        <Field label="Nationality" value={form.nationality} onChange={(v) => update('nationality', v)} />
        <Field label="Address" required value={form.address} onChange={(v) => update('address', v)} className="md:col-span-2" />
        <label className="text-sm block md:col-span-2">
          <span className="block mb-1 font-medium text-ink/80">
            Passport Photo <span className="text-gold-dark">*</span>
          </span>
          <div className="flex items-center gap-4">
            {photoPreview && (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a next/image-eligible remote source
              <img src={photoPreview} alt="Selected passport photo preview" className="w-16 h-16 rounded-full object-cover border border-black/15" />
            )}
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
              className="text-sm"
            />
          </div>
          <span className="block mt-1 text-xs text-muted">A clear photo of your face — required for your ID and admission letter.</span>
        </label>
      </fieldset>

      <fieldset className="grid md:grid-cols-2 gap-5">
        <legend className="font-display text-xl mb-2 md:col-span-2">Program Choice</legend>
        <SelectField
          label="Course"
          required
          value={form.course}
          onChange={(v) => update('course', v)}
          options={courses.map((c) => ({ value: c._id, label: c.title }))}
        />
        {selectedCourse?.intakePeriods?.length > 0 ? (
          <SelectField
            label="Preferred Intake"
            value={form.intakePeriod}
            onChange={(v) => update('intakePeriod', v)}
            options={selectedCourse.intakePeriods}
          />
        ) : (
          <Field label="Preferred Intake" value={form.intakePeriod} onChange={(v) => update('intakePeriod', v)} />
        )}
        <Field label="Prior Education" value={form.priorEducation} onChange={(v) => update('priorEducation', v)} className="md:col-span-2" />
      </fieldset>

      <fieldset className="grid md:grid-cols-2 gap-5">
        <legend className="font-display text-xl mb-2 md:col-span-2">Guardian (if applicable)</legend>
        <Field label="Guardian Name" value={form.guardianName} onChange={(v) => update('guardianName', v)} />
        <Field label="Guardian Phone" value={form.guardianPhone} onChange={(v) => update('guardianPhone', v)} />
      </fieldset>

      <fieldset>
        <legend className="font-display text-xl mb-2">Statement of Purpose</legend>
        <textarea
          rows={5}
          maxLength={2000}
          value={form.statementOfPurpose}
          onChange={(e) => update('statementOfPurpose', e.target.value)}
          placeholder="Tell us why you want to study at Rolen and what you hope to achieve..."
          className="w-full rounded-lg border border-black/15 p-3 text-sm outline-none focus:border-gold-dark"
        />
      </fieldset>

      <button type="submit" disabled={submitting} className="btn-gold w-full">
        {submitting ? 'Submitting…' : 'Submit Application'}
      </button>
      <p className="text-xs text-muted text-center">
        By submitting, you agree that the information provided is accurate. Your data is used solely for admissions purposes.
      </p>
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', required, className = '' }) {
  return (
    <label className={`text-sm ${className}`}>
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

function SelectField({ label, value, onChange, options, required, className = '' }) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="block mb-1 font-medium text-ink/80">
        {label} {required && <span className="text-gold-dark">*</span>}
      </span>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-black/15 p-2.5 outline-none focus:border-gold-dark bg-white"
      >
        <option value="">Select…</option>
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {label}
            </option>
          );
        })}
      </select>
    </label>
  );
}
