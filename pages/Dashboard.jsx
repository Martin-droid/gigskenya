import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Dashboard.css';
import {
  LayoutDashboard, FileText, User, Settings, LogOut, Plus, Trash2, Eye,
  Phone, Briefcase, Edit3, CheckCircle, Search, Star, MessageSquare,
  Link as LinkIcon, FileDown, Camera, Upload, Globe, DollarSign, Award,
  ChevronRight, ChevronLeft, Check, Building2, MapPin, Menu, X, TrendingUp,
  Zap, Bell, ArrowUpRight, Share2, Copy, Lock, Send, Mail, AlertTriangle,
  Shield, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserAds, deleteAd, getTalentProfile, saveTalentProfile, getHirerProfile, saveHirerProfile, acceptTerms } from '../lib/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import PostAdForm from './PostAdForm';
import IntentBanner from '../components/IntentBanner';
import { intentSummary, resolvePostLoginDestination } from '../lib/authGuard';
import { useUnreadCount } from '../hooks/Useunreadcount';

// ── Category → Skills map ─────────────────────────────────────────
const CAT_SKILLS = {
  'Tech & Development': ['Web Development','Mobile Apps','React / Next.js','Node.js / Express','Python / Django','WordPress','Shopify','UI/UX Design','Figma','DevOps / Cloud','Cybersecurity','Database Admin','API Integration','Machine Learning / AI'],
  'Design & Creative': ['Graphic Design','Logo & Branding','Illustration','Print Design','Motion Graphics','Video Editing','Animation','UI/UX Design','Figma','Canva'],
  'Writing & Content': ['Copywriting','Blog / Article Writing','SEO Writing','Social Media Content','Scriptwriting','Proofreading & Editing','Technical Writing','Ghostwriting','Press Releases','Newsletter Writing'],
  'Digital Marketing & SEO': ['SEO & SEM','Facebook / Instagram Ads','Google Ads','Email Marketing','Influencer Marketing','Content Strategy','TikTok Marketing','WhatsApp Marketing','Analytics & Reporting','Community Management'],
  'Photo & Video Production': ['Photography','Videography','Video Editing','Drone Photography','Product Photography','Event Photography','YouTube Production','Podcast Editing'],
  'Business & Finance': ['Bookkeeping','Accounting','Tax & Compliance','Business Plans','Financial Modelling','Data Entry','Project Management','Legal Research','Market Research','Pitch Decks'],
  'Customer Support & VA': ['Customer Support','Virtual Assistant','Data Entry','Scheduling','Email Management','CRM Management','Chat Support','Cold Calling'],
  'Translation & Languages': ['Swahili Translation','English Translation','French Translation','Arabic Translation','Subtitling','Transcription','Proofreading'],
  'Education & Tutoring': ['Tutoring (Primary)','Tutoring (Secondary)','University Level','KCSE Prep','English Language','Coding for Kids','Music Lessons','Online Course Creation'],
  'Data & Analytics': ['Data Analysis','Excel / Sheets','Power BI','Tableau','Python (Data)','SQL','Machine Learning','Survey & Research','Data Entry'],
  'Legal & Compliance': ['Legal Research','Contract Drafting','Compliance Audits','Company Registration','Paralegal Services'],
  'Engineering & Architecture': ['Civil Engineering','Structural Engineering','Architecture / CAD','Interior Design','Quantity Surveying','Electrical Engineering','Mechanical Engineering'],
  'Health & Wellness': ['Personal Training','Nutrition & Diet','Mental Health Coaching','Yoga / Pilates','Physiotherapy','Medical Writing'],
  'Events & Entertainment': ['Event Planning','MC / Host','DJ Services','Live Music','Photography','Decor & Styling','Catering','Ushering'],
  'Trades & Labour': ['Plumbing','Electrical','Carpentry','Painting','Welding','Tiling','Roofing','HVAC','General Handyman'],
  'Sales & Lead Generation': ['Sales & Telemarketing','Cold Calling','Lead Generation','Business Development','CRM Management','Door-to-Door Sales'],
  'HR & Recruitment': ['Recruitment','CV Screening','HR Administration','Payroll','Training & Development','Performance Management'],
  'Logistics & Delivery': ['Driving / Delivery','Dispatch & Coordination','Inventory Management','Supply Chain','Courier Services'],
  'Agriculture & Farming': ['Crop Farming','Livestock','Agribusiness Consulting','Irrigation','Greenhouse Management','Farm Labour'],
  'Other': ['Other / Custom Skill'],
};
const ALL_CATS = Object.keys(CAT_SKILLS);
const CITIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Nyeri','Meru','Malindi','Garissa','Kitale','Kakamega','Embu','Machakos','Kericho','Remote / Online','Other'];
const RATE_TYPES = ['hourly','daily','per project','monthly','negotiable'];
const INDUSTRIES = ['Technology','Media & Marketing','Finance & Banking','Healthcare','Education','Retail & E-commerce','Manufacturing','Construction','Agriculture','Logistics','Legal','NGO / Non-profit','Government','Hospitality','Other'];

// ── Searchable Dropdown ───────────────────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder = 'Search or select…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef();
  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const h = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${open ? 'var(--accent)' : '#E2E8F0'}`, background: 'white', cursor: 'pointer', fontSize: 14, color: value ? '#1a202c' : '#94A3B8', minHeight: 44, transition: 'border-color .15s', boxSizing: 'border-box' }}>
        <span>{value || placeholder}</span>
        <ChevronRight size={14} color="#94A3B8" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 10, marginTop: 4, boxShadow: '0 8px 32px rgba(0,0,0,.12)', overflow: 'hidden' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}>
            <input autoFocus style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} placeholder="Type to search…" value={query} onChange={e => setQuery(e.target.value)} onClick={e => e.stopPropagation()} />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0
              ? <p style={{ padding: '14px', fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>No matches</p>
              : filtered.map(o => (
                <div key={o} onClick={() => { onChange(o); setQuery(''); setOpen(false); }}
                  style={{ padding: '11px 14px', fontSize: 14, cursor: 'pointer', background: o === value ? '#F0FDF4' : 'white', color: o === value ? '#16A34A' : '#1a202c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background .1s' }}
                  onMouseOver={e => { if (o !== value) e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseOut={e => { if (o !== value) e.currentTarget.style.background = 'white'; }}>
                  {o}{o === value && <Check size={13} color="#16A34A" />}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profile Image Uploader ────────────────────────────────────────
function ProfileImageUploader({ uid, folder = 'profile_images', currentUrl, onUploaded, onUploadingChange, size = 72 }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentUrl || '');
  const [err, setErr] = useState('');
  const inputRef = useRef();
  const blobUrlRef = useRef(null);

  // Revoke any previous blob URL to avoid memory leaks and stale fetches
  const revokePrev = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const setUploading_ = val => {
    setUploading(val);
    onUploadingChange?.(val);
  };

  const handleFile = file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('Image must be under 5 MB.'); return; }
    setErr('');
    revokePrev();
    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    setPreview(blobUrl);
    const storageRef = ref(storage, `${folder}/${uid}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    setUploading_(true);
    task.on('state_changed',
      snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => { setErr('Upload failed. Try again.'); setUploading_(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        revokePrev();               // blob no longer needed — Firebase URL is ready
        setPreview(url);            // show the real URL in preview too
        setUploading_(false);
        setProgress(0);
        onUploaded(url);
      }
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: size, height: size, borderRadius: '50%', background: '#F1F5F9', border: '3px solid white', boxShadow: '0 0 0 2px #E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={size * 0.36} color="#94A3B8" />}
        </div>
        {uploading && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{progress}%</span></div>}
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
          <Camera size={12} color="white" />
        </button>
      </div>
      <div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: 'white', fontSize: 12, fontWeight: 600, color: '#475569', cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: 5, transition: 'all .15s' }}>
          <Upload size={12} /> {uploading ? `Uploading… ${progress}%` : preview ? 'Change Photo' : 'Upload Photo'}
        </button>
        <p style={{ fontSize: 11, color: '#94A3B8' }}>JPG or PNG · max 5 MB</p>
        {err && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 3 }}>{err}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
    </div>
  );
}

