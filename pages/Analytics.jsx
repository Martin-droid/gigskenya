import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, FileText, Eye, TrendingUp, RefreshCw, LogOut, Zap, Shield, AlertTriangle, ArrowUp, ArrowDown, Minus, X, ChevronDown, ChevronUp, Phone, MapPin, Briefcase, Globe, Calendar, MessageSquare } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Password system — SHA-256(SALT + password)
   To change password, compute:
     (async()=>{const e=new TextEncoder(),h=await crypto.subtle.digest('SHA-256',
     e.encode('gk_2025_s_nbi:NEW_PASSWORD'));
     console.log(Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join(''))})()
───────────────────────────────────────────────────────────── */
const SALT        = 'gk_2025_s_nbi:';
const ADMIN_HASH  = '97c838dfda902660f17e874fb32932b4304eab374b82ca702cb6ee8dbeeb4946';
const SESSION_KEY = 'gk_analytics_sess';
const MAX_ATTEMPTS = 5;

async function sha256(value) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(SALT + value));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ─────────────────────────────────────────────────────────────
   Data loader
───────────────────────────────────────────────────────────── */
async function loadAnalytics() {
  const [usersSnap, profilesSnap, adsSnap, hirerProfilesSnap, statsSnap] = await Promise.all([
    getDocs(query(collection(db, 'users'))),
    getDocs(query(collection(db, 'profiles'))),
    getDocs(query(collection(db, 'ads'))),
    getDocs(query(collection(db, 'hirer_profiles'))),
    getDoc(doc(db, 'platform_stats', 'public')),
  ]);

  const toMs  = ts => ts?.toDate ? ts.toDate().getTime() : ts ? new Date(ts).getTime() : 0;
  const now   = Date.now();
  const DAY   = 86400000;
  const WEEK  = 7  * DAY;
  const MONTH = 30 * DAY;

  const users    = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const profiles = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const ads      = adsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const hirerProfileMap = {};
  hirerProfilesSnap.docs.forEach(d => { hirerProfileMap[d.id] = d.data(); });

  /* ── Users ──────────────────────────────────────────── */
  const hirers    = users.filter(u => u.role === 'hirer');
  const talent    = users.filter(u => u.role === 'talent');
  const noRole    = users.filter(u => !u.role);
  const newWeek   = users.filter(u => now - toMs(u.createdAt) < WEEK);
  const newMonth  = users.filter(u => now - toMs(u.createdAt) < MONTH);
  const lastWeek  = users.filter(u => {
    const age = now - toMs(u.createdAt);
    return age >= WEEK && age < 2 * WEEK;
  });
  const weekGrowth = lastWeek.length === 0
    ? (newWeek.length > 0 ? 100 : 0)
    : Math.round(((newWeek.length - lastWeek.length) / lastWeek.length) * 100);

  /* ── Talent profiles ──────────────────────────────── */
  const activeProfiles = profiles.filter(p => p.status === 'active');
  const completeProf   = profiles.filter(p => p.phone && p.bio && p.skills?.length && p.title);
  const profViews      = profiles.reduce((s, p) => s + (p.views || 0), 0);
  const profClicks     = profiles.reduce((s, p) => s + (p.contactClicks || 0), 0);
  const profConvert    = profViews > 0 ? ((profClicks / profViews) * 100).toFixed(1) : '0.0';

  /* ── Ads ────────────────────────────────────────────── */
  const activeAds  = ads.filter(a => !a.status || a.status === 'active');
  const newAdsWeek = ads.filter(a => now - toMs(a.createdAt) < WEEK);
  const adViews    = ads.reduce((s, a) => s + (a.views || 0), 0);
  const adClicks   = ads.reduce((s, a) => s + (a.contactClicks || 0), 0);
  const adConvert  = adViews > 0 ? ((adClicks / adViews) * 100).toFixed(1) : '0.0';

  /* ── Hirer activity ──────────────────────────────── */
  const hirersWithAds = new Set(ads.filter(a => a.status !== 'deleted').map(a => a.userId)).size;
  const hirerActivity = hirers.length > 0 ? Math.round((hirersWithAds / hirers.length) * 100) : 0;

  /* ── Profile completion ─────────────────────────── */
  const profCompletion = talent.length > 0
    ? Math.round((completeProf.length / talent.length) * 100)
    : 0;

  /* ── Top categories ────────────────────────────── */
  const catMap = {};
  ads.forEach(a => { if (a.category) catMap[a.category] = (catMap[a.category] || 0) + 1; });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 7);

  /* ── Recent signups ─────────────────────────────── */
  const recentUsers = [...users]
    .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))
    .slice(0, 20);

  /* ── Pitches — read from public platform_stats counter ── */
  const statsData    = statsSnap.exists() ? statsSnap.data() : {};
  const totalPitches = statsData.pitches || 0;

  /* ── Enriched hirers for modal ──────────────────── */
  const hirerAdsMap = {};
  ads.forEach(a => {
    if (a.userId) {
      if (!hirerAdsMap[a.userId]) hirerAdsMap[a.userId] = [];
      hirerAdsMap[a.userId].push(a);
    }
  });
  const enrichedHirers = [...hirers]
    .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))
    .map(u => ({
      ...u,
      hirerProfile: hirerProfileMap[u.id] || null,
      adCount: (hirerAdsMap[u.id] || []).length,
      recentAds: (hirerAdsMap[u.id] || [])
        .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))
        .slice(0, 4),
    }));

  return {
    users:   { total: users.length, hirers: hirers.length, talent: talent.length, noRole: noRole.length, newWeek: newWeek.length, newMonth: newMonth.length, lastWeek: lastWeek.length, weekGrowth },
    profiles:{ total: profiles.length, active: activeProfiles.length, complete: completeProf.length, views: profViews, clicks: profClicks, convert: profConvert, completion: profCompletion },
    ads:     { total: ads.length, active: activeAds.length, newWeek: newAdsWeek.length, views: adViews, clicks: adClicks, convert: adConvert },
    pitches: { total: totalPitches },
    health:  { hirerActivity, hirersWithAds },
    topCats,
    recentUsers,
    enrichedHirers,
    generatedAt: new Date(),
  };
}

