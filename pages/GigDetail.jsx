import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin, Clock, CheckCircle, ArrowLeft, Zap, Users,
  Shield, Send, Briefcase, Calendar, DollarSign, MessageSquare,
  Phone, User, Eye, X,
} from 'lucide-react';
import { getAd, incrementAdViews, incrementAdContact, getHirerProfile } from '../lib/firestore';
import { requireAuth } from '../lib/authGuard';
import { useAuth } from '../context/AuthContext';

const catColors = {
  'Web Development': '#4F46E5', 'Design & Creative': '#EC4899',
  'Writing & Content': '#F59E0B', 'Digital Marketing': '#10B981',
  'Tech & Dev': '#4F46E5', 'Design': '#EC4899',
};
const avatarColors = ['#4F46E5','#EC4899','#F59E0B','#10B981','#EF4444','#8B5CF6','#06B6D4','#F97316'];

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ src, name, color, size = 48 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: src ? 'transparent' : `${color}20`, border: `2.5px solid ${color}30`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontWeight: 800, fontSize: size * 0.34, color, fontFamily: 'var(--font-display)' }}>{initials}</span>
      }
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

function Spinner() {
  return <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block', flexShrink: 0 }} />;
}

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [gig, setGig]                   = useState(null);
  const [hirerProfile, setHirerProfile] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [showApply, setShowApply]       = useState(false);
  const [cover, setCover]               = useState('');
  const [bid, setBid]                   = useState('');
  const [submitted, setSubmitted]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [contactShown, setContactShown] = useState(false);

  useEffect(() => {
    getAd(id)
      .then(async data => {
        if (!data || data.status === 'deleted') { setNotFound(true); return; }
        setGig(data);
        incrementAdViews(id).catch(() => {});
        const uid = data.userId || data.uid;
        if (uid) {
          getHirerProfile(uid).then(hp => { if (hp) setHirerProfile(hp); }).catch(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = e => {
    e.preventDefault();
    if (!requireAuth({ isAuthenticated, navigate, location })) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1000);
  };
  const handleMessage = () => {
    if (!requireAuth({ isAuthenticated, navigate, location })) return;
    if (!gig?.uid) return;
    navigate(`/messages?with=${gig.uid}&name=${encodeURIComponent(gig.posterName || 'Hirer')}&pitch=true`);
  };
  const handleWhatsApp = () => {
    if (!requireAuth({ isAuthenticated, navigate, location })) return;
    if (!gig?.phone) return;
    const num = `254${gig.phone.replace(/^0/, '').replace(/\s/g, '')}`;
    window.open(`https://wa.me/${num}`, '_blank', 'noopener,noreferrer');
  };
  const handleContact = () => {
    if (!requireAuth({ isAuthenticated, navigate, location })) return;
    setContactShown(true);
    incrementAdContact(id).catch(() => {});
  };

  // ── Loading ───────────────────────────────────────────────────
  if (loading) return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        <Sk h={16} w={120} mb={28} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }} className="gig-grid">
          <div>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, marginBottom: 16, border: '1px solid #F1F5F9' }}>
              <Sk h={12} w={100} mb={12} /><Sk h={26} w="70%" mb={12} />
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}><Sk h={52} w={120} r={10} /><Sk h={52} w={100} r={10} /></div>
              <Sk h={14} mb={8} /><Sk h={14} w="80%" />
            </div>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #F1F5F9' }}>
              <Sk h={18} w={180} mb={20} />{[1,2,3,4].map(i=><Sk key={i} h={14} mb={10} />)}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #F1F5F9' }}>
            <Sk h={32} w="60%" mb={8} /><Sk h={14} w="40%" mb={24} />
            <Sk h={46} mb={10} r={11} /><Sk h={46} mb={10} r={11} /><Sk h={52} r={11} />
          </div>
        </div>
      </div>
      <style>{`@keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}`}</style>
    </div>
  );

  if (notFound || !gig) return (
    <div style={{ paddingTop: 68, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', gap: 12 }}>
      <div style={{ fontSize: 52 }}>🕵️</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a202c', letterSpacing: '-.03em' }}>Gig not found</h2>
      <p style={{ color: '#64748B' }}>This listing may have been removed or expired.</p>
      <button onClick={() => navigate('/browse')} style={{ padding: '12px 24px', borderRadius: 12, background: '#16A34A', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>Browse Listings →</button>
    </div>
  );

  const accentColor  = catColors[gig.category] || '#16A34A';
  const avatarColor  = avatarColors[parseInt(id?.slice(-2) || '0', 16) % avatarColors.length];
  const isOwnGig     = user?.uid === (gig.uid || gig.userId);
  const postedDate   = gig.createdAt?.toDate ? gig.createdAt.toDate().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const posterPhoto  = hirerProfile?.photoURL || hirerProfile?.googlePhotoURL || gig.posterPhoto || null;
  const tags = Array.isArray(gig.tags) ? gig.tags : (gig.tags || gig.skills || '').split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 80px' }}>

        <button onClick={() => navigate('/browse')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#64748B', background: 'none', border: 'none', fontSize: 14, marginBottom: 22, cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={15} /> Back to Browse
        </button>

        <div className="gig-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* ── MAIN ── */}
          <div>
            {/* Header */}
            <div style={{ background: 'white', borderRadius: 20, padding: '24px', marginBottom: 14, border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                  {gig.category && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, background: `${accentColor}15`, padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {gig.category}
                    </span>
                  )}
                  {gig.urgent && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '4px 12px', borderRadius: 20 }}>
                      <Zap size={11} fill="#DC2626" /> Urgent
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {postedDate && <><Clock size={11} />{postedDate}</>}
                  {gig.views ? <><Eye size={11} style={{ marginLeft: 6 }} />{gig.views} views</> : null}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, color: '#1a202c', marginBottom: 18, lineHeight: 1.25, letterSpacing: '-0.03em' }}>
                {gig.title}
              </h1>

              {/* Meta pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: tags.length ? 16 : 0 }}>
                <MetaPill icon={<DollarSign size={12} color="#16A34A" />} label="Budget" value={gig.budget || gig.rate || 'Negotiable'} />
                {(gig.budgetType || gig.type) && <MetaPill icon={<Briefcase size={12} color="#6366F1" />} label="Type" value={gig.budgetType || gig.type} />}
                {gig.deadline && <MetaPill icon={<Calendar size={12} color="#F59E0B" />} label="Deadline" value={gig.deadline} />}
                {gig.location && <MetaPill icon={<MapPin size={12} color="#EC4899" />} label="Location" value={gig.location} />}
                {gig.proposals != null && <MetaPill icon={<Users size={12} color="#06B6D4" />} label="Proposals" value={`${gig.proposals}`} />}
              </div>

              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tags.map(t => <span key={t} style={{ fontSize: 12, background: '#F1F5F9', color: '#475569', padding: '5px 12px', borderRadius: 20, fontWeight: 600 }}>{t}</span>)}
                </div>
              )}

              {/* Mobile action strip */}
              {!isOwnGig && (
                <div className="gig-mobile-actions" style={{ display: 'none', gap: 8, paddingTop: 18, marginTop: 18, borderTop: '1px solid #F8FAFC' }}>
                  <button onClick={handleMessage}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 8px', borderRadius: 11, border: '1.5px solid #16A34A', background: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    <MessageSquare size={13} /> Pitch
                  </button>
                  {gig.whatsapp !== false && (
                    <button onClick={handleWhatsApp}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 8px', borderRadius: 11, border: 'none', background: '#25D366', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      <MessageSquare size={13} /> WhatsApp
                    </button>
                  )}
                  <button onClick={() => setShowApply(v => !v)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 8px', borderRadius: 11, border: 'none', background: '#1a202c', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    <Send size={13} /> Apply
                  </button>
                </div>
              )}
            </div>

            {/* Mobile apply form */}
            {showApply && !submitted && (
              <div className="gig-mobile-apply" style={{ display: 'none', background: 'white', borderRadius: 20, padding: '22px', marginBottom: 14, border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a202c' }}>Your Proposal</h3>
                  <button onClick={() => setShowApply(false)} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><X size={14} /></button>
                </div>
                <ApplyForm bid={bid} setBid={setBid} cover={cover} setCover={setCover} submitting={submitting} onSubmit={handleApply} />
              </div>
            )}

            {/* Description */}
            <div style={{ background: 'white', borderRadius: 20, padding: '22px 24px', marginBottom: 14, border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a202c', letterSpacing: '-0.02em', marginBottom: 18 }}>Project Description</h2>
              <div style={{ color: '#374151', fontSize: 15, lineHeight: 1.85 }}>
                {(gig.description || 'No description provided.').split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**'))
                    return <h4 key={i} style={{ fontWeight: 800, color: '#1a202c', marginTop: 20, marginBottom: 8, fontSize: 15 }}>{line.replace(/\*\*/g, '')}</h4>;
                  if (line.startsWith('- '))
                    return <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}><span style={{ color: accentColor, marginTop: 3, flexShrink: 0 }}>•</span><span>{line.slice(2)}</span></div>;
                  return line ? <p key={i} style={{ marginBottom: 10 }}>{line}</p> : <br key={i} />;
                })}
              </div>
            </div>

            {/* Requirements */}
            {gig.requirements?.length > 0 && (
              <div style={{ background: 'white', borderRadius: 20, padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a202c', letterSpacing: '-0.02em', marginBottom: 18 }}>Requirements</h2>
                {gig.requirements.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <CheckCircle size={13} color="#16A34A" />
                    </div>
                    <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {submitted ? (
              <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', border: '2px solid #16A34A', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={28} color="#16A34A" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a202c', letterSpacing: '-.03em', marginBottom: 8 }}>Proposal Sent!</h3>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>The client will review your proposal and respond within 24 hours.</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 20, padding: '22px', border: '1px solid #F1F5F9', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>

                {/* Poster */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #F8FAFC' }}>
                  <Avatar src={posterPhoto} name={gig.posterName} color={avatarColor} size={46} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: '#1a202c', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gig.posterName || 'Anonymous'}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {hirerProfile?.companyName
                        ? <><Briefcase size={10} />{hirerProfile.companyName}</>
                        : <><User size={10} />Individual Hirer</>
                      }
                    </p>
                    {(hirerProfile?.location || gig.location) && (
                      <p style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <MapPin size={10} />{hirerProfile?.location || gig.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Budget */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#1a202c', letterSpacing: '-.04em', lineHeight: 1 }}>
                    {gig.budget || gig.rate || 'Negotiable'}
                  </p>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                    {gig.budgetType || gig.type ? `${gig.budgetType || gig.type}` : ''}
                    {gig.proposals != null ? ` · ${gig.proposals} proposals` : ''}
                  </p>
                </div>

                {!isOwnGig && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={handleMessage}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 11, border: '1.5px solid #16A34A', background: '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .15s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#DCFCE7'}
                      onMouseOut={e => e.currentTarget.style.background = '#F0FDF4'}>
                      <MessageSquare size={15} /> Pitch to Hirer
                    </button>

                    {gig.whatsapp !== false && (
                      <button onClick={handleWhatsApp}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 11, border: 'none', background: '#25D366', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'opacity .15s' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '.88'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                        <MessageSquare size={15} /> WhatsApp
                      </button>
                    )}

                    {!showApply ? (
                      <>
                        <button onClick={() => setShowApply(true)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 11, border: 'none', background: '#1a202c', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .15s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#2D3748'}
                          onMouseOut={e => e.currentTarget.style.background = '#1a202c'}>
                          Submit Proposal <Send size={15} />
                        </button>

                        {gig.phone && (
                          !contactShown ? (
                            <button onClick={handleContact}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 11, border: '1.5px solid #E2E8F0', background: 'white', color: '#475569', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .15s' }}
                              onMouseOver={e => { e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.color = '#15803D'; }}
                              onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}>
                              <Phone size={14} /> Show Contact
                            </button>
                          ) : (
                            <div style={{ background: '#F0FDF4', borderRadius: 11, padding: '12px 14px', border: '1px solid #BBF7D0' }}>
                              <p style={{ fontSize: 11, color: '#64748B', marginBottom: 8, textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                Contact {gig.posterName?.split(' ')[0] || 'them'} directly
                              </p>
                              <a href={`tel:${gig.phone}`}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 9, background: '#1a202c', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                                <Phone size={14} /> {gig.phone}
                              </a>
                            </div>
                          )
                        )}
                      </>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <p style={{ fontSize: 14, fontWeight: 800, color: '#1a202c' }}>Your Proposal</p>
                          <button onClick={() => setShowApply(false)} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><X size={13} /></button>
                        </div>
                        <ApplyForm bid={bid} setBid={setBid} cover={cover} setCover={setCover} submitting={submitting} onSubmit={handleApply} />
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                  <Shield size={14} color="#16A34A" />
                  <span style={{ fontSize: 12, color: '#64748B' }}>Payment protected by GigsKenya Escrow</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
        @media (max-width: 820px) {
          .gig-grid { grid-template-columns: 1fr !important; }
          .gig-grid > div:last-child { display: none !important; }
          .gig-mobile-actions { display: flex !important; }
          .gig-mobile-apply { display: block !important; }
        }
      `}</style>
    </div>
  );
}

// ── Apply Form ────────────────────────────────────────────────
function ApplyForm({ bid, setBid, cover, setCover, submitting, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Your Bid (KES)</label>
      <input required type="number" placeholder="e.g. 15,000" value={bid} onChange={e => setBid(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 15, marginBottom: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
        onFocus={e => e.target.style.borderColor = '#16A34A'}
        onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Cover Letter</label>
      <textarea required rows={4} placeholder="Why are you the best fit for this?" value={cover} onChange={e => setCover(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, resize: 'vertical', lineHeight: 1.7, marginBottom: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = '#16A34A'}
        onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
      <button type="submit" disabled={submitting}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 11, border: 'none', background: '#1a202c', color: 'white', fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .8 : 1, transition: 'opacity .15s' }}>
        {submitting ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }} /> Submitting…</> : <>Submit Proposal 🚀</>}
      </button>
    </form>
  );
}