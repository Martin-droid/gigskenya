// Client for Himalayas' Remote Jobs API, via our own /api/himalayas proxy
// (see api/himalayas.js for why: no CORS header on their side, plus we
// cache at the edge to be a considerate free-tier citizen).

import { stripHtml } from './arbeitnow';

const PROXY_URL = '/api/himalayas';

export async function fetchHimalayasPage(offset = 0) {
  const res = await fetch(`${PROXY_URL}?offset=${offset}`);
  if (!res.ok) {
    throw new Error(`Himalayas proxy error (${res.status})`);
  }
  const json = await res.json();
  return {
    jobs: Array.isArray(json.jobs) ? json.jobs : [],
    hasNextPage: !!json.hasNextPage,
  };
}

/** Maps a raw Himalayas job into the shared normalized job shape (see
 * normalizeArbeitnowJob in lib/arbeitnow.js, normalizeTheirStackJob in
 * lib/theirstack.js). We only ever fetch with worldwide=true upstream, so
 * `worldwideConfirmed` lets lib/jobFilters.js skip its text heuristic here
 * — Himalayas already tells us via structured data (empty
 * locationRestrictions) that a job is open to anyone. */
export function normalizeHimalayasJob(raw) {
  const categories = Array.isArray(raw.parentCategories) && raw.parentCategories.length
    ? raw.parentCategories
    : (Array.isArray(raw.categories) ? raw.categories : []);

  return {
    id: `himalayas-${raw.guid || raw.applicationLink}`,
    source: 'himalayas',
    sourceLabel: 'Himalayas',
    title: raw.title || 'Untitled role',
    company: raw.companyName || 'Unknown company',
    location: Array.isArray(raw.locationRestrictions) && raw.locationRestrictions.length
      ? raw.locationRestrictions.join(', ')
      : 'Worldwide',
    remote: true, // every Himalayas listing is a remote job by definition of the board
    url: raw.applicationLink || raw.guid || '#',
    tags: [raw.employmentType, ...categories].filter(Boolean).slice(0, 5),
    postedAt: raw.pubDate || null,
    descriptionText: stripHtml(raw.description) || raw.excerpt || '',
    worldwideConfirmed: true,
  };
}
