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

export const AVATAR_COLORS = ['#4F46E5', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

export function avatarColor(id = '') {
  return AVATAR_COLORS[hashIndex(id, AVATAR_COLORS.length)];
}