/* ─────────────────────────────────────────────────────────────
   UI atoms
───────────────────────────────────────────────────────────── */
function BigStat({ label, value, sub, badge, color = '#16A34A', bg = '#F0FDF4', icon: Icon, onAction, actionLabel }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</p>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <p style={{ fontSize: 34, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.05em', lineHeight: 1, marginBottom: 6 }}>{value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {sub && <p style={{ fontSize: 12, color: '#94A3B8' }}>{sub}</p>}
        {badge}
      </div>
      {onAction && (
        <button onClick={onAction}
          style={{ marginTop: 14, width: '100%', padding: '7px 0', borderRadius: 8, border: `1.5px solid ${color}`, background: 'transparent', color, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '.01em' }}>
          {actionLabel || 'View all →'}
        </button>
      )}
    </div>
  );
}

function GrowthBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  const up   = pct > 0;
  const flat = pct === 0;
  const col  = flat ? '#94A3B8' : up ? '#16A34A' : '#EF4444';
  const bg2  = flat ? '#F3F4F6' : up ? '#DCFCE7' : '#FEF2F2';
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 20, background: bg2, fontSize: 11, fontWeight: 700, color: col }}>
      <Icon size={10} />{Math.abs(pct)}% vs last week
    </span>
  );
}

function HealthBar({ label, pct, color, note }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{pct}%</span>
      </div>
      <div style={{ height: 10, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 6, transition: 'width .7s ease' }} />
      </div>
      {note && <p style={{ fontSize: 11, color: '#94A3B8' }}>{note}</p>}
    </div>
  );
}

function CatBar({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#16A34A', borderRadius: 4, transition: 'width .6s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', width: 28, textAlign: 'right', flexShrink: 0 }}>{value}</span>
    </div>
  );
}