// ── Step Indicator ────────────────────────────────────────────────
function Steps({ current, steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, overflowX: 'auto', paddingBottom: 2 }}>
      {steps.map((label, i) => {
        const done = i < current, active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#16A34A' : active ? '#1a202c' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}>
                {done ? <Check size={13} color="white" /> : <span style={{ fontSize: 12, fontWeight: 700, color: active ? 'white' : '#94A3B8' }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#1a202c' : done ? '#16A34A' : '#94A3B8', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? '#16A34A' : '#E2E8F0', margin: '0 10px', minWidth: 16, borderRadius: 1, transition: 'background .2s' }} />}
          </div>
        );
      })}
    </div>
  );
}

function Fld({ label, hint, children, required, mb = 16 }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '.02em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 12, background: value ? '#16A34A' : '#CBD5E1', position: 'relative', transition: 'background .2s', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: 'white', top: 3, left: value ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
      </div>
      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
    </label>
  );
}

// Shared input style
const inputStyle = {
  width: '100%', padding: '11px 14px', fontSize: 14, borderRadius: 10,
  border: '1.5px solid #E2E8F0', outline: 'none', boxSizing: 'border-box',
  color: '#1a202c', background: 'white', transition: 'border-color .15s',
  fontFamily: 'inherit',
};

function Input(props) {
  const [focused, setFocused] = useState(false);
  return <input {...props} style={{ ...inputStyle, borderColor: focused ? 'var(--accent)' : '#E2E8F0', ...(props.style||{}) }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />;
}

function Textarea(props) {
  const [focused, setFocused] = useState(false);
  return <textarea {...props} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, borderColor: focused ? 'var(--accent)' : '#E2E8F0', ...(props.style||{}) }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />;
}

function Select({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return <select {...props} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', borderColor: focused ? 'var(--accent)' : '#E2E8F0', ...(props.style||{}) }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>{children}</select>;
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 13, color: '#DC2626', marginBottom: 18 }}>
      <X size={14} style={{ flexShrink: 0 }} /> {msg}
    </div>
  );
}

// ── Hirer Profile Form ────────────────────────────────────────────
function HirerProfileForm({ uid, existing, displayName, userPhotoURL, onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [err, setErr] = useState('');
  const [isCompany, setIsCompany] = useState(existing?.isCompany || false);
  const [form, setForm] = useState({
    name: existing?.name || displayName || '',
    photoURL: existing?.photoURL || '',
    googlePhotoURL: userPhotoURL || '',
    phone: existing?.phone || '',
    hidePhone: existing?.hidePhone || false,
    location: existing?.location || '',
    isCompany: existing?.isCompany || false,
    companyName: existing?.companyName || '',
    companyIndustry: existing?.companyIndustry || '',
    companySize: existing?.companySize || '',
    companyWebsite: existing?.companyWebsite || '',
    companyDesc: existing?.companyDesc || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isValidUrl = str => { if (!str) return true; try { new URL(str); return true; } catch { return false; } };

  const validateStep = () => {
    setErr('');
    if (step === 0) {
      if (!form.name.trim()) { setErr('Please enter your name.'); return false; }
      if (!form.phone.trim()) { setErr('Please enter a contact number.'); return false; }
      if (!form.location) { setErr('Please select your location.'); return false; }
    }
    if (step === 1 && isCompany) {
      if (!form.companyName.trim()) { setErr('Please enter your company name.'); return false; }
      if (form.companyWebsite && !isValidUrl(form.companyWebsite)) { setErr('Company website must include https://'); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(1); };
  const back = () => { setErr(''); setStep(0); };
  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try { await saveHirerProfile(uid, { ...form, isCompany }); onSuccess(); }
    catch { setErr('Failed to save. Check connection and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,.06)', maxWidth: 540, width: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a202c', marginBottom: 4, letterSpacing: '-.03em' }}>
          {existing ? 'Edit Your Profile' : 'Set Up Your Profile'}
        </h2>
        <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.5 }}>Quick setup — under a minute. Helps talent know who's reaching out.</p>
      </div>

      <Steps current={step} steps={['About you', 'Company details']} />
      <ErrBox msg={err} />

      {step === 0 && (
        <div>
          <ProfileImageUploader uid={uid} folder="hirer_images" currentUrl={form.photoURL || form.googlePhotoURL} onUploaded={url => set('photoURL', url)} onUploadingChange={setImageUploading} />
          <Fld label="Your Name" required>
            <Input type="text" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
          </Fld>
          <Fld label="Phone / WhatsApp" required hint="So talent can reach you directly">
            <Input type="tel" placeholder="0712 345 678" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </Fld>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', marginBottom: 16, background: form.hidePhone ? '#FEF2F2' : '#F8FAFC', borderRadius: 10, border: `1.5px solid ${form.hidePhone ? '#FECACA' : 'transparent'}`, transition: 'all .2s' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: form.hidePhone ? '#DC2626' : '#374151', display:'flex', alignItems:'center', gap:6 }}><Lock size={13}/> Hide phone number</p>
              <p style={{ fontSize: 11, color: form.hidePhone ? '#EF4444' : '#94A3B8', marginTop: 2 }}>
                {form.hidePhone ? 'Phone hidden — talent can only message you in-app' : 'Phone visible to logged-in talent who click Contact'}
              </p>
            </div>
            <Toggle value={form.hidePhone} onChange={v => set('hidePhone', v)} label="" />
          </div>
          <Fld label="Your Location" required>
            <SearchableSelect options={CITIES} value={form.location} onChange={v => set('location', v)} placeholder="Select your city…" />
          </Fld>
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 10, marginTop: 6 }}>
            <Toggle value={isCompany} onChange={v => { setIsCompany(v); set('isCompany', v); }} label="I'm hiring on behalf of a company" />
            {isCompany && <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, marginLeft: 52 }}>You'll add company details on the next step.</p>}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          {!isCompany ? (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={28} color="#16A34A" />
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#1a202c', marginBottom: 6 }}>You're all set!</p>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>No company details needed. Hit publish to complete your profile.</p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.02em' }}>Company Logo <span style={{ fontWeight: 400, color: '#94A3B8', textTransform: 'none' }}>(optional)</span></p>
                <ProfileImageUploader uid={uid} folder="company_logos" currentUrl={form.companyLogoURL || ''} onUploaded={url => set('companyLogoURL', url)} size={64} onUploadingChange={setImageUploading} />
              </div>
              <Fld label="Company Name" required>
                <Input type="text" placeholder="e.g. Acme Kenya Ltd" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
              </Fld>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <Fld label="Industry" mb={0}>
                  <SearchableSelect options={INDUSTRIES} value={form.companyIndustry} onChange={v => set('companyIndustry', v)} placeholder="Select…" />
                </Fld>
                <Fld label="Company Size" mb={0}>
                  <Select value={form.companySize} onChange={e => set('companySize', e.target.value)}>
                    <option value="">Select…</option>
                    {['Just me','2–10 people','11–50 people','51–200 people','200+ people'].map(s => <option key={s}>{s}</option>)}
                  </Select>
                </Fld>
              </div>
              <Fld label="Website" hint="Optional — include https://">
                <Input type="url" placeholder="https://yourcompany.co.ke" value={form.companyWebsite} onChange={e => set('companyWebsite', e.target.value)} />
              </Fld>
              <Fld label="What does your company do?" hint="2–3 sentences. Shown to talent when you reach out.">
                <Textarea rows={3} placeholder="e.g. We're a Nairobi-based marketing agency…" value={form.companyDesc} onChange={e => set('companyDesc', e.target.value)} />
              </Fld>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'space-between', alignItems: 'center' }}>
        {step > 0
          ? <button type="button" onClick={back} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
              <ChevronLeft size={15} /> Back
            </button>
          : <div />
        }
        {step === 0
          ? <button type="button" onClick={next} disabled={imageUploading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 22px', borderRadius: 10, background: 'var(--accent)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: imageUploading ? 'not-allowed' : 'pointer', opacity: imageUploading ? .6 : 1, transition: 'opacity .15s' }}>
              {imageUploading ? <><Spinner /> Uploading photo…</> : <>Continue <ChevronRight size={15} /></>}
            </button>
          : <button type="button" onClick={submit} disabled={loading || imageUploading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', borderRadius: 10, background: 'var(--accent)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: (loading || imageUploading) ? 'not-allowed' : 'pointer', opacity: (loading || imageUploading) ? .7 : 1 }}>
              {loading ? <><Spinner /> Saving…</> : imageUploading ? <><Spinner /> Uploading photo…</> : existing ? 'Update Profile →' : 'Save Profile →'}
            </button>
        }
      </div>
    </div>
  );
}

