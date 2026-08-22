// Serverless proxy for Himalayas' Remote Jobs API (search endpoint).
//
// Himalayas' own docs say they don't send Access-Control-Allow-Origin, so a
// direct browser fetch is blocked by CORS — same situation as Arbeitnow.
// Routing through here also lets us cache at Vercel's edge so repeat
// visits don't re-hit Himalayas on every page load.
//
// We call the *search* endpoint with worldwide=true so "open to candidates
// anywhere" comes from Himalayas' own structured locationRestrictions data,
// not a text heuristic — see lib/jobFilters.js for why that's better than
// what we have to do for Arbeitnow/TheirStack.
//
// Pagination note (verified by hand against the live API, not just the
// docs): the documented `page` param returns an empty body here, and
// `limit` appears to be ignored on this endpoint (always ~20/page).
// `offset` + the response's `totalCount` is what actually works, and
// matches the browse endpoint's pagination style — so that's what we use.

const CACHE_SECONDS = parseInt(process.env.HIMALAYAS_CACHE_SECONDS, 10) || 60 * 30; // 30 min

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    const upstream = await fetch(
      `https://himalayas.app/jobs/api/search?worldwide=true&offset=${offset}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!upstream.ok) {
      return res.status(502).json({ error: `Himalayas responded with ${upstream.status}` });
    }

    const json = await upstream.json();
    const jobs = Array.isArray(json.jobs) ? json.jobs : [];
    const totalCount = typeof json.totalCount === 'number' ? json.totalCount : offset + jobs.length;

    res.setHeader('Cache-Control', `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`);
    return res.status(200).json({
      jobs,
      hasNextPage: offset + jobs.length < totalCount,
    });
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach Himalayas' });
  }
}
