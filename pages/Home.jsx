import { useState, useEffect, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, MapPin, Phone, ArrowRight, ChevronRight,
  Code, Palette, PenTool, BarChart2, Camera, Headphones, Globe,
  Briefcase, TrendingUp, CheckCircle, Zap, Users, Sparkles,
  Layers, Clock, Building2, Shield, Laptop
} from 'lucide-react';
import { getAds, getTalents, getPlatformStats } from '../lib/firestore';
import { TalentCard } from './Talent';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/* ── Hero floating visual ──────────────────────────────────── */
const HERO_CATS = [
  { icon: Code,       label:'Tech & Dev',       color:'#4F46E5' },
  { icon: Palette,    label:'Design',            color:'#EC4899' },
  { icon: PenTool,    label:'Writing',           color:'#F59E0B' },
  { icon: BarChart2,  label:'Marketing',         color:'#10B981' },
  { icon: Camera,     label:'Photo & Video',     color:'#EF4444' },
  { icon: Briefcase,  label:'Business',          color:'#8B5CF6' },
  { icon: Globe,      label:'Translation',       color:'#06B6D4' },
  { icon: Headphones, label:'Support & VA',      color:'#F97316' },
];

function HeroVisual({ hirers, talents, ads }) {
  const statsData = [
    { icon: Building2, v: `${hirers > 0 ? hirers : 50}+`, l: 'Businesses', color: '#2DD4BF' },
    { icon: Users,     v: talents > 0 ? `${talents}+` : '—', l: 'Talent',  color: '#4ADE80' },
    { icon: Briefcase, v: ads > 0 ? `${ads}+` : '—',         l: 'Listings', color: '#A78BFA' },
    { icon: MapPin,    v: 'Kenya', l: 'Direct Contact',         color: '#FCD34D' },
  ];

  return (
    <div className="gk-hero-visual">
      {/* Decorative glows — absolute is fine for purely decorative elements */}
      <div style={{ position:'absolute', top:'-8%', right:'-4%', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,165,80,.2) 0%,transparent 65%)', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'absolute', bottom:'5%', left:'-4%', width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 65%)', pointerEvents:'none', zIndex:0 }}/>

      {/* Live badge */}
      <div className="gk-hv-badge">
        <span style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E', display:'inline-block', animation:'gk-pulse 2s infinite', flexShrink:0 }}/>
        <span style={{ fontSize:11, fontWeight:700, color:'#15803D' }}>
          {hirers > 0 ? `${hirers}+ businesses hiring now` : 'Live — businesses hiring now'}
        </span>
      </div>

      {/* Categories card */}
      <div className="gk-hv-card">
        <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.38)', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:14 }}>Browse by category</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {HERO_CATS.map(({ icon: Icon, label, color }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.07)', transition:'background .15s' }}>
              <div style={{ width:30, height:30, borderRadius:9, background:`${color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${color}30` }}>
                <Icon size={14} color={color}/>
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.82)', lineHeight:1.2 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="gk-hv-stats">
        {statsData.map(({ icon: Icon, v, l, color }, i) => (
          <div key={l} className="gk-hv-stat-item" style={{ borderRight: i < statsData.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
            <Icon size={14} color={color} style={{ marginBottom:7 }}/>
            <p style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:900, color:'white', letterSpacing:'-.03em', lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:5, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORIES = [
  { icon: Code,       label:'Tech & Dev',          sub:'Developers, engineers, DevOps',  slug:'Tech & Dev',          color:'#4F46E5' },
  { icon: Palette,    label:'Design',               sub:'Logos, branding, UI/UX',         slug:'Design',              color:'#EC4899' },
  { icon: PenTool,    label:'Writing & Content',    sub:'Copywriting, blogs, scripts',    slug:'Writing & Content',   color:'#F59E0B' },
  { icon: BarChart2,  label:'Digital Marketing',    sub:'SEO, social media, paid ads',    slug:'Digital Marketing',   color:'#10B981' },
  { icon: Camera,     label:'Photo & Video',        sub:'Photography, film, editing',     slug:'Photo & Video',       color:'#EF4444' },
  { icon: Headphones, label:'Customer Support',     sub:'VA, admin, data entry',          slug:'Customer Support',    color:'#8B5CF6' },
  { icon: Globe,      label:'Translation',          sub:'Swahili, English & more',        slug:'Translation',         color:'#06B6D4' },
  { icon: Briefcase,  label:'Business & Finance',   sub:'Accounting, legal, consulting',  slug:'Business & Finance',  color:'#F97316' },
];

const INDUSTRY_TO_CATEGORY = {
  'Software & IT':    'Tech & Dev',
  'Graphic Design':   'Design',
  'Content Writing':  'Writing & Content',
  'Digital Marketing':'Digital Marketing',
  'Photography':      'Photo & Video',
  'Accounting':       'Business & Finance',
  'Legal Services':   'Business & Finance',
  'Construction':      null,
  'Education':         null,
  'Events':            null,
  'Healthcare':        null,
  'Real Estate':       null,
};

const POPULAR_TO_CATEGORY = {
  'Android Developer':  'Tech & Dev',
  'Logo Design Nairobi':'Design',
  'M-Pesa Integration': 'Tech & Dev',
  'Social Media Manager':'Digital Marketing',
  'Video Editing':      'Photo & Video',
  'Accountant Nairobi': 'Business & Finance',
  'SEO Kenya':          'Digital Marketing',
};

const browseIndustry = (navigate, label) => {
  const cat = INDUSTRY_TO_CATEGORY[label];
  navigate(cat ? `/browse?category=${encodeURIComponent(cat)}&type=all` : `/browse?q=${encodeURIComponent(label)}&type=all`);
};

const browseTrending = (navigate, label) => {
  const cat = POPULAR_TO_CATEGORY[label];
  navigate(cat ? `/browse?category=${encodeURIComponent(cat)}&type=all` : `/browse?q=${encodeURIComponent(label)}&type=all`);
};

const AVATAR_COLORS = ['#4F46E5','#EC4899','#F59E0B','#10B981','#EF4444','#8B5CF6','#06B6D4','#F97316'];
const getColor = (id) => AVATAR_COLORS[parseInt(id?.slice(-2)||'0',16) % AVATAR_COLORS.length];
const isProfileComplete = (t) => t.status==='active' && (t.title||t.bio) && t.phone;

/* ── AdCard ───────────────────────────────────────────────── */
export function AdCard({ ad, navigate }) {
  const [hovered, setHovered] = useState(false);
  const color    = getColor(ad.id);
  const isJob    = ad.type === 'job';
  const initials = (ad.posterName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const tags     = ad.tags ? (Array.isArray(ad.tags) ? ad.tags : ad.tags.split(',').map(t => t.trim()).filter(Boolean)) : [];
  const rate     = ad.rate || ad.budget;

  return (
    <div
      role="link" tabIndex={0}
      onClick={() => navigate(`/ad/${ad.id}`)}
      onKeyDown={e => { if (e.key==='Enter'||e.key===' ') navigate(`/ad/${ad.id}`); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 20,
        border: `1.5px solid ${hovered ? color+'66' : '#EAECF0'}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all .22s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-5px)' : 'none',
        boxShadow: hovered
          ? `0 20px 48px ${color}22, 0 4px 16px rgba(0,0,0,.08)`
          : '0 1px 4px rgba(0,0,0,.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Gradient header band */}
      <div style={{
        background: ad.boosted
          ? 'linear-gradient(135deg,#00A550,#00C060)'
          : `linear-gradient(135deg,${color}18,${color}08)`,
        padding: '16px 18px 14px',
        borderBottom: `1px solid ${color}18`,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: ad.boosted
              ? 'rgba(255,255,255,.25)'
              : `linear-gradient(135deg,${color},${color}cc)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14,
            color: 'white',
            boxShadow: `0 4px 12px ${color}44`,
          }}>
            {initials}
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:700, color: ad.boosted ? 'white' : '#1a202c', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3 }}>
              {ad.posterName || 'Anonymous'}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3, flexWrap:'wrap' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, letterSpacing: '.04em',
                background: isJob
                  ? (ad.boosted ? 'rgba(255,255,255,.2)' : '#FEF3C7')
                  : (ad.boosted ? 'rgba(255,255,255,.2)' : `${color}18`),
                color: isJob
                  ? (ad.boosted ? 'white' : '#D97706')
                  : (ad.boosted ? 'white' : color),
              }}>
                {isJob ? <><Briefcase size={9}/> Job</> : <><Zap size={9}/> Service</>}
              </span>
              {ad.boosted && (
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999, background:'rgba(255,255,255,.2)', color:'white', letterSpacing:'.04em' }}>★ Featured</span>
              )}
              {ad.location && (
                <span style={{ fontSize:11, color: ad.boosted ? 'rgba(255,255,255,.7)' : '#94A3B8', display:'flex', alignItems:'center', gap:3 }}>
                  <MapPin size={9} strokeWidth={2.5}/>{ad.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'16px 18px 18px', flex:1, display:'flex', flexDirection:'column' }}>

        {/* Category */}
        {ad.category && (
          <span style={{ display:'inline-flex', alignItems:'center', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:8, marginBottom:10, background:`${color}10`, color, letterSpacing:'.04em', alignSelf:'flex-start', border:`1px solid ${color}20` }}>
            {ad.category}
          </span>
        )}

        {/* Title */}
        <h3 style={{
          fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.3,
          letterSpacing: '-.025em', marginBottom: 8,
          fontFamily: 'var(--font-display)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {ad.title}
        </h3>

        {/* Description */}
        {ad.description && (
          <p style={{
            fontSize: 13, color: '#64748B', lineHeight: 1.7, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {ad.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
            {tags.slice(0, 4).map(t => (
              <span key={t} style={{ fontSize:11, padding:'4px 10px', borderRadius:8, background:'#F8FAFC', color:'#475569', fontWeight:600, border:'1px solid #E2E8F0' }}>{t}</span>
            ))}
            {tags.length > 4 && <span style={{ fontSize:11, color:'#94A3B8', alignSelf:'center' }}>+{tags.length-4}</span>}
          </div>
        )}

        <div style={{ flex:1 }}/>

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid #F1F5F9', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {rate ? (
              <span style={{ fontSize:13, fontWeight:800, color:'#0F172A', fontFamily:'var(--font-display)' }}>{rate}</span>
            ) : (
              <span style={{ fontSize:12, color:'#94A3B8', fontWeight:500 }}>Negotiable</span>
            )}
            {(ad.views||0) > 0 && (
              <span style={{ fontSize:11, color:'#CBD5E1', display:'flex', alignItems:'center', gap:3 }}>
                · <span style={{ color:'#94A3B8' }}>{ad.views} views</span>
              </span>
            )}
          </div>

          <div style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'8px 16px', borderRadius:10, flexShrink:0,
            background: hovered ? color : `${color}12`,
            color: hovered ? 'white' : color,
            fontSize:12, fontWeight:700, transition:'all .2s',
            fontFamily:'var(--font-display)',
          }}>
            {isJob ? 'View Job' : 'View'} <ChevronRight size={12}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ──────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8ECF0', overflow: 'hidden' }}>
      <div style={{ height: 4, background: '#F0F2F5' }} />
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div className="gk-skeleton" style={{ height: 22, width: 72, borderRadius: 20 }} />
          <div style={{ flex: 1 }} />
          <div className="gk-skeleton" style={{ height: 14, width: 60, borderRadius: 10 }} />
        </div>
        <div className="gk-skeleton" style={{ height: 14, width: 80, borderRadius: 20 }} />
        <div className="gk-skeleton" style={{ height: 18, width: '85%', borderRadius: 6 }} />
        <div className="gk-skeleton" style={{ height: 13, width: '70%', borderRadius: 6 }} />
        <div style={{ display: 'flex', gap: 5 }}>
          <div className="gk-skeleton" style={{ height: 24, width: 52, borderRadius: 8 }} />
          <div className="gk-skeleton" style={{ height: 24, width: 52, borderRadius: 8 }} />
        </div>
        <div style={{ height: 1, background: '#F0F2F5', margin: '2px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="gk-skeleton" style={{ height: 32, width: 32, borderRadius: 9 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div className="gk-skeleton" style={{ height: 12, width: 90 }} />
              <div className="gk-skeleton" style={{ height: 11, width: 60 }} />
            </div>
          </div>
          <div className="gk-skeleton" style={{ height: 36, width: 82, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

/* ── Section header ────────────────────────────────────────── */
function SectionHeader({ eyebrow, title, sub, linkTo, linkLabel }) {
  return (
    <div className="gk-sec-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:24,gap:12}}>
      <div>
        <p style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--green)',marginBottom:5}}>{eyebrow}</p>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(20px,3vw,27px)',fontWeight:800,letterSpacing:'-.03em',marginBottom:sub?6:0}}>{title}</h2>
        {sub && <p style={{fontSize:14,color:'var(--grey-500)',lineHeight:1.6,maxWidth:540}}>{sub}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} style={{display:'flex',alignItems:'center',gap:4,fontSize:13,fontWeight:600,color:'var(--green)',textDecoration:'none',whiteSpace:'nowrap',flexShrink:0}}>
          {linkLabel} <ChevronRight size={14}/>
        </Link>
      )}
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, subtitle, ctaLabel, onCta, bg='var(--grey-50)' }) {
  return (
    <div style={{textAlign:'center',padding:'48px 20px',background:bg,borderRadius:'var(--r-xl)',border:'1px solid var(--grey-200)'}}>
      <Icon size={36} style={{margin:'0 auto 12px',display:'block',color:'var(--grey-300)'}}/>
      <h3 style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:700,marginBottom:8}}>{title}</h3>
      <p style={{color:'var(--grey-500)',fontSize:14,marginBottom:20,maxWidth:320,margin:'0 auto 20px',lineHeight:1.6}}>{subtitle}</p>
      {onCta && <button type="button" onClick={onCta} className="gk-btn-primary" style={{padding:'11px 22px',fontSize:14,margin:'0 auto'}}>{ctaLabel}</button>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════ */
export default function Home() {
  const [q, setQ]                           = useState('');
  const [tab, setTab]                       = useState('all');
  const [recentAds, setRecentAds]           = useState([]);
  const [featuredTalent, setFeaturedTalent] = useState([]);
  const [loadingAds, setLoadingAds]         = useState(true);
  const [loadingTalent, setLoadingTalent]   = useState(true);
  const [stats, setStats]                   = useState({ hirers:0, talents:0, ads:0 });
  const navigate            = useNavigate();
  const { isAuthenticated } = useAuth();

  const cHirers  = useCounter(Math.max(stats.hirers, 50));
  const cTalents = useCounter(stats.talents);
  const cAds     = useCounter(stats.ads);

  useEffect(() => {
    getAds({ limitCount: 6 }).then(setRecentAds).catch(()=>{}).finally(()=>setLoadingAds(false));
    getTalents({ limitCount: 20 }).then(all => {
      const sorted = all.filter(isProfileComplete).sort((a,b) => {
        if (b.boosted!==a.boosted) return b.boosted?1:-1;
        if (b.available!==a.available) return b.available!==false?1:-1;
        return (b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0);
      });
      setFeaturedTalent(sorted.slice(0,6));
    }).catch(()=>{}).finally(()=>setLoadingTalent(false));
    getPlatformStats().then(setStats).catch(()=>{});
  }, []);

  const search = () => navigate(`/browse?q=${encodeURIComponent(q)}&type=${tab}`);

  const POPULAR = [
    'Android Developer','Logo Design Nairobi','M-Pesa Integration',
    'Social Media Manager','Video Editing','Accountant Nairobi','SEO Kenya',
  ];

  return (
    <div className="gk-home-page" style={{paddingTop:64}}>

      {/* ════ HERO ════════════════════════════════════════════ */}
      <section
        aria-label="Kenya's top freelance jobs and gig marketplace"
        style={{background:'var(--ink)',position:'relative',overflow:'hidden',minHeight:'92vh',display:'flex',alignItems:'center'}}
      >
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:'-20%',left:'30%',width:'65vw',height:'65vw',maxWidth:720,maxHeight:720,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,165,80,.13) 0%,transparent 65%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'-15%',right:'-8%',width:'45vw',height:'45vw',maxWidth:520,maxHeight:520,borderRadius:'50%',background:'radial-gradient(circle,rgba(206,17,38,.07) 0%,transparent 65%)',pointerEvents:'none'}}/>

        <div style={{maxWidth:1200,margin:'0 auto',padding:'80px 28px 88px',position:'relative',zIndex:1,width:'100%'}}>
          <div className="gk-hero-inner">

            {/* ── Left column ── */}
            <div className="gk-hero-left">
              {/* Badge */}
              <div className="gk-fade-up" style={{display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(0,165,80,.28)',background:'rgba(0,165,80,.07)',borderRadius:'var(--r-full)',padding:'5px 14px',marginBottom:24}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:'var(--green)',display:'inline-block',animation:'gk-pulse 2s infinite'}}/>
                <span style={{fontSize:12,color:'rgba(255,255,255,.65)',fontWeight:500}}>Kenya's #1 Freelance &amp; Gig Marketplace</span>
              </div>

              <h1 className="gk-fade-up gk-d1 gk-hero-h1" style={{fontFamily:'var(--font-display)',fontSize:'clamp(34px,5.5vw,66px)',fontWeight:900,color:'white',lineHeight:1.0,marginBottom:16,letterSpacing:'-.04em'}}>
                Your Skills.<br/>Your Hustle.<br/>
                <span style={{background:'linear-gradient(135deg,var(--green),var(--green-mid))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontStyle:'italic'}}>Your Next Gig.</span>
              </h1>

              <p className="gk-fade-up gk-d2 gk-hero-sub" style={{fontSize:'clamp(14px,1.5vw,16px)',color:'rgba(255,255,255,.5)',maxWidth:460,marginBottom:32,lineHeight:1.85}}>
                Connect with Kenyan freelancers or find work — direct contact, no middleman.
              </p>

              <div className="gk-fade-up gk-d3 gk-hero-btns gk-hero-btns-inline" style={{display:'flex',gap:12,marginBottom:32}}>
                <button type="button" onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=talent')} className="gk-hero-cta-btn gk-hero-cta-primary">
                  <div className="gk-hero-cta-icon" style={{background:'rgba(255,255,255,.18)'}}><Laptop size={20} color="white"/></div>
                  <div className="gk-hero-cta-text">
                    <p className="gk-hero-cta-label">I'm Looking for Work</p>
                    <p className="gk-hero-cta-sub">Create a free freelancer profile</p>
                  </div>
                  <ArrowRight size={16} style={{flexShrink:0,marginLeft:'auto'}}/>
                </button>
                <button type="button" onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=hirer')} className="gk-hero-cta-btn gk-hero-cta-ghost">
                  <div className="gk-hero-cta-icon" style={{background:'rgba(255,255,255,.1)'}}><Building2 size={20} color="white"/></div>
                  <div className="gk-hero-cta-text">
                    <p className="gk-hero-cta-label">I Want to Hire</p>
                    <p className="gk-hero-cta-sub">Post a job or browse talent</p>
                  </div>
                  <ArrowRight size={16} style={{flexShrink:0,marginLeft:'auto'}}/>
                </button>
              </div>

              {/* Search */}
              <div className="gk-fade-up gk-d4">
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14,maxWidth:600}}>
                  <div style={{flex:1,height:1,background:'rgba(255,255,255,.1)'}}/>
                  <span style={{fontSize:11,color:'rgba(255,255,255,.3)',letterSpacing:'.07em',textTransform:'uppercase',whiteSpace:'nowrap'}}>or search directly</span>
                  <div style={{flex:1,height:1,background:'rgba(255,255,255,.1)'}}/>
                </div>
                <div className="gk-search-wrap" style={{background:'white',borderRadius:'var(--r-lg)',padding:6,display:'flex',gap:7,maxWidth:600,marginBottom:12,boxShadow:'0 20px 56px rgba(0,0,0,.42)'}}>
                  <div className="gk-tabs" style={{display:'flex',background:'var(--grey-100)',borderRadius:'var(--r-sm)',padding:3,gap:2,flexShrink:0}}>
                    {[{id:'all',l:'All'},{id:'service',l:'Talent'},{id:'job',l:'Jobs'}].map(({id,l})=>(
                      <button type="button" key={id} onClick={()=>setTab(id)} style={{padding:'7px 11px',borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'var(--font-display)',transition:'all .15s',background:tab===id?'white':'transparent',color:tab===id?'var(--ink)':'var(--grey-500)',boxShadow:tab===id?'var(--shadow-xs)':'none'}}>{l}</button>
                    ))}
                  </div>
                  <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Search gigs or skills — e.g. React dev, designer…" aria-label="Search freelance jobs and talent in Kenya" style={{flex:1,border:'none',fontSize:13,padding:'8px 10px',color:'var(--ink)',background:'transparent',outline:'none',fontFamily:'var(--font-body)',minWidth:0}}/>
                  <button type="button" onClick={search} className="gk-btn-primary gk-search-btn" style={{padding:'10px 18px',fontSize:14,borderRadius:'var(--r-sm)',flexShrink:0}}><Search size={15}/> Search</button>
                </div>
                <div className="gk-popular" style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
                  <span style={{fontSize:10,color:'rgba(255,255,255,.22)',textTransform:'uppercase',letterSpacing:'.08em'}}>Trending:</span>
                  {POPULAR.map(t=>(<button type="button" key={t} className="gk-pill" onClick={()=>browseTrending(navigate,t)}>{t}</button>))}
                </div>
              </div>

              {/* Live stats */}
              <div className="gk-fade-up gk-d4 gk-stats" style={{display:'flex',gap:0,marginTop:44,flexWrap:'wrap',borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:28}}>
                {[
                  {v: cHirers  ? `${fmt(cHirers)}+`  : '—', l:'Businesses hiring'},
                  {v: cTalents ? `${fmt(cTalents)}+` : '—', l:'Talent profiles'},
                  {v: cAds     ? `${fmt(cAds)}+`     : '—', l:'Jobs & gigs posted'},
                  {v:'Direct', l:'Contact hirers'},
                ].map(({v,l},i,a)=>(
                  <div key={l} style={{flex:'1 1 100px',paddingRight:24,borderRight:i<a.length-1?'1px solid rgba(255,255,255,.07)':'none',paddingLeft:i>0?24:0,marginBottom:8}}>
                    <p style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900,color:'var(--green)',letterSpacing:'-.03em',margin:0,lineHeight:1}}>{v}</p>
                    <p style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:5,lineHeight:1.4}}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right column: floating visual ── */}
            <HeroVisual hirers={cHirers} talents={cTalents} ads={cAds}/>
          </div>
        </div>
      </section>

      {/* ════ SOCIAL PROOF BAND ═══════════════════════════════ */}
      <section style={{background:'var(--ink)',borderTop:'1px solid rgba(255,255,255,.06)',padding:'20px 24px'}}>
        <div style={{maxWidth:1160,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'#22C55E',display:'inline-block',animation:'gk-pulse 2s infinite',flexShrink:0}}/>
            <span style={{fontSize:13,color:'rgba(255,255,255,.45)',fontWeight:500}}>Live platform — growing every day</span>
          </div>
          <div className="gk-industry-strip" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
            <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:'.1em',whiteSpace:'nowrap'}}>Industries:</span>
            {['Software & IT','Graphic Design','Content Writing','Digital Marketing','Photography','Accounting','Legal Services','Construction','Education','Events','Healthcare','Real Estate'].map(ind=>(
              <button type="button" key={ind} onClick={()=>browseIndustry(navigate,ind)}
                style={{fontSize:11,color:'rgba(255,255,255,.55)',fontWeight:500,cursor:'pointer',padding:'4px 10px',borderRadius:'var(--r-full)',border:'1px solid rgba(255,255,255,.1)',whiteSpace:'nowrap',transition:'all .15s',background:'transparent',fontFamily:'var(--font-body)'}}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,.08)';e.currentTarget.style.color='white';}}
                onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,.55)';}}>
                {ind}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURED TALENT ══════════════════════════════════ */}
      <section aria-label="Top Kenyan freelancers available for hire" style={{background:'white',padding:'80px 24px'}}>
        <div style={{maxWidth:1160,margin:'0 auto'}}>
          <SectionHeader
            eyebrow="Featured Professionals"
            title="Top Kenyan Freelancers Ready to Work"
            sub="Profiles across tech, design, marketing, finance and more. Direct contact, no middleman."
            linkTo="/talent"
            linkLabel="View all talent"
          />
          {loadingTalent ? (
            <div className="gk-ga">{[1,2,3].map(i=><CardSkeleton key={i}/>)}</div>
          ) : featuredTalent.length===0 ? (
            <EmptyState
              icon={Users}
              bg="var(--cream)"
              title="Be among the first professionals listed"
              subtitle="Create a profile now and get discovered by businesses actively hiring across Kenya."
              ctaLabel="Create My Freelancer Profile →"
              onCta={()=>navigate(isAuthenticated?'/dashboard':'/register?role=talent')}
            />
          ) : (
            <>
              <div className="gk-ga">
                {featuredTalent.map(t=>(
                  <TalentCard key={t.id} talent={t} navigate={navigate} variant="preview"/>
                ))}
              </div>
              <div style={{textAlign:'center',marginTop:32}}>
                <button type="button" onClick={()=>navigate('/talent')} className="gk-btn-primary" style={{padding:'12px 28px',fontSize:14}}>
                  Browse All Kenyan Freelancers <ArrowRight size={15}/>
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ════ LATEST ADS ══════════════════════════════════════ */}
      <section aria-label="Latest freelance jobs and gig listings Kenya" style={{background:'var(--cream)',padding:'80px 24px'}}>
        <div style={{maxWidth:1160,margin:'0 auto'}}>
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
              bg="white"
              title="Be the first to post a listing"
              subtitle="Gigs254 is live and growing. Post your service or job opening and reach thousands of Kenyan professionals."
              ctaLabel="Post a Listing →"
              onCta={()=>navigate('/register?role=hirer')}
            />
          ) : (
            <div className="gk-ga">{recentAds.map(ad=><AdCard key={ad.id} ad={ad} navigate={navigate}/>)}</div>
          )}
        </div>
      </section>

      {/* ════ CATEGORIES ══════════════════════════════════════ */}
      <section aria-label="Browse freelance categories in Kenya" style={{background:'white',padding:'80px 24px'}}>
        <div style={{maxWidth:1160,margin:'0 auto'}}>
          <SectionHeader
            eyebrow="Explore by Industry"
            title="Find the right skill for any job"
            sub="Browse freelancers, talent profiles, and job listings by industry. Pick a category and dive in."
            linkTo="/browse?type=all"
            linkLabel="All listings & talent"
          />
          <div className="gk-g4" style={{marginTop:32}}>
            {CATEGORIES.map(({icon:Icon,label,sub,slug})=>(
              <button type="button" key={slug}
                onClick={()=>navigate(`/browse?category=${encodeURIComponent(slug)}&type=all`)}
                aria-label={`Browse ${label} freelancers and jobs in Kenya`}
                className="gk-cat-card"
                style={{display:'flex',flexDirection:'column',gap:0,padding:'20px 18px 18px',background:'white',border:'1.5px solid var(--grey-200)',borderRadius:18,cursor:'pointer',textAlign:'left',width:'100%',transition:'all .2s',fontFamily:'var(--font-body)',position:'relative',overflow:'hidden'}}
                onMouseOver={e=>{e.currentTarget.style.borderColor='var(--green)';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,165,80,.12)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='var(--grey-200)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,var(--green),var(--green-mid))',opacity:0.7}}/>
                <div style={{width:46,height:46,borderRadius:13,background:'var(--green-light)',border:'1px solid rgba(0,165,80,.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,flexShrink:0}}>
                  <Icon size={20} color="var(--green)"/>
                </div>
                <span style={{display:'block',fontWeight:800,fontSize:14,color:'var(--ink)',fontFamily:'var(--font-display)',lineHeight:1.2,marginBottom:5}}>{label}</span>
                <span className="gk-cat-sub" style={{display:'block',fontSize:12,color:'var(--grey-400)',lineHeight:1.5}}>{sub}</span>
                <div style={{display:'flex',alignItems:'center',gap:4,marginTop:14,fontSize:11,fontWeight:700,color:'var(--green)'}}>
                  Browse <ChevronRight size={11}/>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════════════════════════════════════ */}
      <section aria-label="How to find freelance work in Kenya" style={{background:'var(--cream)',padding:'88px 24px'}}>
        <div style={{maxWidth:1060,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <span style={{display:'inline-block',fontSize:11,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--green)',background:'var(--green-light)',padding:'5px 14px',borderRadius:'var(--r-full)',marginBottom:16}}>Simple &amp; Direct</span>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,4vw,42px)',fontWeight:900,letterSpacing:'-.04em',marginBottom:12,color:'var(--ink)'}}>
              Land your next gig in 3 steps
            </h2>
            <p style={{fontSize:16,color:'var(--grey-500)',maxWidth:500,margin:'0 auto',lineHeight:1.8}}>
              Whether you're a freelancer or a business — GigsKenya keeps it fast and direct.
            </p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 40px 1fr 40px 1fr',gap:0,alignItems:'start'}} className="gk-steps-grid">
            {[
              {n:'1',icon:Search,      title:'Search or Post',       desc:'Browse talent profiles and job listings filtered by skill, location, and industry. Or post your own listing in minutes.'},
              {n:'2',icon:Phone,       title:'Connect Directly',      desc:'Send a pitch message, reveal a phone number, or open WhatsApp in one tap. Three ways to connect — you choose.'},
              {n:'3',icon:CheckCircle, title:'Agree &amp; Get Paid', desc:'Set your terms, agree on scope, and get to work. Your deal, your rates — GigsKenya connects you and steps aside.'},
            ].map(({n,icon:Icon,title,desc},i,a)=>(
              <Fragment key={n}>
                <div style={{background:'white',borderRadius:20,padding:'28px 24px',border:'1.5px solid var(--grey-200)',textAlign:'center',position:'relative',transition:'all .2s'}}
                  onMouseOver={e=>{e.currentTarget.style.borderColor='var(--green)';e.currentTarget.style.boxShadow='0 12px 36px rgba(0,165,80,.12)';e.currentTarget.style.transform='translateY(-4px)';}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor='var(--grey-200)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
                  <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,var(--green),var(--green-mid))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px',boxShadow:'0 8px 24px rgba(0,165,80,.3)'}}>
                    <Icon size={26} color="white" strokeWidth={2}/>
                  </div>
                  <div style={{width:26,height:26,borderRadius:'50%',background:'var(--green)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:900,fontSize:12,color:'white',margin:'-8px auto 14px',border:'3px solid var(--cream)',position:'relative',zIndex:1}}>{n}</div>
                  <h3 style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:800,marginBottom:10,letterSpacing:'-.02em',color:'var(--ink)'}} dangerouslySetInnerHTML={{__html:title}}/>
                  <p style={{fontSize:14,color:'var(--grey-600)',lineHeight:1.8}}>{desc}</p>
                </div>
                {i < a.length-1 && (
                  <div className="gk-step-arrow" style={{display:'flex',alignItems:'center',justifyContent:'center',paddingTop:28}}>
                    <div style={{width:36,height:2,background:`linear-gradient(90deg,var(--grey-200),var(--grey-300))`,position:'relative'}}>
                      <div style={{position:'absolute',right:-1,top:-4,width:0,height:0,borderLeft:'8px solid var(--grey-300)',borderTop:'5px solid transparent',borderBottom:'5px solid transparent'}}/>
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FOR FREELANCERS / FOR BUSINESSES ════════════════ */}
      <section aria-label="For Kenyan freelancers and employers" style={{background:'var(--ink)',padding:'88px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-30%',left:'-5%',width:'50vw',height:'50vw',maxWidth:600,maxHeight:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,165,80,.07) 0%,transparent 65%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'-20%',right:'-5%',width:'40vw',height:'40vw',maxWidth:500,maxHeight:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(13,148,136,.07) 0%,transparent 65%)',pointerEvents:'none'}}/>
        <div style={{maxWidth:1060,margin:'0 auto',position:'relative'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <span style={{display:'inline-block',fontSize:11,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--green)',background:'rgba(0,165,80,.1)',padding:'5px 14px',borderRadius:'var(--r-full)',marginBottom:16}}>Two Sides, One Platform</span>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,4vw,42px)',fontWeight:900,color:'white',letterSpacing:'-.04em',marginBottom:12}}>
              Whether you hustle or you hire —<br/>Gigs254 delivers.
            </h2>
          </div>
          <div className="gk-g2">
            {/* FREELANCER CARD */}
            <div style={{background:'rgba(0,165,80,.06)',border:'1.5px solid rgba(0,165,80,.18)',borderRadius:24,padding:'32px 28px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-20,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(0,165,80,.07)',pointerEvents:'none'}}/>
              <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#00A550,#00C060)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,boxShadow:'0 8px 20px rgba(0,165,80,.35)'}}><Laptop size={24} color="white"/></div>
              <p style={{fontSize:10,fontWeight:700,color:'var(--green)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>For Freelancers &amp; Gig Workers</p>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900,color:'white',letterSpacing:'-.03em',marginBottom:10}}>Turn your talent into income</h3>
              <p style={{fontSize:14,color:'rgba(255,255,255,.45)',marginBottom:22,lineHeight:1.75}}>
                Developer, designer, writer, photographer, accountant or VA — GigsKenya connects you with Kenyan clients actively looking for your skills.
              </p>
              <ul style={{listStyle:'none',padding:0,margin:'0 0 26px',display:'flex',flexDirection:'column',gap:10}}>
                {['Create a profile in minutes — all industries welcome','Get discovered by businesses ready to hire now','Receive messages, calls &amp; WhatsApp from clients','Set your own rates and own every client relationship'].map(item=>(
                  <li key={item} style={{display:'flex',gap:10,fontSize:13,color:'rgba(255,255,255,.7)',alignItems:'flex-start',lineHeight:1.6}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:'rgba(0,165,80,.25)',border:'1px solid rgba(0,165,80,.4)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                      <span style={{color:'var(--green)',fontSize:10,lineHeight:1}}>✓</span>
                    </div>
                    <span dangerouslySetInnerHTML={{__html:item}}/>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=talent')} className="gk-btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:14,borderRadius:12}}>
                Post My Skills &amp; Find Gigs <ArrowRight size={15}/>
              </button>
            </div>

            {/* HIRER CARD */}
            <div style={{background:'rgba(13,148,136,.06)',border:'1.5px solid rgba(13,148,136,.2)',borderRadius:24,padding:'32px 28px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-20,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(13,148,136,.07)',pointerEvents:'none'}}/>
              <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#0D9488,#0F766E)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,boxShadow:'0 8px 20px rgba(13,148,136,.35)'}}><Building2 size={24} color="white"/></div>
              <p style={{fontSize:10,fontWeight:700,color:'#2DD4BF',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>For Businesses &amp; Employers</p>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900,color:'white',letterSpacing:'-.03em',marginBottom:10}}>Hire skilled Kenyan talent, fast</h3>
              <p style={{fontSize:14,color:'rgba(255,255,255,.45)',marginBottom:22,lineHeight:1.75}}>
                From Nairobi startups to established companies — find freelancers, contractors and part-time professionals without the overhead of traditional recruitment.
              </p>
              <ul style={{listStyle:'none',padding:0,margin:'0 0 26px',display:'flex',flexDirection:'column',gap:10}}>
                {['Post job ads and freelance briefs for any industry','Browse talent profiles across tech, creative, finance &amp; more','Message freelancers directly to request a pitch or proposal','Hire contractors, freelancers, or full-time staff'].map(item=>(
                  <li key={item} style={{display:'flex',gap:10,fontSize:13,color:'rgba(255,255,255,.7)',alignItems:'flex-start',lineHeight:1.6}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:'rgba(13,148,136,.25)',border:'1px solid rgba(13,148,136,.4)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                      <span style={{color:'#2DD4BF',fontSize:10,lineHeight:1}}>✓</span>
                    </div>
                    <span dangerouslySetInnerHTML={{__html:item}}/>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={()=>navigate(isAuthenticated?'/dashboard':'/register?role=hirer')}
                style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:14,background:'linear-gradient(135deg,#0D9488,#0F766E)',color:'white',border:'none',borderRadius:12,fontFamily:'var(--font-display)',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'all .2s',boxShadow:'0 4px 16px rgba(13,148,136,.3)'}}
                onMouseOver={e=>e.currentTarget.style.opacity='.9'}
                onMouseOut={e=>e.currentTarget.style.opacity='1'}>
                Post a Job or Browse Talent <ArrowRight size={15}/>
              </button>
            </div>
          </div>

          {/* Social proof bar */}
          <div style={{marginTop:40,display:'flex',gap:0,flexWrap:'wrap',justifyContent:'center',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,padding:'20px 32px'}}>
            {[
              {icon:Building2, v:`${fmt(cHirers) || '—'}+`, l:'Businesses registered', c:'#2DD4BF'},
              {icon:Users,     v:`${fmt(cTalents) || '—'}+`, l:'Talent profiles live',  c:'#4ADE80'},
              {icon:Briefcase, v:`${fmt(cAds) || '—'}+`,    l:'Jobs &amp; gigs posted', c:'#F59E0B'},
              {icon:Shield,    v:'Direct',                  l:'Contact & connect',         c:'#F472B6'},
            ].map(({icon:Icon,v,l,c},i,a)=>(
              <div key={l} style={{flex:'1 1 140px',textAlign:'center',padding:'8px 24px',borderRight:i<a.length-1?'1px solid rgba(255,255,255,.07)':'none'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,marginBottom:5}}>
                  <Icon size={14} color={c}/>
                  <p style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900,color:'white',letterSpacing:'-.03em',margin:0}}>{v}</p>
                </div>
                <p style={{fontSize:11,color:'rgba(255,255,255,.3)'}} dangerouslySetInnerHTML={{__html:l}}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ WHY GIGS254 ══════════════════════════════════════ */}
      <section aria-label="Why Gigs254 vs Upwork Fiverr for Kenya" style={{background:'var(--cream)',padding:'88px 24px'}}>
        <div style={{maxWidth:1060,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <span style={{display:'inline-block',fontSize:11,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--green)',background:'var(--green-light)',padding:'5px 14px',borderRadius:'var(--r-full)',marginBottom:16}}>Why Gigs254</span>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,4vw,42px)',fontWeight:900,letterSpacing:'-.04em',marginBottom:12,color:'var(--ink)'}}>
              The platform that works the way you do.
            </h2>
            <p style={{fontSize:16,color:'var(--grey-500)',maxWidth:520,margin:'0 auto',lineHeight:1.8}}>
              Fast connections, direct communication, every industry — built for Kenya.
            </p>
          </div>
          <div className="gk-g3 gk-why-grid" style={{gap:18}}>
            {[
              {icon:Phone,      title:'Message, Call, or WhatsApp',     desc:'Three ways to connect — in-app pitch, phone number, or WhatsApp in one tap. You choose the channel.'},
              {icon:MapPin,     title:'Local Context, Real Connections', desc:'Professionals who understand the Kenyan market, culture, and what clients actually need. Zero miscommunication.'},
              {icon:Layers,     title:'Every Industry, One Platform',    desc:'Tech, design, writing, law, construction, healthcare, events — every major sector in one place.'},
              {icon:Users,      title:'Talent That Gets the Brief',      desc:'Work with people who understand your audience. Faster briefs, sharper output, better results.'},
              {icon:Clock,      title:'Hire or Get Hired Fast',          desc:'Post a listing and hear back the same day. Browse talent and make contact in minutes — no escrow delays.'},
              {icon:TrendingUp, title:'Grow Your Freelance Business',    desc:'Build your reputation, grow your client base, and turn your skills into a sustainable business — on your terms.'},
            ].map(({icon:Icon,title,desc})=>(
              <div key={title} style={{padding:'24px',textAlign:'left',borderRadius:20,border:'1.5px solid var(--grey-200)',background:'white',transition:'all .2s',cursor:'default'}}
                onMouseOver={e=>{e.currentTarget.style.borderColor='var(--green)';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,165,80,.1)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='var(--grey-200)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,var(--green),var(--green-mid))',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,boxShadow:'0 6px 16px rgba(0,165,80,.3)'}}>
                  <Icon size={22} color="white" strokeWidth={1.8}/>
                </div>
                <h3 style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:800,marginBottom:8,letterSpacing:'-.02em',color:'var(--ink)'}}>{title}</h3>
                <p style={{fontSize:13,color:'var(--grey-600)',lineHeight:1.8}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ SEO KEYWORD BLOCK ═══════════════════════════════ */}
      <section aria-label="About GigsKenya — Kenya freelance platform" style={{background:'white',padding:'52px 20px',borderTop:'1px solid var(--grey-100)'}}>
        <div style={{maxWidth:960,margin:'0 auto'}}>
          <div className="gk-g2 gk-seo-grid" style={{gap:48,alignItems:'flex-start'}}>
            <div>
              <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(17px,2.5vw,22px)',fontWeight:800,marginBottom:14,letterSpacing:'-.02em'}}>
                Kenya's Leading Freelance &amp; Gig Jobs Platform
              </h2>
              <p style={{fontSize:14,color:'var(--grey-600)',lineHeight:1.9,marginBottom:16}}>
                GigsKenya is Kenya's dedicated marketplace for freelance work, short-term contracts, part-time roles, and gig opportunities across all industries. Developers, designers, writers, marketers, photographers, accountants, lawyers, tutors and more — all in one place.
              </p>
              <p style={{fontSize:14,color:'var(--grey-600)',lineHeight:1.9}}>
                We're the local alternative to platforms like Upwork and Fiverr — built specifically for East Africa, with built-in messaging so you can pitch or enquire before calling, plus direct WhatsApp contact and support for local payment methods like M-Pesa. Find freelancers in Nairobi, Mombasa, Kisumu, Eldoret, Nakuru, Thika, and beyond.
              </p>
            </div>
            <div>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:17,fontWeight:700,marginBottom:14,letterSpacing:'-.02em'}}>
                Popular Searches on GigsKenya
              </h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                {[
                  {label:'Freelance jobs Nairobi',         cat:null},
                  {label:'Web developer Kenya',            cat:'Tech & Dev'},
                  {label:'Graphic designer Nairobi',       cat:'Design'},
                  {label:'Content writer Kenya',           cat:'Writing & Content'},
                  {label:'Digital marketing Kenya',        cat:'Digital Marketing'},
                  {label:'Photographer Nairobi',           cat:'Photo & Video'},
                  {label:'Part time jobs Kenya',           cat:null},
                  {label:'Virtual assistant Kenya',        cat:'Customer Support'},
                  {label:'M-Pesa developer',               cat:'Tech & Dev'},
                  {label:'Android developer Kenya',        cat:'Tech & Dev'},
                  {label:'SEO expert Kenya',               cat:'Digital Marketing'},
                  {label:'Video editor Nairobi',           cat:'Photo & Video'},
                  {label:'Accountant Nairobi',             cat:'Business & Finance'},
                  {label:'Social media manager Kenya',     cat:'Digital Marketing'},
                  {label:'UI UX designer Kenya',           cat:'Design'},
                  {label:'Copywriter Kenya',               cat:'Writing & Content'},
                  {label:'Data analyst Nairobi',           cat:'Tech & Dev'},
                  {label:'Translator Swahili English',     cat:'Translation'},
                  {label:'Event planner Nairobi',          cat:null},
                  {label:'Construction Kenya',             cat:null},
                  {label:'Legal services Kenya',           cat:'Business & Finance'},
                ].map(({label,cat})=>(
                  <button
                    type="button"
                    key={label}
                    onClick={()=>navigate(cat ? `/browse?category=${encodeURIComponent(cat)}&type=all` : `/browse?q=${encodeURIComponent(label)}&type=all`)}
                    style={{fontSize:12,padding:'5px 11px',borderRadius:'var(--r-full)',border:'1px solid var(--grey-200)',background:'var(--grey-50)',color:'var(--grey-600)',cursor:'pointer',fontFamily:'var(--font-body)',transition:'all .15s'}}
                    onMouseOver={e=>{e.currentTarget.style.background='var(--green-light)';e.currentTarget.style.borderColor='var(--green)';e.currentTarget.style.color='var(--green-dark)';}}
                    onMouseOut={e=>{e.currentTarget.style.background='var(--grey-50)';e.currentTarget.style.borderColor='var(--grey-200)';e.currentTarget.style.color='var(--grey-600)';}}
                  >{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ FINAL CTA ════════════════════════════════════════ */}
      <section style={{background:'linear-gradient(135deg,var(--green-dark) 0%,var(--green) 60%,var(--green-mid) 100%)',padding:'80px 20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)',backgroundSize:'44px 44px',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1,maxWidth:600,margin:'0 auto'}}>
          <div style={{width:54,height:54,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px'}}>
            <Sparkles size={24} color="white"/>
          </div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(26px,5vw,48px)',fontWeight:900,color:'white',letterSpacing:'-.04em',marginBottom:12,lineHeight:1.05}}>
            Kenya is hiring.<br/>Are you ready?
          </h2>
          <p style={{color:'rgba(255,255,255,.75)',fontSize:16,marginBottom:36,maxWidth:420,margin:'0 auto 36px',lineHeight:1.8}}>
            Thousands of professionals and businesses are on GigsKenya right now. Your next gig — or your next great hire — is one listing away.
          </p>
          <div className="gk-hero-btns" style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            <button
              type="button"
              onClick={()=>navigate(isAuthenticated?'/dashboard':'/register')}
              style={{background:'white',color:'var(--green)',padding:'15px 34px',borderRadius:'var(--r-sm)',fontWeight:700,fontSize:15,border:'none',cursor:'pointer',fontFamily:'var(--font-display)',transition:'all .2s'}}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.2)';}}
              onMouseOut={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}
            >{isAuthenticated?'Go to Dashboard →':'Get Started →'}</button>
            <button type="button" onClick={()=>navigate('/browse')} className="gk-btn-ghost" style={{padding:'15px 30px',fontSize:15}}>Explore Listings</button>
          </div>
          <p style={{marginTop:20,fontSize:12,color:'rgba(255,255,255,.3)'}}>
            GigsKenya — the home of Kenyan freelancers, contractors &amp; gig workers.
          </p>
        </div>
      </section>

      {/* ════ STICKY MOBILE CTA ═══════════════════════════════ */}
      <div className="gk-sticky-cta">
        <button type="button" className="gk-sticky-cta-btn gk-sticky-cta-primary"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register?role=talent')}>
          <Laptop size={16}/> Find Work
        </button>
        <button type="button" className="gk-sticky-cta-btn gk-sticky-cta-ghost"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register?role=hirer')}>
          <Building2 size={16}/> Hire Talent
        </button>
      </div>

    </div>
  );
}