function Sk({ w = '100%', h = 16 }) {
  return <div style={{ height: h, width: w, borderRadius: 6, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />;
}

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 18px' }}>
      <p style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>{label}</p>
      <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Hirers modal
───────────────────────────────────────────────────────────── */
function HirersModal({ hirers, onClose, fmtDate }) {
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = hirers.filter(h => {
    const q = search.toLowerCase();
    return (
      (h.name || h.displayName || '').toLowerCase().includes(q) ||
      (h.email || '').toLowerCase().includes(q) ||
      (h.location || '').toLowerCase().includes(q) ||
      (h.hirerProfile?.company || '').toLowerCase().includes(q)
    );
  });

  const initials = (h) => {
    const name = h.displayName || h.name || h.email || '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const toggle = (id) => setExpanded(v => v === id ? null : id);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.2)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.03em', marginBottom: 2 }}>
              All Hirers
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>{hirers.length}</span>
            </h2>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>Click a row to see full details</p>
          </div>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={15} color="#6B7280" />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #F9FAFB', flexShrink: 0 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company or location…"
            style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111827' }}
            onFocus={e => e.target.style.borderColor = '#16A34A'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Scrollable list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>No hirers match your search.</div>
          ) : filtered.map((h, i) => {
            const open = expanded === h.id;
            const hp   = h.hirerProfile;
            const name = h.displayName || h.name || '—';
            return (
              <div key={h.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F9FAFB' : 'none' }}>

                {/* Row */}
                <div
                  onClick={() => toggle(h.id)}
                  style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: open ? '#F9FAFB' : 'white', transition: 'background .1s' }}
                  onMouseOver={e => { if (!open) e.currentTarget.style.background = '#FAFAFA'; }}
                  onMouseOut={e => { if (!open) e.currentTarget.style.background = 'white'; }}>

                  {/* Avatar */}
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#6366F1' }}>{initials(h)}</span>
                  </div>

                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                      {hp?.company && <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', background: '#F3F4F6', padding: '1px 7px', borderRadius: 10, whiteSpace: 'nowrap' }}>{hp.company}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.email || '—'}</p>
                  </div>

                  {/* Right chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {h.adCount > 0
                      ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#FEF3C7', color: '#D97706' }}>{h.adCount} ad{h.adCount !== 1 ? 's' : ''}</span>
                      : <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#F3F4F6', color: '#9CA3AF' }}>no ads</span>}
                    <p style={{ fontSize: 11, color: '#CBD5E1', whiteSpace: 'nowrap' }}>{fmtDate(h.createdAt)}</p>
                    <div style={{ color: '#CBD5E1' }}>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
                  </div>
                </div>

                {/* Expanded detail */}
                {open && (
                  <div style={{ padding: '0 24px 18px 78px', background: '#F9FAFB' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: hp?.bio ? 12 : 0 }}>
                      {(h.phone || hp?.phone) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Phone size={12} color="#94A3B8" />
                          <span style={{ fontSize: 13, color: '#374151' }}>{h.phone || hp?.phone}</span>
                        </div>
                      )}
                      {(h.location || hp?.location) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={12} color="#94A3B8" />
                          <span style={{ fontSize: 13, color: '#374151' }}>{h.location || hp?.location}</span>
                        </div>
                      )}
                      {hp?.companySize && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Briefcase size={12} color="#94A3B8" />
                          <span style={{ fontSize: 13, color: '#374151' }}>{hp.companySize}</span>
                        </div>
                      )}
                      {hp?.website && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Globe size={12} color="#94A3B8" />
                          <a href={hp.website} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#16A34A', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hp.website}</a>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={12} color="#94A3B8" />
                        <span style={{ fontSize: 13, color: '#374151' }}>Joined {fmtDate(h.createdAt)}</span>
                      </div>
                    </div>

                    {hp?.bio && (
                      <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, marginBottom: 10, background: 'white', padding: '10px 12px', borderRadius: 8, border: '1px solid #F1F5F9' }}>{hp.bio}</p>
                    )}

                    {h.recentAds.length > 0 && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Recent Ads</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {h.recentAds.map(ad => (
                            <span key={ad.id} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'white', border: '1px solid #E5E7EB', color: '#374151', fontWeight: 500 }}>
                              {ad.title}
                              {ad.status === 'deleted' && <span style={{ marginLeft: 4, color: '#EF4444' }}>·deleted</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
          <p style={{ fontSize: 12, color: '#CBD5E1', textAlign: 'center' }}>{filtered.length} of {hirers.length} hirers shown</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Password gate
───────────────────────────────────────────────────────────── */
function PasswordGate({ onAuth }) {
  const [pw, setPw]             = useState('');
  const [show, setShow]         = useState(false);
  const [err, setErr]           = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading]   = useState(false);
  const locked = attempts >= MAX_ATTEMPTS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked || loading) return;
    setLoading(true); setErr('');
    try {
      const hash = await sha256(pw.trim());
      if (hash === ADMIN_HASH) {
        sessionStorage.setItem(SESSION_KEY, '1');
        onAuth();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setErr(next >= MAX_ATTEMPTS
          ? 'Too many incorrect attempts. Close and reopen this tab to try again.'
          : `Incorrect password — ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? '' : 's'} remaining.`);
        if (next < MAX_ATTEMPTS) setPw('');
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, background: '#111', border: '1.5px solid #1F2937', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={24} color="#16A34A" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-.03em', marginBottom: 6 }}>GigsKenya Analytics</h1>
          <p style={{ color: '#4B5563', fontSize: 13 }}>Restricted access — admin only.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type={show ? 'text' : 'password'} value={pw}
              onChange={e => setPw(e.target.value)} placeholder="Admin password"
              disabled={locked} autoFocus
              style={{ width: '100%', padding: '13px 46px 13px 16px', borderRadius: 12, border: `1.5px solid ${err ? '#EF4444' : '#1F2937'}`, background: '#111', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box', letterSpacing: show ? 'normal' : '.1em' }}
            />
            <button type="button" onClick={() => setShow(v => !v)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
              {show ? 'HIDE' : 'SHOW'}
            </button>
          </div>
          {err && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#1F0A0A', border: '1px solid #450A0A', borderRadius: 10, marginBottom: 12, alignItems: 'center' }}>
              <AlertTriangle size={13} color="#EF4444" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#FCA5A5', margin: 0 }}>{err}</p>
            </div>
          )}
          <button type="submit" disabled={locked || loading}
            style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: locked ? '#1F2937' : '#16A34A', color: locked ? '#4B5563' : 'white', fontSize: 15, fontWeight: 700, cursor: locked ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Verifying…' : locked ? 'Locked' : 'Unlock Dashboard'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: '#1F2937' }}>SHA-256 protected · Rate limited</p>
      </div>
      <style>{`@keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Analytics dashboard
───────────────────────────────────────────────────────────── */
function AnalyticsDashboard({ onLogout }) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [showHirers, setShowHirers] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try { setData(await loadAnalytics()); }
    catch (e) { setErr('Failed to load. Check Firestore permissions.'); console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt     = n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  const fmtDate = ts => {
    const ms = ts?.seconds ? ts.seconds * 1000 : ts ? new Date(ts).getTime() : 0;
    if (!ms) return '—';
    return new Date(ms).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const card = (content) => (
    <div style={{ background: 'white', borderRadius: 16, padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
      {content}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingTop: 64 }}>

      {/* Top bar — sits below the site Navbar (fixed, z-index 200) */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 64, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#0A0A0A', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={13} color="#16A34A" fill="#16A34A" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 15, color: '#0A0A0A', letterSpacing: '-.02em' }}>
            GigsKenya <span style={{ color: '#16A34A' }}>Analytics</span>
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', letterSpacing: '.04em' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {data && <p style={{ fontSize: 11, color: '#94A3B8' }}>Refreshed {data.generatedAt.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</p>}
          <button onClick={load} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <RefreshCw size={11} style={{ animation: loading ? 'spin .8s linear infinite' : 'none' }} /> Refresh
          </button>
          <button onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', fontSize: 12, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>
            <LogOut size={11} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 80px' }}>

        {err && (
          <div style={{ display: 'flex', gap: 10, padding: '13px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, marginBottom: 24 }}>
            <AlertTriangle size={15} color="#EF4444" /><p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>{err}</p>
          </div>
        )}

        {/* if load failed entirely, data stays null — show nothing further */}
        {!loading && !data && !err && null}

        {/* ── GROWTH ─────────────────────────────────────────────── */}
        <Divider label="Growth" />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #F1F5F9' }}>
                <Sk w="55%" h={10} /><div style={{ height: 12 }} /><Sk w="45%" h={30} />
              </div>
            ))}
          </div>
        ) : data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            <BigStat
              icon={Users} label="Total Users" value={fmt(data.users.total)}
              sub={`${data.users.newMonth} this month`}
              badge={<GrowthBadge pct={data.users.weekGrowth} />}
              color="#6366F1" bg="#EEF2FF"
            />
            <BigStat icon={TrendingUp} label="New This Week" value={fmt(data.users.newWeek)}
              sub={`${data.users.lastWeek} last week`} color="#06B6D4" bg="#ECFEFF" />
            <BigStat icon={Users} label="Hirers" value={fmt(data.users.hirers)}
              sub={data.users.total > 0 ? `${Math.round((data.users.hirers / data.users.total) * 100)}% of users` : '—'}
              color="#F59E0B" bg="#FEF3C7"
              onAction={() => setShowHirers(true)} actionLabel="View Hirers →" />
            <BigStat icon={FileText} label="Talent" value={fmt(data.users.talent)}
              sub={data.users.total > 0 ? `${Math.round((data.users.talent / data.users.total) * 100)}% of users` : '—'}
              color="#10B981" bg="#F0FDF4" />
            <BigStat icon={AlertTriangle} label="Incomplete Reg." value={fmt(data.users.noRole)}
              sub="no role assigned" color="#EF4444" bg="#FEF2F2" />
          </div>
        )}

        {/* ── PLATFORM HEALTH ──────────────────────────────────────── */}
        <Divider label="Platform Health" />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #F1F5F9' }}><Sk h={14} /><div style={{ height: 24 }} /><Sk h={8} /><div style={{ height: 16 }} /><Sk h={8} /></div>
            <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #F1F5F9' }}><Sk h={14} /><div style={{ height: 24 }} /><Sk h={8} /><div style={{ height: 16 }} /><Sk h={8} /></div>
          </div>
        ) : data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

            {card(<>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Talent Profile Completion</p>
              <HealthBar
                label="Profiles created by talent"
                pct={data.users.talent > 0 ? Math.round((data.profiles.total / data.users.talent) * 100) : 0}
                color="#10B981"
                note={`${data.profiles.total} of ${data.users.talent} talent have a profile`}
              />
              <HealthBar
                label="Profiles fully complete"
                pct={data.profiles.completion}
                color="#16A34A"
                note={`${data.profiles.complete} of ${data.users.talent} have phone, bio, skills & title`}
              />
              <HealthBar
                label="Active & visible"
                pct={data.profiles.total > 0 ? Math.round((data.profiles.active / data.profiles.total) * 100) : 0}
                color="#06B6D4"
                note={`${data.profiles.active} of ${data.profiles.total} profiles are live`}
              />
            </>)}

            {card(<>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Hirer & Ads Activity</p>
              <HealthBar
                label="Hirers who posted ads"
                pct={data.health.hirerActivity}
                color="#F59E0B"
                note={`${data.health.hirersWithAds} of ${data.users.hirers} hirers are active`}
              />
              <HealthBar
                label="Active ads (not deleted)"
                pct={data.ads.total > 0 ? Math.round((data.ads.active / data.ads.total) * 100) : 0}
                color="#6366F1"
                note={`${data.ads.active} of ${data.ads.total} ads are live`}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>ADS THIS WEEK</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.04em' }}>{data.ads.newWeek}</p>
                </div>
                <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>TOTAL ADS</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-.04em' }}>{fmt(data.ads.total)}</p>
                </div>
              </div>
            </>)}

          </div>
        )}

        {/* ── ENGAGEMENT ───────────────────────────────────────────── */}
        <Divider label="Engagement" />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #F1F5F9' }}>
                <Sk w="55%" h={10} /><div style={{ height: 12 }} /><Sk w="45%" h={30} />
              </div>
            ))}
          </div>
        ) : data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            <BigStat icon={Eye} label="Profile Views" value={fmt(data.profiles.views)}
              sub={`${data.profiles.clicks} contact clicks`} color="#6366F1" bg="#EEF2FF" />
            <BigStat icon={Eye} label="Ad Views" value={fmt(data.ads.views)}
              sub={`${data.ads.clicks} contact clicks`} color="#F59E0B" bg="#FEF3C7" />
            <BigStat icon={TrendingUp} label="Profile Conversion" value={`${data.profiles.convert}%`}
              sub="views → contact clicks" color="#10B981" bg="#F0FDF4" />
            <BigStat icon={TrendingUp} label="Ad Conversion" value={`${data.ads.convert}%`}
              sub="views → contact clicks" color="#06B6D4" bg="#ECFEFF" />
          </div>
        )}

        {/* ── PITCHES ──────────────────────────────────────────────── */}
        <Divider label="Pitches & Connections" />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid #F1F5F9' }}>
                <Sk w="55%" h={10} /><div style={{ height: 12 }} /><Sk w="45%" h={30} />
              </div>
            ))}
          </div>
        ) : data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            <BigStat icon={MessageSquare} label="Total Pitches" value={fmt(data.pitches.total)}
              sub="messages sent to listings" color="#8B5CF6" bg="#F5F3FF" />
            <BigStat icon={TrendingUp} label="Pitch Rate" value={
              data.ads.active > 0 ? `${(data.pitches.total / data.ads.active).toFixed(1)}×` : '—'
            } sub="pitches per active ad" color="#F59E0B" bg="#FEF3C7" />
            <BigStat icon={Eye} label="Ad Contact Clicks" value={fmt(data.ads.clicks)}
              sub="contact reveals on listings" color="#06B6D4" bg="#ECFEFF" />
            <BigStat icon={Eye} label="Profile Contact Clicks" value={fmt(data.profiles.clicks)}
              sub="contact reveals on profiles" color="#10B981" bg="#F0FDF4" />
          </div>
        )}

        {/* ── TOP CATEGORIES ───────────────────────────────────────── */}
        {!loading && data?.topCats.length > 0 && (
          <>
            <Divider label="Top Ad Categories" />
            <div style={{ background: 'white', borderRadius: 16, padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              {data.topCats.map(([cat, n]) => (
                <CatBar key={cat} label={cat} value={n} max={data.topCats[0]?.[1] || 1} />
              ))}
            </div>
          </>
        )}

        {/* ── RECENT SIGNUPS ────────────────────────────────────────── */}
        {!loading && data?.recentUsers.length > 0 && (
          <>
            <Divider label="Recent Signups" />
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Name', 'Email', 'Role', 'Location', 'Joined'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '.05em', textTransform: 'uppercase', borderBottom: '1px solid #F3F4F6' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < data.recentUsers.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                      onMouseOver={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseOut={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#111827' }}>{u.displayName || u.name || '—'}</td>
                      <td style={{ padding: '11px 16px', color: '#6B7280' }}>{u.email || '—'}</td>
                      <td style={{ padding: '11px 16px' }}>
                        {u.role
                          ? <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: u.role === 'talent' ? '#FEF3C7' : '#EEF2FF', color: u.role === 'talent' ? '#D97706' : '#6366F1' }}>{u.role}</span>
                          : <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: '#FEF2F2', color: '#EF4444' }}>none</span>}
                      </td>
                      <td style={{ padding: '11px 16px', color: '#6B7280' }}>{u.location || '—'}</td>
                      <td style={{ padding: '11px 16px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

      {showHirers && data && (
        <HirersModal
          hirers={data.enrichedHirers}
          onClose={() => setShowHirers(false)}
          fmtDate={fmtDate}
        />
      )}

      <style>{`
        @keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 640px) { table { display: block; overflow-x: auto } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Root
───────────────────────────────────────────────────────────── */
export default function Analytics() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;
  return <AnalyticsDashboard onLogout={handleLogout} />;
}
