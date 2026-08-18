import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Search, ChevronDown, X, Plus, SlidersHorizontal,
  MapPin, Phone, MessageSquare, Star,
} from 'lucide-react';
import { getAds } from '../lib/firestore';
import { requireAuth, goToPostJob } from '../lib/authGuard';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../lib/categories';
import { CITIES } from '../lib/locations';
import { avatarColor, darkGradient, GOLD_GRADIENT, DARK_TILE } from '../lib/colors';
import { timeAgo } from '../lib/time';
import './Home.css';
import SEO from '../components/SEO';

/* ─────────────────────────────────────────────────────────────
   Config
───────────────────────────────────────────────────────────── */
const PAGE_SIZE = 12;

const LOCS = ['All Kenya', ...CITIES];

// id === label === the exact string PostAdForm saves as ad.category —
// keeps filtering an exact match instead of a fragile prefix guess.
const CATS = [
  { id: 'all', label: 'All Categories' },
  ...CATEGORIES.map(c => ({ id: c, label: c })),
];

const getInitials  = (name) => (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

/* ─────────────────────────────────────────────────────────────
   Rate formatter
───────────────────────────────────────────────────────────── */
const RATE_SUFFIX = {
  hourly: '/hr', hour: '/hr',
  daily: '/day', day: '/day',
  weekly: '/wk', week: '/wk',
  monthly: '/mo', month: '/mo',
  fixed: ' fixed', project: '/project', once: ' once',
};

function formatRate(ad) {
  const raw = ad.rate || ad.budget;
  if (!raw && raw !== 0) return 'Negotiable';
  const str = String(raw).trim();
  const alreadyFormatted = /[A-Za-z\/\$€£]/.test(str);
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  const currency = ad.currency || 'KES';
  const rt = (ad.rateType || ad.ratetype || ad.rate_type || '').toLowerCase();
  const suffix = RATE_SUFFIX[rt] || '';
  if (alreadyFormatted) return suffix && !str.includes('/') && !str.toLowerCase().includes('fixed') ? str + suffix : str;
  if (isNaN(num)) return str;
  return `${currency} ${num.toLocaleString('en-KE')}${suffix}`;
}

/* ─────────────────────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #E5E7EB', overflow: 'hidden' }}>
      <div style={{ height: 4, background: '#E5E7EB' }} />
      <div style={{ padding: '18px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div className="gk-skeleton" style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="gk-skeleton" style={{ height: 11, width: '55%' }} />
            <div className="gk-skeleton" style={{ height: 9, width: '35%' }} />
          </div>
        </div>
        <div className="gk-skeleton" style={{ height: 16, width: '85%', marginBottom: 8 }} />
        <div className="gk-skeleton" style={{ height: 12, width: '95%', marginBottom: 5 }} />
        <div className="gk-skeleton" style={{ height: 12, width: '70%', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[60, 70, 55].map((w, i) => (
            <div key={i} className="gk-skeleton" style={{ height: 22, width: w, borderRadius: 6 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
          <div className="gk-skeleton" style={{ height: 18, width: 90 }} />
          <div className="gk-skeleton" style={{ height: 34, width: 80, borderRadius: 9 }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FilterPill
───────────────────────────────────────────────────────────── */
function FilterPill({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '5px 10px 5px 13px', background: 'var(--green-light)', color: 'var(--green-dark)', borderRadius: 'var(--r-full)', border: '1px solid rgba(0,165,80,.18)' }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: 'var(--green)' }}>
        <X size={12} />
      </button>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Sel (select dropdown)