// ── CV / Document Uploader ────────────────────────────────────────
function CvUploader({ uid, currentUrl, onUploaded, onUploadingChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [fileName, setFileName]   = useState(() => {
    if (!currentUrl) return '';
    try { return decodeURIComponent(new URL(currentUrl).pathname.split('/').pop().split('?')[0]); } catch { return 'Current CV'; }
  });
  const [err, setErr] = useState('');
  const inputRef = useRef();

  const setUploading_ = val => { setUploading(val); onUploadingChange?.(val); };

  const handleFile = file => {
    if (!file) return;
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { setErr('Only PDF or Word documents are accepted.'); return; }
    if (file.size > 10 * 1024 * 1024) { setErr('File must be under 10 MB.'); return; }
    setErr('');
    setFileName(file.name);
    const storageRef = ref(storage, `cv_files/${uid}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    setUploading_(true);
    task.on('state_changed',
      snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => { setErr('Upload failed. Try again.'); setUploading_(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setUploading_(false);
        setProgress(0);
        onUploaded(url);
      }
    );
  };

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 10, border: `1.5px dashed ${uploading ? 'var(--accent)' : '#CBD5E1'}`, background: uploading ? '#F0FDF4' : '#FAFAFA', cursor: uploading ? 'default' : 'pointer', transition: 'all .15s' }}
        onMouseOver={e => { if (!uploading) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = '#F0FDF4'; }}}
        onMouseOut={e => { if (!uploading) { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#FAFAFA'; }}}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: uploading ? '#DCFCE7' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileDown size={16} color={uploading ? 'var(--accent)' : '#94A3B8'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {uploading
            ? <>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>Uploading… {progress}%</p>
                <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width .2s', borderRadius: 2 }} />
                </div>
              </>
            : fileName
              ? <p style={{ fontSize: 13, fontWeight: 600, color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✔ {fileName}</p>
              : <p style={{ fontSize: 13, color: '#94A3B8' }}>Click to upload PDF or Word doc · max 10 MB</p>
          }
        </div>
        {fileName && !uploading && (
          <button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
            style={{ fontSize: 11, fontWeight: 600, color: '#64748B', background: 'white', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', flexShrink: 0 }}>
            Replace
          </button>
        )}
      </div>
      {err && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 5 }}>{err}</p>}
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
    </div>
  );
}

// ── Talent Profile Form ───────────────────────────────────────────
function TalentProfileForm({ uid, existing, displayName, userPhotoURL, onSuccess, onStepChange }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvMode, setCvMode] = useState(() => existing?.cvUrl ? 'link' : 'upload');
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    posterName: existing?.posterName || displayName || '',
    photoURL: existing?.photoURL || '',
    googlePhotoURL: userPhotoURL || '',
    title: existing?.title || '',
    category: existing?.category || '',
    location: existing?.location || '',
    bio: existing?.bio || '',
    skills: existing?.skills || [],
    rate: existing?.rate || '',
    currency: existing?.currency || 'KES',
    rateType: existing?.rateType || 'hourly',
    hidePhone: existing?.hidePhone || false,
    experience: existing?.experience || '',
    workType: existing?.workType || [],
    phone: existing?.phone || '',
    whatsapp: existing?.whatsapp !== false,
    available: existing?.available !== false,
    portfolioUrl: existing?.portfolioUrl || '',
    linkedinUrl: existing?.linkedinUrl || '',
    cvUrl: existing?.cvUrl || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleSkill = s => set('skills', form.skills.includes(s) ? form.skills.filter(x => x !== s) : [...form.skills, s]);
  const toggleWorkType = w => set('workType', form.workType.includes(w) ? form.workType.filter(x => x !== w) : [...form.workType, w]);
  const availableSkills = form.category ? (CAT_SKILLS[form.category] || []) : [];
  const isValidUrl = str => { if (!str) return true; try { new URL(str); return true; } catch { return false; } };

  const validateStep = () => {
    setErr('');
    if (step === 0) {
      if (!form.posterName.trim()) { setErr('Please enter your name.'); return false; }
      if (!form.title.trim()) { setErr('Please enter a headline.'); return false; }
      if (!form.category) { setErr('Please select a category.'); return false; }
      if (!form.location) { setErr('Please select your location.'); return false; }
    }
    if (step === 1) {
      if (!form.bio.trim() || form.bio.trim().length < 30) { setErr('Please write at least a sentence about yourself.'); return false; }
    }
    if (step === 2) {
      if (!form.phone.trim()) { setErr('Please enter a contact number.'); return false; }
      for (const [f, l] of [['portfolioUrl','Portfolio URL'],['linkedinUrl','LinkedIn URL']]) {
        if (form[f] && !isValidUrl(form[f])) { setErr(`${l} must include https://`); return false; }
      }
      if (cvMode === 'link' && form.cvUrl && !isValidUrl(form.cvUrl)) { setErr('CV URL must include https://'); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => { const n = s + 1; onStepChange?.(n); return n; }); };
  const back = () => { setErr(''); setStep(s => { const n = s - 1; onStepChange?.(n); return n; }); };
  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try { await saveTalentProfile(uid, form); onSuccess(); }
    catch { setErr('Failed to save. Try again.'); }
    finally { setLoading(false); }
  };

  const bioLen = form.bio.length;

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,.06)', maxWidth: 600, width: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a202c', marginBottom: 4, letterSpacing: '-.03em' }}>
          {existing ? 'Edit Your Profile' : 'Build Your Profile'}
        </h2>
        <p style={{ color: '#64748B', fontSize: 13 }}>Takes about 2 minutes. You can always update it later.</p>
      </div>

      <Steps current={step} steps={['Who you are', 'What you do', 'How to reach you']} />
      <ErrBox msg={err} />

      {step === 0 && (
        <div>
          <ProfileImageUploader uid={uid} currentUrl={form.photoURL || form.googlePhotoURL} onUploaded={url => set('photoURL', url)} onUploadingChange={setImageUploading} />
          <Fld label="Your Name" required>
            <Input type="text" placeholder="Full name" value={form.posterName} onChange={e => set('posterName', e.target.value)} />
          </Fld>
          <Fld label="Profile Headline" required hint="e.g. 'Graphic Designer · Logo & Branding · Nairobi'">
            <Input type="text" placeholder="What you do in one line" value={form.title} onChange={e => set('title', e.target.value)} />
          </Fld>
          <Fld label="Category" required hint="Filters your skills on the next step">
            <SearchableSelect options={ALL_CATS} value={form.category} onChange={v => { set('category', v); set('skills', []); }} placeholder="Search categories…" />
          </Fld>
          <Fld label="Location" required>
            <SearchableSelect options={CITIES} value={form.location} onChange={v => set('location', v)} placeholder="Select your city…" />
          </Fld>
        </div>
      )}

      {step === 1 && (
        <div>
          <Fld label="About You" required hint="What you do, who you work with, what results you deliver">
            <Textarea rows={5} placeholder="e.g. I'm a Nairobi-based graphic designer with 4 years of experience…" value={form.bio} onChange={e => set('bio', e.target.value)} />
            <p style={{ fontSize: 11, color: bioLen > 480 ? '#EF4444' : '#94A3B8', marginTop: 4, textAlign: 'right' }}>{bioLen} / 500</p>
          </Fld>
          <Fld label={`Skills${form.skills.length > 0 ? ` (${form.skills.length} selected)` : ''}`} hint={form.category ? `Showing skills for ${form.category}` : 'Select a category first'}>
            {availableSkills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {availableSkills.map(s => {
                  const sel = form.skills.includes(s);
                  return (
                    <button type="button" key={s} onClick={() => toggleSkill(s)}
                      style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${sel ? '#16A34A' : '#E2E8F0'}`, background: sel ? '#F0FDF4' : 'white', color: sel ? '#15803D' : '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .12s', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {sel && <Check size={11} />}{s}
                    </button>
                  );
                })}
              </div>
            ) : <p style={{ fontSize: 13, color: '#94A3B8', padding: '10px 0' }}>← Go back and select a category</p>}
          </Fld>
          <Fld label="Your Rate" hint="What you charge — shown on your public profile">
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 140px', gap: 8 }}>
              <Select value={form.currency} onChange={e => set('currency', e.target.value)}>
                {['KES','USD','EUR','GBP'].map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 2500"
                value={form.rate}
                onChange={e => set('rate', e.target.value)}
              />
              <Select value={form.rateType} onChange={e => set('rateType', e.target.value)}>
                {RATE_TYPES.map(r => <option key={r} value={r}>per {r === 'negotiable' ? 'negotiable' : r}</option>)}
              </Select>
            </div>
            {form.rate && (
              <p style={{ fontSize: 12, color: 'var(--green-dark)', marginTop: 6, fontWeight: 600 }}>
                Preview: {form.currency} {Number(form.rate).toLocaleString('en-KE')} / {form.rateType}
              </p>
            )}
          </Fld>
          <Fld label="Experience Level">
            <Select value={form.experience} onChange={e => set('experience', e.target.value)}>
              <option value="">Select…</option>
              {['Entry (0–1 yrs)','Junior (1–3 yrs)','Mid-Level (3–5 yrs)','Senior (5–8 yrs)','Expert (8+ yrs)'].map(l => <option key={l}>{l}</option>)}
            </Select>
          </Fld>
          <Fld label="Work Type">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {[{ v: 'remote', l: 'Remote', icon: <Globe size={13}/> }, { v: 'onsite', l: 'On-site', icon: <MapPin size={13}/> }, { v: 'hybrid', l: 'Hybrid', icon: <RefreshCw size={13}/> }].map(({ v, l, icon }) => {
                const sel = form.workType.includes(v);
                return <button type="button" key={v} onClick={() => toggleWorkType(v)} style={{ display:'flex', alignItems:'center', gap:6, padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${sel ? '#16A34A' : '#E2E8F0'}`, background: sel ? '#F0FDF4' : 'white', color: sel ? '#15803D' : '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .12s' }}>{icon}{l}</button>;
              })}
            </div>
          </Fld>
        </div>
      )}

      {step === 2 && (
        <div>
          <Fld label="Phone / WhatsApp" required hint="Shown to hirers when they click 'Contact'">
            <Input type="tel" placeholder="0712 345 678" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </Fld>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 20, padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, flexWrap: 'wrap' }}>
              <Toggle value={form.whatsapp} onChange={v => set('whatsapp', v)} label="WhatsApp enabled" />
              <Toggle value={form.available} onChange={v => set('available', v)} label="Open to new work" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: form.hidePhone ? '#FEF2F2' : '#F8FAFC', borderRadius: 10, border: `1.5px solid ${form.hidePhone ? '#FECACA' : 'transparent'}`, transition: 'all .2s' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: form.hidePhone ? '#DC2626' : '#374151', display:'flex', alignItems:'center', gap:6 }}><Lock size={13}/> Hide phone number</p>
                <p style={{ fontSize: 11, color: form.hidePhone ? '#EF4444' : '#94A3B8', marginTop: 2 }}>
                  {form.hidePhone ? 'Phone hidden — hirers can only message you in-app' : 'Phone visible to logged-in hirers who click Contact'}
                </p>
              </div>
              <Toggle value={form.hidePhone} onChange={v => set('hidePhone', v)} label="" />
            </div>
          </div>
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Links (optional)</p>
          </div>
          <Fld label="Portfolio / Website">
            <Input type="url" placeholder="https://yourportfolio.com" value={form.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)} />
          </Fld>
          <Fld label="LinkedIn">
            <Input type="url" placeholder="https://linkedin.com/in/yourname" value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} />
          </Fld>
          <Fld label="CV / Resume">
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {['upload', 'link'].map(mode => (
                <button key={mode} type="button" onClick={() => setCvMode(mode)}
                  style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1.5px solid ${cvMode === mode ? 'var(--accent)' : '#E2E8F0'}`, background: cvMode === mode ? '#F0FDF4' : 'white', color: cvMode === mode ? 'var(--accent)' : '#64748B', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
                  {mode === 'upload' ? '⬆ Upload File' : '🔗 Paste Link'}
                </button>
              ))}
            </div>
            {cvMode === 'upload'
              ? <CvUploader uid={uid} currentUrl={form.cvUrl} onUploaded={url => set('cvUrl', url)} onUploadingChange={setCvUploading} />
              : <Input type="url" placeholder="https://drive.google.com/file/d/…" value={form.cvUrl} onChange={e => set('cvUrl', e.target.value)} />
            }
            {cvMode === 'link' && <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Google Drive, Dropbox, OneDrive, etc. — make sure the link is public.</p>}
          </Fld>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'space-between', alignItems: 'center' }}>
        {step > 0
          ? <button type="button" onClick={back} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
              <ChevronLeft size={15} /> Back
            </button>
          : <div />
        }
        {step < 2
          ? <button type="button" onClick={next} disabled={imageUploading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 22px', borderRadius: 10, background: 'var(--accent)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: imageUploading ? 'not-allowed' : 'pointer', opacity: imageUploading ? .6 : 1 }}>
              {imageUploading && step === 0 ? <><Spinner /> Uploading photo…</> : <>Continue <ChevronRight size={15} /></>}
            </button>
          : <button type="button" onClick={submit} disabled={loading || imageUploading || cvUploading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', borderRadius: 10, background: 'var(--accent)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: (loading || imageUploading || cvUploading) ? 'not-allowed' : 'pointer', opacity: (loading || imageUploading || cvUploading) ? .7 : 1 }}>
              {loading ? <><Spinner /> Saving…</> : imageUploading ? <><Spinner /> Uploading photo…</> : cvUploading ? <><Spinner /> Uploading CV…</> : existing ? 'Update Profile →' : 'Publish Profile →'}
            </button>
        }
      </div>
    </div>
  );
}

function Spinner() {
  return <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block', flexShrink: 0 }} />;
}

// ── Sidebar ───────────────────────────────────────────────────────
function Sidebar({ tab, setTab, isTalent, name, photoURL, uploadedPhotoURL, onLogout, mobileOpen, onMobileClose, unreadCount = 0 }) {
  const navigate = useNavigate();
  const iNav = id => {
    if (id === 'messages') { navigate('/messages'); }
    else { setTab(id); }
    onMobileClose();
  };

  const nav = isTalent
    ? [{ id:'overview', icon:LayoutDashboard, label:'Overview' },{ id:'profile', icon:User, label:'My Profile' },{ id:'messages', icon:MessageSquare, label:'Messages', badge: unreadCount },{ id:'settings', icon:Settings, label:'Settings' }]
    : [{ id:'overview', icon:LayoutDashboard, label:'Overview' },{ id:'profile', icon:User, label:'My Profile' },{ id:'ads', icon:FileText, label:'My Job Ads' },{ id:'messages', icon:MessageSquare, label:'Messages', badge: unreadCount },{ id:'settings', icon:Settings, label:'Settings' }];

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatarSrc = uploadedPhotoURL || photoURL;

  const sidebarContent = (
    <aside style={{ width: 240, background: 'white', borderRight: '1px solid #F1F5F9', padding: '20px 14px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* User card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: isTalent ? '#FEF3C7' : '#F0FDFA', color: isTalent ? '#D97706' : '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0, overflow: 'hidden', border: `2px solid ${isTalent ? '#FDE68A' : '#99F6E4'}` }}>
          {avatarSrc ? <img src={avatarSrc} style={{ width: 36, height: 36, objectFit: 'cover' }} alt="" /> : initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a202c', marginBottom: 2 }}>{name.split(' ')[0]}</p>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: isTalent ? '#FEF3C7' : '#F0FDFA', color: isTalent ? '#D97706' : '#0D9488' }}>
            {isTalent ? '✦ Talent' : '◈ Hirer'}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, paddingLeft: 12 }}>Navigation</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {nav.map(({ id, icon: Icon, label, badge }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => iNav(id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: active ? (isTalent ? '#FEF3C7' : '#F0FDFA') : 'transparent', color: active ? (isTalent ? '#D97706' : '#0D9488') : '#64748B', fontWeight: active ? 700 : 500, fontSize: 14, transition: 'all .15s', textAlign: 'left' }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#1a202c'; }}}
              onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}}>
              <Icon size={15} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && (
                <span style={{ background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, minWidth: 18, textAlign: 'center', lineHeight: '14px' }}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isTalent
          ? <button onClick={() => { navigate('/browse'); onMobileClose(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', transition: 'all .15s' }} onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.background = 'white'}><Search size={13} /> Browse Jobs</button>
          : <button onClick={() => { setTab('post'); onMobileClose(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: 'none', background: 'var(--accent)', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}><Plus size={13} /> Post Job Ad</button>
        }
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', border: '1px solid #FEE2E2', borderRadius: 10, background: 'white', fontSize: 12, color: '#EF4444', cursor: 'pointer', fontWeight: 600, transition: 'all .15s' }}
          onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'}
          onMouseOut={e => e.currentTarget.style.background = 'white'}>
          <LogOut size={12} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="desk-sidebar" style={{ position: 'sticky', top: 64, height: 'calc(100vh - 64px)', flexShrink: 0 }}>
        {sidebarContent}
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex' }}>
          <div onClick={onMobileClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'relative', width: 260, height: '100%', boxShadow: '4px 0 32px rgba(0,0,0,.15)', animation: 'slideInLeft .22s ease' }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

// ── Terms Gate Modal ──────────────────────────────────────────────
function TermsGate({ onAccepted }) {
  const [checked, setChecked]     = useState(false);
  const [saving, setSaving]       = useState(false);

  const handleAccept = async () => {
    if (!checked || saving) return;
    setSaving(true);
    try { await onAccepted(); } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,.3)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#0A0A0A', padding: '26px 28px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={16} color="white" />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-.02em' }}>
              Updated Terms &amp; Conditions
            </p>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>
            GigsKenya has published its Terms &amp; Conditions and Privacy Policy. You need to review and accept them before continuing.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 28px 26px' }}>
          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
            {[
              [<MapPin size={14} color="#16A34A"/>, 'Governed by the laws of Kenya (Data Protection Act 2019, Employment Act 2007, Computer Misuse & Cybercrimes Act 2018).'],
              [<CheckCircle size={14} color="#0D9488"/>, 'GigsKenya is a marketplace only — we are not your employer or agent.'],
              [<DollarSign size={14} color="#D97706"/>, 'All payments are made directly between you and the other party.'],
              [<Lock size={14} color="#6366F1"/>, 'We do not sell your personal data to third parties.'],
            ].map(([icon, t]) => (
              <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                <span style={{ flexShrink: 0, marginTop: 2 }}>{icon}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <a href="/terms" target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#FAFAFA', fontSize: 13, fontWeight: 700, color: '#374151', textDecoration: 'none', transition: 'all .15s' }}>
              <FileText size={13}/> Terms &amp; Conditions
            </a>
            <a href="/privacy" target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#FAFAFA', fontSize: 13, fontWeight: 700, color: '#374151', textDecoration: 'none', transition: 'all .15s' }}>
              <Shield size={13}/> Privacy Policy
            </a>
          </div>

          {/* Checkbox */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18, cursor: 'pointer', userSelect: 'none' }}>
            <div onClick={() => setChecked(v => !v)}
              style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? '#16A34A' : '#CBD5E1'}`, background: checked ? '#16A34A' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all .15s', cursor: 'pointer' }}>
              {checked && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.65 }}>
              I have read and agree to GigsKenya's <strong>Terms &amp; Conditions</strong> and <strong>Privacy Policy</strong>, and confirm I am at least 18 years old.
            </span>
          </label>

          {/* Accept button */}
          <button onClick={handleAccept} disabled={!checked || saving}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 11, border: 'none', background: checked ? '#16A34A' : '#E2E8F0', color: checked ? 'white' : '#94A3B8', fontSize: 14, fontWeight: 700, cursor: checked && !saving ? 'pointer' : 'not-allowed', transition: 'all .2s' }}>
            {saving
              ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }}/> Saving…</>
              : checked ? 'I Agree — Continue to Dashboard →' : 'Tick the box above to continue'
            }
          </button>

          <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
            You cannot access the dashboard until you accept. If you disagree, you may close this tab.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = '#16A34A', bg = '#F0FDF4', trend }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,.04)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} />
        </div>
        {trend && <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}><TrendingUp size={10} />{trend}</span>}
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 900, color: '#1a202c', letterSpacing: '-.04em', lineHeight: 1, marginBottom: 4 }}>{value}</p>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</p>
      </div>
    </div>
  );
}

