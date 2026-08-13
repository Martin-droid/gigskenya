// Serverless proxy for the Arbeitnow Job Board API.
//
// The browser can't call arbeitnow.com directly: their API doesn't send an
// Access-Control-Allow-Origin header, so any cross-origin fetch from a real
// browser gets blocked by CORS — even though a server-side request works
// fine (CORS is only enforced by browsers, not servers). Routing through
// this endpoint (same origin as the frontend) sidesteps that entirely.
//
// It also lets us cache responses at Vercel's edge, which helps with
// Arbeitnow's "please do not abuse" API guidance — repeat visits and
// concurrent users hit our cache instead of hammering their free API.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const page = parseInt(req.query.page, 10) || 1;

  try {
    const upstream = await fetch(`https://arbeitnow.com/api/job-board-api?page=${page}`, {
      headers: { Accept: 'application/json' },
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: `Arbeitnow responded with ${upstream.status}` });
    }

    const data = await upstream.json();

    // Cache at the edge for 15 min, serve stale for another 5 while revalidating.
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach Arbeitnow' });
  }
}
