import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Phone, MessageSquare, ChevronDown, X, Link as LinkIcon, FileDown, SlidersHorizontal, ArrowRight, Zap, Lock } from 'lucide-react';
import { getTalents, getTalentsCount } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const LOCS = ['All Kenya','Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Remote'];
const CATS = ['All','Tech & Dev','Design','Writing & Content','Digital Marketing','Photo & Video','Business & Finance','Customer Support','Translation','Education & Tutoring','Other'];
const EXP  = ['Any Level','Entry (0–1 yrs)','Junior (1–3 yrs)','Mid-Level (3–5 yrs)','Senior (5–8 yrs)','Expert (8+ yrs)'];

const avatarColors  = ['#4F46E5','#EC4899','#F59E0B','#10B981','#EF4444','#8B5CF6','#06B6D4','#F97316'];
const catBgColors   = {
  'Tech & Dev':'#EEF2FF','Design':'#FDF2F8','Writing & Content':'#FFFBEB',
  'Digital Marketing':'#ECFDF5','Photo & Video':'#FEF2F2','Business & Finance':'#F5F3FF',
  'Customer Support':'#E0F2FE','Translation':'#FFF7ED','Education & Tutoring':'#F0FDF4',
};
const catTextColors = {
  'Tech & Dev':'#4F46E5','Design':'#DB2777','Writing & Content':'#D97706',
  'Digital Marketing':'#059669','Photo & Video':'#DC2626','Business & Finance':'#7C3AED',
  'Customer Support':'#0284C7','Translation':'#EA580C','Education & Tutoring':'#16A34A',
};

