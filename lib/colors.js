// Deterministic index from a doc id, for picking a per-listing accent
// color out of any palette. Firestore auto-ids use a much wider alphabet
// than hex, so parsing the tail as a hex number (the old approach in
// each page) returns NaN for most real ids — this hashes the whole
// string instead, so it works for any character set.
export function hashIndex(id = '', length) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % length;
}

// On-brand palette — greens, dark ink tones, and one gold — built from
// the site's own CSS vars (--green, --green-dark, --ink, --gold) plus a
// few adjacent shades for variety, no unrelated hues (pink/purple/etc).
export const AVATAR_COLORS = ['#00A550', '#007A3D', '#0D9488', '#0F766E', '#166534', '#065F46', '#1A1F2E', '#134E4A', '#C9860A'];

export function avatarColor(id = '') {
  return AVATAR_COLORS[hashIndex(id, AVATAR_COLORS.length)];
}

// Two-tone accent gradients — echoes the dark hero sections (135deg,
// color -> ink) instead of a flat tint or a same-color fade.
export const darkGradient = (color) => `linear-gradient(135deg, ${color}, #1A1F2E)`;
export const GOLD_GRADIENT = 'linear-gradient(135deg, #C9860A, #E8A93A)';
export const DARK_TILE = 'linear-gradient(145deg, #1E293B, #334155)';
