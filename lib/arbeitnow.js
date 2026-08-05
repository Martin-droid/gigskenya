// Thin client for the free Arbeitnow Job Board API.
// Docs: https://www.arbeitnow.com/api/job-board-api
// No API key required, CORS is open (access-control-allow-origin: *), so this
// is called directly from the browser. Data refreshes hourly on Arbeitnow's side.
//
// Per Arbeitnow's Terms of Service (section 11, "API"):
//   - the API is provided "as is", with no uptime/accuracy guarantee
//   - they can revoke API access at any time
//   - "You also agree to providing a link back to Arbeitnow.com on your platform"
// The link-back lives in <ArbeitnowAttribution /> — see pages/ExternalJobs.jsx.
// Every job also links out to its original arbeitnow.com listing so Arbeitnow
// (and the employer) get the traffic/attribution, and so we never have to be
// the system of record for a posting we don't own.

const BASE_URL = 'https://arbeitnow.com/api/job-board-api';

// Arbeitnow explicitly asks integrators not to hammer the free API
// ("please do not abuse"). We cache each page in memory for a while so
// re-renders, tab switches, etc. don't trigger a fresh request every time.
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const pageCache = new Map();

async function fetchPage(page) {
  const cacheKey = String(page);
  const cached = pageCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await fetch(`${BASE_URL}?page=${page}`);
  if (!res.ok) {
    throw new Error(`Arbeitnow API error (${res.status})`);
  }
  const json = await res.json();
  pageCache.set(cacheKey, { data: json, at: Date.now() });
  return json;
}

/**
 * Fetches one raw page (up to 100 jobs) from Arbeitnow, unfiltered.
 * The public API only supports `?page=` — no server-side search/remote
 * param — so callers accumulate pages and filter client-side (see
 * `filterJobs` below) across everything loaded so far.
 *
 * @param {number} page - 1-indexed page number
 * @returns {Promise<{ jobs: object[], hasNextPage: boolean }>}
 */
export async function fetchArbeitnowPage(page = 1) {
  const json = await fetchPage(page);
  return {
    jobs: Array.isArray(json.data) ? json.data : [],
    hasNextPage: Boolean(json.links?.next),
  };
}

/** Client-side filter over an already-fetched list of jobs. */
export function filterJobs(jobs, { search = '', remoteOnly = false } = {}) {
  let result = jobs;
  if (remoteOnly) {
    result = result.filter((j) => j.remote);
  }
  const q = search.trim().toLowerCase();
  if (q) {
    result = result.filter((j) =>
      j.title?.toLowerCase().includes(q) ||
      j.company_name?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      (j.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }
  return result;
}

/** Strips HTML tags from Arbeitnow's `description` field for safe plain-text
 * previews — we never render their raw HTML with dangerouslySetInnerHTML
 * since it's third-party content we don't control. */
export function stripHtml(html) {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

/** Human-friendly "posted X ago" from Arbeitnow's unix `created_at`. */
export function formatPostedDate(unixSeconds) {
  if (!unixSeconds) return '';
  const diffDays = Math.floor((Date.now() / 1000 - unixSeconds) / 86400);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
