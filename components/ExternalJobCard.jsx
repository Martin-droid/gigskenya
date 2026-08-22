import { useState } from 'react';
import { MapPin, Globe2, ExternalLink, Building2 } from 'lucide-react';
import { formatPostedDate } from '../lib/arbeitnow';

// Accent per source so the two feeds stay visually distinguishable while
// sharing the same card layout.
const SOURCE_STYLE = {
  arbeitnow:  { accent: '#2563EB' },
  theirstack: { accent: '#7C3AED' },
  himalayas:  { accent: '#0D9488' },
};

// Expects a normalized job — see normalizeArbeitnowJob (lib/arbeitnow.js)
// and normalizeTheirStackJob (lib/theirstack.js).
export default function ExternalJobCard({ job }) {
  const [hovered, setHovered] = useState(false);
  const { accent } = SOURCE_STYLE[job.source] || SOURCE_STYLE.arbeitnow;
  const snippet = (job.descriptionText || '').slice(0, 140);
  const chips = (job.tags || []).slice(0, 3);

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 16,
        border: `1.5px solid ${hovered ? accent + '55' : '#E8ECF0'}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all .2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered
          ? `0 16px 40px ${accent}1e, 0 4px 12px rgba(0,0,0,.07)`
          : '0 1px 4px rgba(0,0,0,.04)',
      }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)`, flexShrink: 0 }} />

      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, letterSpacing: '.05em', background: `${accent}14`, color: accent, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Globe2 size={9} /> {job.sourceLabel}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, letterSpacing: '.05em', background: 'var(--green-light)', color: 'var(--green-dark)' }}>
            Remote · Worldwide
          </span>
          <span style={{ flex: 1 }} />
          {job.postedAt && (
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{formatPostedDate(job.postedAt)}</span>
          )}
        </div>

        <h3 style={{
          fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1.35, letterSpacing: '-.02em',
          marginBottom: 6, fontFamily: 'var(--font-display)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {job.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10, fontSize: 12.5, color: '#6B7280', fontWeight: 600 }}>
          <Building2 size={12} strokeWidth={2.5} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}</span>
          {job.location && (
            <>
              <span style={{ color: '#D1D5DB' }}>·</span>
              <MapPin size={12} strokeWidth={2.5} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</span>
            </>
          )}
        </div>

        {snippet && (
          <p style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.65, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {snippet}{(job.descriptionText || '').length > 140 ? '…' : ''}
          </p>
        )}

        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {chips.map((t, i) => (
              <span key={t + i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#F3F4F6', color: '#374151', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, paddingTop: 12, borderTop: '1px solid #F0F2F5', fontSize: 12, fontWeight: 700, color: accent }}>
          Apply on {job.sourceLabel} <ExternalLink size={13} strokeWidth={2.5} />
        </div>
      </div>
    </a>
  );
}
