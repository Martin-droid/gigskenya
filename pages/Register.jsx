import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Zap, ChevronRight,
         Briefcase, UserCheck, Phone, ArrowLeft, Star, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Register.css';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ERR = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password':        'Password must be at least 6 characters.',
  'auth/invalid-email':        'Please enter a valid email address.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/network-request-failed':'Check your internet connection.',
};

const ROLE_LABEL = { hirer: 'Hirer / Client', talent: 'Talent / Freelancer' };

function Spinner() {
  return <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin .6s linear infinite', display:'inline-block', flexShrink:0 }} />;
}

// ── Role Picker ───────────────────────────────────────────────────
function RolePicker({ onSelect }) {
  const [hov, setHov] = useState(null);

  const roles = [
    {
      id:       'hirer',
      icon:     Building2,
      badge:    'FOR BUSINESSES & INDIVIDUALS',
      title:    'I want to hire',
      sub:      "Post jobs, browse profiles and connect with Kenya's best freelancers — directly.",
      bullets:  [
        'Post a free job ad in minutes',
        'Browse and contact talent directly',
        'No agency fees or middlemen',
      ],
      bg:     'linear-gradient(145deg, #042F2E 0%, #134E4A 100%)',
      accent: '#2DD4BF',
      btn:    '#0D9488',
      btnHov: '#0F766E',
      glow:   'rgba(13,148,136,.35)',
      tag:    { bg:'rgba(45,212,191,.12)', color:'#5EEAD4' },
    },
    {
      id:       'talent',
      icon:     Star,
      badge:    'FOR FREELANCERS & PROFESSIONALS',
      title:    "I'm looking for work",
      sub:      'Create a profile, showcase your skills and get hired by businesses across Kenya.',
      bullets:  [
        'Set your own rates and get paid directly',
        'Set your own rates and availability',
        'Get contacted directly, no middleman',
      ],
      bg:     'linear-gradient(145deg, #052E16 0%, #14532D 100%)',
      accent: '#4ADE80',
      btn:    '#16A34A',
      btnHov: '#15803D',
      glow:   'rgba(34,197,94,.35)',
      tag:    { bg:'rgba(74,222,128,.12)', color:'#86EFAC' },
    },
  ];

  return (
    <div style={{ paddingTop:64, minHeight:'100vh', background:'#0A0A0A', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 16px 40px', fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', marginBottom:40 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'#16A34A', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Zap size={17} color="white" fill="white" />
        </div>
        <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:18, color:'white', letterSpacing:'-.02em' }}>Gigs254</span>
      </Link>

      <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:14 }}>Create a free account</p>
      <h1 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'clamp(22px,4vw,32px)', fontWeight:900, color:'white', letterSpacing:'-.03em', marginBottom:8, textAlign:'center' }}>
        Who are you joining as?
      </h1>
      <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', marginBottom:36, textAlign:'center', maxWidth:400 }}>
        Choose carefully — your account type cannot be changed after sign-up.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16, width:'100%', maxWidth:760 }}>
        {roles.map(({ id, icon: Icon, badge, title, sub, bullets, bg, accent, btn, btnHov, glow, tag }) => (
          <button key={id} onClick={() => onSelect(id)}
            onMouseEnter={() => setHov(id)} onMouseLeave={() => setHov(null)}
            style={{ background:bg, borderRadius:20, padding:'32px 28px', border:`1.5px solid ${hov===id ? accent+'66' : 'rgba(255,255,255,.08)'}`, cursor:'pointer', textAlign:'left', transition:'all .2s', boxShadow:hov===id ? `0 20px 60px ${glow}` : '0 4px 24px rgba(0,0,0,.4)', transform:hov===id ? 'translateY(-4px)' : 'none' }}>

            <span style={{ display:'inline-block', fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:999, background:tag.bg, color:tag.color, letterSpacing:'.06em', marginBottom:20 }}>
              {badge}
            </span>

            <div style={{ width:56, height:56, borderRadius:16, background:`${accent}22`, border:`1.5px solid ${accent}33`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
              <Icon size={26} color={accent} strokeWidth={1.8} />
            </div>

            <p style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:22, fontWeight:900, color:'white', letterSpacing:'-.03em', marginBottom:8, lineHeight:1.2 }}>{title}</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.65, marginBottom:22 }}>{sub}</p>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28, paddingBottom:24, borderBottom:'1px solid rgba(255,255,255,.07)' }}>
              {bullets.map((b, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:`${accent}22`, border:`1px solid ${accent}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ color:accent, fontSize:10, lineHeight:1 }}>✓</span>
                  </div>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>{b}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, background:hov===id ? btnHov : btn, color:'white', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:14, transition:'background .18s', boxShadow:hov===id ? `0 8px 24px ${glow}` : 'none' }}>
              Join as {id === 'hirer' ? 'a Hirer' : 'Talent'} <ChevronRight size={15} />
            </div>
          </button>
        ))}
      </div>

      <p style={{ marginTop:28, fontSize:13, color:'rgba(255,255,255,.3)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color:'#4ADE80', fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
      </p>
    </div>
  );
}

// ── Registration Form ─────────────────────────────────────────────
export default function Register() {
  const [sp] = useSearchParams();
  const initialRole = sp.get('role') === 'talent' ? 'talent' : sp.get('role') === 'hirer' ? 'hirer' : null;

  const [step, setStep]               = useState(initialRole ? 1 : 0);
  const [role, setRole]               = useState(initialRole || 'hirer');
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [pw, setPw]                   = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [show, setShow]               = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [gLoading, setGLoading]       = useState(false);
  const [err, setErr]                 = useState('');
  const [agreed, setAgreed]           = useState(false);

  const { signUpEmail, signInGoogle, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const isHirer   = role === 'hirer';
  const accent    = isHirer ? '#0D9488' : '#16A34A';
  const accentBg  = isHirer ? '#F0FDFA' : '#F0FDF4';
  const accentBdr = isHirer ? '#99F6E4' : '#BBF7D0';

  const checkRoleConflict = async (uid) => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const existing = snap.data().role;
    if (existing && existing !== role) return existing;
    return null;
  };

  // Single source of truth for /users/{uid} during registration.
  // Writes the role from this component's state — never a default.
  // saveUserProfile → refreshProfile → goToDashboard is the guaranteed
  // sequence that ensures context has the correct role before the
  // Dashboard mounts and runs its role gate check.
  const saveUserProfile = async (user, displayName) => {
    const ref  = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().role) return;
    await setDoc(ref, {
      uid:           user.uid,
      role,
      name:          displayName || user.displayName || name || '',
      email:         user.email,
      phone:         phone || null,
      photoURL:      user.photoURL || null,
      createdAt:     serverTimestamp(),
      termsAgreed:   true,
      termsAgreedAt: serverTimestamp(),
      termsVersion:  '2026-05-08',
    });
  };

  const goToDashboard = () => navigate('/dashboard', { replace: true });

  const handleGoogle = async () => {
    if (!agreed) { setErr('Please accept the Terms & Conditions to continue.'); return; }
    setErr('');
    setGLoading(true);
    try {
      const { user } = await signInGoogle();
      const conflict = await checkRoleConflict(user.uid);
      if (conflict) {
        await logout();
        setErr(`This Google account is already registered as a ${ROLE_LABEL[conflict]}. Please log in instead.`);
        setGLoading(false);
        return;
      }
      await saveUserProfile(user);
      // Pass user.uid explicitly — the refreshProfile closure captured from
      // context still has user=null because Register hasn't re-rendered since
      // onAuthStateChanged fired. The uid override bypasses that stale closure.
      await refreshProfile(user.uid);
      goToDashboard();
    } catch (e) {
      if (e.code) setErr(ERR[e.code] || 'Google sign-in failed. Try again.');
      else { console.error(e); setErr('Something went wrong completing setup. Please try again.'); }
    } finally { setGLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed)          { setErr('Please accept the Terms & Conditions to continue.'); return; }
    if (pw !== confirmPw) { setErr('Passwords do not match.'); return; }
    if (pw.length < 6)    { setErr('Password must be at least 6 characters.'); return; }
    setErr('');
    setLoading(true);
    try {
      const { user } = await signUpEmail(email, pw, name);
      await saveUserProfile(user, name);
      // Pass user.uid explicitly — same stale closure reason as in handleGoogle.
      await refreshProfile(user.uid);
      goToDashboard();
    } catch (e) {
      if (e.code) setErr(ERR[e.code] || 'Sign-up failed. Try again.');
      else { console.error(e); setErr('Something went wrong. Please try again.'); }
    } finally { setLoading(false); }
  };

  // ── Step 0: Role picker ──
  if (step === 0) {
    return <RolePicker onSelect={(r) => { setRole(r); setStep(1); }} />;
  }

  // ── Step 1: Form ──
  return (
    <div className="register-container">

      {/* Left panel */}
      <div className="register-auth-panel" style={{ background: isHirer ? 'linear-gradient(160deg, #042F2E 0%, #134E4A 100%)' : 'linear-gradient(160deg, #052E16 0%, #14532D 100%)' }}>
        <div className="register-auth-panel-grid" style={{ backgroundImage:`radial-gradient(circle, ${isHirer ? 'rgba(129,140,248,.13)' : 'rgba(0,165,80,.13)'} 1px, transparent 1px)` }} />
        <div className="register-auth-panel-blob" style={{ background:`radial-gradient(circle, ${isHirer ? 'rgba(99,102,241,.15)' : 'rgba(0,165,80,.12)'} 0%, transparent 70%)` }} />

        <div className="register-auth-panel-content">
          <Link to="/" className="register-logo">
            <div className="register-logo-icon" style={{ background:accent }}>
              <Zap size={17} color="white" fill="white" />
            </div>
            <span className="register-logo-text">Gigs254</span>
          </Link>

          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:999, background:isHirer ? 'rgba(129,140,248,.2)' : 'rgba(74,222,128,.15)', marginBottom:20 }}>
            {isHirer ? <Building2 size={13} color="#5EEAD4" /> : <Star size={13} color="#86EFAC" />}
            <span style={{ fontSize:11, fontWeight:700, color:isHirer ? '#5EEAD4' : '#86EFAC', letterSpacing:'.06em', textTransform:'uppercase' }}>
              {isHirer ? 'Hirer Account' : 'Talent Account'}
            </span>
          </div>

          <h2 className="register-auth-headline" style={{ color:'white' }}>
            {isHirer
              ? <>Find the right person<br /><em style={{ color:'#5EEAD4' }}>for the job.</em></>
              : <>Put your skills<br /><em style={{ color:'#4ADE80' }}>to work.</em></>}
          </h2>

          <p className="register-auth-body-text">
            {isHirer
              ? 'Post what you need, browse freelancer profiles, and reach out directly — no agency fees, no middlemen.'
              : 'Build a profile, list your services, and let businesses across Kenya find and contact you — on your terms.'}
          </p>

          <div className="register-auth-divider" style={{ background:isHirer ? 'rgba(129,140,248,.25)' : 'rgba(74,222,128,.25)' }} />

          {(isHirer
            ? ['Free to post a job ad and browse profiles', 'Contact talent directly via phone or WhatsApp', 'No agency fees or middlemen']
            : ['Free to create a profile and get discovered', 'You set your own rates and availability', 'Direct contact from hirers, no middleman']
          ).map((t, i) => (
            <div key={i} className="register-bullet-item">
              <div className="register-bullet-circle" style={{ background:isHirer ? 'rgba(129,140,248,.2)' : 'rgba(74,222,128,.15)', border:`1px solid ${isHirer ? 'rgba(129,140,248,.4)' : 'rgba(74,222,128,.4)'}` }}>
                <span className="register-bullet-check" style={{ color:isHirer ? '#5EEAD4' : '#4ADE80' }}>✓</span>
              </div>
              <span className="register-bullet-text">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="register-form-section">
        <div className="register-form-wrapper">

          {/* Role badge + back */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:999, background:accentBg, border:`1.5px solid ${accentBdr}` }}>
              {isHirer ? <Building2 size={13} color={accent} /> : <Star size={13} color={accent} />}
              <span style={{ fontSize:12, fontWeight:700, color:accent }}>
                {isHirer ? 'Hirer Account' : 'Talent Account'}
              </span>
            </div>
            <button type="button" onClick={() => { setErr(''); setStep(0); }}
              style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#64748B', background:'none', border:'none', cursor:'pointer', fontWeight:600, padding:'6px 10px', borderRadius:8, transition:'all .15s' }}
              onMouseOver={e => e.currentTarget.style.color = '#1a202c'}
              onMouseOut={e  => e.currentTarget.style.color = '#64748B'}>
              <ArrowLeft size={13} /> Change role
            </button>
          </div>

          <h1 className="register-welcome-header">Create your account</h1>
          <p className="register-welcome-subtext">Free to create your profile. No credit card needed.</p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={gLoading} className="register-google-button">
            {gLoading ? <Spinner /> : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {gLoading ? 'Signing in…' : `Continue with Google as ${isHirer ? 'Hirer' : 'Talent'}`}
          </button>

          <div className="register-signin-divider">
            <div className="register-divider-line" />
            <span className="register-divider-text">or register with email</span>
            <div className="register-divider-line" />
          </div>

          {err && (
            <div className="register-error-box">
              <AlertCircle size={15} color="var(--red)" className="register-error-icon" />
              <span className="register-error-text">{err}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="register-form-group">
              <label className="register-form-label">Full Name</label>
              <div className="input-wrap">
                <User size={14} className="icon" />
                <input className="input" required type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label">Email address</label>
              <div className="input-wrap">
                <Mail size={14} className="icon" />
                <input className="input" required type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label">Phone / WhatsApp <span>(optional)</span></label>
              <div className="input-wrap">
                <Phone size={14} className="icon" />
                <input className="input" type="tel" placeholder="+254 712 345 678" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
              </div>
            </div>

            <div className="register-form-group">
              <label className="register-form-label">Password</label>
              <div className="input-wrap">
                <Lock size={14} className="icon" />
                <input className="input" required type={show ? 'text' : 'password'} placeholder="Min. 6 characters" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" style={{ paddingRight:40 }} />
                <button type="button" onClick={() => setShow(!show)} className="register-password-toggle">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="register-form-group large">
              <label className="register-form-label">Confirm Password</label>
              <div className="input-wrap">
                <Lock size={14} className="icon" />
                <input className="input" required type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" style={{ paddingRight:40 }} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="register-password-toggle">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* T&C checkbox */}
            <label style={{ display:'flex', alignItems:'flex-start', gap:10, margin:'16px 0 20px', cursor:'pointer', userSelect:'none' }}>
              <div onClick={() => { setAgreed(v => !v); setErr(''); }}
                style={{ width:20, height:20, borderRadius:5, border:`2px solid ${agreed ? accent : '#CBD5E1'}`, background:agreed ? accent : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, transition:'all .15s', cursor:'pointer' }}>
                {agreed && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>
                I have read and agree to Gigs254's{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color:accent, fontWeight:700, textDecoration:'none' }}>Terms &amp; Conditions</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color:accent, fontWeight:700, textDecoration:'none' }}>Privacy Policy</a>.
                {' '}<span style={{ color:'#EF4444', fontWeight:700 }}>*</span>
              </span>
            </label>

            <button type="submit" disabled={loading}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:11, border:'none', background:accent, color:'white', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15, fontWeight:700, cursor:loading ? 'not-allowed' : 'pointer', opacity:loading ? .7 : 1, transition:'all .15s' }}>
              {loading ? <Spinner /> : <><ChevronRight size={16} />Create {isHirer ? 'Hirer' : 'Talent'} Account</>}
            </button>
          </form>

          <p className="register-signin-prompt">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className="register-signin-link" style={{ color:accent }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}