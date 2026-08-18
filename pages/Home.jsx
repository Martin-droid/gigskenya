import { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Search, MapPin, Phone, ArrowRight, ChevronRight, ChevronLeft,
  Code, Palette, PenTool, BarChart2, Camera, Headphones, Globe,
  Briefcase, TrendingUp, CheckCircle, Zap, Users, Sparkles,
  Layers, Clock, Building2, Shield, Laptop
} from 'lucide-react';
import { getAds, getTalents } from '../lib/firestore';
import { TalentCard } from './Talent';
import { useAuth } from '../context/AuthContext';
import { hashIndex, avatarColor, darkGradient, GOLD_GRADIENT, DARK_TILE } from '../lib/colors';
import { timeAgo } from '../lib/time';
import './Home.css';

/* ── Categories ─────────────────────────────────────────── */
const CATEGORIES = [
  { icon: Code,       label:'Tech & Dev',          sub:'Developers, engineers, DevOps',  slug:'Tech & Dev',          color:'#7C3AED' },
  { icon: Palette,    label:'Design',               sub:'Logos, branding, UI/UX',         slug:'Design',              color:'#DB2777' },
  { icon: PenTool,    label:'Writing & Content',    sub:'Copywriting, blogs, scripts',    slug:'Writing & Content',   color:'#D97706' },
  { icon: BarChart2,  label:'Digital Marketing',    sub:'SEO, social media, paid ads',    slug:'Digital Marketing',   color:'#059669' },
  { icon: Camera,     label:'Photo & Video',        sub:'Photography, film, editing',     slug:'Photo & Video',       color:'#DC2626' },
  { icon: Headphones, label:'Customer Support',     sub:'VA, admin, data entry',          slug:'Customer Support',    color:'#0891B2' },
  { icon: Globe,      label:'Translation',          sub:'Swahili, English & more',        slug:'Translation',         color:'#EA580C' },
  { icon: Briefcase,  label:'Business & Finance',   sub:'Accounting, legal, consulting',  slug:'Business & Finance',  color:'#0D9488' },
];

const INDUSTRY_TO_CATEGORY = {
  'Software & IT':'Tech & Dev','Graphic Design':'Design','Content Writing':'Writing & Content',
  'Digital Marketing':'Digital Marketing','Photography':'Photo & Video',
  'Accounting':'Business & Finance','Legal Services':'Business & Finance',
  'Construction':null,'Education':null,'Events':null,'Healthcare':null,'Real Estate':null,
};
const POPULAR_TO_CATEGORY = {
  'Android Developer':'Tech & Dev','Logo Design Nairobi':'Design','M-Pesa Integration':'Tech & Dev',
  'Social Media Manager':'Digital Marketing','Video Editing':'Photo & Video',
  'Accountant Nairobi':'Business & Finance','SEO Kenya':'Digital Marketing',
};

const browseIndustry = (navigate, label) => {
  const cat = INDUSTRY_TO_CATEGORY[label];
  navigate(cat ? `/browse?category=${encodeURIComponent(cat)}&type=all` : `/browse?q=${encodeURIComponent(label)}&type=all`);
};
const browseTrending = (navigate, label) => {
  const cat = POPULAR_TO_CATEGORY[label];
  navigate(cat ? `/browse?category=${encodeURIComponent(cat)}&type=all` : `/browse?q=${encodeURIComponent(label)}&type=all`);
};

/* Avatar colours — no blue/indigo */
const AVATAR_PALETTE = ['#00875A','#0D9488','#D97706','#DC2626','#7C3AED','#EA580C','#0891B2','#059669'];
const getColor = (id) => AVATAR_PALETTE[hashIndex(id, AVATAR_PALETTE.length)];
const getInitials = (name) => (name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
/* ── Hero qualification: active + at least a headline/bio + phone ── */
const heroQualifies = (t) =>
  t.status === 'active' &&
  !!(t.title || t.bio)  &&
  !!t.phone;

/* ── Completeness score out of 16 — higher surfaces first ── */
const heroScore = (t) => {
  const bioDepth   = !t.bio         ? 0 : t.bio.length   >= 120 ? 3 : t.bio.length   >= 40 ? 2 : 1;
  const skillDepth = !(t.skills?.length) ? 0 : t.skills.length >= 4 ? 2 : 1;
  return (
    (t.photoURL     ? 4 : 0) +   // photo is the most important signal
    (t.title        ? 2 : 0) +   // professional headline
    bioDepth                 +   // 0–3 depth bonus based on bio length
    skillDepth               +   // 0–2 based on how many skills listed
    (t.category     ? 1 : 0) +
    (t.location     ? 1 : 0) +
    (t.rate         ? 1 : 0) +
    (t.experience   ? 1 : 0) +
    (t.portfolioUrl ? 1 : 0)
  );                               // max = 16
};

const HERO_INTERVAL = 7000; // ms — long enough to read the featured card

/* ── Shared carousel state (syncs featured panel + strip) ── */
function useHeroCarousel(talents) {
  const [idx, setIdx]       = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!talents.length || paused) return;
    const id = setInterval(() => setIdx(i => (i + 1) % talents.length), HERO_INTERVAL);
    return () => clearInterval(id);
  }, [talents.length, paused]);
  return { idx, setIdx, paused, setPaused };
}