───────────────────────────────────────────────────────────── */
function Sel({ value, onChange, options, isObj }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={e  => e.target.style.borderColor = 'var(--green)'}
        onBlur={e   => e.target.style.borderColor = '#E5E7EB'}
        style={{ padding: '9px 32px 9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'white', cursor: 'pointer', appearance: 'none', color: '#111827', fontFamily: 'var(--font-body)', transition: 'border-color .15s', minWidth: 140 }}
      >
        {options.map(o => isObj
          ? <option key={o.id} value={o.id}>{o.label}</option>
          : <option key={o}>{o}</option>
        )}
      </select>
      <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PageBtn
───────────────────────────────────────────────────────────── */
function PageBtn({ active, disabled, onClick, children }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{ minWidth: 44, minHeight: 44, padding: '0 12px', borderRadius: 10, border: `1.5px solid ${active ? 'var(--green)' : '#E5E7EB'}`, background: active ? 'var(--green)' : disabled ? '#F9FAFB' : 'white', color: active ? 'white' : disabled ? '#D1D5DB' : '#111827', fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
    >{children}</button>
  );
}

/* ─────────────────────────────────────────────────────────────
   AdCard — main listing card
───────────────────────────────────────────────────────────── */
export function AdCard({ ad, navigate }) {
  const [contactShown, setContactShown] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const color = avatarColor(ad.id);
  const inits = getInitials(ad.posterName);
  const rateDisplay = formatRate(ad);
  const posted = timeAgo(ad.createdAt);
  const tags = Array.isArray(ad.tags)
    ? ad.tags
    : (ad.tags || '').split(',').map(t => t.trim()).filter(Boolean);

  const goToAd = () => navigate(`/ad/${ad.id}`);

  const handleContact = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!requireAuth({ isAuthenticated, navigate, location })) return;
    setContactShown(v => !v);
  };

  return (
    <div
      onClick={goToAd}
      role="link"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') goToAd(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 16,
        border: `1.5px solid ${hovered ? color + '55' : '#E8ECF0'}`,
        overflow: 'visible',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all .2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered
          ? `0 16px 40px ${color}1e, 0 4px 12px rgba(0,0,0,.07)`
          : '0 1px 4px rgba(0,0,0,.04)',
      }}
    >
      {/* Top accent stripe */}
      <div style={{
        height: 4,
        borderRadius: '14px 14px 0 0',
        background: ad.boosted ? GOLD_GRADIENT : darkGradient(color),
        flexShrink: 0,
      }} />

      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Row 1: featured + posted time + location */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
          {ad.boosted && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
              <Star size={9} fill="currentColor"/> Featured
            </span>
          )}
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', minWidth: 0 }}>
            {posted && <span>{posted}</span>}
            {posted && ad.location && <span style={{ color: '#E5E7EB' }}>·</span>}
            {ad.location && <span style={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}><MapPin size={9} strokeWidth={2.5} /> {ad.location}</span>}
          </span>
        </div>

        {/* Category chip */}
        {ad.category && (
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 9px',
            borderRadius: 20, marginBottom: 9, alignSelf: 'flex-start',
            background: `${color}0d`, color, letterSpacing: '.04em',
          }}>
            {CATS.find(c => c.id === ad.category)?.label || ad.category}
          </span>
        )}

        {/* Title */}
        <h3 style={{
          fontSize: 15, fontWeight: 800, color: '#111827',
          lineHeight: 1.35, letterSpacing: '-.02em',
          marginBottom: ad.description ? 8 : 12,
          fontFamily: 'var(--font-display)',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {ad.title}
        </h3>

        {/* Description */}
        {ad.description && (
          <p style={{
            fontSize: 12.5, color: '#6B7280', lineHeight: 1.65, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {ad.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {tags.slice(0, 3).map(t => (
              <span key={t} style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 6,
                background: '#F3F4F6', color: '#374151', fontWeight: 600,
              }}>{t}</span>
            ))}
            {tags.length > 3 && (
              <span style={{ fontSize: 11, color: '#9CA3AF', alignSelf: 'center' }}>+{tags.length - 3}</span>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Footer: poster + rate | contact */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 12, borderTop: '1px solid #F0F2F5', gap: 8,
        }}>
          <div style={{ display: 'flex', gap: 9, alignItems: 'center', minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: ad.posterLogo ? 'white' : DARK_TILE,
              border: ad.posterLogo ? '1px solid #F0F2F5' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 11, color: ad.posterLogo ? color : 'white', overflow: 'hidden',
            }}>
              {ad.posterLogo
                ? <img src={ad.posterLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                : inits
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                {ad.posterName || 'Anonymous'}
              </p>
              <p style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.3 }}>{rateDisplay}</p>
            </div>
          </div>

          <button
            onClick={handleContact}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              background: contactShown ? '#F0FDF4' : color,
              color: contactShown ? '#16A34A' : 'white',
              border: `1.5px solid ${contactShown ? '#86EFAC' : color}`,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all .15s', flexShrink: 0,
            }}
          >
            <Phone size={12} /> {contactShown ? 'Hide' : 'Contact'}
          </button>
        </div>
      </div>

      {/* Contact overlay */}
      {contactShown && (
        <div
          onClick={e => { e.stopPropagation(); e.preventDefault(); }}
          style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            background: 'white', zIndex: 10,
            display: 'flex', flexDirection: 'column',
            padding: '20px 18px',
            boxShadow: `0 24px 64px rgba(0,0,0,.18)`,
            border: `2px solid ${color}45`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 3 }}>
                {ad.posterName || 'Anonymous'}
              </p>
              <p style={{ fontSize: 12, color: '#6B7280' }}>Contact directly</p>
            </div>
            <button onClick={handleContact}
              style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={13} color="#6B7280" />
            </button>
          </div>

          {ad.phone ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <a href={`tel:${ad.phone}`}
                  onClick={e => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 11, background: '#111827', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  <Phone size={15} /> {ad.phone}
                </a>
                {ad.whatsapp !== false && (
                  <a href={`https://wa.me/254${ad.phone.replace(/^0/, '').replace(/\s/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 11, background: '#16A34A', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    <MessageSquare size={15} /> Open WhatsApp
                  </a>
                )}
              </div>
              <button onClick={e => { e.stopPropagation(); navigate(`/ad/${ad.id}`); }}
                style={{ marginTop: 14, fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                View full listing →
              </button>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>No contact number provided.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BROWSE PAGE
───────────────────────────────────────────────────────────── */
export default function Browse() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const topRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const postJobClick = e => goToPostJob(navigate, isAuthenticated, e);

  const [q,           setQ]           = useState(() => sp.get('q')        || '');
  const [draftQ,      setDraftQ]      = useState(() => sp.get('q')        || '');
  const [type,        setType]        = useState(() => sp.get('type')     || 'all');
  const [cat,         setCat]         = useState(() => sp.get('category') || 'all');
  const [loc,         setLoc]         = useState('All Kenya');
  const [sort,        setSort]        = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(() => !!(sp.get('category') && sp.get('category') !== 'all'));
  const [page,        setPage]        = useState(1);

  const [ads,     setAds]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newCat  = sp.get('category') || 'all';
    const newType = sp.get('type')     || 'all';
    const newQ    = sp.get('q')        || '';
    setCat(newCat); setType(newType); setQ(newQ); setDraftQ(newQ); setPage(1);
    if (newCat !== 'all') setFiltersOpen(true);
  }, [sp.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getAds({ limitCount: 200 })
      .then(data => setAds(data))
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [q, type, cat, loc, sort]);

  const filtered = useMemo(() => {
    const qL   = q.toLowerCase();
    const catL = cat.toLowerCase();

    return ads
      .filter(a => {
        const tags   = Array.isArray(a.tags) ? a.tags : (a.tags || '').split(',').map(t => t.trim());
        const qMatch = !q
          || a.title?.toLowerCase().includes(qL)
          || a.description?.toLowerCase().includes(qL)
          || a.posterName?.toLowerCase().includes(qL)
          || tags.some(t => t.toLowerCase().includes(qL));
        const typeMatch = type === 'all' || a.type === type;
        const catMatch = cat === 'all' || (a.category || '').toLowerCase().trim() === catL;
        const locMatch = loc === 'All Kenya' || a.location?.toLowerCase().includes(loc.toLowerCase());
        return qMatch && typeMatch && catMatch && locMatch;
      })
      .sort((a, b) => {
        if (sort === 'featured' && b.boosted !== a.boosted) return b.boosted ? 1 : -1;
        return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
      });
  }, [ads, q, type, cat, loc, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (n) => {
    setPage(n);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const hasActive = q || type !== 'all' || cat !== 'all' || loc !== 'All Kenya';
  const activeCt  = [type !== 'all', cat !== 'all', loc !== 'All Kenya'].filter(Boolean).length;
  const clearAll  = () => { setQ(''); setDraftQ(''); setType('all'); setCat('all'); setLoc('All Kenya'); setSort('featured'); };

  const pageNumbers = useMemo(() => {
    const pages = [], lo = Math.max(1, page - 1), hi = Math.min(totalPages, page + 1);
    if (lo > 1) { pages.push(1); if (lo > 2) pages.push('…'); }
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (hi < totalPages) { if (hi < totalPages - 1) pages.push('…'); pages.push(totalPages); }
    return pages;
  }, [page, totalPages]);

  const catLabel  = CATS.find(c => c.id === cat)?.label || '';
  const headingText = cat !== 'all' ? `${catLabel} Jobs in Kenya` : 'All Jobs in Kenya';

  const yr = new Date().getFullYear();
  const browseTitle = cat !== 'all'
    ? `${catLabel} Jobs in Kenya ${yr}`
    : `Latest Jobs in Kenya ${yr} | Vacancies, Part Time & Remote Work`;

  const browseDesc = cat !== 'all'
    ? `Browse ${catLabel.toLowerCase()} jobs in Kenya. Find opportunities in Nairobi, Mombasa, Kisumu & remote. Apply directly, pay via M-Pesa.`
    : `Latest job vacancies in Kenya ${yr}. Full time, part time, remote & freelance jobs in Nairobi, Mombasa, Kisumu, Nakuru & across Kenya. Online jobs that pay via M-Pesa. Fresh graduate & entry level jobs included.`;

  return (
    <>
    <SEO
      title={browseTitle}
      description={browseDesc}
      keywords={`jobs in Kenya, jobs in Nairobi, Kenya jobs ${yr}, latest jobs Kenya, job vacancies Kenya, freelance jobs Kenya, online jobs Kenya, kazi Kenya, ajira Kenya, tafuta kazi, work from home Kenya, remote jobs Kenya, part time jobs Kenya, side hustle Kenya, gig work Kenya, online jobs that pay via M-Pesa, online jobs Kenya no experience, fresh graduate jobs Kenya, entry level jobs Nairobi, jobs for students Kenya, work from home Nairobi, tech jobs Kenya, software developer jobs Kenya, graphic design jobs Kenya, digital marketing jobs Kenya, content writing jobs Kenya, accounting jobs Kenya, data entry jobs Kenya, transcription jobs Kenya, social media jobs Kenya, jobs Mombasa, jobs Kisumu, jobs Nakuru, jobs Eldoret, jobs Thika, county jobs Kenya, NGO jobs Kenya, internship Kenya, casual jobs Kenya, jua kali jobs Kenya`}
      canonical="/browse"
    />
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F9FAFB' }}>

      {/* Hidden H1 for SEO */}
      <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', margin: 0 }}>
        {headingText} — GigsKenya Free Freelance Marketplace
      </h1>

      {/* ════ STICKY HEADER ════ */}
      <div style={{ background: 'var(--ink)', padding: '14px 20px 12px', position: 'sticky', top: 64, zIndex: 40, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px,2.2vw,18px)', fontWeight: 800, color: 'white', letterSpacing: '-.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cat !== 'all' ? headingText : type === 'job' ? 'Job Ads' : 'All Listings'}
              </span>
              {!loading && (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
                  {filtered.length.toLocaleString()} result{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <Link to="/post-a-job" onClick={postJobClick} className="gk-btn-primary" style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}>
              <Plus size={13} /> Post Free
            </Link>
          </div>

          {/* Search row */}
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0, background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', overflow: 'hidden', height: 46 }}>
              {/* Type tabs */}
              <div style={{ display: 'flex', gap: 2, background: '#F3F4F6', padding: 3, margin: '0 4px', borderRadius: 9, flexShrink: 0 }}>
                {[{ id: 'all', l: 'All' }, { id: 'job', l: 'Jobs' }].map(({ id, l }) => (
                  <button key={id} onClick={() => setType(id)} style={{ padding: '5px 9px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', transition: 'all .12s', background: type === id ? 'white' : 'transparent', color: type === id ? '#111827' : '#9CA3AF', boxShadow: type === id ? '0 1px 3px rgba(0,0,0,.1)' : 'none', whiteSpace: 'nowrap' }}>{l}</button>
                ))}
              </div>
              <input
                value={draftQ}
                onChange={e => setDraftQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setQ(draftQ)}
                placeholder="Search skills, jobs, names…"
                style={{ flex: 1, border: 'none', fontSize: 13, padding: '0 8px', outline: 'none', color: '#111827', fontFamily: 'var(--font-body)', background: 'transparent', minWidth: 0 }}
              />
              {draftQ && (
                <button onClick={() => { setDraftQ(''); setQ(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', color: '#9CA3AF', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <X size={13} />
                </button>
              )}
            </div>

            <button onClick={() => setQ(draftQ)} className="gk-btn-primary" style={{ padding: '0 16px', height: 46, borderRadius: 12, flexShrink: 0, minWidth: 46 }}>
              <Search size={15} />
            </button>

            <button
              onClick={() => setFiltersOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 46, borderRadius: 12, border: `1.5px solid ${filtersOpen ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.12)'}`, background: filtersOpen ? 'rgba(255,255,255,.1)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', flexShrink: 0, position: 'relative', transition: 'all .15s' }}
            >
              <SlidersHorizontal size={14} />
              <span className="gk-filter-label">Filters</span>
              {activeCt > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--green)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeCt}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ════ FILTER PANEL ════ */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', maxHeight: filtersOpen ? 500 : 0, overflow: 'hidden', transition: 'max-height .3s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>

            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Category</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATS.map(c => (
                  <button key={c.id} onClick={() => setCat(c.id)}
                    style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${cat === c.id ? 'var(--green)' : '#E5E7EB'}`, background: cat === c.id ? 'var(--green-light)' : '#F9FAFB', color: cat === c.id ? 'var(--green-dark)' : '#6B7280', fontSize: 12, fontWeight: cat === c.id ? 700 : 500, cursor: 'pointer', transition: 'all .12s', fontFamily: 'var(--font-body)' }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Location</p>
                <Sel value={loc} onChange={setLoc} options={LOCS} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Sort by</p>
                <Sel value={sort} onChange={setSort} options={['featured', 'newest']} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setFiltersOpen(false)} className="gk-btn-primary" style={{ padding: '9px 22px', fontSize: 13 }}>Apply Filters</button>
            {hasActive && (
              <button onClick={clearAll} style={{ fontSize: 13, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ════ CONTENT ════ */}
      <div ref={topRef} style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 20px 80px' }}>

        {/* Active filter pills */}
        {!loading && hasActive && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            {q               && <FilterPill label={`"${q}"`}                                    onRemove={() => { setQ(''); setDraftQ(''); }} />}
            {type !== 'all'  && <FilterPill label="Jobs" onRemove={() => setType('all')} />}
            {cat  !== 'all'  && <FilterPill label={CATS.find(c => c.id === cat)?.label}         onRemove={() => setCat('all')} />}
            {loc  !== 'All Kenya' && <FilterPill label={loc}                                    onRemove={() => setLoc('All Kenya')} />}
            <button onClick={clearAll} style={{ fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>
              Clear all
            </button>
          </div>
        )}

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <p style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 16 }}>
            Showing <strong style={{ color: '#111827' }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of{' '}
            <strong style={{ color: '#111827' }}>{filtered.length}</strong> listing{filtered.length !== 1 ? 's' : ''}
            {' · '}
            <Link to="/talent" style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none' }}>
              Hiring instead? Browse Kenyan freelancers →
            </Link>
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: 'white', borderRadius: 20, border: '1.5px solid #E5E7EB' }}>
            {ads.length === 0 ? (
              <>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🇰🇪</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 10, color: '#111827' }}>Be the first to post!</h2>
                <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, maxWidth: 340, margin: '0 auto 24px', lineHeight: 1.7 }}>
                  GigsKenya just launched. Post your job ad and be the first listing Kenyans see — completely free.
                </p>
                <Link to="/post-a-job" onClick={postJobClick} className="gk-btn-primary" style={{ padding: '12px 28px', fontSize: 14, margin: '0 auto' }}>
                  Post a Free Ad →
                </Link>
              </>
            ) : (
              <>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Search size={28} color="#9CA3AF" strokeWidth={1.5}/></div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#111827' }}>No listings match</h2>
                <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
                  Try different keywords, a broader category, or clear your filters.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={clearAll} style={{ padding: '11px 24px', fontSize: 14, borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white', color: '#111827', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    Clear Filters
                  </button>
                  <Link to="/post-a-job" onClick={postJobClick} className="gk-btn-primary" style={{ padding: '11px 24px', fontSize: 14 }}>
                    Post a Job →
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {paginated.map(ad => <AdCard key={ad.id} ad={ad} navigate={navigate} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <PageBtn disabled={page === 1} onClick={() => goToPage(page - 1)}>← Prev</PageBtn>
                {pageNumbers.map((p, i) =>
                  p === '…'
                    ? <span key={`e${i}`} style={{ padding: '0 4px', fontSize: 14, color: '#9CA3AF' }}>…</span>
                    : <PageBtn key={p} active={p === page} onClick={() => goToPage(p)}>{p}</PageBtn>
                )}
                <PageBtn disabled={page === totalPages} onClick={() => goToPage(page + 1)}>Next →</PageBtn>
              </div>
            )}
            {totalPages > 1 && (
              <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#9CA3AF' }}>
                Page {page} of {totalPages} · {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
              </p>
            )}
          </>
        )}

        {/* SEO block */}
        {!loading && (
          <div style={{ marginTop: 52, padding: '24px 26px', background: 'white', borderRadius: 16, border: '1.5px solid #E5E7EB' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, marginBottom: 8, letterSpacing: '-.02em', color: '#111827' }}>
              {cat !== 'all'
                ? `${catLabel} Jobs in Kenya`
                : 'Find Job Vacancies in Kenya on GigsKenya'
              }
            </h2>
            <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.8, maxWidth: 720 }}>
              GigsKenya connects Kenyan job seekers with employers across Nairobi, Mombasa, Kisumu, Eldoret, and beyond.
              {cat !== 'all'
                ? ` Browse ${catLabel} vacancies and apply directly via phone or WhatsApp — no middleman.`
                : ' Browse the latest job ads, or post your own vacancy and receive direct applications from qualified Kenyan candidates.'
              }
            </p>
          </div>
        )}
      </div>

      {/* ════ MOBILE BOTTOM BAR ════ */}
      <div className="gk-browse-bar" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'white', borderTop: '1px solid #E5E7EB', padding: '10px 16px', gap: 10 }}>
        <button onClick={() => setFiltersOpen(o => !o)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white', color: '#111827', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <SlidersHorizontal size={15} /> Filters{activeCt > 0 ? ` (${activeCt})` : ''}
        </button>
        <Link to="/post-a-job" onClick={postJobClick} className="gk-btn-primary" style={{ flex: 1, padding: '12px', fontSize: 14, justifyContent: 'center' }}>
          <Plus size={15} /> Post Free
        </Link>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .gk-browse-bar { display: flex !important; }
          body { padding-bottom: 78px; }
          .gk-filter-label { display: none; }
        }
      `}</style>
    </div>
    </>
  );
}