const getColor    = (id) => avatarColors[parseInt(id?.slice(-2)||'0',16) % avatarColors.length];
const getInitials = (name) => (name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

/* ─── Responsive styles ─── */
const RESPONSIVE_CSS = `
  .talent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  .talent-hero-inner { flex-direction: row; align-items: flex-end; gap: 24px; }
  .talent-cta-banner { flex-direction: row; justify-content: space-between; align-items: center; }
  .filter-bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .contact-btns { display: flex; gap: 10px; flex-wrap: wrap; }

  /* Clickable card base */
  .talent-card-clickable {
    display: block;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    background: white;
    border-radius: var(--r-xl);
    overflow: hidden;
    transition: transform .2s cubic-bezier(.4,0,.2,1), box-shadow .2s cubic-bezier(.4,0,.2,1), border-color .2s cubic-bezier(.4,0,.2,1);
    position: relative;
  }
  .talent-card-clickable:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0,0,0,.13);
  }

  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }

  @media (max-width: 640px) {
    .talent-grid { grid-template-columns: 1fr; }
    .talent-hero-inner { flex-direction: column; align-items: flex-start; gap: 16px; }
    .talent-search-bar { max-width: 100% !important; }
    .talent-cta-banner { flex-direction: column; align-items: flex-start; gap: 12px; }
    .filter-bar { gap: 6px; }
    .filter-bar-count { margin-left: 0 !important; width: 100%; }
    .contact-btns { flex-direction: column; }
    .talent-card-toprow { gap: 10px; }
  }
  @media (min-width: 641px) and (max-width: 960px) {
    .talent-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('talent-responsive-css')) return;
    const tag = document.createElement('style');
    tag.id = 'talent-responsive-css';
    tag.textContent = RESPONSIVE_CSS;
    document.head.appendChild(tag);
    return () => {};
  }, []);
  return null;
}

/* ─── Skeleton ─── */
function Skeleton() {
  return (
    <div style={{ background:'white', borderRadius:'var(--r-xl)', border:'1px solid var(--grey-200)', overflow:'hidden' }}>
      <div className="skeleton" style={{ height:6 }} />
      <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div className="skeleton" style={{ width:54, height:54, borderRadius:'50%', flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div className="skeleton" style={{ height:13, width:'55%', marginBottom:6 }} />
            <div className="skeleton" style={{ height:11, width:'40%' }} />
          </div>
        </div>
        <div className="skeleton" style={{ height:13, width:'80%' }} />
        <div className="skeleton" style={{ height:11, width:'100%' }} />
        <div className="skeleton" style={{ height:11, width:'65%' }} />
        <div style={{ display:'flex', gap:6, marginTop:4 }}>
          {[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:22, width:60, borderRadius:'var(--r-full)' }}/>)}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TalentCard — world-class redesign
   variant: 'preview' (homepage) | 'default' (talent page)
═══════════════════════════════════════════════════════════ */
export function TalentCard({ talent, navigate, variant = 'default' }) {
  const [contactShown, setContactShown] = useState(false);
  const [hov, setHov] = useState(false);
  const isPreview = variant === 'preview';

  const color    = getColor(talent.id);
  const initials = getInitials(talent.posterName);
  const catBg    = catBgColors[talent.category]   || '#F6F6F4';
  const catText  = catTextColors[talent.category] || 'var(--grey-600)';
  const isAvailable = talent.available !== false;

  const goToProfile = () => navigate(`/talent/${talent.id}`);

  /* ─── Preview variant: clean Toptal-style profile card ─── */
  if (isPreview) {
    return (
      <div
        role="link" tabIndex={0}
        onClick={goToProfile}
        onKeyDown={e => { if (e.key==='Enter'||e.key===' ') goToProfile(); }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: 'white',
          borderRadius: 18,
          overflow: 'hidden',
          cursor: 'pointer',
          border: `1.5px solid ${hov ? '#D1D5DB' : '#E5E7EB'}`,
          boxShadow: hov ? '0 20px 48px rgba(0,0,0,.1)' : '0 1px 4px rgba(0,0,0,.05)',
          transform: hov ? 'translateY(-4px)' : 'none',
          transition: 'all .22s cubic-bezier(.4,0,.2,1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: talent.boosted ? 'linear-gradient(90deg,#00A550,#22D37A)' : `linear-gradient(90deg,${color},${color}77)` }}/>

        <div style={{ padding:'18px 20px', flex:1, display:'flex', flexDirection:'column' }}>

          {/* Top row: avatar + info + availability */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:14 }}>
            {/* Avatar */}
            <div style={{
              width:52, height:52, borderRadius:14, flexShrink:0, overflow:'hidden',
              background: `linear-gradient(145deg,${color},${color}99)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:800, fontSize:17, color:'white',
              boxShadow: `0 4px 14px ${color}33`,
            }}>
              {talent.photoURL
                ? <img src={talent.photoURL} alt={talent.posterName} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>
                : initials}
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:14.5, color:'#0F172A', lineHeight:1.2, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {talent.posterName || 'Talent'}
              </p>
              <p style={{ fontSize:12.5, color:'#374151', fontWeight:600, lineHeight:1.3, marginBottom:4, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                {talent.title || 'Freelance Professional'}
              </p>
              <p style={{ fontSize:11, color:'#9CA3AF', display:'flex', alignItems:'center', gap:3 }}>
                <MapPin size={10} strokeWidth={2.5}/>{talent.location || 'Kenya'}
              </p>
            </div>

            {/* Availability */}
            <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:5, padding:'4px 9px', borderRadius:999, background: isAvailable ? '#F0FDF4' : '#F9FAFB', border:`1px solid ${isAvailable ? 'rgba(34,197,94,.3)' : '#E5E7EB'}` }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background: isAvailable ? '#22C55E' : '#D1D5DB', animation: isAvailable ? 'pulse-dot 2s infinite' : 'none' }}/>
              <span style={{ fontSize:10, fontWeight:700, color: isAvailable ? '#15803D' : '#9CA3AF', whiteSpace:'nowrap' }}>
                {isAvailable ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>

          {/* Category + badges */}
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
            {talent.category && (
              <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:7, background:catBg, color:catText, letterSpacing:'.04em', textTransform:'uppercase' }}>
                {talent.category}
              </span>
            )}
            {talent.portfolioUrl && (
              <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:7, background:'#F0FDF4', color:'#166534', display:'flex', alignItems:'center', gap:3 }}>
                <LinkIcon size={9}/> Portfolio
              </span>
            )}
            {talent.cvUrl && (
              <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:7, background:'#F9FAFB', color:'#4B5563', display:'flex', alignItems:'center', gap:3 }}>
                <FileDown size={9}/> CV
              </span>
            )}
            {talent.boosted && (
              <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:7, background:'#00A550', color:'white' }}>★ Featured</span>
            )}
          </div>

          {/* Bio */}
          {talent.bio && (
            <p style={{ fontSize:12.5, color:'#6B7280', lineHeight:1.7, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {talent.bio}
            </p>
          )}

          {/* Skills */}
          {talent.skills?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
              {talent.skills.slice(0,4).map(s=>(
                <span key={s} style={{ fontSize:11, background:'#F0FDF4', color:'#166534', padding:'3px 9px', borderRadius:7, fontWeight:600, border:'1px solid rgba(0,165,80,.15)' }}>{s}</span>
              ))}
              {talent.skills.length > 4 && <span style={{ fontSize:11, color:'#9CA3AF', alignSelf:'center' }}>+{talent.skills.length-4}</span>}
            </div>
          )}

          <div style={{ flex:1 }}/>

          {/* Footer */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid #F3F4F6', gap:8 }}>
            <div>
              <p style={{ fontWeight:800, fontSize:15, color:'#0F172A', margin:0 }}>
                {talent.rate
                  ? `${talent.currency || 'KES'} ${Number(talent.rate).toLocaleString('en-KE') || talent.rate}`
                  : 'Negotiable'}
              </p>
              {talent.rate && talent.rateType && talent.rateType !== 'negotiable' && (
                <p style={{ fontSize:10.5, color:'#9CA3AF', marginTop:1 }}>per {talent.rateType}</p>
              )}
            </div>
            <button
              onClick={e => { e.stopPropagation(); navigate(`/talent/${talent.id}`); }}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'9px 16px', borderRadius:10,
                background: hov ? '#00A550' : '#F0FDF4',
                color: hov ? 'white' : '#166534',
                border:'none', fontSize:12, fontWeight:700,
                cursor:'pointer', transition:'background .2s, color .2s', flexShrink:0,
              }}
            >
              View Profile <ArrowRight size={11}/>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Default variant: talent page card with contact reveal ─── */
  return (
    <div
      role="link" tabIndex={0}
      onClick={goToProfile}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') goToProfile(); }}
      className="talent-card-clickable"
      style={{ border: `1.5px solid ${talent.boosted ? 'var(--green)' : 'var(--grey-200)'}` }}
      onMouseOver={e => { e.currentTarget.style.borderColor = talent.boosted ? 'var(--green)' : color; }}
      onMouseOut={e  => { e.currentTarget.style.borderColor = talent.boosted ? 'var(--green)' : 'var(--grey-200)'; }}
    >
      {/* Accent bar */}
      <div style={{ height:4, background: talent.boosted ? 'linear-gradient(90deg,var(--green),#22D37A)' : `linear-gradient(90deg,${color},${color}88)` }}/>

      <div style={{ padding:'18px' }}>
        {/* Top row */}
        <div className="talent-card-toprow" style={{ display:'flex', gap:12, marginBottom:13, alignItems:'flex-start' }}>
          <div style={{ width:52, height:52, borderRadius:15, background:`${color}16`, border:`2px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:17, color, flexShrink:0, overflow:'hidden' }}>
            {talent.photoURL
              ? <img src={talent.photoURL} alt={talent.posterName} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }}/>
              : initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--ink)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {talent.posterName || 'Talent'}
            </p>
            <p style={{ fontSize:12, color:'var(--grey-400)', display:'flex', alignItems:'center', gap:3 }}>
              <MapPin size={11}/> {talent.location || 'Kenya'}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0, background: isAvailable ? '#F0FDF4' : 'var(--grey-100)', borderRadius:'var(--r-full)', padding:'4px 9px' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background: isAvailable ? '#22C55E' : '#D1D5DB', animation: isAvailable ? 'pulse-dot 2s infinite' : 'none' }}/>
            <span style={{ fontSize:10, fontWeight:700, color: isAvailable ? '#15803D' : 'var(--grey-400)', whiteSpace:'nowrap' }}>
              {isAvailable ? 'Available' : 'Busy'}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10, alignItems:'center' }}>
          {talent.category && (
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:'var(--r-full)', background:catBg, color:catText, letterSpacing:'.04em', textTransform:'uppercase' }}>
              {talent.category}
            </span>
          )}
          {talent.portfolioUrl && (
            <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:'var(--r-full)', background:'var(--green-light)', color:'var(--green-dark)', display:'flex', alignItems:'center', gap:3 }}>
              <LinkIcon size={9}/> Portfolio
            </span>
          )}
          {talent.cvUrl && (
            <span style={{ fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:'var(--r-full)', background:'var(--grey-100)', color:'var(--grey-600)', display:'flex', alignItems:'center', gap:3 }}>
              <FileDown size={9}/> CV
            </span>
          )}
          {talent.boosted && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:'var(--r-full)', background:'var(--green)', color:'white' }}>
              <Zap size={9} fill="white"/> Featured
            </span>
          )}
        </div>

        {/* Headline */}
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--ink)', marginBottom:7, lineHeight:1.35, letterSpacing:'-.01em' }}>
          {talent.title || 'Freelance Professional'}
        </h3>

        {/* Bio */}
        {talent.bio && (
          <p style={{ fontSize:12, color:'var(--grey-500)', lineHeight:1.65, marginBottom:11 }}>
            {talent.bio.slice(0,95)}{talent.bio.length > 95 ? '…' : ''}
          </p>
        )}

        {/* Skills */}
        {talent.skills?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
            {talent.skills.slice(0,3).map(s=>(
              <span key={s} style={{ fontSize:11, background:`${color}10`, color, padding:'3px 9px', borderRadius:'var(--r-sm)', fontWeight:600 }}>{s}</span>
            ))}
            {talent.skills.length > 3 && <span style={{ fontSize:11, color:'var(--grey-400)', alignSelf:'center' }}>+{talent.skills.length-3}</span>}
          </div>
        )}

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid var(--grey-100)', gap:8 }}>
          <div style={{ minWidth:0 }}>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:15, color:'var(--ink)', letterSpacing:'-.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {talent.rate
                ? `${talent.currency || 'KES'} ${Number(talent.rate).toLocaleString('en-KE') || talent.rate}`
                : 'Negotiable'}
            </p>
            <p style={{ fontSize:11, color:'var(--grey-400)', marginTop:1 }}>
              {talent.rate && talent.rateType && talent.rateType !== 'negotiable' ? `per ${talent.rateType}` : talent.experience || ''}
            </p>
          </div>

          {talent.hidePhone ? (
            <span style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:'var(--r-sm)', background:'#FEF2F2', color:'#DC2626', fontSize:11, fontWeight:700, flexShrink:0 }}>
              <Lock size={11}/> Message only
            </span>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); setContactShown(v=>!v); }}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:'var(--r-sm)', background: contactShown ? '#1a1a1a' : color, color:'white', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .15s', flexShrink:0, opacity: contactShown ? 0.75 : 1 }}
            >
              <Phone size={12}/> {contactShown ? 'Hide' : 'Contact'}
            </button>
          )}
        </div>

        {/* Contact reveal */}
        {!talent.hidePhone && contactShown && (
          <div style={{ marginTop:12, padding:'12px 14px', background:'var(--green-light)', borderRadius:'var(--r-md)', border:'1px solid rgba(0,165,80,.15)' }} onClick={e => e.stopPropagation()}>
            {talent.phone ? (
              <>
                <p style={{ fontSize:12, color:'var(--grey-500)', marginBottom:8 }}>Contact {talent.posterName?.split(' ')[0] || 'them'} directly:</p>
                <div className="contact-btns">
                  <a href={`tel:${talent.phone}`} onClick={e=>e.stopPropagation()} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:'var(--r-sm)', background:'var(--ink)', color:'white', fontWeight:700, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
                    <Phone size={13}/> {talent.phone}
                  </a>
                  {talent.whatsapp !== false && (
                    <a href={`https://wa.me/254${talent.phone.replace(/^0/,'').replace(/\s/g,'')}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:'var(--r-sm)', background:'#25D366', color:'white', fontWeight:700, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}>
                      <MessageSquare size={13}/> WhatsApp
                    </a>
                  )}
                </div>
                <button onClick={e=>{ e.stopPropagation(); navigate(`/talent/${talent.id}`); }} style={{ marginTop:10, fontSize:12, color:'var(--grey-500)', background:'none', border:'none', cursor:'pointer', fontWeight:500, display:'block' }}>
                  View full profile →
                </button>
              </>
            ) : (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontSize:13, color:'var(--grey-500)' }}>No contact number provided.</p>
                <button onClick={e=>{ e.stopPropagation(); navigate(`/talent/${talent.id}`); }} style={{ fontSize:12, color:'var(--green-dark)', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>View profile →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Talent Page ─── */
export default function Talent() {
  const [sp] = useSearchParams();
  const [talents, setTalents]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [totalCount, setTotalCount] = useState(null);
  const [q, setQ]                 = useState(() => sp.get('q') || '');
  const [loc, setLoc]             = useState('All Kenya');
  const [cat, setCat]             = useState('All');
  const [exp, setExp]             = useState('Any Level');
  const [availOnly, setAvailOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    getTalents({ limitCount: 50 })
      .then(data => setTalents(data))
      .catch(() => setTalents([]))
      .finally(() => setLoading(false));
    getTalentsCount().then(setTotalCount).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return talents.filter(t => {
      const qL = q.toLowerCase();
      const qMatch = !q
        || t.title?.toLowerCase().includes(qL)
        || t.bio?.toLowerCase().includes(qL)
        || t.posterName?.toLowerCase().includes(qL)
        || (t.skills||[]).some(s => s.toLowerCase().includes(qL));
      const locMatch   = loc === 'All Kenya' || t.location?.includes(loc);
      const catMatch   = cat === 'All'       || t.category === cat;
      const expMatch   = exp === 'Any Level' || t.experience === exp;
      const availMatch = !availOnly          || t.available !== false;
      return qMatch && locMatch && catMatch && expMatch && availMatch;
    });
  }, [talents, q, loc, cat, exp, availOnly]);

  const hasActiveFilters = q || loc !== 'All Kenya' || cat !== 'All' || exp !== 'Any Level' || availOnly;
  const clearAll = () => { setQ(''); setLoc('All Kenya'); setCat('All'); setExp('Any Level'); setAvailOnly(false); };

  return (
    <>
      <SEO
        title={`Hire Freelancers in Kenya ${new Date().getFullYear()} | Top Kenyan Talent — Nairobi, Mombasa, Kisumu`}
        description="Find & hire verified Kenyan freelancers — developers, designers, writers, social media managers, photographers, accountants & more. Browse talent in Nairobi, Mombasa, Kisumu & remote. Direct contact, no commission, pay via M-Pesa."
        keywords="hire freelancers Kenya, Kenyan freelancers, freelancers Nairobi, hire web developer Kenya, hire graphic designer Nairobi, hire content writer Kenya, hire social media manager Kenya, hire virtual assistant Kenya, hire photographer Nairobi, hire accountant Kenya, hire digital marketer Kenya, hire software developer Nairobi, hire SEO specialist Kenya, hire data analyst Kenya, hire video editor Kenya, hire UI UX designer Kenya, hire lawyer Kenya, hire event planner Nairobi, hire tutor Nairobi, hire fundi Nairobi, find professionals Kenya, vetted freelancers Kenya, local freelancers Nairobi, affordable freelancers Kenya, top talent Kenya, where to hire freelancers Kenya, best freelancers Nairobi, hire remote workers Kenya, Kenya based freelancers, skilled workers Kenya, hire on M-Pesa Kenya, post a job Kenya, find talent Kenya, outsource work Kenya"
        canonical="/talent"
      />
      <StyleInjector />
      <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--cream)' }}>

        {/* ── Hero ── */}
        <div style={{ background:'var(--ink)', padding:'44px 24px 38px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize:'72px 72px', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:-100, right:'20%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,165,80,.1) 0%,transparent 65%)', pointerEvents:'none' }}/>
          <div style={{ maxWidth:1160, margin:'0 auto', position:'relative' }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--green)', marginBottom:10 }}>Find Talent</p>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px,4vw,42px)', fontWeight:900, color:'white', letterSpacing:'-.03em', marginBottom:6 }}>
              Kenya's Best Freelancers
            </h1>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:'clamp(13px,2vw,15px)', marginBottom:24 }}>
              Browse verified profiles. Click a card to view full details & contact.
            </p>
            {/* Search bar */}
            <div
              className="talent-search-bar"
              style={{ display:'flex', gap:0, maxWidth:580, width:'100%', background:'white', borderRadius:'var(--r-md)', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,.3)' }}
            >
              <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 14px', gap:8 }}>
                <Search size={16} color="var(--grey-400)"/>
                <input
                  value={q}
                  onChange={e=>setQ(e.target.value)}
                  placeholder="Search by skill, name, or role…"
                  style={{ flex:1, border:'none', fontSize:14, padding:'13px 0', outline:'none', color:'var(--ink)', fontFamily:'var(--font-body)', minWidth:0 }}
                />
                {q && (
                  <button onClick={()=>setQ('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--grey-400)', display:'flex', flexShrink:0 }}>
                    <X size={14}/>
                  </button>
                )}
              </div>
              <button className="btn-primary" style={{ borderRadius:0, padding:'0 20px', fontSize:14, whiteSpace:'nowrap' }}>Search</button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth:1160, margin:'0 auto', padding:'24px 16px' }}>

          {/* Filter bar */}
          <div className="filter-bar" style={{ marginBottom:20 }}>
            <button
              onClick={()=>setFiltersOpen(v=>!v)}
              style={{
                display:'none',
                alignItems:'center', gap:6,
                padding:'8px 13px', borderRadius:'var(--r-sm)',
                border:`1.5px solid ${hasActiveFilters?'var(--green)':'var(--grey-200)'}`,
                background: hasActiveFilters ? 'var(--green-light)' : 'white',
                color: hasActiveFilters ? 'var(--green-dark)' : 'var(--grey-600)',
                fontSize:13, fontWeight:600, cursor:'pointer',
              }}
              className="mobile-filter-toggle"
            >
              <SlidersHorizontal size={14}/> Filters {hasActiveFilters ? '•' : ''}
            </button>

            <div className={`filter-selects${filtersOpen ? ' filter-selects--open' : ''}`} style={{ display:'contents' }}>
              <Sel value={loc} onChange={setLoc} options={LOCS} />
              <Sel value={cat} onChange={setCat} options={CATS} />
              <Sel value={exp} onChange={setExp} options={EXP} />
              <label style={{
                display:'flex', alignItems:'center', gap:7, cursor:'pointer',
                padding:'8px 13px', borderRadius:'var(--r-sm)',
                border:`1.5px solid ${availOnly?'var(--green)':'var(--grey-200)'}`,
                background: availOnly ? 'var(--green-light)' : 'white',
                fontSize:13, fontWeight:500,
                color: availOnly ? 'var(--green-dark)' : 'var(--grey-600)',
                transition:'all .15s', userSelect:'none', whiteSpace:'nowrap',
              }}>
                <input type="checkbox" checked={availOnly} onChange={e=>setAvailOnly(e.target.checked)} style={{ display:'none' }}/>
                <div style={{
                  width:14, height:14, borderRadius:3,
                  border:`2px solid ${availOnly?'var(--green)':'var(--grey-300)'}`,
                  background: availOnly ? 'var(--green)' : 'white',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0, transition:'all .15s',
                }}>
                  {availOnly && <span style={{ color:'white', fontSize:9, lineHeight:1 }}>✓</span>}
                </div>
                Available Now
              </label>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAll}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 13px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--red)', background:'var(--red-light)', color:'var(--red)', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}
              >
                <X size={13}/> Clear all
              </button>
            )}
            <p className="filter-bar-count" style={{ marginLeft:'auto', fontSize:13, color:'var(--grey-500)', whiteSpace:'nowrap' }}>
              {loading ? 'Loading…' : (
                <>
                  <strong style={{ color:'var(--ink)' }}>{filtered.length}</strong>
                  {' of '}
                  <strong style={{ color:'var(--ink)' }}>{totalCount ?? talents.length}</strong>
                  {' profiles'}
                </>
              )}
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="talent-grid">
              {[1,2,3,4,5,6].map(i=><Skeleton key={i}/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'64px 24px', background:'white', borderRadius:'var(--r-xl)', border:'1px solid var(--grey-200)' }}>
              {talents.length === 0 ? (
                <>
                  <div style={{ fontSize:52, marginBottom:16 }}>🇰🇪</div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(18px,4vw,22px)', fontWeight:700, marginBottom:8 }}>Be the first talent listed!</h3>
                  <p style={{ color:'var(--grey-500)', marginBottom:24, fontSize:15, maxWidth:380, margin:'0 auto 24px' }}>
                    GigsKenya is live. Create your talent profile and get discovered by Kenyan businesses.
                  </p>
                  <button onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=talent')} className="btn-primary" style={{ padding:'12px 28px', fontSize:15 }}>
                    Create Talent Profile →
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom:14 }}><Search size={40} color="#9CA3AF" strokeWidth={1.5}/></div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, marginBottom:8 }}>No matches found</h3>
                  <p style={{ color:'var(--grey-500)', marginBottom:20 }}>Try different keywords or clear your filters.</p>
                  <button onClick={clearAll} className="btn-secondary" style={{ padding:'10px 24px' }}>Clear Filters</button>
                </>
              )}
            </div>
          ) : (
            <div className="talent-grid">
              {filtered.map(t => (
                <TalentCard key={t.id} talent={t} navigate={navigate} variant="default" />
              ))}
            </div>
          )}

          {/* CTA banner */}
          {!loading && talents.length > 0 && (
            <div className="talent-cta-banner" style={{ marginTop:48, background:'var(--ink)', borderRadius:'var(--r-xl)', padding:'28px 32px', display:'flex', gap:16 }}>
              <div>
                <p style={{ fontFamily:'var(--font-display)', fontSize:'clamp(15px,3vw,18px)', fontWeight:800, color:'white', letterSpacing:'-.02em', marginBottom:4 }}>
                  Are you a freelancer?
                </p>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.45)' }}>
                  List your services for free and get discovered by thousands of Kenyan businesses.
                </p>
              </div>
              <button
                onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=talent')}
                className="btn-primary"
                style={{ padding:'12px 24px', whiteSpace:'nowrap', flexShrink:0 }}
              >
                Create Your Profile →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .mobile-filter-toggle { display: flex !important; }
          .filter-selects { display: none !important; }
          .filter-selects--open { display: flex !important; flex-wrap: wrap; gap: 8px; width: 100%; }
        }
      `}</style>
    </>
  );
}

function Sel({ value, onChange, options }) {
  return (
    <div style={{ position:'relative' }}>
      <select
        value={value}
        onChange={e=>onChange(e.target.value)}
        style={{
          padding:'8px 32px 8px 12px',
          border:'1.5px solid var(--grey-200)',
          borderRadius:'var(--r-sm)',
          fontSize:13, fontWeight:500,
          background:'white', cursor:'pointer',
          appearance:'none', color:'var(--grey-700)',
          fontFamily:'var(--font-body)',
          transition:'border-color .15s',
          maxWidth:'100%',
        }}
        onFocus={e=>e.target.style.borderColor='var(--green)'}
        onBlur={e=>e.target.style.borderColor='var(--grey-200)'}
      >
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--grey-400)' }}/>
    </div>
  );
}