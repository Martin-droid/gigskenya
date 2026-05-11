import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Zap, ArrowRight,
         ArrowLeft, Building2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { resolvePostLoginDestination } from '../lib/authGuard';
import './Login.css';

const ERR = {
  'auth/user-not-found':        'No account found with this email.',
  'auth/wrong-password':        'Wrong password. Try again.',
  'auth/invalid-credential':    'Invalid email or password.',
  'auth/too-many-requests':     'Too many attempts. Please try later.',
  'auth/popup-closed-by-user':  'Google sign-in was cancelled.',
  'auth/network-request-failed':'Check your internet connection.',
};

const ROLE_LABELS = { hirer: 'Hirer', talent: 'Talent' };

function Spinner() {
  return <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin .6s linear infinite', display:'inline-block', flexShrink:0 }} />;
}

// ── Role Picker ───────────────────────────────────────────────────
function RolePicker({ onSelect }) {
  const [hov, setHov] = useState(null);

  const roles = [
    {
      id:      'hirer',
      icon:    Building2,
      badge:   'FOR BUSINESSES & INDIVIDUALS',
      title:   'Sign in as a Hirer',
      sub:     'Access your job ads, view applicants and manage your hiring activity.',
      bullets: ['Manage job ads & listings', 'Browse talent profiles', 'Direct contact with freelancers'],
      bg:      'linear-gradient(145deg, #042F2E 0%, #134E4A 100%)',
      accent:  '#2DD4BF',
      btn:     '#0D9488',
      btnHov:  '#0F766E',
      glow:    'rgba(13,148,136,.35)',
      tag:     { bg:'rgba(45,212,191,.12)', color:'#5EEAD4' },
    },
    {
      id:      'talent',
      icon:    Star,
      badge:   'FOR FREELANCERS & PROFESSIONALS',
      title:   'Sign in as Talent',
      sub:     'Access your profile, manage availability and connect with hirers looking for your skills.',
      bullets: ['Manage your talent profile', 'View profile stats & contacts', 'Respond to hirers directly'],
      bg:      'linear-gradient(145deg, #052E16 0%, #14532D 100%)',
      accent:  '#4ADE80',
      btn:     '#16A34A',
      btnHov:  '#15803D',
      glow:    'rgba(34,197,94,.35)',
      tag:     { bg:'rgba(74,222,128,.12)', color:'#86EFAC' },
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

      <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:14 }}>Welcome back</p>
      <h1 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'clamp(22px,4vw,32px)', fontWeight:900, color:'white', letterSpacing:'-.03em', marginBottom:8, textAlign:'center' }}>
        How are you using Gigs254?
      </h1>
      <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', marginBottom:36, textAlign:'center', maxWidth:420 }}>
        Select the account type you registered with. You'll be blocked if you pick the wrong one.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16, width:'100%', maxWidth:760 }}>
        {roles.map(({ id, icon: Icon, badge, title, sub, bullets, bg, accent, btn, btnHov, glow, tag }) => (
          <button key={id} onClick={() => onSelect(id)}
            onMouseEnter={() => setHov(id)} onMouseLeave={() => setHov(null)}
            style={{ background: bg, borderRadius:20, padding:'32px 28px', border:`1.5px solid ${hov===id ? accent+'66' : 'rgba(255,255,255,.08)'}`, cursor:'pointer', textAlign:'left', transition:'all .2s', boxShadow: hov===id ? `0 20px 60px ${glow}` : '0 4px 24px rgba(0,0,0,.4)', transform: hov===id ? 'translateY(-4px)' : 'none' }}>

            <span style={{ display:'inline-block', fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:999, background:tag.bg, color:tag.color, letterSpacing:'.06em', marginBottom:20 }}>
              {badge}
            </span>

            <div style={{ width:56, height:56, borderRadius:16, background:`${accent}22`, border:`1.5px solid ${accent}33`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
              <Icon size={26} color={accent} strokeWidth={1.8} />
            </div>

            <p style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:22, fontWeight:900, color:'white', letterSpacing:'-.03em', marginBottom:8, lineHeight:1.2 }}>{title}</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', lineHeight:1.65, marginBottom:22 }}>{sub}</p>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28, paddingBottom:24, borderBottom:`1px solid rgba(255,255,255,.07)` }}>
              {bullets.map((b, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:`${accent}22`, border:`1px solid ${accent}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ color:accent, fontSize:10, lineHeight:1 }}>✓</span>
                  </div>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>{b}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, background: hov===id ? btnHov : btn, color:'white', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:14, transition:'background .18s', boxShadow: hov===id ? `0 8px 24px ${glow}` : 'none' }}>
              Sign in as {id === 'hirer' ? 'Hirer' : 'Talent'} <ArrowRight size={15} />
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop:32, width:'100%', maxWidth:760 }}>
        <div style={{ height:1, background:'rgba(255,255,255,.08)', marginBottom:28 }}/>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.45)', fontWeight:500 }}>New to Gigs254?</p>
          <Link to="/register"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, width:'100%', maxWidth:480, padding:'15px 24px', borderRadius:14, background:'linear-gradient(135deg,var(--green),#00C060)', color:'white', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:15, textDecoration:'none', letterSpacing:'-.01em', boxShadow:'0 8px 28px rgba(0,165,80,.35)', transition:'opacity .15s' }}
            onMouseOver={e => e.currentTarget.style.opacity='.9'}
            onMouseOut={e => e.currentTarget.style.opacity='1'}>
            Create a free account <ArrowRight size={16}/>
          </Link>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.2)' }}>Free to create your profile · No credit card needed</p>
        </div>
      </div>
    </div>
  );
}

// ── Login Form ────────────────────────────────────────────────────
export default function Login() {
  const [sp] = useSearchParams();
  const initialRole = sp.get('role') === 'talent' ? 'talent' : sp.get('role') === 'hirer' ? 'hirer' : null;

  const [step, setStep]         = useState(initialRole ? 1 : 0);
  const [role, setRole]         = useState(initialRole || 'hirer');
  const [email, setEmail]       = useState('');
  const [pw, setPw]             = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [err, setErr]           = useState('');

  const { signInEmail, signInGoogle } = useAuth();
  const navigate = useNavigate();

  const isHirer   = role === 'hirer';
  const accent    = isHirer ? '#0D9488' : '#16A34A';
  const accentBg  = isHirer ? '#F0FDFA' : '#F0FDF4';
  const accentBdr = isHirer ? '#99F6E4' : '#BBF7D0';
  const panelBg   = isHirer ? 'linear-gradient(160deg, #042F2E 0%, #134E4A 100%)' : 'linear-gradient(160deg, #052E16 0%, #14532D 100%)';

  const go = async (user) => {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists() || !snap.data()?.role) {
        await signOut(auth);
        setErr('This account has no registered role. Please sign up to complete registration.');
        return;
      }
      const storedRole = snap.data().role;
      if (storedRole !== role) {
        await signOut(auth);
        setErr(`This is a ${ROLE_LABELS[storedRole]} account. Go back and select "${ROLE_LABELS[storedRole]}" to sign in.`);
        return;
      }
    } catch {
      await signOut(auth);
      setErr('Could not verify your account. Check your connection and try again.');
      return;
    }
    resolvePostLoginDestination(navigate, '/dashboard');
  };

  const handleGoogle = async () => {
    setErr('');
    setGLoading(true);
    try {
      const { user } = await signInGoogle(role);
      await go(user);
    } catch (e) {
      if (e.code) setErr(ERR[e.code] || 'Google sign-in failed. Try again.');
      else { console.error(e); resolvePostLoginDestination(navigate, '/dashboard'); }
    } finally { setGLoading(false); }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { user } = await signInEmail(email, pw);
      await go(user);
    } catch (e) {
      if (e.code) setErr(ERR[e.code] || 'Sign-in failed. Try again.');
      else { console.error(e); resolvePostLoginDestination(navigate, '/dashboard'); }
    } finally { setLoading(false); }
  };

  // ── Step 0: Role picker ──
  if (step === 0) {
    return <RolePicker onSelect={(r) => { setRole(r); setStep(1); }} />;
  }

  // ── Step 1: Login form ──
  return (
    <div className="login-container">

      {/* Left panel */}
      <div className="auth-panel" style={{ background: panelBg }}>
        <div className="auth-panel-grid" style={{ backgroundImage:`radial-gradient(circle, ${isHirer ? 'rgba(129,140,248,.13)' : 'rgba(0,165,80,.13)'} 1px, transparent 1px)` }} />
        <div className="auth-panel-blob" style={{ background:`radial-gradient(circle, ${isHirer ? 'rgba(99,102,241,.15)' : 'rgba(0,165,80,.12)'} 0%, transparent 70%)` }} />

        <div className="auth-panel-content">
          <Link to="/" className="login-logo">
            <div className="logo-icon" style={{ background: accent }}>
              <Zap size={17} color="white" fill="white" />
            </div>
            <span className="logo-text">Gigs254</span>
          </Link>

          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:999, background: isHirer ? 'rgba(129,140,248,.2)' : 'rgba(74,222,128,.15)', marginBottom:20 }}>
            {isHirer ? <Building2 size={13} color="#5EEAD4" /> : <Star size={13} color="#86EFAC" />}
            <span style={{ fontSize:11, fontWeight:700, color: isHirer ? '#5EEAD4' : '#86EFAC', letterSpacing:'.06em', textTransform:'uppercase' }}>
              {isHirer ? 'Hirer Account' : 'Talent Account'}
            </span>
          </div>

          <h2 className="auth-headline">
            {isHirer
              ? <><span>Hire Kenyan talent,</span><br /><em style={{ color:'#5EEAD4', fontStyle:'italic' }}>your way.</em></>
              : <><span>Get your skills</span><br /><em style={{ color:'#4ADE80', fontStyle:'italic' }}>in front of hirers.</em></>}
          </h2>

          <p className="auth-body-text">
            {isHirer
              ? 'Browse freelancer profiles, post job ads, and reach out directly — no agency, no middleman.'
              : 'Create a profile, list what you offer, and let Kenyan businesses find and contact you directly.'}
          </p>

          <div className="auth-divider" style={{ background: isHirer ? 'rgba(129,140,248,.25)' : 'rgba(74,222,128,.25)' }} />

          {(isHirer
            ? ['Free to post a job ad and browse profiles', 'Contact talent directly via phone or WhatsApp', 'No agency fees or middlemen']
            : ['Free to create a profile and get discovered', 'Set your own rates and availability', 'Get contacted directly, no middleman']
          ).map((t, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background: isHirer ? 'rgba(129,140,248,.2)' : 'rgba(0,165,80,.2)', border:`1px solid ${isHirer ? 'rgba(129,140,248,.5)' : 'rgba(0,165,80,.5)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color: isHirer ? '#5EEAD4' : 'var(--green)', fontSize:11, lineHeight:1 }}>✓</span>
              </div>
              <span style={{ color:'rgba(255,255,255,.65)', fontSize:14 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="login-form-section">
        <div className="login-form-wrapper">

          {/* Role badge + back */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:999, background: accentBg, border:`1.5px solid ${accentBdr}` }}>
              {isHirer ? <Building2 size={13} color={accent} /> : <Star size={13} color={accent} />}
              <span style={{ fontSize:12, fontWeight:700, color: accent }}>
                {isHirer ? 'Hirer Account' : 'Talent Account'}
              </span>
            </div>
            <button type="button" onClick={() => { setErr(''); setStep(0); }}
              style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#64748B', background:'none', border:'none', cursor:'pointer', fontWeight:600, padding:'6px 10px', borderRadius:8, transition:'all .15s' }}
              onMouseOver={e => e.currentTarget.style.color = '#1a202c'}
              onMouseOut={e => e.currentTarget.style.color = '#64748B'}>
              <ArrowLeft size={13} /> Change
            </button>
          </div>

          <h1 className="welcome-header">Welcome back</h1>
          <p className="welcome-subtext">Signing in as a <strong>{isHirer ? 'Hirer' : 'Talent'}</strong>.</p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={gLoading} className="google-button">
            {gLoading ? <Spinner /> : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {gLoading ? 'Signing in…' : `Continue with Google`}
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
            <div style={{ flex:1, height:1, background:'var(--grey-200)' }} />
            <span style={{ color:'var(--grey-400)', fontSize:12 }}>or sign in with email</span>
            <div style={{ flex:1, height:1, background:'var(--grey-200)' }} />
          </div>

          {err && (
            <div className="error-box">
              <AlertCircle size={15} color="var(--red)" className="error-icon" />
              <span className="error-text">{err}</span>
            </div>
          )}

          <form onSubmit={handleEmail}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrap">
                <Mail size={14} className="icon" />
                <input className="input" type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            <div className="form-group large">
              <div className="form-label-row">
                <label style={{ fontSize:12, fontWeight:600, color:'var(--grey-700)' }}>Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="input-wrapper">
                <Lock size={14} className="icon" />
                <input className="input" type={show ? 'text' : 'password'} required placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" style={{ paddingRight:40 }} />
                <button type="button" onClick={() => setShow(!show)} className="password-toggle">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:11, border:'none', background: accent, color:'white', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, transition:'all .15s' }}>
              {loading ? <Spinner /> : <><ArrowRight size={16} />Sign in as {ROLE_LABELS[role]}</>}
            </button>
          </form>

          <div style={{ marginTop:28, paddingTop:24, borderTop:'1.5px solid var(--grey-150)' }}>
            <p style={{ textAlign:'center', fontSize:13, color:'var(--grey-400)', marginBottom:12 }}>First time here?</p>
            <Link to={`/register?role=${role}`}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'13px', borderRadius:11, background: accentBg, border:`2px solid ${accent}`, color: accent, fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:14, textDecoration:'none', transition:'all .15s', letterSpacing:'-.01em' }}
              onMouseOver={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = 'white'; }}
              onMouseOut={e => { e.currentTarget.style.background = accentBg; e.currentTarget.style.color = accent; }}>
              Create a free account <ArrowRight size={15}/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
