// Serverless proxy for TheirStack's Job Search API.
//
// Two reasons the browser can't call TheirStack directly:
//   1. It needs a secret Bearer token (THEIRSTACK_API_KEY) that must never
//      ship to client-side code.
//   2. TheirStack bills 1 API credit per job RETURNED. On the free tier
//      that's a fixed, non-renewing pool (200 credits at signup) — if every
//      visitor triggered their own search, credits would be gone in
//      minutes. Routing through here lets us cache the response at
//      Vercel's edge for a long window, so the whole site shares a small,
//      predictable number of real upstream calls per day regardless of
//      traffic.
//
// Set THEIRSTACK_API_KEY in Vercel → Project → Settings → Environment
// Variables (and in a local, gitignored .env for `vercel dev`). See
// .env.example. Never commit the real key to the repo.

// Credits spent per cache refresh ≈ JOB_LIMIT (1 credit/job returned).
// Defaults: ~20 credits every 24h ≈ 10 days of runway on the free 200-credit
// balance. Tune via env vars if you buy more credits or want fresher data.
const JOB_LIMIT = parseInt(process.env.THEIRSTACK_JOB_LIMIT, 10) || 20;
const CACHE_SECONDS = parseInt(process.env.THEIRSTACK_CACHE_SECONDS, 10) || 60 * 60 * 24; // 24h

// TheirStack's raw response also carries enriched personal data about
// hiring managers (names, LinkedIn profiles, photos) meant for sales
// prospecting, plus a lot of company-intelligence fields we don't need.
// We only forward what the public job listing actually needs — never the
// people-search / hiring_team data.
function pruneJob(job) {
  return {
    id: job.id,
    job_title: job.job_title,
    company: job.company,
    location: job.location,
    short_location: job.short_location,
    remote: job.remote,
    hybrid: job.hybrid,
    url: job.url,
    final_url: job.final_url,
    source_url: job.source_url,
    technology_slugs: job.technology_slugs,
    employment_statuses: job.employment_statuses,
    date_posted: job.date_posted,
    description: job.description,
    salary_string: job.salary_string,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.THEIRSTACK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'THEIRSTACK_API_KEY is not configured' });
  }

  try {
    const upstream = await fetch('https://api.theirstack.com/v1/jobs/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // At least one of these date/company filters is required by the API.
        posted_at_max_age_days: 21,
        // Only fetch remote roles — this is also what keeps credit spend
        // down, since non-remote jobs would never pass our "open to global
        // candidates" filter anyway (see lib/jobFilters.js).
        workplace_types_or: ['remote'],
        limit: JOB_LIMIT,
        page: 0,
      }),
    });

    if (upstream.status === 402) {
      // Out of credits — not an error worth logging loudly, just tell the client.
      return res.status(402).json({ error: 'Out of TheirStack API credits' });
    }
    if (!upstream.ok) {
      return res.status(502).json({ error: `TheirStack responded with ${upstream.status}` });
    }

    const json = await upstream.json();
    const data = Array.isArray(json.data) ? json.data.map(pruneJob) : [];

    res.setHeader('Cache-Control', `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`);
    return res.status(200).json({ data });
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach TheirStack' });
  }
}
