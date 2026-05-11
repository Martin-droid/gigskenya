import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, MessageSquare, ChevronDown, X, Link as LinkIcon, FileDown, SlidersHorizontal, ArrowRight, Zap, Lock } from 'lucide-react';
import { getTalents } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';

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
   TalentCard
   
   Props:
   - talent: talent object
   - navigate: react-router navigate fn
   - variant: 'default' (full contact reveal) | 'preview' (homepage — no contact, CTA leads to profile)
═══════════════════════════════════════════════════════════ */
export function TalentCard({ talent, navigate, variant = 'default' }) {
  const [contactShown, setContactShown] = useState(false);
  const isPreview = variant === 'preview';

  const color    = getColor(talent.id);
  const initials = getInitials(talent.posterName);
  const catBg    = catBgColors[talent.category]   || '#F6F6F4';
  const catText  = catTextColors[talent.category] || 'var(--grey-600)';

  const goToProfile = () => navigate(`/talent/${talent.id}`);

  /* Entire card navigates to profile on click.
     The contact button stops propagation so it doesn't trigger card click. */
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToProfile}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') goToProfile(); }}
      className="talent-card-clickable"
      style={{
        border: `1.5px solid ${talent.boosted ? 'var(--green)' : 'var(--grey-200)'}`,
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = talent.boosted ? 'var(--green)' : color;
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = talent.boosted ? 'var(--green)' : 'var(--grey-200)';
      }}
    >
      {/* Accent bar */}
      <div style={{
        height: 5,
        background: talent.boosted
          ? 'linear-gradient(90deg,var(--green),var(--green-dark))'
          : `linear-gradient(90deg,${color},${color}99)`,
      }} />

      <div style={{ padding: '18px' }}>
        {/* Top row: avatar + name + availability */}
        <div className="talent-card-toprow" style={{ display:'flex', gap:12, marginBottom:13, alignItems:'flex-start' }}>
          <div style={{
            width:52, height:52, borderRadius:'50%',
            background:`${color}18`, border:`2px solid ${color}30`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-display)', fontWeight:800, fontSize:17, color,
            flexShrink:0, overflow:'hidden',
          }}>
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
          {/* Availability badge */}
          <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0, background: talent.available !== false ? '#F0FDF4' : 'var(--grey-100)', borderRadius:'var(--r-full)', padding:'4px 9px' }}>
            <div style={{
              width:6, height:6, borderRadius:'50%',
              background: talent.available !== false ? '#22C55E' : '#D1D5DB',
              animation: talent.available !== false ? 'pulse-dot 2s infinite' : 'none',
            }}/>
            <span style={{ fontSize:10, fontWeight:700, color: talent.available !== false ? '#15803D' : 'var(--grey-400)', whiteSpace:'nowrap' }}>
              {talent.available !== false ? 'Available' : 'Busy'}
            </span>
          </div>
        </div>

        {/* Category + badges */}
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
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:'var(--r-full)', background:'var(--green)', color:'white' }}><Zap size={9} fill="white"/> Featured</span>
          )}
        </div>

        {/* Headline */}
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--ink)', marginBottom:7, lineHeight:1.35, letterSpacing:'-.01em' }}>
          {talent.title || 'Freelance Professional'}
        </h3>

        {/* Bio snippet */}
        {talent.bio && (
          <p style={{ fontSize:12, color:'var(--grey-500)', lineHeight:1.6, marginBottom:11 }}>
            {talent.bio.slice(0,95)}{talent.bio.length > 95 ? '…' : ''}
          </p>
        )}

        {/* Skills */}
        {talent.skills?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
            {talent.skills.slice(0,3).map(s=>(
              <span key={s} style={{ fontSize:11, background:`${color}10`, color, padding:'3px 9px', borderRadius:'var(--r-sm)', fontWeight:600 }}>{s}</span>
            ))}
            {talent.skills.length > 3 && (
              <span style={{ fontSize:11, color:'var(--grey-400)', alignSelf:'center' }}>+{talent.skills.length-3}</span>
            )}
          </div>
        )}

        {/* Bottom: rate + action button */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid var(--grey-100)', gap:8 }}>
          <div style={{ minWidth:0 }}>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:15, color:'var(--ink)', letterSpacing:'-.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {talent.rate
                ? `${talent.currency || 'KES'} ${Number(talent.rate).toLocaleString('en-KE') || talent.rate}`
                : 'Negotiable'}
            </p>
            <p style={{ fontSize:11, color:'var(--grey-400)', marginTop:1 }}>
              {talent.rate && talent.rateType && talent.rateType !== 'negotiable'
                ? `per ${talent.rateType}`
                : talent.experience || ''}
            </p>
          </div>

          {isPreview ? (
            /* ── PREVIEW variant (homepage): no contact reveal, link to profile ── */
            <button
              onClick={e => { e.stopPropagation(); navigate(`/talent/${talent.id}`); }}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'8px 14px', borderRadius:'var(--r-sm)',
                background:'var(--green-light)',
                color:'var(--green-dark)',
                border:'1.5px solid rgba(0,165,80,.2)',
                fontSize:12, fontWeight:700,
                cursor:'pointer', transition:'all .15s', flexShrink:0,
              }}
              onMouseOver={e => { e.stopPropagation(); e.currentTarget.style.background='var(--green)'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='var(--green)'; }}
              onMouseOut={e => { e.stopPropagation(); e.currentTarget.style.background='var(--green-light)'; e.currentTarget.style.color='var(--green-dark)'; e.currentTarget.style.borderColor='rgba(0,165,80,.2)'; }}
            >
              View Profile <ArrowRight size={11}/>
            </button>
          ) : talent.hidePhone ? (
            /* ── Phone hidden — message only ── */
            <span style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:'var(--r-sm)', background:'#FEF2F2', color:'#DC2626', fontSize:11, fontWeight:700, flexShrink:0 }}>
              <Lock size={11}/> Message only
            </span>
          ) : (
            /* ── DEFAULT variant (talent page): full contact reveal ── */
            <button
              onClick={e => { e.stopPropagation(); setContactShown(v=>!v); }}
              style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'8px 14px', borderRadius:'var(--r-sm)',
                background: contactShown ? '#1a1a1a' : color,
                color: 'white',
                border: 'none', fontSize:12, fontWeight:700,
                cursor:'pointer', transition:'all .15s', flexShrink:0,
                opacity: contactShown ? 0.75 : 1,
              }}
            >
              <Phone size={12}/> {contactShown ? 'Hide' : 'Contact'}
            </button>
          )}
        </div>

        {/* Contact reveal — default variant only, phone not hidden */}
        {!isPreview && !talent.hidePhone && contactShown && (
          <div
            style={{ marginTop:12, padding:'12px 14px', background:'var(--green-light)', borderRadius:'var(--r-md)', border:'1px solid rgba(0,165,80,.15)' }}
            onClick={e => e.stopPropagation()}
          >
            {talent.phone ? (
              <>
                <p style={{ fontSize:12, color:'var(--grey-500)', marginBottom:8 }}>
                  Contact {talent.posterName?.split(' ')[0] || 'them'} directly:
                </p>
                <div className="contact-btns">
                  <a
                    href={`tel:${talent.phone}`}
                    onClick={e => e.stopPropagation()}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:'var(--r-sm)', background:'var(--ink)', color:'white', fontWeight:700, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}
                  >
                    <Phone size={13}/> {talent.phone}
                  </a>
                  {talent.whatsapp !== false && (
                    <a
                      href={`https://wa.me/254${talent.phone.replace(/^0/,'').replace(/\s/g,'')}`}
                      target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:'var(--r-sm)', background:'#25D366', color:'white', fontWeight:700, fontSize:13, textDecoration:'none', whiteSpace:'nowrap' }}
                    >
                      <MessageSquare size={13}/> WhatsApp
                    </a>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/talent/${talent.id}`); }}
                  style={{ marginTop:10, fontSize:12, color:'var(--grey-500)', background:'none', border:'none', cursor:'pointer', fontWeight:500, display:'block' }}
                >
                  View full profile →
                </button>
              </>
            ) : (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontSize:13, color:'var(--grey-500)' }}>No contact number provided.</p>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/talent/${talent.id}`); }}
                  style={{ fontSize:12, color:'var(--green-dark)', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}
                >
                  View profile →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Preview variant: subtle "click card to view" hint */}
        {isPreview && (
          <p style={{ marginTop:10, fontSize:11, color:'var(--grey-300)', textAlign:'center', letterSpacing:'.02em' }}>
            Click anywhere to view full profile
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Talent Page ─── */
export default function Talent() {
  const [talents, setTalents]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [q, setQ]                 = useState('');
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
              {loading ? 'Loading…' : <><strong style={{ color:'var(--ink)' }}>{filtered.length}</strong> found</>}
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