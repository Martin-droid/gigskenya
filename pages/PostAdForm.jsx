import { useState } from 'react';
import { createAd } from '../lib/firestore';

const CATS = [
  'Tech & Dev','Design','Writing & Content','Digital Marketing',
  'Photo & Video','Business & Finance','Customer Support',
  'Translation','Education & Tutoring','Other',
];
const CITIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret',
  'Thika','Remote / Online','Other',
];
const DURATIONS = [
  'Less than 1 week',
  '1–2 weeks',
  '2–4 weeks',
  '1–2 months',
  '3–6 months',
  'Ongoing / Permanent',
  'To be discussed',
];
const BUDGET_TYPES = ['Fixed Price', 'Hourly Rate', 'Monthly Retainer', 'Negotiable'];

function F({ label, hint, children, required, mb = 16 }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--grey-700)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--red)' }}> *</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }} />
      Posting…
    </span>
  );
}

export default function PostAdForm({ uid, posterName, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    budgetType: '',
    budgetAmount: '',
    duration: '',
    description: '',
    phone: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      // Build a clean budget string e.g. "Fixed Price — KES 45,000"
      const budget = form.budgetType === 'Negotiable'
        ? 'Negotiable'
        : form.budgetAmount
          ? `${form.budgetType} — KES ${form.budgetAmount}`
          : form.budgetType;

      await createAd(uid, {
        title:       form.title,
        category:    form.category,
        location:    form.location,
        budget,
        budgetType:  form.budgetType,
        budgetAmount: form.budgetAmount,
        duration:    form.duration,
        description: form.description,
        phone:       form.phone,
        tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
        type:        'job',
        posterName,
      });
      onSuccess();
    } catch (e) {
      console.error(e);
      setErr('Failed to post. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const needsAmount = form.budgetType && form.budgetType !== 'Negotiable' && form.budgetType !== 'To be discussed';

  return (
    <div style={{ background: 'white', borderRadius: 'var(--r-xl)', border: '1px solid var(--grey-200)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 4 }}>
        Post a Job Ad
      </h2>
      <p style={{ color: 'var(--grey-500)', fontSize: 13, marginBottom: 24 }}>
        Free to post. Talent will contact you directly via phone or WhatsApp.
      </p>

      {err && (
        <div style={{ padding: '10px 14px', background: 'var(--red-light)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>
          {err}
        </div>
      )}

      <form onSubmit={submit}>
        {/* Title */}
        <F label="Job Title" required hint="Be specific — e.g. 'React Developer needed for 4-week e-commerce project'">
          <input className="input" required type="text"
            placeholder="e.g. Looking for: WordPress Developer"
            value={form.title} onChange={e => set('title', e.target.value)} />
        </F>

        {/* Category + Location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <F label="Category" required mb={0}>
            <select className="input" required value={form.category} onChange={e => set('category', e.target.value)} style={{ appearance: 'none' }}>
              <option value="">Select…</option>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </F>
          <F label="Location" required mb={0}>
            <select className="input" required value={form.location} onChange={e => set('location', e.target.value)} style={{ appearance: 'none' }}>
              <option value="">Select…</option>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </F>
        </div>

        {/* Budget Type + Amount */}
        <div style={{ display: 'grid', gridTemplateColumns: needsAmount ? '1fr 1fr' : '1fr', gap: 14, marginBottom: 16 }}>
          <F label="Budget Type" required mb={0}>
            <select className="input" required value={form.budgetType} onChange={e => set('budgetType', e.target.value)} style={{ appearance: 'none' }}>
              <option value="">Select…</option>
              {BUDGET_TYPES.map(b => <option key={b}>{b}</option>)}
            </select>
          </F>
          {needsAmount && (
            <F label={`Amount (KES)${form.budgetType === 'Hourly Rate' ? ' per hour' : form.budgetType === 'Monthly Retainer' ? ' per month' : ''}`} mb={0}>
              <input className="input" type="text"
                placeholder={form.budgetType === 'Hourly Rate' ? 'e.g. 2,500' : 'e.g. 45,000'}
                value={form.budgetAmount} onChange={e => set('budgetAmount', e.target.value)} />
            </F>
          )}
        </div>

        {/* Duration */}
        <F label="Project Duration" hint="How long do you expect this work to take?">
          <select className="input" value={form.duration} onChange={e => set('duration', e.target.value)} style={{ appearance: 'none' }}>
            <option value="">Select duration…</option>
            {DURATIONS.map(d => <option key={d}>{d}</option>)}
          </select>
        </F>

        {/* Description */}
        <F label="Job Description" required>
          <textarea className="input" required rows={5}
            placeholder="Describe what you need, required skills, deliverables, and how talent should reach you…"
            value={form.description} onChange={e => set('description', e.target.value)}
            style={{ resize: 'vertical', lineHeight: 1.7 }} />
        </F>

        {/* Skills */}
        <F label="Required Skills" hint="Comma-separated — helps talent find your ad">
          <input className="input" type="text"
            placeholder="e.g. React, Node.js, M-Pesa, Figma"
            value={form.tags} onChange={e => set('tags', e.target.value)} />
        </F>

        {/* Phone */}
        <F label="Your Contact Number" required hint="Shown to talent who tap 'Show Contact' on your ad">
          <input className="input" required type="tel"
            placeholder="0712 345 678"
            value={form.phone} onChange={e => set('phone', e.target.value)} />
        </F>

        <button type="submit" className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}
          disabled={loading}>
          {loading ? <Spinner /> : 'Post Job Ad — Free →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--grey-400)' }}>
          Free to post. No hidden fees. Goes live immediately.
        </p>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}