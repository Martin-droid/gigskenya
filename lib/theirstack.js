// Client for TheirStack's Job Search API, via our own /api/theirstack proxy
// (see api/theirstack.js for why we don't call TheirStack directly — secret
// key + per-job credit cost).
//
// Deliberately no "load more" here: every extra job pulled from TheirStack
// spends another credit, and the free tier's 200 credits don't renew. We
// fetch the one cached batch the proxy serves and cache it again in memory
// for the tab's session so switching pages/filters doesn't refetch.

const PROXY_URL = '/api/theirstack';
const CLIENT_CACHE_MS = 60 * 60 * 1000; // 1h in-tab cache, on top of the server/edge cache

let cache = null; // { jobs, at }

export async function fetchTheirStackJobs() {
  if (cache && Date.now() - cache.at < CLIENT_CACHE_MS) {
    return cache.jobs;
  }

  const res = await fetch(PROXY_URL);
  if (res.status === 402) {
    throw new Error('OUT_OF_CREDITS');
  }
  if (!res.ok) {
    throw new Error(`TheirStack proxy error (${res.status})`);
  }

  const json = await res.json();
  const jobs = Array.isArray(json.data) ? json.data.map(normalizeTheirStackJob) : [];
  cache = { jobs, at: Date.now() };
  return jobs;
}

/** Maps a (pruned) TheirStack job into the shared normalized job shape used
 * across both integrations — see normalizeArbeitnowJob in lib/arbeitnow.js. */
export function normalizeTheirStackJob(raw) {
  return {
    id: `theirstack-${raw.id}`,
    source: 'theirstack',
    sourceLabel: 'TheirStack',
    title: raw.job_title || 'Untitled role',
    company: raw.company || 'Unknown company',
    location: raw.short_location || raw.location || (raw.remote ? 'Remote' : ''),
    remote: !!raw.remote,
    url: raw.final_url || raw.url || raw.source_url || '#',
    tags: Array.isArray(raw.technology_slugs) ? raw.technology_slugs.slice(0, 5) : [],
    postedAt: raw.date_posted ? Math.floor(new Date(raw.date_posted).getTime() / 1000) : null,
    descriptionText: raw.description || '',
  };
}
