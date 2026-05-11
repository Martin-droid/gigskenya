import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ChevronRight, Phone, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createAd } from '../lib/firestore';

const CATS = ['Tech & Dev','Design','Writing & Content','Digital Marketing','Photo & Video','Business & Finance','Customer Support','Translation','Education & Tutoring','Other'];
const CITIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale','Remote / Online','Other'];

function Field({ label, hint, children, required }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--grey-700)', marginBottom: 7 }}>
        {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 5, lineHeight: 1.4 }}>{hint}</p>}
    </div>
  );
}

export default function PostAd() {
  const [sp] = useSearchParams();
  const [type, setType] = useState(sp.get('type') === 'job' ? 'job' : 'service');
  const [form, setForm] = useState({ title: '', category: '', description: '', rate: '', location: '', phone: '', whatsapp: true, tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const { user, isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const adData = {
        ...form,
        type,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        posterName: profile?.displayName || user?.displayName || form.phone || 'Anonymous',
        posterEmail: user?.email || null,
      };
      if (isAuthenticated) {
        await createAd(adData, user.uid);
      } else {
        // Guest post — still save with a guest marker
        await createAd({ ...adData, guestPost: true }, 'guest_' + Date.now());
      }
      setDone(true);
    } catch (err) {
      console.error(err);
      setError('Failed to post. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div style={{ background: 'white', borderRadius: 'var(--r-xl)', padding: '52px 44px', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--grey-200)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} color="var(--green)" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>Ad Posted! 🎉</h1>
        <p style={{ color: 'var(--grey-500)', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
          <strong>"{form.title}"</strong> is now live on GigsKenya. Kenyans searching for {form.category || 'this service'} can see it right now.
        </p>
        <button onClick={() => navigate('/browse')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginBottom: 10 }}>
          View Live Listings →
        </button>
        {isAuthenticated && (
          <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}>
            Manage My Ads
          </button>
        )}
        {!isAuthenticated && (
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--grey-400)', lineHeight: 1.6 }}>
            <button onClick={() => navigate('/register')} style={{ color: 'var(--green)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Create a free account</button> to manage, edit, and track your ads.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
        {/* Type toggle */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 'var(--r-md)', padding: 4, border: '1px solid var(--grey-200)', width: 'fit-content', marginBottom: 20 }}>
            {[{ id: 'service', l: '💼 I offer a service' }, { id: 'job', l: '📋 I need to hire' }].map(({ id, l }) => (
              <button key={id} type="button" onClick={() => setType(id)} style={{ padding: '9px 20px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: type === id ? 'var(--ink)' : 'transparent', color: type === id ? 'white' : 'var(--grey-500)', transition: 'all 0.15s' }}>{l}</button>
            ))}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
            {type === 'service' ? 'List Your Service' : 'Post a Job Ad'}
          </h1>
          <p style={{ color: 'var(--grey-500)', fontSize: 14 }}>Free to post. Reach thousands of Kenyan professionals directly.</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'var(--red-light)', border: '1px solid rgba(206,17,38,0.2)', borderRadius: 'var(--r-sm)', marginBottom: 20, fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 'var(--r-xl)', border: '1px solid var(--grey-200)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          <Field label={type === 'service' ? 'Service Title' : 'Job Title'} required hint="Be specific. Ads with detailed titles get far more contact clicks.">
            <input className="input" required type="text"
              placeholder={type === 'service' ? 'e.g. Full-Stack React Developer in Nairobi' : 'e.g. Looking for: WordPress Developer — 3-week project'}
              value={form.title} onChange={e => set('title', e.target.value)} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <Field label="Category" required mb={0}>
              <select required className="input" value={form.category} onChange={e => set('category', e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Select…</option>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Location" required mb={0}>
              <select required className="input" value={form.location} onChange={e => set('location', e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Select…</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label={type === 'service' ? 'Rate / Price' : 'Budget'} hint="e.g. KES 2,500/hr or KES 15,000 per project or Negotiable">
            <input className="input" type="text"
              placeholder={type === 'service' ? 'e.g. KES 2,500/hr or negotiable' : 'e.g. KES 30,000–50,000 or open'}
              value={form.rate} onChange={e => set('rate', e.target.value)} />
          </Field>

          <Field label="Description" required hint="The more detail, the better. Describe skills, experience, timeline, and what makes you (or this job) a great fit.">
            <textarea className="input" required rows={6}
              placeholder={type === 'service'
                ? 'Describe your skills, experience, what you deliver, and why clients should contact you…'
                : 'Describe the work needed, required skills, timeline, how to apply, and what you offer…'}
              value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical', lineHeight: 1.7 }} />
          </Field>

          <Field label="Skills / Keywords" hint="Comma-separated — helps people find your ad in search">
            <input className="input" type="text" placeholder="e.g. React, Node.js, M-Pesa, Figma, SEO"
              value={form.tags} onChange={e => set('tags', e.target.value)} />
          </Field>

          <div style={{ height: 1, background: 'var(--grey-150)', margin: '24px 0' }} />

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>Contact Details</h3>
          <p style={{ fontSize: 13, color: 'var(--grey-500)', marginBottom: 18, lineHeight: 1.6 }}>
            Shown when someone clicks "Show Contact" on your ad. This is how they reach you directly.
          </p>

          <Field label="Phone Number" required>
            <div className="input-icon-wrap">
              <Phone size={14} className="icon" />
              <input className="input" required type="tel" placeholder="0712 345 678"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </Field>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 28, userSelect: 'none' }}>
            <div onClick={() => set('whatsapp', !form.whatsapp)} style={{ width: 40, height: 22, borderRadius: 11, background: form.whatsapp ? 'var(--green)' : 'var(--grey-300)', position: 'relative', transition: 'background 0.2s', flexShrink: 0, cursor: 'pointer' }}>
              <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: 'white', top: 3, left: form.whatsapp ? 20 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--grey-700)', fontWeight: 500 }}>This number has WhatsApp</span>
          </label>

          {/* Account nudge for guests */}
          {!isAuthenticated && (
            <div style={{ background: 'var(--green-light)', border: '1px solid rgba(0,165,80,0.2)', borderRadius: 'var(--r-sm)', padding: '13px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Shield size={15} color="var(--green)" style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 600, marginBottom: 3 }}>Create a free account to manage your ads</p>
                <p style={{ fontSize: 12, color: 'var(--green-dark)', lineHeight: 1.5 }}>
                  Track views, contact clicks, edit or delete your listing anytime.{' '}
                  <button type="button" onClick={() => navigate('/register')} style={{ color: 'var(--green)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>Sign up free →</button>
                </p>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }} disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                Posting…
              </span>
            ) : 'Post Free Ad →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--grey-400)' }}>
            Free to post. No hidden fees. Goes live immediately.
          </p>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