// ── Ad Row ────────────────────────────────────────────────────────
function AdRow({ ad, onDelete, navigate }) {
  const date = ad.createdAt?.toDate ? ad.createdAt.toDate().toLocaleDateString('en-KE',{ day:'numeric', month:'short' }) : '';
  const [hov, setHov] = useState(false);
  return (
    <div onMouseOver={() => setHov(true)} onMouseOut={() => setHov(false)}
      style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #F8FAFC', alignItems: 'center', transition: 'all .1s' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Briefcase size={15} color="#16A34A" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{ad.title}</p>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94A3B8', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> {ad.views||0} views</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {ad.contactClicks||0} contacts</span>
          {date && <span>{date}</span>}
          <span style={{ padding: '2px 8px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', fontWeight: 600, fontSize: 10 }}>Active</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={() => navigate(`/ad/${ad.id}`)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: hov ? '#F8FAFC' : 'white', color: '#64748B', cursor: 'pointer', transition: 'all .1s', display: 'flex', alignItems: 'center' }}><Eye size={13}/></button>
        <button onClick={() => onDelete(ad)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', color: '#CBD5E1', cursor: 'pointer', transition: 'all .1s', display: 'flex', alignItems: 'center' }}
          onMouseOver={e => { e.currentTarget.style.color='#EF4444'; e.currentTarget.style.borderColor='#FECACA'; e.currentTarget.style.background='#FEF2F2'; }}
          onMouseOut={e => { e.currentTarget.style.color='#CBD5E1'; e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.background='white'; }}>
          <Trash2 size={13}/>
        </button>
      </div>
    </div>
  );
}