/* ── FeaturedProfileCard — the large right-side panel ───── */
function FeaturedProfileCard({ talent, navigate }) {
  const color    = getColor(talent.id);
  const initials = getInitials(talent.posterName);
  const isAvail  = talent.available !== false;

  return (
    <div className="gk-featured-wrap">
      {/* Glass card — key prop on the parent causes remount, so the animation reruns */}
      <div className="gk-featured-card" onClick={() => navigate(`/talent/${talent.id}`)}
        style={{ animation: `gk-hero-fade-in 0.45s cubic-bezier(.4,0,.2,1) both` }}>

        {/* Timed progress bar — resets on remount (7 s matches HERO_INTERVAL) */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:3, zIndex:2,
          background:`linear-gradient(90deg,${color},${color}99)`,
          animation:`gk-hero-progress ${HERO_INTERVAL}ms linear both`,
          transformOrigin:'left',
        }}/>

        {/* Portrait photo area */}
        <div className="gk-featured-photo" style={{ background:`linear-gradient(165deg,${color}28,${color}09)` }}>
          {talent.photoURL ? (
            <img
              src={talent.photoURL} alt={talent.posterName}
              className="gk-featured-img"
              decoding="async"
              fetchPriority="high"
              onError={e => { e.target.style.display='none'; }}
            />
          ) : (
            <div style={{
              width:90, height:90, borderRadius:24,
              background:`linear-gradient(145deg,${color},${color}99)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:900, fontSize:28, color:'white',
              boxShadow:`0 10px 36px ${color}55`,
              border:'3px solid rgba(255,255,255,.2)',
            }}>
              {initials}
            </div>
          )}
          {/* Availability pill over photo */}
          <div className={`gk-featured-avail-pill${isAvail ? '' : ' gk-featured-avail-pill--busy'}`}>
            <div style={{ width:6, height:6, borderRadius:'50%', background: isAvail ? '#22C55E' : '#6B7280', animation: isAvail ? 'pulse-dot 2s infinite' : 'none', flexShrink:0 }}/>
            {isAvail ? 'Available now' : 'Busy'}
          </div>
        </div>

        {/* Info panel */}
        <div className="gk-featured-info">
          <p className="gk-featured-name">{talent.posterName || 'Freelancer'}</p>
          <p className="gk-featured-title">{talent.title || 'Freelance Professional'}</p>

          {talent.category && (
            <span className="gk-featured-cat" style={{ background:`${color}22`, color }}>
              {talent.category}
            </span>
          )}

          {talent.location && (
            <p className="gk-featured-loc">
              <MapPin size={12} color={color}/> {talent.location}
            </p>
          )}

          {talent.rate && (
            <p className="gk-featured-rate">
              {talent.currency || 'KES'} {Number(talent.rate).toLocaleString('en-KE') || talent.rate}
              {talent.rateType && talent.rateType !== 'negotiable' && (
                <span className="gk-featured-rate-sub"> / {talent.rateType}</span>
              )}
            </p>
          )}

          <button
            className="gk-featured-btn"
            onClick={e => { e.stopPropagation(); navigate(`/talent/${talent.id}`); }}
          >
            View Full Profile <ArrowRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── HeroProfileStrip — synced carousel at hero bottom ───── */
function HeroProfileStrip({ talents, navigate, idx, setIdx, setPaused }) {
  const trackRef = useRef(null);
  const CARD_W   = 272;

  useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.scrollTo({ left: idx * CARD_W, behavior: 'smooth' });
  }, [idx]);

  if (!talents.length) return null;

  const prev = () => setIdx(i => (i - 1 + talents.length) % talents.length);
  const next = () => setIdx(i => (i + 1) % talents.length);

  return (
    <div
      className="gk-pstrip"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="gk-pstrip-header">
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="gk-live-dot"/>
          <span className="gk-pstrip-label">Featured talent on GigsKenya</span>
        </div>
        <div className="gk-pstrip-nav">
          <button className="gk-pstrip-arrow" onClick={prev} aria-label="Previous"><ChevronLeft size={16}/></button>
          <button className="gk-pstrip-arrow" onClick={next} aria-label="Next"><ChevronRight size={16}/></button>
        </div>
      </div>

      <div className="gk-pstrip-outer">
        <div className="gk-pstrip-track" ref={trackRef}>
          {talents.map((t, i) => {
            const color   = getColor(t.id);
            const init    = getInitials(t.posterName);
            const isAvail = t.available !== false;
            const active  = i === idx;
            return (
              <div
                key={t.id}
                className={`gk-pcard${active ? ' gk-pcard--active' : ''}`}
                onClick={() => { setIdx(i); navigate(`/talent/${t.id}`); }}
                role="button" tabIndex={0}
                onKeyDown={e => { if (e.key==='Enter'||e.key===' ') { setIdx(i); navigate(`/talent/${t.id}`); } }}
              >
                <div className="gk-pcard-photo" style={{ background:`linear-gradient(160deg,${color}28,${color}09)` }}>
                  {t.photoURL ? (
                    <img src={t.photoURL} alt={t.posterName} className="gk-pcard-img" decoding="async" loading="lazy" onError={e => { e.target.style.display='none'; }}/>
                  ) : (
                    <div style={{ width:52, height:52, borderRadius:15, background:`linear-gradient(145deg,${color},${color}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:17, color:'white', boxShadow:`0 6px 18px ${color}50` }}>
                      {init}
                    </div>
                  )}
                </div>
                <div className="gk-pcard-info">
                  <p className="gk-pcard-name">{t.posterName || 'Freelancer'}</p>
                  <p className="gk-pcard-role">{(t.title || t.category || 'Freelance Professional').slice(0, 28)}</p>
                  <div className="gk-pcard-meta">
                    {t.category && <span className="gk-pcard-cat">{t.category}</span>}
                    <div className="gk-pcard-avail">
                      <div style={{ width:5, height:5, borderRadius:'50%', flexShrink:0, background: isAvail ? '#22C55E' : '#4B5563', boxShadow: isAvail ? '0 0 5px rgba(34,197,94,.55)' : 'none', animation: isAvail ? 'pulse-dot 2s infinite' : 'none' }}/>
                      <span style={{ color: isAvail ? '#4ADE80' : '#6B7280' }}>{isAvail ? 'Available now' : 'Busy'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="gk-pstrip-dots">
        {talents.map((_, i) => (
          <button key={i} className={`gk-pstrip-dot${i === idx ? ' gk-pstrip-dot--active' : ''}`} onClick={() => setIdx(i)} aria-label={`Profile ${i + 1}`}/>
        ))}
      </div>
    </div>
  );
}

/* ── AdCard ─────────────────────────────────────────────── */
export function AdCard({ ad, navigate }) {
  const [hov, setHov] = useState(false);
  const isJob = ad.type === 'job';
  const color = avatarColor(ad.id);
  const initials = (ad.posterName||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const tags = ad.tags
    ? (Array.isArray(ad.tags) ? ad.tags : ad.tags.split(',').map(t=>t.trim()).filter(Boolean))
    : [];
  const rate = ad.rate || ad.budget;
  const posted = timeAgo(ad.createdAt);

  return (
    <div
      role="link" tabIndex={0}
      onClick={() => navigate(`/ad/${ad.id}`)}
      onKeyDown={e => { if (e.key==='Enter'||e.key===' ') navigate(`/ad/${ad.id}`); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="gk-ad-card"
      style={{
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 20px 48px ${color}1e, 0 4px 14px rgba(0,0,0,.06)` : '0 1px 4px rgba(0,0,0,.06)',
        borderColor: hov ? color+'55' : '#E5E7EB',
        overflow: 'hidden',
      }}
    >
      {/* Top accent stripe */}
      <div style={{
        height: 3,
        background: ad.boosted ? GOLD_GRADIENT : darkGradient(color),
      }} />

      <div style={{ padding:'18px 20px 20px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{
            width:40, height:40, borderRadius:12, flexShrink:0, overflow:'hidden',
            background: ad.posterLogo ? 'white' : DARK_TILE,
            border: ad.posterLogo ? '1px solid #E5E7EB' : 'none',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:800, color:'white', letterSpacing:'.01em',
          }}>
            {ad.posterLogo
              ? <img src={ad.posterLogo} alt="" style={{ width:'100%', height:'100%', objectFit:'contain', padding:4 }} />
              : initials
            }
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'#111827', lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {ad.posterName || 'Anonymous'}
            </p>
            {ad.location && (
              <p style={{ fontSize:11, color:'#9CA3AF', display:'flex', alignItems:'center', gap:3, marginTop:2 }}>
                <MapPin size={9} strokeWidth={2.5}/>{ad.location}
              </p>
            )}
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
            {ad.boosted && (
              <span style={{ fontSize:9.5, fontWeight:800, padding:'2px 7px', borderRadius:6, background:'#00A550', color:'white', letterSpacing:'.04em' }}>FEATURED</span>
            )}
            {posted && <span style={{ fontSize:10.5, color:'#9CA3AF', whiteSpace:'nowrap' }}>{posted}</span>}
          </div>
        </div>

        {/* Category */}
        {ad.category && (
          <p style={{ fontSize:10, fontWeight:700, color:'#9CA3AF', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8 }}>
            {ad.category}
          </p>
        )}

        {/* Title */}
        <h3 style={{ fontSize:15, fontWeight:800, color:'#0F172A', lineHeight:1.35, letterSpacing:'-.02em', marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', fontFamily:'var(--font-display)' }}>
          {ad.title}
        </h3>

        {/* Description */}
        {ad.description && (
          <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.7, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {ad.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>
            {tags.slice(0,3).map(t => (
              <span key={t} style={{ fontSize:11, padding:'3px 9px', borderRadius:8, background:'#F9FAFB', color:'#4B5563', fontWeight:500, border:'1px solid #E5E7EB' }}>{t}</span>
            ))}
            {tags.length > 3 && <span style={{ fontSize:11, color:'#9CA3AF' }}>+{tags.length-3}</span>}
          </div>
        )}

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid #F3F4F6', gap:8 }}>
          <div>
            {rate
              ? <p style={{ fontSize:14.5, fontWeight:800, color:'#0F172A', margin:0 }}>{rate}</p>
              : <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>Negotiable</p>
            }
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:5, padding:'8px 16px', borderRadius:10,
            background: hov ? '#00A550' : '#F0FDF4',
            color: hov ? 'white' : '#00875A',
            fontSize:12, fontWeight:700, transition:'background .2s, color .2s', flexShrink:0,
          }}>
            {isJob ? 'View Job' : 'View'} <ChevronRight size={12}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div style={{ background:'white', borderRadius:16, border:'1px solid #E5E7EB', padding:'20px' }}>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14 }}>
        <div className="gk-skeleton" style={{ width:40, height:40, borderRadius:12, flexShrink:0 }}/>
        <div style={{ flex:1 }}>
          <div className="gk-skeleton" style={{ height:12, width:'50%', marginBottom:6, borderRadius:6 }}/>
          <div className="gk-skeleton" style={{ height:10, width:'32%', borderRadius:6 }}/>
        </div>
      </div>
      <div className="gk-skeleton" style={{ height:10, width:'28%', borderRadius:5, marginBottom:10 }}/>
      <div className="gk-skeleton" style={{ height:16, width:'90%', borderRadius:6, marginBottom:6 }}/>
      <div className="gk-skeleton" style={{ height:13, width:'75%', borderRadius:6, marginBottom:6 }}/>
      <div className="gk-skeleton" style={{ height:13, width:'60%', borderRadius:6, marginBottom:14 }}/>
      <div style={{ display:'flex', gap:5, marginBottom:14 }}>
        {[55,48,44].map(w=><div key={w} className="gk-skeleton" style={{ height:22, width:w, borderRadius:8 }}/>)}
      </div>
      <div style={{ height:1, background:'#F3F4F6', marginBottom:12 }}/>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <div className="gk-skeleton" style={{ height:14, width:72, borderRadius:6 }}/>
        <div className="gk-skeleton" style={{ height:34, width:76, borderRadius:10 }}/>
      </div>
    </div>
  );
}

/* ── Section header ──────────────────────────────────────── */
function SectionHeader({ eyebrow, title, sub, linkTo, linkLabel }) {
  return (
    <div className="gk-sec-header">
      <div>
        <p className="gk-eyebrow">{eyebrow}</p>
        <h2 className="gk-section-title" dangerouslySetInnerHTML={{ __html:title }}/>
        {sub && <p className="gk-section-sub">{sub}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="gk-sec-link">
          {linkLabel} <ChevronRight size={13}/>
        </Link>
      )}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, subtitle, ctaLabel, onCta }) {
  return (
    <div style={{ textAlign:'center', padding:'64px 24px', background:'#FAFAFA', borderRadius:20, border:'1.5px dashed #E5E7EB' }}>
      <div style={{ width:56, height:56, borderRadius:16, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
        <Icon size={26} color="#D1D5DB"/>
      </div>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, marginBottom:8, color:'#0F172A' }}>{title}</h3>
      <p style={{ color:'#6B7280', fontSize:14, marginBottom:24, maxWidth:340, margin:'0 auto 24px', lineHeight:1.75 }}>{subtitle}</p>
      {onCta && (
        <button type="button" onClick={onCta} className="gk-btn-primary" style={{ padding:'12px 24px', fontSize:14, margin:'0 auto' }}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   HOME
════════════════════════════════════════════════════════════ */
export default function Home() {
  const [q, setQ]                           = useState('');
  const [tab, setTab]                       = useState('all');
  const [recentAds, setRecentAds]           = useState([]);
  const [featuredTalent, setFeaturedTalent] = useState([]);
  const [loadingAds, setLoadingAds]         = useState(true);
  const [loadingTalent, setLoadingTalent]   = useState(true);
  const navigate            = useNavigate();
  const { isAuthenticated } = useAuth();

  /* Shared state for hero featured panel + strip */
  const { idx: heroIdx, setIdx: setHeroIdx, setPaused: setHeroPaused } = useHeroCarousel(featuredTalent);

  useEffect(() => {
    getAds({ limitCount: 6 }).then(setRecentAds).catch(()=>{}).finally(()=>setLoadingAds(false));
    getTalents({ limitCount: 50 }).then(all => {
      const sorted = all
        .filter(heroQualifies)
        .sort((a, b) => {
          if (b.boosted !== a.boosted) return b.boosted ? 1 : -1;
          const scoreDiff = heroScore(b) - heroScore(a);
          if (scoreDiff !== 0) return scoreDiff;
          if (b.available !== a.available) return b.available !== false ? 1 : -1;
          return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
        });
      setFeaturedTalent(sorted.slice(0, 12));
    }).catch(()=>{}).finally(()=>setLoadingTalent(false));
  }, []);

  const search = () => tab === 'service'
    ? navigate(`/talent?q=${encodeURIComponent(q)}`)
    : navigate(`/browse?q=${encodeURIComponent(q)}&type=${tab}`);

  const POPULAR = ['Android Developer','Logo Design Nairobi','M-Pesa Integration','Social Media Manager','Video Editing','Accountant Nairobi','SEO Kenya'];
  const activeTalent = featuredTalent[heroIdx];

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'GigsKenya — Jobs in Kenya & Freelance Marketplace',
    description: 'Find jobs in Kenya or hire top Kenyan freelancers. Tech, design, writing, marketing, photography & more. Nairobi, Mombasa, Kisumu & remote.',
    url: 'https://gigs254.com',
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gigs254.com' }] },
  };

  return (
    <>
    <SEO
      title={`Jobs in Kenya ${new Date().getFullYear()} | Freelance Work, Hire Talent & Kazi Kenya`}
      description="Kenya's #1 freelance & jobs marketplace. Find jobs in Nairobi, Mombasa, Kisumu & across Kenya — or hire top Kenyan freelancers. Tech, design, writing, marketing & more. Pay via M-Pesa. Free to join. Kazi Kenya, ajira, side hustle, online jobs."
      keywords="jobs in Kenya, jobs in Nairobi, Kenya jobs 2026, freelance jobs Kenya, online jobs Kenya, kazi Kenya, ajira Kenya, tafuta kazi, pata kazi, nafasi za kazi, work from home Kenya, remote jobs Kenya, part time jobs Kenya, side hustle Kenya, gig work Kenya, hire freelancers Kenya, hire graphic designer Nairobi, hire web developer Kenya, hire content writer Kenya, hire virtual assistant Kenya, hire social media manager Kenya, hire photographer Nairobi, digital marketing jobs Kenya, software developer Kenya, online jobs that pay via M-Pesa, freelance jobs Nairobi, data entry jobs Kenya, transcription jobs Kenya, online writing jobs Kenya, jobs Mombasa, jobs Kisumu, jobs Nakuru, jobs Eldoret, M-Pesa freelance Kenya, Silicon Savannah jobs, hustle Kenya, earn money online Kenya, make money online Kenya, kazi online Kenya, online jobs that pay through M-Pesa, tech jobs Nairobi, fresh graduate jobs Kenya, entry level jobs Kenya, no experience jobs Kenya, flexible jobs Kenya, casual jobs Nairobi, jua kali Kenya, fundi Nairobi"
      canonical="/"
      jsonLd={homeJsonLd}
    />
    <div className="gk-home-page" style={{ paddingTop:64 }}>

      {/* ════ HERO — 2-column like Toptal ════════════════════ */}
      <section className="gk-hero-section" aria-label="Kenya's top freelance marketplace">
        <div className="gk-hero-glow"/>

        {/* Main 2-column body */}
        <div className="gk-hero-body">

          {/* ── Left: text content ── */}
          <div className="gk-hero-left">

            <div className="gk-fade-up gk-hero-badge">
              <span className="gk-live-dot"/>
              <span>Kenya's #1 Freelance &amp; Gig Marketplace</span>
            </div>

            <h1 className="gk-fade-up gk-d1 gk-hero-h1">
              Find Work.<br/>
              Find Talent.<br/>
              <em className="gk-hero-accent">Find Your Next Gig.</em>
            </h1>

            <p className="gk-fade-up gk-d2 gk-hero-sub">
              Connect directly with top Kenyan freelancers — no commission, no middleman, just great work.
            </p>

            <div className="gk-fade-up gk-d3 gk-hero-ctas">
              <button type="button" className="gk-cta-primary" onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=talent')}>
                <Laptop size={18}/> Find Work
              </button>
              <button type="button" className="gk-cta-ghost" onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=hirer')}>
                <Building2 size={18}/> Hire Talent
              </button>
            </div>

            <div className="gk-fade-up gk-d4 gk-hero-search-wrap">
              <div className="gk-search-bar">
                <div className="gk-search-tabs">
                  {[{id:'all',l:'All'},{id:'service',l:'Talent'},{id:'job',l:'Jobs'}].map(({id,l})=>(
                    <button type="button" key={id} onClick={()=>setTab(id)} className={`gk-search-tab${tab===id?' gk-search-tab--active':''}`}>{l}</button>
                  ))}
                </div>
                <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Search skills or roles…" aria-label="Search" className="gk-search-input"/>
                <button type="button" onClick={search} className="gk-search-btn"><Search size={15}/> Search</button>
              </div>
              <div className="gk-popular">
                <span className="gk-popular-label">Trending:</span>
                {POPULAR.map(t=>(<button type="button" key={t} className="gk-pill" onClick={()=>browseTrending(navigate,t)}>{t}</button>))}
              </div>
            </div>

            <div className="gk-fade-up gk-d4 gk-trust-row">
              {[
                { icon:CheckCircle, text:'Free to join' },
                { icon:Phone,       text:'Direct contact' },
                { icon:Shield,      text:'No middleman' },
                { icon:MapPin,      text:'Kenya-wide' },
              ].map(({ icon:Icon, text }) => (
                <div key={text} className="gk-trust-badge">
                  <Icon size={12} color="var(--green)"/>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: featured profile (changes with carousel) ── */}
          {activeTalent && (
            <FeaturedProfileCard
              key={activeTalent.id}
              talent={activeTalent}
              navigate={navigate}
            />
          )}
        </div>

        {/* Talent carousel strip — synced with featured panel */}
        <HeroProfileStrip
          talents={featuredTalent}
          navigate={navigate}
          idx={heroIdx}
          setIdx={setHeroIdx}
          setPaused={setHeroPaused}
        />

      </section>

      {/* ════ INDUSTRY BAND ═══════════════════════════════════ */}
      <section className="gk-band">
        <div className="gk-band-inner">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span className="gk-live-dot"/>
            <span style={{ fontSize:12.5, color:'rgba(255,255,255,.38)', fontWeight:500 }}>Live platform</span>
          </div>
          <div className="gk-industry-strip">
            <span className="gk-industry-label">Industries:</span>
            {['Software & IT','Graphic Design','Content Writing','Digital Marketing','Photography','Accounting','Legal Services','Construction','Education','Events','Healthcare','Real Estate'].map(ind=>(
              <button type="button" key={ind} className="gk-industry-pill" onClick={()=>browseIndustry(navigate,ind)}>{ind}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURED TALENT ════════════════════════════════ */}
      <section className="gk-section gk-section--white" aria-label="Top Kenyan freelancers">
        <div className="gk-container">
          <SectionHeader
            eyebrow="Featured Professionals"
            title="Top Kenyan Freelancers<br/>Ready to Work"
            sub="Profiles across tech, design, marketing and finance. Direct contact, no middleman."
            linkTo="/talent"
            linkLabel="View all talent"
          />
          {loadingTalent ? (
            <div className="gk-ga">{[1,2,3].map(i=><CardSkeleton key={i}/>)}</div>
          ) : featuredTalent.length===0 ? (
            <EmptyState
              icon={Users}
              title="Be among the first professionals listed"
              subtitle="Create a profile now and get discovered by businesses actively hiring across Kenya."
              ctaLabel="Create My Profile →"
              onCta={()=>navigate(isAuthenticated?'/dashboard':'/register?role=talent')}
            />
          ) : (
            <>
              <div className="gk-ga">
                {featuredTalent.map(t=><TalentCard key={t.id} talent={t} navigate={navigate} variant="preview"/>)}
              </div>
              <div style={{ textAlign:'center', marginTop:40 }}>
                <button type="button" onClick={()=>navigate('/talent')} className="gk-btn-primary" style={{ padding:'13px 28px', fontSize:14 }}>
                  Browse All Kenyan Freelancers <ArrowRight size={15}/>
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ════ LATEST LISTINGS ════════════════════════════════ */}
      <section className="gk-section gk-section--grey" aria-label="Latest freelance jobs and gig listings">
        <div className="gk-container">
          <SectionHeader
            eyebrow="Just Posted"
            title="Fresh Gigs &amp; Job Listings"
            sub="New opportunities posted daily across Kenya's fastest-growing industries."
            linkTo="/browse"
            linkLabel="Browse all"
          />
          {loadingAds ? (
            <div className="gk-ga">{[1,2,3,4,5,6].map(i=><CardSkeleton key={i}/>)}</div>
          ) : recentAds.length===0 ? (
            <EmptyState
              icon={Zap}
              title="Be the first to post a listing"
              subtitle="GigsKenya is live and growing. Post a job and reach Kenyan professionals."
              ctaLabel="Post a Listing →"
              onCta={()=>navigate('/register?role=hirer')}
            />
          ) : (
            <div className="gk-ga">
              {recentAds.map(ad=><AdCard key={ad.id} ad={ad} navigate={navigate}/>)}
            </div>
          )}
        </div>
      </section>

      {/* ════ CATEGORIES ══════════════════════════════════════ */}
      <section className="gk-section gk-section--white" aria-label="Browse freelance categories">
        <div className="gk-container">
          <SectionHeader
            eyebrow="Explore by Industry"
            title="Find the right skill<br/>for any job"
            sub="Browse freelancers and listings by industry."
            linkTo="/browse?type=all"
            linkLabel="All listings"
          />
          <div className="gk-g4">
            {CATEGORIES.map(({ icon:Icon, label, sub, slug, color })=>(
              <button type="button" key={slug}
                onClick={()=>navigate(`/browse?category=${encodeURIComponent(slug)}&type=all`)}
                aria-label={`Browse ${label} in Kenya`}
                className="gk-cat-card"
                onMouseOver={e=>{ e.currentTarget.style.borderColor=color+'44'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 40px rgba(0,0,0,.08)`; }}
                onMouseOut={e=>{ e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`${color}10`, border:`1.5px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, flexShrink:0 }}>
                  <Icon size={22} color={color}/>
                </div>
                <span className="gk-cat-label">{label}</span>
                <span className="gk-cat-sub">{sub}</span>
                <div className="gk-cat-cta" style={{ color }}>Browse <ChevronRight size={11}/></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════════════════════════════════════ */}
      <section className="gk-section gk-section--grey" aria-label="How to find freelance work">
        <div className="gk-container" style={{ maxWidth:1000 }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <p className="gk-eyebrow" style={{ textAlign:'center' }}>Simple &amp; Direct</p>
            <h2 className="gk-section-title" style={{ textAlign:'center', maxWidth:'none' }}>Land your next gig in 3 steps</h2>
            <p style={{ fontSize:16, color:'#6B7280', maxWidth:440, margin:'12px auto 0', lineHeight:1.8 }}>
              Whether you're a freelancer or a business — GigsKenya keeps it fast and direct.
            </p>
          </div>

          <div className="gk-steps-grid">
            {[
              { n:'1', icon:Search,       title:'Search or Post',       desc:'Browse talent filtered by skill, location, and industry. Or post your own listing in minutes.' },
              { n:'2', icon:Phone,        title:'Connect Directly',      desc:'Send a pitch, reveal a phone number, or open WhatsApp. Three contact methods — you choose.' },
              { n:'3', icon:CheckCircle,  title:'Agree &amp; Get Paid',  desc:'Set your terms, agree on scope, get to work. Your deal, your rates — GigsKenya steps aside.' },
            ].map(({ n, icon:Icon, title, desc }, i, a) => (
              <Fragment key={n}>
                <div className="gk-step-card"
                  onMouseOver={e=>{ e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,165,80,.1)'; e.currentTarget.style.transform='translateY(-4px)'; }}
                  onMouseOut={e=>{ e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; }}>
                  <div className="gk-step-icon">
                    <Icon size={28} color="white" strokeWidth={1.8}/>
                  </div>
                  <span className="gk-step-num">{n}</span>
                  <h3 className="gk-step-title" dangerouslySetInnerHTML={{ __html:title }}/>
                  <p className="gk-step-desc">{desc}</p>
                </div>
                {i < a.length-1 && (
                  <div className="gk-step-arrow">
                    <div className="gk-step-line"><div className="gk-step-arrowhead"/></div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FOR FREELANCERS / FOR BUSINESSES ═══════════════ */}
      <section className="gk-section gk-section--dark" aria-label="For freelancers and businesses">
        <div className="gk-container" style={{ maxWidth:1000 }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p className="gk-eyebrow gk-eyebrow--dark">Two Sides, One Platform</p>
            <h2 className="gk-section-title gk-section-title--white">
              Whether you hustle or you hire —<br/>Gigs254 delivers.
            </h2>
          </div>

          <div className="gk-g2">
            {/* FREELANCER */}
            <div className="gk-split-card gk-split-card--green">
              <div className="gk-split-icon" style={{ background:'linear-gradient(145deg,#007A3A,#00A550)' }}><Laptop size={24} color="white"/></div>
              <p className="gk-split-label" style={{ color:'var(--green)' }}>For Freelancers &amp; Gig Workers</p>
              <h3 className="gk-split-title">Turn your talent into income</h3>
              <p className="gk-split-body">Developer, designer, writer, photographer, accountant or VA — GigsKenya connects you with Kenyan clients actively looking for your skills.</p>
              <ul className="gk-split-list">
                {['Create a profile in minutes — all industries welcome','Get discovered by businesses ready to hire now','Receive messages, calls &amp; WhatsApp from clients','Set your own rates and own every client relationship'].map(item=>(
                  <li key={item}><span className="gk-split-check gk-split-check--green">✓</span><span dangerouslySetInnerHTML={{ __html:item }}/></li>
                ))}
              </ul>
              <button type="button" className="gk-btn-primary" style={{ width:'100%', justifyContent:'center', padding:'15px', fontSize:14, borderRadius:14 }}
                onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=talent')}>
                Post My Skills &amp; Find Gigs <ArrowRight size={15}/>
              </button>
            </div>

            {/* HIRER */}
            <div className="gk-split-card gk-split-card--teal">
              <div className="gk-split-icon" style={{ background:'linear-gradient(145deg,#0F766E,#0D9488)' }}><Building2 size={24} color="white"/></div>
              <p className="gk-split-label" style={{ color:'#2DD4BF' }}>For Businesses &amp; Employers</p>
              <h3 className="gk-split-title">Hire skilled Kenyan talent, fast</h3>
              <p className="gk-split-body">From Nairobi startups to established companies — find freelancers and contractors without the overhead of traditional recruitment.</p>
              <ul className="gk-split-list">
                {['Post job ads and freelance briefs for any industry','Browse talent profiles across tech, creative &amp; finance','Message freelancers directly for a pitch or proposal','Hire contractors, freelancers, or full-time staff'].map(item=>(
                  <li key={item}><span className="gk-split-check gk-split-check--teal">✓</span><span dangerouslySetInnerHTML={{ __html:item }}/></li>
                ))}
              </ul>
              <button type="button"
                className="gk-btn-teal"
                style={{ width:'100%', justifyContent:'center', padding:'15px', fontSize:14, borderRadius:14 }}
                onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=hirer')}>
                Post a Job or Browse Talent <ArrowRight size={15}/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════ WHY GIGS254 ════════════════════════════════════ */}
      <section className="gk-section gk-section--white" aria-label="Why Gigs254">
        <div className="gk-container" style={{ maxWidth:1000 }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p className="gk-eyebrow" style={{ textAlign:'center' }}>Why Gigs254</p>
            <h2 className="gk-section-title" style={{ textAlign:'center', maxWidth:'none' }}>The platform that works<br/>the way you do.</h2>
            <p style={{ fontSize:16, color:'#6B7280', maxWidth:440, margin:'12px auto 0', lineHeight:1.8 }}>
              Fast connections, direct communication, every industry — built for Kenya.
            </p>
          </div>
          <div className="gk-g3 gk-why-grid">
            {[
              { icon:Phone,      title:'Message, Call, or WhatsApp',     desc:'In-app pitch, phone, or WhatsApp in one tap. You choose the contact method.' },
              { icon:MapPin,     title:'Local Context, Real Connections', desc:'Professionals who understand the Kenyan market and what clients need.' },
              { icon:Layers,     title:'Every Industry, One Platform',    desc:'Tech, design, writing, law, construction, healthcare — all in one place.' },
              { icon:Users,      title:'Talent That Gets the Brief',      desc:'Faster briefs, sharper output, better results — from people who get it.' },
              { icon:Clock,      title:'Hire or Get Hired Fast',          desc:'Post a listing and hear back the same day. No escrow delays.' },
              { icon:TrendingUp, title:'Grow Your Freelance Business',    desc:'Build reputation, grow clients, and earn sustainably on your terms.' },
            ].map(({ icon:Icon, title, desc })=>(
              <div key={title} className="gk-why-card"
                onMouseOver={e=>{ e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,.08)'; }}
                onMouseOut={e=>{ e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div className="gk-why-icon"><Icon size={22} color="var(--green)" strokeWidth={1.8}/></div>
                <h3 className="gk-why-title">{title}</h3>
                <p className="gk-why-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ SEO BLOCK ══════════════════════════════════════ */}
      <section className="gk-section gk-section--grey" style={{ paddingTop:56, paddingBottom:64 }} aria-label="About GigsKenya — Jobs in Kenya">
        <div style={{ maxWidth:960, margin:'0 auto', padding:'0 24px' }}>

          {/* ── About text ── */}
          <div style={{ marginBottom:48 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(18px,2.8vw,24px)', fontWeight:900, marginBottom:16, letterSpacing:'-.03em', color:'#0F172A' }}>
              Jobs in Kenya — Nairobi, Mombasa, Kisumu &amp; Remote
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'0 48px' }}>
              <div>
                <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.95, marginBottom:14 }}>
                  GigsKenya is Kenya's #1 platform for <strong style={{ color:'#374151' }}>jobs in Nairobi</strong>, <strong style={{ color:'#374151' }}>remote jobs in Kenya</strong>, and <strong style={{ color:'#374151' }}>part-time jobs</strong> across every industry. Whether you're a fresh graduate looking for your first role, a professional hunting for a side hustle, or a business ready to hire — GigsKenya connects you directly.
                </p>
                <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.95 }}>
                  Browse <strong style={{ color:'#374151' }}>online jobs in Kenya that pay via M-Pesa</strong>, find <strong style={{ color:'#374151' }}>work from home jobs</strong> in tech, writing, marketing, and design, or discover <strong style={{ color:'#374151' }}>casual jobs in Nairobi</strong> and gig work near you. New listings are posted daily.
                </p>
              </div>
              <div>
                <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.95, marginBottom:14 }}>
                  Businesses post free job ads and find <strong style={{ color:'#374151' }}>freelancers in Nairobi</strong>, <strong style={{ color:'#374151' }}>Mombasa</strong>, <strong style={{ color:'#374151' }}>Kisumu</strong>, Nakuru, Eldoret, Thika and beyond — or hire <strong style={{ color:'#374151' }}>remote workers from Kenya</strong> for global projects. Pay freelancers directly via M-Pesa, bank transfer, or any method you agree on.
                </p>
                <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.95 }}>
                  We are the local alternative to Upwork and Fiverr — built for East Africa, with WhatsApp contact, no commission, and a deep understanding of the Kenyan market and Silicon Savannah talent pool.
                </p>
              </div>
            </div>
          </div>

          {/* ── 3-column link grid ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:32, marginBottom:40 }}>

            {/* Jobs by city */}
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:800, color:'#0F172A', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:12, paddingBottom:8, borderBottom:'2px solid var(--green)' }}>
                Jobs by City
              </h3>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  {label:'Jobs in Nairobi',q:'jobs in Nairobi'},
                  {label:'Jobs in Mombasa',q:'jobs in Mombasa'},
                  {label:'Jobs in Kisumu',q:'jobs in Kisumu'},
                  {label:'Jobs in Nakuru',q:'jobs in Nakuru'},
                  {label:'Jobs in Eldoret',q:'jobs in Eldoret'},
                  {label:'Jobs in Thika',q:'jobs in Thika'},
                  {label:'Jobs in Meru',q:'jobs in Meru'},
                  {label:'Jobs in Kisii',q:'jobs in Kisii'},
                  {label:'Remote / Online',q:'remote'},
                ].map(({label,q})=>(
                  <li key={label}>
                    <button type="button" onClick={()=>navigate(`/browse?q=${encodeURIComponent(q)}&type=all`)}
                      style={{ background:'none', border:'none', padding:0, fontSize:13, color:'#4B5563', cursor:'pointer', textAlign:'left', lineHeight:1.5, fontFamily:'var(--font-body)', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:'var(--green)', fontSize:10 }}>▶</span>{label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Jobs by type */}
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:800, color:'#0F172A', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:12, paddingBottom:8, borderBottom:'2px solid var(--green)' }}>
                Jobs by Type
              </h3>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  {label:'Remote Jobs in Kenya',q:'remote jobs Kenya'},
                  {label:'Part Time Jobs Kenya',q:'part time jobs Kenya'},
                  {label:'Work From Home Kenya',q:'work from home Kenya'},
                  {label:'Online Jobs Kenya',q:'online jobs Kenya'},
                  {label:'Freelance Jobs Kenya',q:'freelance jobs Kenya'},
                  {label:'Casual Jobs Nairobi',q:'casual jobs Nairobi'},
                  {label:'Entry Level Jobs Kenya',q:'entry level jobs Kenya'},
                  {label:'Fresh Graduate Jobs',q:'fresh graduate jobs Kenya'},
                  {label:'Side Hustle Kenya',q:'side hustle Kenya'},
                ].map(({label,q})=>(
                  <li key={label}>
                    <button type="button" onClick={()=>navigate(`/browse?q=${encodeURIComponent(q)}&type=all`)}
                      style={{ background:'none', border:'none', padding:0, fontSize:13, color:'#4B5563', cursor:'pointer', textAlign:'left', lineHeight:1.5, fontFamily:'var(--font-body)', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:'var(--green)', fontSize:10 }}>▶</span>{label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Jobs by category */}
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:800, color:'#0F172A', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:12, paddingBottom:8, borderBottom:'2px solid var(--green)' }}>
                Jobs by Category
              </h3>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  {label:'Tech & Developer Jobs',cat:'Tech & Dev'},
                  {label:'Design Jobs Kenya',cat:'Design'},
                  {label:'Writing & Content Jobs',cat:'Writing & Content'},
                  {label:'Digital Marketing Jobs',cat:'Digital Marketing'},
                  {label:'Photography & Video',cat:'Photo & Video'},
                  {label:'Finance & Accounting',cat:'Business & Finance'},
                  {label:'Customer Support Jobs',cat:'Customer Support'},
                  {label:'Translation Jobs Kenya',cat:'Translation'},
                  {label:'Education & Tutoring',cat:'Education & Tutoring'},
                ].map(({label,cat})=>(
                  <li key={label}>
                    <button type="button" onClick={()=>navigate(`/browse?category=${encodeURIComponent(cat)}&type=all`)}
                      style={{ background:'none', border:'none', padding:0, fontSize:13, color:'#4B5563', cursor:'pointer', textAlign:'left', lineHeight:1.5, fontFamily:'var(--font-body)', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:'var(--green)', fontSize:10 }}>▶</span>{label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Search tag cloud ── */}
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:'#9CA3AF', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:10 }}>Popular Searches</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {[
                {label:'Remote jobs in Kenya',q:'remote jobs Kenya'},
                {label:'Jobs in Nairobi today',q:'jobs in Nairobi'},
                {label:'Part time jobs Nairobi',q:'part time jobs Nairobi'},
                {label:'Work from home Kenya',q:'work from home Kenya'},
                {label:'Online jobs M-Pesa',q:'online jobs Kenya M-Pesa'},
                {label:'Freelance jobs Nairobi',q:'freelance jobs Nairobi'},
                {label:'Web developer Kenya',cat:'Tech & Dev'},
                {label:'Graphic designer Nairobi',cat:'Design'},
                {label:'Content writer Kenya',cat:'Writing & Content'},
                {label:'Digital marketing Kenya',cat:'Digital Marketing'},
                {label:'Photographer Nairobi',cat:'Photo & Video'},
                {label:'Virtual assistant Kenya',cat:'Customer Support'},
                {label:'Android developer Kenya',cat:'Tech & Dev'},
                {label:'SEO expert Kenya',cat:'Digital Marketing'},
                {label:'Video editor Nairobi',cat:'Photo & Video'},
                {label:'Accountant Nairobi',cat:'Business & Finance'},
                {label:'Social media manager Kenya',cat:'Digital Marketing'},
                {label:'UI UX designer Kenya',cat:'Design'},
                {label:'Data analyst Nairobi',cat:'Tech & Dev'},
                {label:'Translator Swahili English',cat:'Translation'},
                {label:'Software developer Nairobi',cat:'Tech & Dev'},
                {label:'Entry level jobs Kenya',q:'entry level jobs Kenya'},
                {label:'Fresh graduate jobs Kenya',q:'fresh graduate jobs Kenya'},
                {label:'NGO jobs Kenya',q:'NGO jobs Kenya'},
                {label:'Casual jobs Nairobi',q:'casual jobs Nairobi'},
                {label:'Side hustle Kenya',q:'side hustle Kenya'},
                {label:'Kazi Kenya',q:'kazi Kenya'},
                {label:'Event planner Nairobi',q:'event planner Nairobi'},
                {label:'Legal services Kenya',cat:'Business & Finance'},
                {label:'Copywriter Kenya',cat:'Writing & Content'},
              ].map(({ label, cat, q })=>(
                <button type="button" key={label}
                  onClick={()=>navigate(cat ? `/browse?category=${encodeURIComponent(cat)}&type=all` : `/browse?q=${encodeURIComponent(q||label)}&type=all`)}
                  className="gk-seo-tag">
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════ FINAL CTA ═══════════════════════════════════════ */}
      <section className="gk-cta-section">
        <div className="gk-cta-bg-grid"/>
        <div style={{ position:'relative', zIndex:1, maxWidth:580, margin:'0 auto', textAlign:'center', padding:'0 24px' }}>
          <div className="gk-cta-icon-wrap"><Sparkles size={24} color="white"/></div>
          <h2 className="gk-cta-title">Kenya is hiring.<br/>Are you ready?</h2>
          <p className="gk-cta-sub">
            Thousands of professionals and businesses are on GigsKenya right now. Your next gig — or your next great hire — is one listing away.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button type="button" className="gk-cta-btn-white"
              onClick={()=>navigate(isAuthenticated?'/dashboard':'/register')}
              onMouseOver={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(0,0,0,.2)'; }}
              onMouseOut={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,.15)'; }}>
              {isAuthenticated ? 'Go to Dashboard →' : 'Get Started Free →'}
            </button>
            <button type="button" className="gk-btn-ghost" style={{ padding:'15px 28px', fontSize:15 }} onClick={()=>navigate('/browse')}>
              Explore Listings
            </button>
          </div>
        </div>
      </section>

      {/* ════ STICKY MOBILE CTA ══════════════════════════════ */}
      <div className="gk-sticky-cta">
        <button type="button" className="gk-sticky-cta-btn gk-sticky-cta-primary" onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=talent')}>
          <Laptop size={16}/> Find Work
        </button>
        <button type="button" className="gk-sticky-cta-btn gk-sticky-cta-ghost" onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=hirer')}>
          <Building2 size={16}/> Hire Talent
        </button>
      </div>
    </div>
    </>
  );
}
