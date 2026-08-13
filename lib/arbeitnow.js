// Thin client for the free Arbeitnow Job Board API.
// Docs: https://www.arbeitnow.com/api/job-board-api
// No API key required. Data refreshes hourly on Arbeitnow's side.
//
// We call our own /api/arbeitnow serverless proxy (see /api/arbeitnow.js)
// rather than arbeitnow.com directly — their API doesn't send an
// Access-Control-Allow-Origin header, so a direct browser fetch gets
// blocked by CORS. The proxy also caches responses at Vercel's edge.
//
// Per Arbeitnow's Terms of Service (section 11, "API"):
//   - the API is provided "as is", with no uptime/accuracy guarantee
//   - they can revoke API access at any time
//   - "You also agree to providing a link back to Arbeitnow.com on your platform"
// The link-back lives in <ArbeitnowAttribution /> — see pages/ExternalJobs.jsx.
// Every job also links out to its original arbeitnow.com listing so Arbeitnow
// (and the employer) get the traffic/attribution, and so we never have to be
// the system of record for a posting we don't own.

const BASE_URL = '/api/arbeitnow';

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
      (Array.isArray(j.tags) ? j.tags : []).some((t) => String(t).toLowerCase().includes(q))
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

/** Maps a raw Arbeitnow job into the shared normalized job shape used
 * across both integrations — see normalizeTheirStackJob in lib/theirstack.js. */
export function normalizeArbeitnowJob(raw) {
  const jobTypes = Array.isArray(raw.job_types) ? raw.job_types : [];
  const tags = Array.isArray(raw.tags) ? raw.tags : [];
  return {
    id: `arbeitnow-${raw.slug}`,
    source: 'arbeitnow',
    sourceLabel: 'Arbeitnow',
    title: raw.title,
    company: raw.company_name,
    location: raw.location || (raw.remote ? 'Remote' : ''),
    remote: !!raw.remote,
    url: raw.url,
    tags: [...jobTypes, ...tags].slice(0, 5),
    postedAt: raw.created_at || null,
    descriptionText: stripHtml(raw.description),
  };
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
