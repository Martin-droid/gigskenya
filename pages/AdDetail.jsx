import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  MapPin, Phone, MessageSquare, ArrowLeft, Eye, Clock, Flag,
  Share2, Shield, ChevronRight, Copy, Check, X, Link as LinkIcon,
  Zap, User, Calendar, DollarSign, Briefcase, Mail, Send, Lock, Search,
} from 'lucide-react';
import { getAd, incrementAdViews, incrementAdContact, reportListing, getHirerProfile } from '../lib/firestore';
import { requireAuth, saveIntent } from '../lib/authGuard';
import { useAuth } from '../context/AuthContext';
import { avatarColor, DARK_TILE } from '../lib/colors';

function Avatar({ src, name, color, size = 48 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: src ? 'white' : DARK_TILE, border: `2.5px solid ${color}30`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontWeight: 800, fontSize: size * 0.34, color: 'white', fontFamily: 'var(--font-display)' }}>{initials}</span>
      }
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1a202c', color: 'white', borderRadius: 100, padding: '11px 22px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,.25)', zIndex: 9999, whiteSpace: 'nowrap', animation: 'toastIn .2s ease' }}>
      <Check size={14} color="#22C55E" /> {message}
    </div>
  );
}

function ShareModal({ url, onClose }) {
  const inputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { inputRef.current?.select(); }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(onClose, 1300); }
    catch { inputRef.current?.select(); }
  };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, padding: '24px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,.2)', animation: 'modalIn .2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <p style={{ fontWeight: 800, fontSize: 17, color: '#1a202c', letterSpacing: '-.03em' }}>Share this listing</p>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><X size={15} /></button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', background: '#F8FAFC', overflow: 'hidden' }}>
            <LinkIcon size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
            <input ref={inputRef} readOnly value={url} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: '#64748B', outline: 'none', minWidth: 0 }} onClick={e => e.target.select()} />
          </div>
          <button onClick={copy} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: copied ? '#22C55E' : '#16A34A', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, transition: 'background .2s' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { href: `https://wa.me/?text=${encodeURIComponent(url)}`, label: 'WhatsApp', icon: <MessageSquare size={13}/>, bg: '#25D366', color: 'white' },
            { href: `https://t.me/share/url?url=${encodeURIComponent(url)}`, label: 'Telegram', icon: <Send size={13}/>, bg: '#229ED9', color: 'white' },
            { href: `mailto:?subject=${encodeURIComponent('Check this on GigsKenya')}&body=${encodeURIComponent(url)}`, label: 'Email', icon: <Mail size={13}/>, bg: '#F1F5F9', color: '#374151' },
          ].map(({ href, label, icon, bg, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 6px', borderRadius: 10, background: bg, color, fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>
              {icon}{label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sk({ h = 14, w = '100%', r = 8, mb = 0 }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: mb, flexShrink: 0 }} />;
}

function MetaPill({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
      {icon}
      <div>
        <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1a202c', letterSpacing: '-.02em' }}>{value}</div>
      </div>
    </div>
  );
}

export default function AdDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const { user, isAuthenticated, isTalent, profile } = useAuth();

  const [ad, setAd]                         = useState(null);
  const [hirerProfile, setHirerProfile]     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [contactShown, setContactShown]     = useState(false);
  const [reported, setReported]             = useState(false);
  const [notFound, setNotFound]             = useState(false);
  const [toast, setToast]                   = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    getAd(id)
      .then(async data => {
        if (!data || data.status === 'deleted') { setNotFound(true); return; }
        setAd(data);
        incrementAdViews(id).catch(() => {});
        const uid = data.userId || data.uid;
        if (uid) {
          getHirerProfile(uid).then(hp => { if (hp) setHirerProfile(hp); }).catch(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // ── AUTH-GATED HANDLERS ──────────────────────────────────────────

  /**
   * "Pitch to Hirer" — talent-specific action.
   * Unauthenticated users go to /register?role=talent so they immediately
   * land on the talent registration flow, with the pitch intent preserved.
   */
  const handleMessage = () => {
    const posterUid  = ad.userId || ad.uid;
    const posterName = ad.posterName || 'Hirer';

    if (!requireAuth({
      isAuthenticated,
      navigate,
      location,
      intent: {
        type:     'pitch',
        returnTo: '/messages',
        params:   { with: posterUid, name: posterName, pitch: 'true' },
        source:   location.pathname,
        label:    posterName,
      },
      redirectTo: '/register?role=talent',
    })) return;

    // Talent must have a completed profile before pitching — a hirer needs
    // to know who's reaching out, and it filters low-effort contacts.
    if (isTalent && !profile?.profileComplete) {
      saveIntent({
        type:     'pitch',
        returnTo: '/messages',
        params:   { with: posterUid, name: posterName, pitch: 'true' },
        source:   location.pathname,
        label:    posterName,
      });
      navigate('/dashboard', { state: { tab: 'profile' } });
      return;
    }

    navigate(`/messages?with=${posterUid}&name=${encodeURIComponent(posterName)}&pitch=true`);
  };

  /**
   * WhatsApp contact — could be any authenticated user.
   * Sends to /login so existing users aren't forced through registration.
   * After login, they return to this ad page to tap WhatsApp themselves.
   */
  const handleWhatsApp = () => {
    if (!requireAuth({
      isAuthenticated,
      navigate,
      location,
      intent: {
        type:     'generic',
        returnTo: location.pathname,
        source:   location.pathname,
        label:    null,
      },
      redirectTo: '/login',
    })) return;

    const num = `254${ad.phone.replace(/^0/, '').replace(/\s/g, '')}`;
    window.open(`https://wa.me/${num}`, '_blank', 'noopener,noreferrer');
  };

  /**
   * Reveal phone number — same as WhatsApp: any authenticated user.
   */
  const handleShowContact = () => {
    if (!requireAuth({
      isAuthenticated,
      navigate,
      location,
      intent: {
        type:     'generic',
        returnTo: location.pathname,
        source:   location.pathname,
        label:    null,
      },
      redirectTo: '/login',
    })) return;

    setContactShown(true);
    incrementAdContact(id).catch(() => {});
  };

  const handleReport = async () => {
    if (reported) return;
    try { await reportListing(id, user?.uid || 'anonymous', 'User report'); } catch {}
    setReported(true);
    setToast('Listing reported. Thanks for keeping GigsKenya safe.');
  };

  const handleShare = () => {
    setShowShareModal(true);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  // ── LOADING / NOT FOUND ──────────────────────────────────────────

  if (loading) return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 16px' }}>
        <Sk h={16} w={120} mb={28} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }} className="ad-grid">
          <div>
            <div style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 14, border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                <Sk h={52} w={52} r={26} />
                <div style={{ flex: 1 }}><Sk h={11} w={80} mb={10} /><Sk h={22} w="70%" mb={10} /><Sk h={11} w={180} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}><Sk h={52} w={120} r={10} /><Sk h={52} w={100} r={10} /></div>
              <Sk h={14} w="100%" mb={8} /><Sk h={14} w="90%" mb={8} /><Sk h={14} w="80%" />
            </div>
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #F1F5F9' }}>
              <Sk h={18} w={160} mb={18} />
              {[1,2,3,4].map(i => <Sk key={i} h={14} mb={10} />)}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}><Sk h={46} w={46} r={23} /><div style={{ flex: 1 }}><Sk h={14} mb={8} /><Sk h={11} w="60%" /></div></div>
            <Sk h={44} mb={8} r={11} /><Sk h={44} mb={8} r={11} /><Sk h={44} r={11} />
          </div>
        </div>
      </div>
      <style>{`@keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}`}</style>
    </div>
  );

  if (notFound || !ad) return (
    <div style={{ paddingTop: 64, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', gap: 12 }}>
      <Search size={52} color="#CBD5E1" strokeWidth={1.5}/>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', letterSpacing: '-.03em' }}>Ad not found</h2>
      <p style={{ color: '#64748B' }}>This listing may have been removed or expired.</p>
      <button onClick={() => navigate('/browse')} style={{ padding: '12px 24px', borderRadius: 12, background: '#16A34A', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>Browse Listings →</button>
    </div>
  );

  const color       = avatarColor(id);
  const isJob       = ad.type === 'job';
  const postedDate  = ad.createdAt?.toDate ? ad.createdAt.toDate().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const isOwnAd     = isAuthenticated && user?.uid === (ad.userId || ad.uid);
  const posterPhoto = ad.posterLogo || hirerProfile?.companyLogoURL || hirerProfile?.photoURL || hirerProfile?.googlePhotoURL || ad.posterPhoto || null;
  const tags        = Array.isArray(ad.tags) ? ad.tags : (ad.tags || '').split(',').map(t => t.trim()).filter(Boolean);

  const ActionButtons = ({ stack = true }) => (
    <div style={{ display: 'flex', flexDirection: stack ? 'column' : 'row', gap: 8 }}>
      <button onClick={handleMessage}
        style={{ flex: stack ? 'none' : 1, width: stack ? '100%' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: stack ? '13px' : '11px 8px', borderRadius: 11, border: '1.5px solid #16A34A', background: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: stack ? 14 : 12, cursor: 'pointer', transition: 'all .15s' }}
        onMouseOver={e => e.currentTarget.style.background = '#DCFCE7'}
        onMouseOut={e => e.currentTarget.style.background = '#F0FDF4'}>
        <MessageSquare size={stack ? 15 : 13} />{stack ? 'Pitch to Hirer' : 'Pitch'}
      </button>

      {!hirerProfile?.hidePhone && ad.whatsapp !== false && (
        <button onClick={handleWhatsApp}
          style={{ flex: stack ? 'none' : 1, width: stack ? '100%' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: stack ? '13px' : '11px 8px', borderRadius: 11, border: 'none', background: '#25D366', color: 'white', fontWeight: 700, fontSize: stack ? 14 : 12, cursor: 'pointer', transition: 'opacity .15s' }}
          onMouseOver={e => e.currentTarget.style.opacity = '.88'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}>
          <MessageSquare size={stack ? 15 : 13} /> WhatsApp
        </button>
      )}

      {hirerProfile?.hidePhone ? (
        <div style={{ padding: '11px 14px', borderRadius: 11, background: '#FEF2F2', border: '1px solid #FECACA', textAlign: 'center', fontSize: 12, color: '#DC2626', fontWeight: 700 }}>
          <Lock size={12}/> Phone hidden — use Pitch to contact
        </div>
      ) : !contactShown ? (
        <button onClick={handleShowContact}
          style={{ flex: stack ? 'none' : 1, width: stack ? '100%' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: stack ? '14px' : '11px 8px', borderRadius: 11, border: 'none', background: '#1a202c', color: 'white', fontWeight: 700, fontSize: stack ? 15 : 12, cursor: 'pointer', transition: 'background .15s' }}
          onMouseOver={e => e.currentTarget.style.background = '#2D3748'}
          onMouseOut={e => e.currentTarget.style.background = '#1a202c'}>
          <Phone size={stack ? 16 : 13} />{stack ? 'Show Contact' : 'Contact'}
        </button>
      ) : (
        <div style={{ flex: stack ? 'none' : 1, background: '#F0FDF4', borderRadius: 11, padding: '12px 14px', border: '1px solid #BBF7D0', width: stack ? '100%' : 'auto', boxSizing: 'border-box' }}>
          <p style={{ fontSize: 11, color: '#64748B', marginBottom: 8, textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Contact {ad.posterName?.split(' ')[0] || 'them'} directly
          </p>
          <a href={`tel:${ad.phone}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 9, background: '#1a202c', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            <Phone size={14} /> {ad.phone}
          </a>
        </div>
      )}
    </div>
  );

  const adTitle    = ad?.title    || '';
  const adLocation = ad?.location || 'Kenya';
  const adCategory = ad?.category || '';
  const adDesc     = ad?.description ? ad.description.slice(0, 155) : `${adTitle} opportunity in ${adLocation}. Apply on GigsKenya — Kenya's top freelance & jobs marketplace.`;
  const adJsonLd   = ad ? {
    '@context': 'https://schema.org',
    '@type': isJob ? 'JobPosting' : 'Service',
    title: adTitle,
    description: ad.description || adTitle,
    datePosted: ad.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    hiringOrganization: { '@type': 'Organization', name: ad.posterName || 'GigsKenya Hirer' },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: adLocation, addressCountry: 'KE' } },
    ...(ad.rate ? { baseSalary: { '@type': 'MonetaryAmount', currency: ad.currency || 'KES', value: { '@type': 'QuantitativeValue', value: ad.rate } } } : {}),
  } : null;

  return (
    <>
    <SEO
      title={`${adTitle}${adCategory ? ` | ${adCategory}` : ''} in ${adLocation} — ${isJob ? 'Job' : 'Service'} | GigsKenya`}
      description={adDesc}
      keywords={[
        adTitle.toLowerCase(),
        `${isJob ? 'jobs' : 'hire'} in Kenya`,
        `${adCategory.toLowerCase()} ${isJob ? 'jobs' : 'freelancers'} Kenya`,
        `${adLocation.toLowerCase()} ${isJob ? 'jobs' : 'freelancers'}`,
        'jobs in Kenya 2026',
        'kazi Kenya',
        'latest jobs Kenya',
        isJob ? 'job vacancies Kenya' : 'hire freelancers Kenya',
        'M-Pesa Kenya',
        'online jobs Kenya',
      ].filter(Boolean).join(', ')}
      canonical={`/ad/${id}`}
      ogType={isJob ? 'article' : 'website'}
      jsonLd={adJsonLd}
    />
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 16px 80px' }} className="ad-page-inner">

        <button onClick={() => navigate('/browse')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#64748B', background: 'none', border: 'none', fontSize: 14, marginBottom: 22, cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={15} /> Back to listings
        </button>

        <div className="ad-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* ── MAIN ── */}
          <div>
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #F1F5F9', padding: '22px 24px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
                <Avatar src={posterPhoto} name={ad.posterName} color={color} size={52} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 9, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: isJob ? '#FEF3C7' : '#F0FDF4', color: isJob ? '#D97706' : '#16A34A', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {isJob ? <><Briefcase size={10}/> Job Ad</> : <><Zap size={10}/> Service</>}
                    </span>
                    {ad.category && <span style={{ fontSize: 11, color: '#64748B', padding: '3px 10px', border: '1px solid #E2E8F0', borderRadius: 20 }}>{ad.category}</span>}
                    {ad.urgent && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '3px 10px', borderRadius: 20 }}>
                        <Zap size={10} fill="#DC2626" /> Urgent
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#1a202c', lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: 10 }}>{ad.title}</h1>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#94A3B8', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1a202c' }}>{ad.posterName || 'Anonymous'}</span>
                    {ad.location && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{ad.location}</span>}
                    {postedDate && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} />{postedDate}</span>}
                    {ad.views > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={11} />{ad.views} views</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: tags.length ? 14 : 0 }}>
                <MetaPill icon={<DollarSign size={12} color="#16A34A" />} label="Budget" value={ad.budget || ad.rate || 'Negotiable'} />
                {(ad.budgetType || ad.duration) && <MetaPill icon={<Briefcase size={12} color="#6366F1" />} label="Type" value={ad.budgetType || ad.duration} />}
                {ad.deadline && <MetaPill icon={<Calendar size={12} color="#F59E0B" />} label="Deadline" value={ad.deadline} />}
              </div>

              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tags.map(t => <span key={t} style={{ fontSize: 12, background: '#F1F5F9', color: '#475569', padding: '5px 12px', borderRadius: 20, fontWeight: 600 }}>{t}</span>)}
                </div>
              )}

            </div>

            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #F1F5F9', padding: '22px 24px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a202c', letterSpacing: '-0.02em', marginBottom: 18 }}>
                {isJob ? 'Job Details' : 'About This Service'}
              </h2>
              <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                {ad.description || 'No description provided.'}
              </div>
            </div>

            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Shield size={16} color="#D97706" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>Safety Tips</p>
                  <p style={{ fontSize: 13, color: '#B45309', lineHeight: 1.6 }}>
                    Meet in a safe public place. Never pay upfront before seeing work.{' '}
                    <button onClick={() => navigate('/how-it-works')} style={{ color: '#D97706', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>Learn more →</button>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="ad-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 80 }}>
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #F1F5F9', padding: '22px', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid #F8FAFC' }}>
                <Avatar src={posterPhoto} name={ad.posterName} color={color} size={48} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: '#1a202c', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.posterName || 'Anonymous'}</p>
                  <p style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {hirerProfile?.companyName
                      ? <><Briefcase size={10} />{hirerProfile.companyName}</>
                      : <><User size={10} />Individual Hirer</>
                    }
                  </p>
                  {(hirerProfile?.location || ad.location) && (
                    <p style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <MapPin size={10} />{hirerProfile?.location || ad.location}
                    </p>
                  )}
                </div>
              </div>
              {!isOwnAd && <div className="desk-action-btns"><ActionButtons stack={true} /></div>}
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: '#94A3B8', lineHeight: 1.6 }}>
                GigsKenya connects you directly. Negotiate and agree on your own terms.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleShare}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: 11, background: 'white', fontSize: 13, color: '#475569', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
                <Share2 size={13} /> Share
              </button>
              <button onClick={handleReport}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', border: `1.5px solid ${reported ? '#F1F5F9' : '#FEE2E2'}`, borderRadius: 11, background: reported ? '#F8FAFC' : 'white', fontSize: 13, color: reported ? '#CBD5E1' : '#EF4444', cursor: reported ? 'default' : 'pointer', fontWeight: 600, transition: 'all 0.15s' }}>
                <Flag size={13} /> {reported ? 'Reported' : 'Report'}
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #F1F5F9', padding: '14px 16px' }}>
              <button
                onClick={() => {
                  if (isAuthenticated && !isTalent) navigate('/dashboard', { state: { tab: 'post' } });
                  else navigate('/register', { state: { role: 'hirer' } });
                }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1.5px solid #F1F5F9', borderRadius: 10, background: '#FAFAFA', cursor: 'pointer', transition: 'all .15s', textAlign: 'left' }}
                onMouseOver={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#F1F5F9'; }}>
                <Briefcase size={20} color="#94A3B8"/>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1a202c' }}>Post your own free ad</p>
                  <p style={{ fontSize: 11, color: '#94A3B8' }}>Reach thousands of Kenyans</p>
                </div>
                <ChevronRight size={14} color="#CBD5E1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
      {showShareModal && <ShareModal url={window.location.href} onClose={() => setShowShareModal(false)} />}

      {/* ── Mobile sticky CTA bar ── */}
      {!isOwnAd && (
        <div className="mob-cta-bar" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'white',
          borderTop: '1px solid #E2E8F0',
          padding: '10px 14px calc(10px + env(safe-area-inset-bottom))',
          display: 'none',
          gap: 8,
          boxShadow: '0 -4px 24px rgba(0,0,0,.1)',
        }}>
          <button onClick={handleMessage}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 6px', borderRadius: 12, border: '2px solid #16A34A', background: '#F0FDF4', color: '#15803D', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
            <MessageSquare size={15} /> Pitch to Hirer
          </button>
          {!hirerProfile?.hidePhone && ad.whatsapp !== false && (
            <button onClick={handleWhatsApp}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 6px', borderRadius: 12, border: 'none', background: '#25D366', color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              <MessageSquare size={15} /> WhatsApp
            </button>
          )}
          {hirerProfile?.hidePhone ? null : !contactShown ? (
            <button onClick={handleShowContact}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 6px', borderRadius: 12, border: 'none', background: '#1a202c', color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              <Phone size={15} /> Contact
            </button>
          ) : (
            <a href={`tel:${ad.phone}`}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 6px', borderRadius: 12, background: '#1a202c', color: 'white', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
              <Phone size={15} /> {ad.phone}
            </a>
          )}
        </div>
      )}

      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
        @media (max-width: 768px) {
          .ad-grid { grid-template-columns: 1fr !important; }
          .ad-sidebar { position: static !important; }
          .mob-cta-bar { display: flex !important; }
          .desk-action-btns { display: none; }
          /* extra bottom room so sticky bar doesn't cover content */
          .ad-page-inner { padding-bottom: 100px !important; }
        }
      `}</style>
    </div>
    </>
  );
}