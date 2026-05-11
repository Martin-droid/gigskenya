import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, MessageSquare, ArrowLeft, Eye, Clock,
  Flag, Share2, Link as LinkIcon, FileDown, ExternalLink,
  Copy, Check, X, Globe, FileText, Briefcase, Star,
  Shield, Zap, Mail, Send, Lock, Search,
} from 'lucide-react';
import {
  getTalentProfile, incrementProfileViews,
  incrementProfileContact, reportListing,
  submitRating, getMyRating,
} from '../lib/firestore';
import { requireAuth } from '../lib/authGuard';
import { useAuth } from '../context/AuthContext';

// ── Design tokens ────────────────────────────────────────────
const ACCENT_COLORS = ['#4F46E5','#EC4899','#F59E0B','#10B981','#EF4444','#8B5CF6','#06B6D4','#F97316'];
const getAccent   = (id) => ACCENT_COLORS[parseInt(id?.slice(-2) || '0', 16) % ACCENT_COLORS.length];
const getInitials = (name) => (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const CAT_META = {
  'Tech & Dev':           { bg:'#EEF2FF', text:'#4338CA', dot:'#6366F1' },
  'Tech & Development':   { bg:'#EEF2FF', text:'#4338CA', dot:'#6366F1' },
  'Design':               { bg:'#FDF2F8', text:'#BE185D', dot:'#EC4899' },
  'Design & Creative':    { bg:'#FDF2F8', text:'#BE185D', dot:'#EC4899' },
  'Writing & Content':    { bg:'#FFFBEB', text:'#B45309', dot:'#F59E0B' },
  'Digital Marketing':    { bg:'#ECFDF5', text:'#065F46', dot:'#10B981' },
  'Digital Marketing & SEO': { bg:'#ECFDF5', text:'#065F46', dot:'#10B981' },
  'Photo & Video':        { bg:'#FEF2F2', text:'#991B1B', dot:'#EF4444' },
  'Photo & Video Production': { bg:'#FEF2F2', text:'#991B1B', dot:'#EF4444' },
  'Business & Finance':   { bg:'#F5F3FF', text:'#5B21B6', dot:'#8B5CF6' },
  'Customer Support':     { bg:'#E0F2FE', text:'#075985', dot:'#0EA5E9' },
  'Customer Support & VA':{ bg:'#E0F2FE', text:'#075985', dot:'#0EA5E9' },
  'Translation':          { bg:'#FFF7ED', text:'#9A3412', dot:'#F97316' },
  'Translation & Languages': { bg:'#FFF7ED', text:'#9A3412', dot:'#F97316' },
  'Education & Tutoring': { bg:'#F0FDF4', text:'#14532D', dot:'#22C55E' },
};

// ── Global styles ────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .tp-root * { box-sizing: border-box; }

  /* FIX 1: Prevent the entire page from scrolling horizontally */
  .tp-root { font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

  .tp-display { font-family: 'Plus Jakarta Sans', sans-serif !important; }

  .tp-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
  .tp-card { background: white; border-radius: 20px; border: 1.5px solid #EAECEF; overflow: hidden; min-width: 0; }
  .tp-card-pad { padding: 24px; }

  /* FIX 2: sidebar needs min-width:0 so it doesn't blow out the grid column */
  .tp-sidebar { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 80px; min-width: 0; }

  .tp-avatar { border-radius: 50%; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; line-height: 1; }
  .tp-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .tp-btn { display: flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; cursor: pointer; transition: all 0.17s cubic-bezier(.4,0,.2,1); text-decoration: none; white-space: nowrap; letter-spacing: -.01em; font-size: 14px; }
  .tp-btn:active { transform: scale(0.97); }
  .tp-btn-green { background:#00A550; color:white; }
  .tp-btn-green:hover { background:#007A3A; box-shadow:0 6px 20px rgba(0,165,80,.28); }
  .tp-btn-dark  { background:#0A0A0A; color:white; }
  .tp-btn-dark:hover  { background:#1F2937; }
  .tp-btn-ghost { background:white; color:#52525B; border:1.5px solid #E4E4E7; }
  .tp-btn-ghost:hover { border-color:#A1A1AA; background:#FAFAFA; }
  .tp-btn-wa    { background:#25D366; color:white; }
  .tp-btn-wa:hover    { background:#1eb957; box-shadow:0 6px 20px rgba(37,211,102,.28); }

  .tp-chip { display: inline-flex; align-items: center; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 8px;
    /* FIX 3: chips with long text shouldn't blow out their container */
    max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .tp-link-card { display: block; text-decoration: none; border-radius: 14px; border: 1.5px solid #E4E4E7; overflow: hidden; background: white; transition: border-color .18s, box-shadow .18s, transform .18s; cursor: pointer; width: 100%; box-sizing: border-box; min-width: 0; }
  .tp-link-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.09); }

  .tp-section-head { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 800; color: #0A0A0A; letter-spacing: -.02em; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1.5px solid #F1F5F9; }

  @keyframes tp-fadein  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tp-spin    { to{transform:rotate(360deg)} }
  @keyframes tp-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.75)} }
  @keyframes tp-toast   { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

  .tp-fade   { animation: tp-fadein .42s ease both; }
  .tp-d1     { animation-delay:.07s }
  .tp-d2     { animation-delay:.14s }
  .tp-d3     { animation-delay:.21s }

  @media (max-width: 480px) {
    .tp-lc-browser  { display: none !important; }
    .tp-lc-footer   { display: none !important; }
    .tp-lc-btn-full { display: none !important; }
    .tp-lc-btn-short{ display: flex !important; }
    .tp-card-pad    { padding: 16px !important; }
  }

  @media (max-width: 820px) {
    .tp-layout               { grid-template-columns: 1fr !important; }
    .tp-sidebar              { position:static !important; }
    .tp-sidebar-desktop-only { display:none !important; }
    .tp-mobile-cta           { display:flex !important; }
    .tp-mobile-contact-slot  { display:block !important; }
    .tp-hero-inner           { padding: 28px 18px 24px !important; }
    .tp-hero-avatar-wrap     { width:76px !important; height:76px !important; }
    .tp-hero-avatar-wrap .tp-avatar { width:76px !important; height:76px !important; font-size:24px !important; }
    .tp-hero-rate-pill       { display:flex !important; }
    .tp-mobile-actions-row   { display:flex !important; }
  }
  @media (min-width: 821px) {
    .tp-mobile-cta          { display:none !important; }
    .tp-mobile-contact-slot { display:none !important; }
    .tp-hero-rate-pill      { display:none !important; }
    .tp-mobile-actions-row  { display:none !important; }
  }
`;

function StyleTag() {
  useEffect(() => {
    if (document.getElementById('tp-styles-v2')) return;
    const el = document.createElement('style');
    el.id = 'tp-styles-v2';
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
  return null;
}

// ── Avatar — photo error handling ───────────────────────────
function Avatar({ src, name, color, size = 64, className = '', style = {} }) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <div className={`tp-avatar ${className}`} style={{ width: size, height: size, background: showImg ? '#F1F5F9' : `${color}22`, border: `3px solid ${showImg ? '#E2E8F0' : color + '44'}`, fontSize: Math.round(size * 0.3), color, ...style }}>
      {showImg
        ? <img src={src} alt={name || 'Talent'} onError={() => setFailed(true)} />
        : getInitials(name)
      }
    </div>
  );
}

function Stars({ score, size = 14, color = '#F59E0B' }) {
  return (
    <span style={{ display:'inline-flex', gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 20 20" fill={n <= score ? color : '#E4E4E7'}>
          <path d="M10 1l2.39 4.84 5.34.78-3.86 3.77.91 5.32L10 13.27 5.22 15.71l.91-5.32L2.27 6.62l5.34-.78z"/>
        </svg>
      ))}
    </span>
  );
}

function InteractiveStars({ value, hover, onHover, onLeave, onClick, size = 24 }) {
  const active = hover || value;
  return (
    <span style={{ display:'inline-flex', gap:4, cursor:'pointer' }} onMouseLeave={onLeave}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 20 20"
          fill={n <= active ? '#F59E0B' : '#E4E4E7'}
          style={{ transition:'fill .12s', flexShrink:0 }}
          onMouseEnter={() => onHover(n)}
          onClick={() => onClick(n)}>
          <path d="M10 1l2.39 4.84 5.34.78-3.86 3.77.91 5.32L10 13.27 5.22 15.71l.91-5.32L2.27 6.62l5.34-.78z"/>
        </svg>
      ))}
    </span>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', background:'#0A0A0A', color:'white', borderRadius:999, padding:'11px 22px', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,.28)', zIndex:9999, whiteSpace:'nowrap', animation:'tp-toast .22s ease', fontFamily:'Plus Jakarta Sans, sans-serif' }}>
      <Check size={14} color="#22C55E"/> {message}
    </div>
  );
}

function ShareModal({ url, title, onClose }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { ref.current?.select(); }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { ref.current?.select(); }
    setCopied(true);
    setTimeout(onClose, 1300);
  };
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,.52)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:22, padding:26, width:'100%', maxWidth:420, boxShadow:'0 24px 64px rgba(0,0,0,.22)', animation:'tp-fadein .2s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <p className="tp-display" style={{ fontWeight:800, fontSize:17, color:'#0A0A0A', letterSpacing:'-.02em' }}>Share Profile</p>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:'#F4F4F5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#71717A' }}><X size={15}/></button>
        </div>
        {title && <p style={{ fontSize:13, color:'#71717A', marginBottom:16, lineHeight:1.55 }}>{title}</p>}
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, border:'1.5px solid #E4E4E7', borderRadius:11, padding:'10px 13px', background:'#FAFAFA', overflow:'hidden' }}>
            <LinkIcon size={13} color="#A1A1AA" style={{ flexShrink:0 }}/>
            <input ref={ref} readOnly value={url} onClick={e => e.target.select()} style={{ flex:1, border:'none', background:'transparent', fontSize:12, color:'#71717A', outline:'none', minWidth:0 }}/>
          </div>
          <button onClick={copy} className="tp-btn" style={{ padding:'10px 16px', borderRadius:11, flexShrink:0, background: copied ? '#22C55E' : '#00A550', color:'white', fontSize:13 }}>
            {copied ? <Check size={14}/> : <Copy size={14}/>}{copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[
            { href:`https://wa.me/?text=${encodeURIComponent(url)}`, label:'WhatsApp', icon:<MessageSquare size={13}/>, bg:'#25D366', color:'white' },
            { href:`https://t.me/share/url?url=${encodeURIComponent(url)}`, label:'Telegram', icon:<Send size={13}/>, bg:'#229ED9', color:'white' },
            { href:`mailto:?subject=${encodeURIComponent('Check out this talent on GigsKenya')}&body=${encodeURIComponent(url)}`, label:'Email', icon:<Mail size={13}/>, bg:'#F4F4F5', color:'#374151' },
          ].map(({ href, label, icon, bg, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'10px 6px', borderRadius:11, background:bg, color, fontWeight:600, fontSize:12, textDecoration:'none', fontFamily:'Plus Jakarta Sans, sans-serif' }}>
              {icon}{label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function LinkCard({ url, type }) {
  let domain = '';
  try { domain = new URL(url).hostname.replace('www.', ''); } catch {}
  const isPortfolio = type === 'portfolio';
  const cfg = isPortfolio
    ? { icon:<Globe size={20} color="#00A550"/>, label:'Portfolio / Website', btn:'Open Portfolio', hex:'#00A550', bg:'#F0FDF4' }
    : { icon:<FileText size={20} color="#6366F1"/>, label:'CV / Resume',     btn:'Download CV',    hex:'#6366F1', bg:'#EEF2FF' };
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="tp-link-card"
      onMouseOver={e => e.currentTarget.style.borderColor = cfg.hex}
      onMouseOut={e => e.currentTarget.style.borderColor = '#E4E4E7'}
      style={{ display:'block', width:'100%', boxSizing:'border-box', overflow:'hidden' }}>
      {/* Fake browser bar — hidden on very small screens via .tp-lc-browser */}
      <div className="tp-lc-browser" style={{ background:'#F4F4F5', padding:'7px 12px', display:'flex', alignItems:'center', gap:7, borderBottom:'1px solid #E4E4E7', overflow:'hidden' }}>
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          {['#EF4444','#F59E0B','#22C55E'].map(c => <div key={c} style={{ width:8, height:8, borderRadius:'50%', background:c }}/>)}
        </div>
        <div style={{ flex:1, minWidth:0, background:'white', border:'1px solid #E4E4E7', borderRadius:4, padding:'3px 10px', fontSize:10, color:'#A1A1AA', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{url}</div>
        <ExternalLink size={11} color="#A1A1AA" style={{ flexShrink:0 }}/>
      </div>
      {/* Main row */}
      <div style={{ padding:'15px 18px', display:'flex', alignItems:'center', gap:12, overflow:'hidden' }}>
        <div style={{ width:44, height:44, borderRadius:11, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{cfg.icon}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <p className="tp-display" style={{ fontSize:13, fontWeight:700, color:'#0A0A0A', marginBottom:3 }}>{cfg.label}</p>
          <p style={{ fontSize:12, color:'#A1A1AA', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{domain}</p>
        </div>
        {/* Full label hidden on very small screens, short icon-only version shown */}
        <div className="tp-lc-btn-full" style={{ padding:'7px 11px', borderRadius:9, background:cfg.bg, color:cfg.hex, fontSize:12, fontWeight:700, flexShrink:0, fontFamily:'Plus Jakarta Sans, sans-serif', whiteSpace:'nowrap' }}>{cfg.btn}</div>
        <div className="tp-lc-btn-short" style={{ display:'none', width:32, height:32, borderRadius:9, background:cfg.bg, color:cfg.hex, alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <ExternalLink size={14}/>
        </div>
      </div>
      {/* URL footer strip — hidden on very small screens via .tp-lc-footer */}
      <div className="tp-lc-footer" style={{ background:cfg.bg, borderTop:`1px solid ${cfg.hex}22`, padding:'6px 14px', display:'flex', alignItems:'center', gap:6, overflow:'hidden' }}>
        <LinkIcon size={10} color={cfg.hex} style={{ flexShrink:0 }}/>
        <span style={{ fontSize:10, color:cfg.hex, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0, flex:1 }}>{url}</span>
      </div>
    </a>
  );
}

// ══════════════════════════════════════════════════════════════
// TalentProfile
// ══════════════════════════════════════════════════════════════
export default function TalentProfile() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [talent, setTalent]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [contactShown, setContactShown] = useState(false);
  const [reported, setReported]         = useState(false);
  const [toast, setToast]               = useState('');
  const [showShare, setShowShare]       = useState(false);
  const [myRating, setMyRating]         = useState(null);
  const [hoverStar, setHoverStar]       = useState(0);
  const [selStar, setSelStar]           = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingDone, setRatingDone]     = useState(false);

  const currentPath = `/talent/${id}`;

  useEffect(() => {
    (async () => {
      try {
        const tp = await getTalentProfile(id);
        if (!tp || tp.status === 'deleted') { setLoading(false); return; }
        setTalent(tp);
        incrementProfileViews(id);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    getMyRating(id, user.uid).then(r => {
      if (r) {
        setMyRating(r);
        setSelStar(r.score);
        setRatingComment(r.comment || '');
        setRatingDone(true);
      }
    }).catch(() => {});
  }, [id, user]);

  // ── Auth-gated handlers with full intent ─────────────────────

  const handleMessage = () => {
    if (!requireAuth({
      isAuthenticated, navigate,
      location: { pathname: currentPath },
      intent: {
        type:     'pitch',
        label:    talent?.posterName || 'the talent',
        returnTo: '/messages',
        params:   { with: id, name: talent?.posterName || 'User' },
        source:   currentPath,
      },
    })) return;
    navigate(`/messages?with=${id}&name=${encodeURIComponent(talent?.posterName || 'User')}`);
  };

  const handleContact = () => {
    if (!requireAuth({
      isAuthenticated, navigate,
      location: { pathname: currentPath },
      intent: {
        type:     'generic',
        returnTo: currentPath,
        params:   { showContact: 'true' },
        source:   currentPath,
      },
    })) return;
    setContactShown(true);
    incrementProfileContact(id);
  };

  const handleShare = () => {
    setShowShare(true);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  const handleReport = async () => {
    if (reported) return;
    await reportListing(id, user?.uid || 'anon', 'User report').catch(() => {});
    setReported(true);
    setToast('Listing reported. Thanks for keeping GigsKenya safe.');
  };

  const handleRate = async () => {
    if (!selStar || ratingSubmitting) return;
    if (!requireAuth({
      isAuthenticated, navigate,
      location: { pathname: currentPath },
      intent: { type: 'generic', returnTo: currentPath, source: currentPath },
    })) return;
    setRatingSubmitting(true);
    try {
      await submitRating(id, user.uid, selStar, ratingComment);
      setMyRating({ score: selStar, comment: ratingComment });
      setRatingDone(true);
      setToast('Rating submitted — thank you!');
    } catch {
      setToast('Could not submit rating. Try again.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (loading) return (
    <>
      <StyleTag/>
      <div style={{ paddingTop:64, minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F8F6F1' }}>
        <div style={{ width:36, height:36, border:'3px solid #E4E4E7', borderTopColor:'#00A550', borderRadius:'50%', animation:'tp-spin .7s linear infinite' }}/>
        <style>{`@keyframes tp-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  if (!talent) return (
    <>
      <StyleTag/>
      <div style={{ paddingTop:64, minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F8F6F1', gap:14, padding:'40px 20px', textAlign:'center' }}>
        <Search size={52} color="#CBD5E1" strokeWidth={1.5}/>
        <h2 className="tp-display" style={{ fontSize:22, fontWeight:800, color:'#0A0A0A', letterSpacing:'-.02em' }}>Profile not found</h2>
        <p style={{ color:'#71717A', fontSize:14 }}>This profile may have been removed or doesn't exist.</p>
        <button onClick={() => navigate('/talent')} className="tp-btn tp-btn-green" style={{ padding:'12px 26px', fontSize:14, marginTop:8 }}>Browse Talent →</button>
      </div>
    </>
  );

  const accent   = getAccent(id);
  const catMeta  = CAT_META[talent.category] || { bg:'#F4F4F5', text:'#52525B', dot:'#A1A1AA' };
  const isAvail  = talent.available !== false;
  const isOwn    = user?.uid === id;
  const skills   = talent.skills || [];
  const hasLinks = talent.portfolioUrl || talent.cvUrl;
  const photoSrc = talent.photoURL || talent.googlePhotoURL || null;
  const waNum    = talent.phone ? `254${talent.phone.replace(/^0/, '').replace(/\s/g, '')}` : null;
  const waHref   = waNum ? `https://wa.me/${waNum}` : null;
  const postedDate = talent.createdAt?.toDate
    ? talent.createdAt.toDate().toLocaleDateString('en-KE', { month:'long', year:'numeric' }) : '';

  const ContactPanel = () => (
    <div style={{ marginTop:4, borderRadius:14, background:'#F0FDF4', border:'1px solid #BBF7D0', padding:'16px' }}>
      <p style={{ fontSize:11, color:'#64748B', marginBottom:12, fontWeight:700, textAlign:'center', textTransform:'uppercase', letterSpacing:'.06em' }}>
        Contact {talent.posterName?.split(' ')[0] || 'directly'}
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
        {talent.hidePhone ? (
          <p style={{ fontSize:13, color:'#64748B', textAlign:'center', lineHeight:1.5 }}>
            <Mail size={14} style={{marginBottom:4}}/><br/>This freelancer prefers messages.<br/>Use the Message button above.
          </p>
        ) : talent.phone ? (
          <>
            <a href={`tel:${talent.phone}`} className="tp-btn tp-btn-dark" style={{ padding:'12px', width:'100%' }}>
              <Phone size={15}/> {talent.phone}
            </a>
            {talent.whatsapp !== false && waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="tp-btn tp-btn-wa" style={{ padding:'12px', width:'100%' }}>
                <MessageSquare size={15}/> WhatsApp
              </a>
            )}
          </>
        ) : (
          <p style={{ fontSize:13, color:'#64748B', textAlign:'center' }}>No phone number provided.</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <StyleTag/>
      {/* FIX 4: overflow-x hidden on the page root stops any stray element from causing a horizontal scrollbar */}
      <div className="tp-root" style={{ paddingTop:64, minHeight:'100vh', background:'#F8F6F1', overflowX:'hidden' }}>

        {/* ══ HERO ══ */}
        <div style={{ background:'#0A0A0A', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)', backgroundSize:'56px 56px' }}/>
          <div style={{ position:'absolute', top:'-50%', left:'0%', width:'45vw', height:'45vw', maxWidth:480, maxHeight:480, borderRadius:'50%', pointerEvents:'none', background:`radial-gradient(circle, ${accent}22 0%, transparent 65%)` }}/>

          <div className="tp-hero-inner" style={{ maxWidth:1160, margin:'0 auto', padding:'44px 24px 36px', position:'relative' }}>
            <button onClick={() => navigate('/talent')}
              style={{ display:'flex', alignItems:'center', gap:7, color:'rgba(255,255,255,.4)', background:'none', border:'none', fontSize:13, marginBottom:26, cursor:'pointer', fontWeight:600, fontFamily:'DM Sans, sans-serif', transition:'color .15s' }}
              onMouseOver={e => e.currentTarget.style.color='rgba(255,255,255,.75)'}
              onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,.4)'}>
              <ArrowLeft size={14}/> Back to talent
            </button>

            <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
              {/* Avatar */}
              <div className="tp-fade tp-hero-avatar-wrap" style={{ position:'relative', width:96, height:96, flexShrink:0 }}>
                <Avatar src={photoSrc} name={talent.posterName} color={accent} size={96}/>
                <div style={{ position:'absolute', bottom:5, right:5, width:18, height:18, borderRadius:'50%', background: isAvail ? '#22C55E' : '#6B7280', border:'3px solid #0A0A0A' }}/>
              </div>

              {/* Text — FIX 5: minWidth was 200, causing overflow on narrow screens; 0 lets flex do its job */}
              <div className="tp-fade tp-d1" style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10, alignItems:'center' }}>
                  {talent.category && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, padding:'4px 11px', borderRadius:999, background:catMeta.bg, color:catMeta.text, letterSpacing:'.04em', textTransform:'uppercase' }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:catMeta.dot }}/>{talent.category}
                    </span>
                  )}
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, padding:'4px 11px', borderRadius:999, background: isAvail ? 'rgba(34,197,94,.14)' : 'rgba(255,255,255,.07)', color: isAvail ? '#4ADE80' : 'rgba(255,255,255,.3)', letterSpacing:'.04em', textTransform:'uppercase' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background: isAvail ? '#22C55E' : '#6B7280', animation: isAvail ? 'tp-pulse 2s infinite' : 'none' }}/>{isAvail ? 'Available' : 'Busy'}
                  </span>
                  {talent.boosted && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, padding:'4px 11px', borderRadius:999, background:'#00A550', color:'white', letterSpacing:'.04em' }}>
                      <Zap size={9} fill="white"/> Featured
                    </span>
                  )}
                </div>
                <p className="tp-display" style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,.5)', marginBottom:4, letterSpacing:'-.01em' }}>{talent.posterName || 'Talent'}</p>
                {/* FIX 6: h1 needs word-break so a very long title doesn't overflow */}
                <h1 className="tp-display" style={{ fontSize:'clamp(20px,4vw,30px)', fontWeight:900, color:'white', lineHeight:1.1, letterSpacing:'-.03em', marginBottom:12, wordBreak:'break-word', overflowWrap:'break-word' }}>
                  {talent.title || 'Freelance Professional'}
                </h1>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'center' }}>
                  {talent.location && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'rgba(255,255,255,.4)', minWidth:0, overflow:'hidden' }}><MapPin size={12} style={{ flexShrink:0 }}/><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{talent.location}</span></span>}
                  {talent.experience && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'rgba(255,255,255,.4)' }}><Clock size={12}/> {talent.experience}</span>}
                  {postedDate && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'rgba(255,255,255,.3)' }}><Star size={12}/> Since {postedDate}</span>}
                  {(talent.views || 0) > 0 && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'rgba(255,255,255,.3)' }}><Eye size={12}/> {talent.views} views</span>}
                  {(talent.ratingCount || 0) > 0 && (
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Stars score={Math.round((talent.ratingSum || 0) / talent.ratingCount)} size={13} color="#F59E0B"/>
                      <span style={{ fontSize:12, color:'rgba(255,255,255,.35)', fontWeight:600 }}>
                        {((talent.ratingSum || 0) / talent.ratingCount).toFixed(1)} ({talent.ratingCount})
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Rate pill — desktop only (sidebar has its own; mobile gets a separate row below) */}
              {talent.rate && (
                <div className="tp-fade tp-d2 tp-sidebar-desktop-only" style={{ background:'rgba(255,255,255,.06)', border:'1.5px solid rgba(255,255,255,.1)', borderRadius:16, padding:'16px 22px', textAlign:'center', flexShrink:0 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:5 }}>Rate</p>
                  <p className="tp-display" style={{ fontSize:24, fontWeight:900, color:'white', letterSpacing:'-.04em', lineHeight:1 }}>
                    {talent.currency || 'KES'} {Number(talent.rate).toLocaleString('en-KE') || talent.rate}
                  </p>
                  {talent.rateType && talent.rateType !== 'negotiable' && (
                    <p style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:4 }}>per {talent.rateType}</p>
                  )}
                </div>
              )}
            </div>

            {/* Mobile rate pill */}
            {talent.rate && (
              <div className="tp-hero-rate-pill" style={{ display:'none', alignItems:'center', gap:10, marginTop:18, paddingTop:16, borderTop:'1px solid rgba(255,255,255,.07)' }}>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'.08em', textTransform:'uppercase' }}>Rate:</span>
                <span className="tp-display" style={{ fontSize:20, fontWeight:900, color:'white', letterSpacing:'-.03em' }}>
                  {talent.currency || 'KES'} {Number(talent.rate).toLocaleString('en-KE') || talent.rate}
                </span>
                {talent.rateType && talent.rateType !== 'negotiable' && (
                  <span style={{ fontSize:11, color:'rgba(255,255,255,.35)' }}>/ {talent.rateType}</span>
                )}
              </div>
            )}

            {/* Mobile CTA */}
            {!isOwn && (
              <div className="tp-mobile-cta" style={{ display:'none', flexDirection:'column', gap:10, marginTop:18, paddingTop:18, borderTop:'1px solid rgba(255,255,255,.07)' }}>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={handleMessage} className="tp-btn" style={{ flex:1, padding:'12px', background:'rgba(255,255,255,.09)', color:'white', border:'1.5px solid rgba(255,255,255,.16)', borderRadius:12 }}>
                    <MessageSquare size={14}/> Message
                  </button>
                  <button onClick={handleContact} className="tp-btn tp-btn-green" style={{ flex:1, padding:'12px' }}>
                    <Phone size={14}/> {contactShown ? 'Hide' : 'Contact'}
                  </button>
                </div>
                <div className="tp-mobile-actions-row" style={{ display:'none', gap:10 }}>
                  <button onClick={handleShare} className="tp-btn" style={{ flex:1, padding:'10px', fontSize:13, borderRadius:12, background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.7)', border:'1.5px solid rgba(255,255,255,.15)' }}>
                    <Share2 size={13}/> Share
                  </button>
                  <button onClick={handleReport} className="tp-btn" style={{ flex:1, padding:'10px', fontSize:13, borderRadius:12, background: reported ? 'rgba(255,255,255,.04)' : 'rgba(239,68,68,.12)', color: reported ? 'rgba(255,255,255,.3)' : '#FCA5A5', border:`1.5px solid ${reported ? 'rgba(255,255,255,.1)' : 'rgba(239,68,68,.3)'}`, cursor: reported ? 'default' : 'pointer' }}>
                    <Flag size={13}/> {reported ? 'Reported' : 'Report'}
                  </button>
                </div>
              </div>
            )}
            {/* Mobile share when viewing own profile */}
            {isOwn && (
              <div className="tp-mobile-actions-row" style={{ display:'none', gap:10, marginTop:18, paddingTop:18, borderTop:'1px solid rgba(255,255,255,.07)' }}>
                <button onClick={handleShare} className="tp-btn" style={{ flex:1, padding:'10px', fontSize:13, borderRadius:12, background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.7)', border:'1.5px solid rgba(255,255,255,.15)' }}>
                  <Share2 size={13}/> Share Profile
                </button>
              </div>
            )}
            {contactShown && (
              <div className="tp-mobile-contact-slot" style={{ display:'none', marginTop:14 }}>
                <ContactPanel/>
              </div>
            )}
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div style={{ maxWidth:1160, margin:'0 auto', padding:'28px 16px 64px' }}>
          <div className="tp-layout">

            {/* Left column — FIX 7: direct grid child needs min-width:0, otherwise its content
                can expand the 1fr column wider than the viewport on mobile */}
            <div style={{ display:'flex', flexDirection:'column', gap:18, minWidth:0 }}>
              {skills.length > 0 && (
                <div className="tp-card tp-card-pad tp-fade">
                  <h2 className="tp-section-head">Skills &amp; Expertise</h2>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {skills.map(s => (
                      <span key={s} className="tp-chip" style={{ background:`${accent}12`, color:accent, border:`1px solid ${accent}22` }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="tp-card tp-card-pad tp-fade tp-d1">
                <h2 className="tp-section-head">About</h2>
                {/* FIX 8: pre-wrap without word-break lets long URLs / unbroken strings blow out the card */}
                <div style={{ fontSize:15, color:'#3F3F46', lineHeight:1.85, whiteSpace:'pre-wrap', wordBreak:'break-word', overflowWrap:'break-word' }}>
                  {talent.bio || 'No bio provided.'}
                </div>
              </div>

              {hasLinks && (
                <div className="tp-card tp-card-pad tp-fade tp-d2">
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:14, marginBottom:18, borderBottom:'1.5px solid #F1F5F9' }}>
                    <h2 className="tp-display" style={{ fontSize:15, fontWeight:800, color:'#0A0A0A', letterSpacing:'-.02em' }}>Portfolio &amp; Documents</h2>
                    <span style={{ fontSize:11, color:'#A1A1AA', flexShrink:0, marginLeft:8 }}>Click to open</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {talent.portfolioUrl && <LinkCard url={talent.portfolioUrl} type="portfolio"/>}
                    {talent.cvUrl        && <LinkCard url={talent.cvUrl}        type="cv"/>}
                  </div>
                </div>
              )}

              {/* ── Rating card ── */}
              {!isOwn && (
                <div className="tp-card tp-card-pad tp-fade tp-d3">
                  <h2 className="tp-section-head" style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Star size={15} color="#F59E0B" fill="#F59E0B"/> Rate this freelancer
                    {(talent.ratingCount || 0) > 0 && (
                      <span style={{ marginLeft:'auto', fontSize:12, fontWeight:600, color:'#71717A', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                        <Stars score={Math.round((talent.ratingSum||0)/talent.ratingCount)} size={12}/>
                        {((talent.ratingSum||0)/talent.ratingCount).toFixed(1)} · {talent.ratingCount} {talent.ratingCount === 1 ? 'rating' : 'ratings'}
                      </span>
                    )}
                  </h2>

                  {ratingDone ? (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'18px 0' }}>
                      <Stars score={selStar} size={28}/>
                      <p style={{ fontSize:13, fontWeight:700, color:'#15803D' }}>Your rating: {selStar}/5</p>
                      {/* FIX 9: italic comment text could overflow without word-break */}
                      {ratingComment && <p style={{ fontSize:13, color:'#52525B', fontStyle:'italic', textAlign:'center', lineHeight:1.6, wordBreak:'break-word', overflowWrap:'break-word' }}>"{ratingComment}"</p>}
                      <button onClick={() => setRatingDone(false)} style={{ fontSize:12, color:'#A1A1AA', background:'none', border:'none', cursor:'pointer', textDecoration:'underline', marginTop:4 }}>
                        Update rating
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                        <p style={{ fontSize:13, color:'#71717A', textAlign:'center' }}>
                          {isAuthenticated ? 'How was your experience working with this freelancer?' : 'Sign in to leave a rating.'}
                        </p>
                        <InteractiveStars
                          value={selStar}
                          hover={hoverStar}
                          onHover={setHoverStar}
                          onLeave={() => setHoverStar(0)}
                          onClick={n => { if (!isAuthenticated) { handleMessage(); return; } setSelStar(n); }}
                          size={32}
                        />
                        {selStar > 0 && (
                          <p style={{ fontSize:12, color:'#F59E0B', fontWeight:700 }}>
                            {['','Poor','Fair','Good','Very good','Excellent'][selStar]}
                          </p>
                        )}
                      </div>
                      {selStar > 0 && (
                        <>
                          <textarea
                            value={ratingComment}
                            onChange={e => setRatingComment(e.target.value)}
                            placeholder="Add a comment (optional)…"
                            rows={3}
                            style={{ width:'100%', marginTop:14, padding:'10px 13px', borderRadius:10, border:'1.5px solid #E4E4E7', fontSize:13, color:'#3F3F46', resize:'vertical', outline:'none', fontFamily:'DM Sans, sans-serif', lineHeight:1.65, boxSizing:'border-box' }}
                          />
                          <button
                            onClick={handleRate}
                            disabled={ratingSubmitting}
                            className="tp-btn tp-btn-green"
                            style={{ width:'100%', marginTop:10, padding:'12px' }}>
                            {ratingSubmitting ? 'Submitting…' : 'Submit Rating'}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="tp-fade tp-d3" style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:16, padding:'16px 20px', display:'flex', gap:12, alignItems:'flex-start' }}>
                <Shield size={16} color="#D97706" style={{ marginTop:2, flexShrink:0 }}/>
                <div style={{ minWidth:0 }}>
                  <p className="tp-display" style={{ fontSize:13, fontWeight:700, color:'#92400E', marginBottom:4 }}>Safety Tips</p>
                  <p style={{ fontSize:13, color:'#B45309', lineHeight:1.65 }}>Verify the person before sharing sensitive details. Meet in a safe, public place for first meetings. Never pay in advance for undelivered work.</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="tp-sidebar tp-sidebar-desktop-only">
              <div className="tp-card tp-card-pad" style={{ boxShadow:'0 8px 36px rgba(0,0,0,.09)' }}>
                <div style={{ marginBottom:18, paddingBottom:16, borderBottom:'1.5px solid #F1F5F9' }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#A1A1AA', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Rate</p>
                  <p className="tp-display" style={{ fontSize:28, fontWeight:900, color:'#0A0A0A', letterSpacing:'-.04em', lineHeight:1 }}>
                    {talent.rate
                      ? `${talent.currency || 'KES'} ${Number(talent.rate).toLocaleString('en-KE') || talent.rate}`
                      : 'Negotiable'}
                  </p>
                  {talent.rate && talent.rateType && talent.rateType !== 'negotiable' && (
                    <p style={{ fontSize:11, color:'#A1A1AA', marginTop:4 }}>per {talent.rateType}</p>
                  )}
                  {(talent.ratingCount || 0) > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:10 }}>
                      <Stars score={Math.round((talent.ratingSum||0)/talent.ratingCount)} size={13}/>
                      <span style={{ fontSize:12, fontWeight:700, color:'#3F3F46' }}>
                        {((talent.ratingSum||0)/talent.ratingCount).toFixed(1)}
                      </span>
                      <span style={{ fontSize:11, color:'#A1A1AA' }}>({talent.ratingCount} {talent.ratingCount === 1 ? 'review' : 'reviews'})</span>
                    </div>
                  )}
                  {isAvail && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:9 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E', animation:'tp-pulse 2s infinite' }}/>
                      <span className="tp-display" style={{ fontSize:13, fontWeight:600, color:'#15803D' }}>Available for work</span>
                    </div>
                  )}
                </div>

                {!isOwn && (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <button onClick={handleMessage} className="tp-btn tp-btn-ghost" style={{ width:'100%', padding:'13px' }}>
                      <MessageSquare size={15}/> Send Message
                    </button>
                    {!talent.hidePhone && (
                      !contactShown ? (
                        <button onClick={handleContact} className="tp-btn tp-btn-green" style={{ width:'100%', padding:'13px' }}>
                          <Phone size={15}/> Show Contact
                        </button>
                      ) : <ContactPanel/>
                    )}
                    {talent.hidePhone && (
                      <div style={{ padding:'10px 14px', borderRadius:10, background:'#FEF2F2', border:'1px solid #FECACA', fontSize:12, color:'#DC2626', fontWeight:600, textAlign:'center' }}>
                        <Lock size={12}/> Phone hidden — message only
                      </div>
                    )}
                  </div>
                )}

                <p style={{ textAlign:'center', marginTop:14, fontSize:11, color:'#A1A1AA', lineHeight:1.6 }}>GigsKenya connects you directly.<br/>Negotiate on your own terms.</p>
              </div>

              {hasLinks && (
                <div className="tp-card" style={{ padding:'16px 18px' }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#A1A1AA', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Quick Links</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                    {talent.portfolioUrl && (
                      <a href={talent.portfolioUrl} target="_blank" rel="noopener noreferrer" className="tp-btn" style={{ padding:'11px 14px', fontSize:13, background:'#F0FDF4', color:'#15803D', border:'1.5px solid #BBF7D0', borderRadius:11 }}>
                        <Globe size={13}/> View Portfolio
                      </a>
                    )}
                    {talent.cvUrl && (
                      <a href={talent.cvUrl} target="_blank" rel="noopener noreferrer" className="tp-btn tp-btn-ghost" style={{ padding:'11px 14px', fontSize:13, borderRadius:11 }}>
                        <FileDown size={13}/> Download CV
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handleShare} className="tp-btn tp-btn-ghost" style={{ flex:1, padding:'11px', fontSize:13, borderRadius:12 }}>
                  <Share2 size={13}/> Share
                </button>
                <button onClick={handleReport} className="tp-btn" style={{ flex:1, padding:'11px', fontSize:13, borderRadius:12, background: reported ? '#F4F4F5' : 'white', color: reported ? '#A1A1AA' : '#EF4444', border:`1.5px solid ${reported ? '#E4E4E7' : '#FCA5A5'}`, cursor: reported ? 'default' : 'pointer' }}>
                  <Flag size={13}/> {reported ? 'Reported' : 'Report'}
                </button>
              </div>

              <div style={{ background:'#0A0A0A', borderRadius:18, padding:'22px', textAlign:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-44, right:-44, width:130, height:130, borderRadius:'50%', background:`${accent}18`, pointerEvents:'none' }}/>
                <p className="tp-display" style={{ fontSize:15, fontWeight:800, color:'white', marginBottom:6, position:'relative' }}>Need to hire?</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,.38)', marginBottom:14, lineHeight:1.65, position:'relative' }}>Post a free job ad and let talented Kenyans come to you.</p>
                <button onClick={() => navigate('/register')} className="tp-btn tp-btn-green" style={{ width:'100%', padding:'11px', fontSize:13, position:'relative' }}>Post a Free Ad →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast('')}/>}
      {showShare && <ShareModal url={window.location.href} title={talent.title} onClose={() => setShowShare(false)}/>}
    </>
  );
}