function QuickBtn({ icon: Icon, label, desc, onClick, accent }) {
  return (
    <button onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', marginBottom: 8, borderRadius: 12, border: '1.5px solid #F1F5F9', background: '#FAFAFA', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
      onMouseOver={e => { e.currentTarget.style.background='white'; e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.06)'; }}
      onMouseOut={e => { e.currentTarget.style.background='#FAFAFA'; e.currentTarget.style.borderColor='#F1F5F9'; e.currentTarget.style.boxShadow='none'; }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: accent || '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={accent ? 'white' : '#64748B'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: '#1a202c', marginBottom: 1 }}>{label}</p>
        <p style={{ fontSize: 12, color: '#94A3B8' }}>{desc}</p>
      </div>
      <ArrowUpRight size={14} color="#CBD5E1" />
    </button>
  );
}

// ── Bottom Nav (mobile) ───────────────────────────────────────────
function BottomNav({ tab, setTab, isTalent, navigate, unreadCount = 0 }) {
  const nav = isTalent
    ? [{ id:'overview', icon:LayoutDashboard, label:'Home' },{ id:'profile', icon:User, label:'Profile' },{ id:'messages', icon:MessageSquare, label:'Messages' },{ id:'settings', icon:Settings, label:'Settings' }]
    : [{ id:'overview', icon:LayoutDashboard, label:'Home' },{ id:'ads', icon:FileText, label:'My Ads' },{ id:'post', icon:Plus, label:'Post', cta: true },{ id:'messages', icon:MessageSquare, label:'Messages' },{ id:'settings', icon:Settings, label:'Settings' }];

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'white', borderTop: '1px solid #F1F5F9', display: 'flex', padding: '8px 0 calc(8px + env(safe-area-inset-bottom))', boxShadow: '0 -4px 24px rgba(0,0,0,.06)' }} className="mob-bottom-nav">
      {nav.map(({ id, icon: Icon, label, cta }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => { if (id === 'messages') navigate('/messages'); else setTab(id); }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 4px', border: 'none', background: 'transparent', cursor: 'pointer', color: cta ? 'white' : active ? 'var(--accent)' : '#94A3B8', transition: 'color .15s' }}>
            {cta
              ? <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(22,163,74,.35)', marginTop: -12 }}>
                  <Icon size={18} color="white" />
                </div>
              : <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  {id === 'messages' && unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -7, background: '#EF4444', color: 'white', fontSize: 9, fontWeight: 800, padding: '0 4px', borderRadius: 999, lineHeight: '14px', minWidth: 14, textAlign: 'center' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
            }
            {!cta && <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

// ── Share Nudge ───────────────────────────────────────────────────
function ShareNudge({ url, heading, sub, platform }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  const wa  = `https://wa.me/?text=${encodeURIComponent(url)}`;
  const tg  = `https://t.me/share/url?url=${encodeURIComponent(url)}`;
  const isTalent = platform === 'talent';
  const accent = isTalent ? '#D97706' : '#0D9488';
  const bg     = isTalent ? 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' : 'linear-gradient(135deg,#F0FDFA,#CCFBF1)';
  const border = isTalent ? '#FDE68A' : '#99F6E4';
  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Share2 size={16} color={accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#1a202c', marginBottom: 1 }}>{heading}</p>
          <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>{sub}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${border}`, background: 'white', fontSize: 12, fontWeight: 700, color: accent, cursor: 'pointer', flexShrink: 0, transition: 'all .15s' }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Copied!' : 'Copy Link'}
        </button>
        <a href={wa} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, background: '#25D366', color: 'white', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
          <MessageSquare size={12}/> WhatsApp
        </a>
        <a href={tg} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, background: '#229ED9', color: 'white', fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
          <Send size={12}/> Telegram
        </a>
      </div>
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,.04)', ...style }}>
      {children}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, isTalent, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(() => location.state?.tab || 'overview');
  const [ads, setAds] = useState([]);
  const [talentProfile, setTalentProfile] = useState(null);
  const [hirerProfile, setHirerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const roleRetryRef = useRef(false);
  const [isRetryingRole, setIsRetryingRole] = useState(false);
  const unreadCount = useUnreadCount();
  const [pitchIntent, setPitchIntent] = useState(null);   // hirer name when pitch is pending
  const [profileFormStep, setProfileFormStep] = useState(0);

  // Pick up any saved pitch intent on mount so the profile form shows the banner
  useEffect(() => {
    const s = intentSummary();
    if (s?.action === 'pitch') setPitchIntent(s.label || 'Hirer');
  }, []);

  // If profile.role is null after auth (race condition or Firestore read hiccup),
  // attempt one silent re-read before showing the error screen.
  useEffect(() => {
    if (profile && !profile.role && user && !roleRetryRef.current) {
      roleRetryRef.current = true;
      setIsRetryingRole(true);
      refreshProfile().finally(() => setIsRetryingRole(false));
    }
  }, [profile, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const name = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'there';
  const uploadedPhotoURL = isTalent ? (talentProfile?.photoURL || null) : (hirerProfile?.photoURL || null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (isTalent) {
          const tp = await getTalentProfile(user.uid).catch(() => null);
          setTalentProfile(tp);
          if (!tp) setTab('profile');
        } else {
          const [a, hp] = await Promise.all([
            getUserAds(user.uid).catch(() => []),
            getHirerProfile(user.uid).catch(() => null),
          ]);
          setAds(a); setHirerProfile(hp);
          if (!hp) setTab('profile');
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [user, isTalent]);

  const show = msg => { setBanner(msg); setTimeout(() => setBanner(''), 5000); };

  const handleDeleteAd = async ad => {
    if (!confirm(`Delete "${ad.title}"?`)) return;
    await deleteAd(ad.id, user.uid).catch(() => {});
    setAds(p => p.filter(a => a.id !== ad.id));
  };

  const handleAdPosted = async () => {
    const a = await getUserAds(user.uid).catch(() => []);
    setAds(a); setTab('ads');
    show('Job ad posted! Talent can now find and contact you.');
  };

  const handleTalentProfileSaved = async () => {
    const tp = await getTalentProfile(user.uid).catch(() => null);
    setTalentProfile(tp);
    await refreshProfile(user.uid);
    setPitchIntent(null);
    const redirected = resolvePostLoginDestination(navigate);
    if (!redirected) {
      setTab('overview');
      show("Profile saved! You're now visible to hirers.");
    }
  };

  const handleHirerProfileSaved = async () => {
    const hp = await getHirerProfile(user.uid).catch(() => null);
    setHirerProfile(hp); await refreshProfile(); setTab('overview');
    show('Profile saved!');
  };

  const totalViews = ads.reduce((s, a) => s + (a.views || 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.contactClicks || 0), 0);
  const activeCount = ads.filter(a => !a.status || a.status === 'active').length;

  // ── ROLE GATE ──────────────────────────────────────────────────────
  // Show a spinner while the one-time role retry is in flight.
  if (isRetryingRole || (!roleRetryRef.current && profile && !profile.role)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#16A34A', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    );
  }

  if (!loading && profile) {
    const r = profile.role;

    if (!r || (r !== 'hirer' && r !== 'talent')) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '40px 32px', maxWidth: 420, width: '100%', textAlign: 'center', border: '1px solid #E2E8F0', boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>
            <div style={{ marginBottom: 16 }}><AlertTriangle size={48} color="#F59E0B" strokeWidth={1.5}/></div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>Registration incomplete</h2>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 28 }}>
              Your account does not have a role assigned. Please complete registration to continue.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/register?role=hirer')} style={{ padding: '11px 20px', borderRadius: 10, border: 'none', background: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Join as Hirer</button>
              <button onClick={() => navigate('/register?role=talent')} style={{ padding: '11px 20px', borderRadius: 10, border: 'none', background: 'var(--green)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Join as Talent</button>
            </div>
            <button onClick={async () => { await logout(); navigate('/login'); }} style={{ marginTop: 16, padding: '9px 18px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      );
    }

    const HIRER_TABS  = ['overview', 'ads', 'post', 'profile', 'settings'];
    const TALENT_TABS = ['overview', 'profile', 'settings'];
    const allowedTabs = r === 'talent' ? TALENT_TABS : HIRER_TABS;

    if (!allowedTabs.includes(tab)) {
      setTimeout(() => setTab('overview'), 0);
    }
  }

  const hirerAccent    = '#0D9488';
  const hirerAccentBg  = '#F0FDFA';
  const hirerAccentBdr = '#99F6E4';

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8FAFC', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif", '--accent': isTalent ? '#16A34A' : hirerAccent }}>

      {/* Desktop sidebar */}
      <Sidebar tab={tab} setTab={setTab} isTalent={isTalent} name={name} photoURL={user?.photoURL} uploadedPhotoURL={uploadedPhotoURL}
        onLogout={async () => { await logout(); navigate('/'); }}
        mobileOpen={mobileNav} onMobileClose={() => setMobileNav(false)}
        unreadCount={unreadCount} />

      {/* Mobile top bar */}
      <div className="mob-topbar" style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 50, background: 'white', borderBottom: '1px solid #F1F5F9', padding: '12px 16px', display: 'none', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: 15, color: '#1a202c', letterSpacing: '-.02em' }}>
            {tab === 'overview' ? `Hey, ${name.split(' ')[0]} 👋` : tab === 'profile' ? 'My Profile' : tab === 'ads' ? 'My Job Ads' : tab === 'post' ? 'Post Job Ad' : 'Settings'}
          </p>
          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{isTalent ? 'Talent' : 'Hirer'} Dashboard</p>
        </div>
        <button onClick={() => setMobileNav(true)} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Menu size={16} color="#64748B" />
        </button>
      </div>

      <main style={{ flex: 1, padding: '28px 24px', minWidth: 0, overflowY: 'auto', paddingBottom: 80 }} className="dash-main">

        {/* Banner */}
        {banner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: isTalent ? '#F0FDF4' : '#F0FDFA', border: `1px solid ${isTalent ? '#BBF7D0' : '#99F6E4'}`, borderRadius: 12, marginBottom: 20, fontSize: 14, color: isTalent ? '#15803D' : '#0F766E', fontWeight: 600, animation: 'fadeIn .3s ease' }}>
            <CheckCircle size={16} color={isTalent ? '#16A34A' : '#0D9488'} style={{ flexShrink: 0 }} /> {banner}
          </div>
        )}

        {/* ── Talent Overview ── */}
        {isTalent && tab === 'overview' && (
          <>
            <div className="desk-greeting" style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a202c', letterSpacing: '-.04em', marginBottom: 4 }}>Hey, {name.split(' ')[0]}</h1>
              <p style={{ color: '#64748B', fontSize: 14 }}>Your talent profile at a glance.</p>
            </div>

            {/* Profile completion nudge */}
            {!talentProfile && !loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)', border: '1.5px solid #FDE68A', borderRadius: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={18} color="#D97706" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 2 }}>Create your profile to get hired</p>
                  <p style={{ fontSize: 12, color: '#B45309', lineHeight: 1.5 }}>Hirers can't find you until you create one. Takes 2 minutes.</p>
                </div>
                <button onClick={() => setTab('profile')} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#D97706', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Create Profile →
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} className="stat-grid">
              <StatCard icon={Eye} label="Profile Views" value={loading ? '…' : talentProfile?.views || 0} color="#0D9488" bg="#F0FDFA" />
              <StatCard icon={Phone} label="Contacts" value={loading ? '…' : talentProfile?.contactClicks || 0} color="#F59E0B" bg="#FFFBEB" />
              <StatCard icon={CheckCircle} label="Available" value={talentProfile?.available !== false ? 'Yes' : 'No'} color="#16A34A" bg="#F0FDF4" />
            </div>

            {talentProfile && (
              <ShareNudge
                platform="talent"
                url={`${window.location.origin}/talent/${user.uid}`}
                heading="Share your profile — get hired faster"
                sub="Send your profile link to potential clients via WhatsApp, Telegram, or copy it."
              />
            )}

            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a202c', letterSpacing: '-.02em' }}>Your Public Profile</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {talentProfile && (
                    <Link to={`/talent/${user.uid}`} style={{ fontSize: 13, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #E2E8F0', borderRadius: 9, background: 'white', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      <Eye size={12} /> Preview
                    </Link>
                  )}
                  <button onClick={() => setTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <Edit3 size={12} /> {talentProfile ? 'Edit' : 'Create Profile'}
                  </button>
                </div>
              </div>

              {talentProfile ? (
                <>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14, padding: '14px', background: '#F8FAFC', borderRadius: 12 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', flexShrink: 0, border: '2px solid white', boxShadow: '0 0 0 2px #E2E8F0' }}>
                      {(talentProfile.photoURL || talentProfile.googlePhotoURL)
                        ? <img src={talentProfile.photoURL || talentProfile.googlePhotoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#94A3B8" /></div>
                      }
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#1a202c', marginBottom: 3 }}>{talentProfile.title}</p>
                      <p style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>{talentProfile.category}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{talentProfile.location}</span>
                        {talentProfile.rate && <span style={{ color: '#16A34A', fontWeight: 700 }}>{talentProfile.currency || 'KES'} {Number(talentProfile.rate).toLocaleString('en-KE') || talentProfile.rate}/{talentProfile.rateType || 'hr'}</span>}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 14 }}>{talentProfile.bio?.slice(0, 200)}{talentProfile.bio?.length > 200 ? '…' : ''}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {talentProfile.skills?.slice(0, 6).map(s => <span key={s} style={{ fontSize: 11, background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>{s}</span>)}
                    {(talentProfile.skills?.length || 0) > 6 && <span style={{ fontSize: 11, color: '#94A3B8', padding: '4px 10px' }}>+{talentProfile.skills.length - 6} more</span>}
                  </div>
                  {(talentProfile.portfolioUrl || talentProfile.cvUrl || talentProfile.linkedinUrl) && (
                    <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
                      {talentProfile.portfolioUrl && <a href={talentProfile.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#16A34A', background: '#F0FDF4', padding: '6px 12px', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}><Globe size={11} /> Portfolio</a>}
                      {talentProfile.linkedinUrl && <a href={talentProfile.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#0A66C2', background: '#EFF6FF', padding: '6px 12px', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}><LinkIcon size={11} /> LinkedIn</a>}
                      {talentProfile.cvUrl && <a href={talentProfile.cvUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569', background: '#F1F5F9', padding: '6px 12px', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}><FileDown size={11} /> CV</a>}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><User size={24} color="#CBD5E1" /></div>
                  <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 16 }}>No profile yet. Hirers can't find you.</p>
                  <button onClick={() => setTab('profile')} style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Create Profile — 2 mins →</button>
                </div>
              )}
            </Card>

            <Card>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1a202c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Quick Actions</h4>
              <QuickBtn icon={Search} label="Browse Job Ads" desc="Find gigs posted by hirers" onClick={() => navigate('/browse')} />
              <QuickBtn icon={User} label="View All Talent" desc="See how other profiles look" onClick={() => navigate('/talent')} />
            </Card>
          </>
        )}

        {/* ── Talent Profile ── */}
        {isTalent && tab === 'profile' && (
          <>
            <div className="desk-greeting" style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', letterSpacing: '-.03em' }}>My Profile</h1>
            </div>
            {pitchIntent && (
              <IntentBanner type="pitch" label={pitchIntent} step={profileFormStep} total={3} />
            )}
            <TalentProfileForm uid={user.uid} existing={talentProfile} displayName={name} userPhotoURL={user?.photoURL} onSuccess={handleTalentProfileSaved} onStepChange={setProfileFormStep} />
          </>
        )}

        {/* ── Hirer Overview ── */}
        {!isTalent && tab === 'overview' && (
          <>
            <div className="desk-greeting" style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a202c', letterSpacing: '-.04em', marginBottom: 4 }}>Hey, {name.split(' ')[0]}</h1>
              <p style={{ color: '#64748B', fontSize: 14 }}>Your hiring activity.</p>
            </div>

            {!hirerProfile && !loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)', border: '1.5px solid #FDE68A', borderRadius: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} color="#D97706" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 2 }}>Complete your profile</p>
                  <p style={{ fontSize: 12, color: '#B45309', lineHeight: 1.5 }}>Talent are more likely to respond when they know who's hiring.</p>
                </div>
                <button onClick={() => setTab('profile')} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#D97706', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Set Up →
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} className="stat-grid">
              <StatCard icon={Briefcase} label="Active Ads" value={loading ? '…' : activeCount} color="#0D9488" bg="#F0FDFA" />
              <StatCard icon={Eye} label="Total Views" value={loading ? '…' : totalViews} color="#F59E0B" bg="#FFFBEB" />
              <StatCard icon={Phone} label="Contacts" value={loading ? '…' : totalClicks} color="#16A34A" bg="#F0FDF4" />
            </div>

            {hirerProfile && (
              <Card style={{ marginBottom: 14, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#F1F5F9', overflow: 'hidden', flexShrink: 0, border: '2px solid white', boxShadow: '0 0 0 2px #E2E8F0' }}>
                    {(hirerProfile.photoURL || hirerProfile.googlePhotoURL)
                      ? <img src={hirerProfile.photoURL || hirerProfile.googlePhotoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#94A3B8" /></div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#1a202c', marginBottom: 2 }}>{hirerProfile.name}</p>
                    <p style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>{hirerProfile.isCompany && hirerProfile.companyName ? hirerProfile.companyName : 'Individual hirer'}</span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{hirerProfile.location}</span>
                    </p>
                    {hirerProfile.isCompany && hirerProfile.companyIndustry && (
                      <span style={{ fontSize: 11, background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 20, fontWeight: 600, marginTop: 5, display: 'inline-block' }}>{hirerProfile.companyIndustry}</span>
                    )}
                  </div>
                  <button onClick={() => setTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #E2E8F0', borderRadius: 9, background: 'white', fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    <Edit3 size={11} /> Edit
                  </button>
                </div>
              </Card>
            )}

            {ads.length > 0 && (
              <ShareNudge
                platform="hirer"
                url={`${window.location.origin}/ad/${ads[0].id}`}
                heading="Share your job ad — reach more talent"
                sub={`Share "${ads[0].title}" and attract qualified freelancers directly.`}
              />
            )}

            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a202c', letterSpacing: '-.02em' }}>Recent Job Ads</h3>
                <button onClick={() => setTab('post')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <Plus size={13} /> Post New Ad
                </button>
              </div>
              {loading
                ? [1, 2].map(i => <div key={i} style={{ height: 56, background: '#F8FAFC', borderRadius: 10, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />)
                : ads.length === 0
                  ? <div style={{ textAlign: 'center', padding: '36px 0' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Briefcase size={22} color="#CBD5E1" /></div>
                      <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 16 }}>No job ads yet.</p>
                      <button onClick={() => setTab('post')} style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Post Your First Ad →</button>
                    </div>
                  : ads.slice(0, 5).map(ad => <AdRow key={ad.id} ad={ad} onDelete={handleDeleteAd} navigate={navigate} />)
              }
            </Card>

            <Card>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1a202c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Quick Actions</h4>
              <QuickBtn icon={Search} label="Browse Talent" desc="Find and contact Kenya's best freelancers" onClick={() => navigate('/talent')} />
              <QuickBtn icon={Briefcase} label="Browse Job Ads" desc="See what others are posting" onClick={() => navigate('/browse')} />
            </Card>
          </>
        )}

        {/* ── Hirer Profile ── */}
        {!isTalent && tab === 'profile' && (
          <>
            <div className="desk-greeting" style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', letterSpacing: '-.03em' }}>My Profile</h1>
            </div>
            <HirerProfileForm uid={user.uid} existing={hirerProfile} displayName={name} userPhotoURL={user?.photoURL} onSuccess={handleHirerProfileSaved} />
          </>
        )}

        {/* ── Hirer Ads Tab ── */}
        {!isTalent && tab === 'ads' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', letterSpacing: '-.03em' }}>My Job Ads <span style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8' }}>({ads.length})</span></h1>
              <button onClick={() => setTab('post')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <Plus size={14} /> New Ad
              </button>
            </div>
            <Card>
              {loading
                ? [1, 2, 3].map(i => <div key={i} style={{ height: 56, background: '#F8FAFC', borderRadius: 10, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />)
                : ads.length === 0
                  ? <div style={{ textAlign: 'center', padding: '52px 0' }}>
                      <p style={{ color: '#94A3B8', marginBottom: 16, fontSize: 14 }}>No ads yet.</p>
                      <button onClick={() => setTab('post')} style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Post Free Ad →</button>
                    </div>
                  : ads.map(ad => <AdRow key={ad.id} ad={ad} onDelete={handleDeleteAd} navigate={navigate} />)
              }
            </Card>
          </>
        )}

        {/* ── Post Ad ── */}
        {!isTalent && tab === 'post' && (
          <PostAdForm uid={user.uid} posterName={hirerProfile?.companyName || name} posterLogo={hirerProfile?.companyLogoURL} onSuccess={handleAdPosted} />
        )}

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <div style={{ maxWidth: 520 }}>
            <div className="desk-greeting" style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', letterSpacing: '-.03em' }}>Settings</h1>
            </div>
            <Card style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Account Details</p>
              {[
                { l: 'Name', v: profile?.displayName || user?.displayName || '—' },
                { l: 'Email', v: user?.email || '—' },
                { l: 'Role', v: isTalent ? 'Talent / Freelancer' : 'Hirer / Client' },
                { l: 'Joined', v: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-KE', { year: 'numeric', month: 'long' }) : '—' },
              ].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #F8FAFC', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#64748B', flexShrink: 0 }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a202c', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
            </Card>
            <div style={{ padding: '14px 18px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9', fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
              Want to switch roles? Email <strong style={{ color: '#1a202c' }}>info@gigs254.com</strong> and we'll update your account.
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav tab={tab} setTab={setTab} isTalent={isTalent} navigate={navigate} unreadCount={unreadCount} />

      <style>{`
        :root { --accent: #16A34A; }

        /* Desktop sidebar shown, mobile hidden */
        .desk-sidebar { display: block; }
        .mob-topbar { display: none !important; }
        .mob-bottom-nav { display: none !important; }
        .stat-grid { grid-template-columns: repeat(3, 1fr); }

        @media (max-width: 860px) {
          .desk-sidebar { display: none !important; }
          .mob-topbar { display: flex !important; }
          .mob-bottom-nav { display: flex !important; }
          .desk-greeting { display: none; }
          .dash-main {
            padding: 80px 16px 100px !important;
          }
        }

        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }

        @media (max-width: 360px) {
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
}