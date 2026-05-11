/**
 * IntentBanner.jsx
 * ----------------
 * A warm, contextual banner shown at the top of the talent / hirer profile
 * setup form when the user arrived there mid-flow (e.g. they clicked
 * "Pitch to Hirer" and were redirected to login → now need a profile).
 *
 * Props:
 *   type     'pitch' | 'register' | null
 *   label    string  — hirer name for pitch, or null
 *   step     number  — current step index (0-based)
 *   total    number  — total steps
 */

import { MessageSquare, UserCheck, ArrowRight, Clock } from 'lucide-react';

const STEP_LABELS = ['About you', 'What you do', 'Contact'];

export default function IntentBanner({ type, label, step, total }) {
  if (!type) return null;

  const isPitch    = type === 'pitch';
  const remaining  = total - step;         // steps left including current
  const estSeconds = remaining * 35;       // ~35s per step is realistic
  const estLabel   = estSeconds < 60 ? `${estSeconds}s` : '~1 min';

  // ── Copy variants ────────────────────────────────────────
  const heading = isPitch
    ? `Quick setup — then we'll take you to pitch ${label ? label.split(' ')[0] : 'the hirer'}`
    : 'Quick setup — then you\'re in';

  const subline = isPitch
    ? `Your pitch to ${label ? label.split(' ')[0] : 'the hirer'} is waiting. We just need a quick profile first so they know who's pitching. This takes about ${estLabel}.`
    : `Creating your talent profile lets hirers find and contact you directly. Takes about ${estLabel} to complete.`;

  const Icon = isPitch ? MessageSquare : UserCheck;
  const accentColor = isPitch ? '#D97706' : '#16A34A';
  const accentBg    = isPitch ? '#FFFBEB' : '#F0FDF4';
  const accentBorder = isPitch ? '#FDE68A' : '#BBF7D0';
  const accentText  = isPitch ? '#92400E' : '#14532D';
  const accentSub   = isPitch ? '#B45309' : '#166534';

  return (
    <div style={{
      background: accentBg,
      border: `1.5px solid ${accentBorder}`,
      borderRadius: 14,
      padding: '14px 16px',
      marginBottom: 22,
      animation: 'intentBannerIn .3s cubic-bezier(.4,0,.2,1)',
    }}>
      <style>{`
        @keyframes intentBannerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top row: icon + heading + time estimate */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={accentColor} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight: 800, fontSize: 14,
            color: accentText,
            letterSpacing: '-.01em',
            lineHeight: 1.3,
            marginBottom: 4,
          }}>
            {heading}
          </p>
          <p style={{ fontSize: 12.5, color: accentSub, lineHeight: 1.6 }}>
            {subline}
          </p>
        </div>

        {/* Time pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: `${accentColor}15`,
          border: `1px solid ${accentColor}25`,
          borderRadius: 999,
          padding: '4px 10px',
          flexShrink: 0,
        }}>
          <Clock size={11} color={accentColor} />
          <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, whiteSpace: 'nowrap' }}>
            {estLabel} left
          </span>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        paddingTop: 10,
        borderTop: `1px solid ${accentBorder}`,
      }}>
        {Array.from({ length: total }).map((_, i) => {
          const done   = i < step;
          const active = i === step;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: active || done ? 1 : 'none' }}>
              <div style={{
                width: active ? 8 : 8, height: 8,
                borderRadius: '50%',
                background: done ? accentColor : active ? accentColor : `${accentColor}30`,
                flexShrink: 0,
                transition: 'background .2s',
              }} />
              {(active || done) && (
                <span style={{
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  color: active ? accentText : `${accentText}88`,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {active ? STEP_LABELS[i] || `Step ${i + 1}` : '✓'}
                </span>
              )}
            </div>
          );
        })}

        {/* Destination hint */}
        {isPitch && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: accentSub, opacity: .7 }}>then</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${accentColor}12`, padding: '3px 9px', borderRadius: 999 }}>
              <MessageSquare size={10} color={accentColor} />
              <span style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>Your Pitch</span>
            </div>
            <ArrowRight size={11} color={accentColor} style={{ opacity: .6 }} />
          </div>
        )}
      </div>
    </div>
  );
}