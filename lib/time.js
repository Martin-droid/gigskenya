export function timeAgo(ts) {
  const ms = ts?.toMillis?.() ?? (ts ? new Date(ts).getTime() : NaN);
  if (isNaN(ms)) return '';
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 1) return 'Just posted';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return `${Math.floor(day / 30)}mo ago`;
}
