import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Globe2, RefreshCw, AlertTriangle, ExternalLink, CreditCard } from 'lucide-react';
import SEO from '../components/SEO';
import ExternalJobCard from '../components/ExternalJobCard';
import { fetchArbeitnowPage, normalizeArbeitnowJob } from '../lib/arbeitnow';
import { fetchTheirStackJobs } from '../lib/theirstack';
import { fetchHimalayasPage, normalizeHimalayasJob } from '../lib/himalayas';
import { isOpenToGlobalCandidates } from '../lib/jobFilters';

/* Link-backs to all three data sources — required by Arbeitnow's (§11) and
   Himalayas' terms, and good practice for TheirStack too, since none of
   these are our content; we're just pointing candidates at the source. */
function SourceAttribution() {
  const links = [
    ['https://arbeitnow.com', 'Arbeitnow.com'],
    ['https://theirstack.com', 'TheirStack.com'],
    ['https://himalayas.app', 'Himalayas.app'],
  ];
  return (
    <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 28 }}>
      Listings powered by{' '}
      {links.map(([href, label], i) => (
        <span key={href}>
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-600)', fontWeight: 600, textDecoration: 'underline' }}>{label}</a>
          {i < links.length - 2 ? ', ' : i === links.length - 2 ? ' and ' : ''}
        </span>
      ))}
      . Applications are handled entirely on their sites — GigsKenya doesn't collect or store your application data for these listings.
    </p>
  );
}

export default function ExternalJobs() {
  // Arbeitnow: live-paginated, unlimited free calls.
  const [rawArbeitnow, setRawArbeitnow] = useState([]);
  const [arbeitnowPage, setArbeitnowPage] = useState(1);
  const [arbeitnowHasNext, setArbeitnowHasNext] = useState(false);

  // Himalayas: live-paginated via offset, unlimited free calls (soft rate limit only).
  const [rawHimalayas, setRawHimalayas] = useState([]);
  const [himalayasOffset, setHimalayasOffset] = useState(0);
  const [himalayasHasNext, setHimalayasHasNext] = useState(false);

  // TheirStack: one cached, credit-metered batch — no pagination by design.
  const [theirstackJobs, setTheirstackJobs] = useState([]);
  const [theirstackStatus, setTheirstackStatus] = useState('loading'); // loading | ok | credits | error

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [draftQ, setDraftQ] = useState('');
  const [q, setQ] = useState('');

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ab, hi] = await Promise.all([
        fetchArbeitnowPage(1),
        fetchHimalayasPage(0),
      ]);
      setRawArbeitnow(ab.jobs);
      setArbeitnowHasNext(ab.hasNextPage);
      setArbeitnowPage(1);
      setRawHimalayas(hi.jobs);
      setHimalayasHasNext(hi.hasNextPage);
      setHimalayasOffset(hi.jobs.length);
    } catch (e) {
      setError('Could not load jobs right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  useEffect(() => {
    fetchTheirStackJobs()
      .then(jobs => { setTheirstackJobs(jobs); setTheirstackStatus('ok'); })
      .catch(e => setTheirstackStatus(e.message === 'OUT_OF_CREDITS' ? 'credits' : 'error'));
  }, []);

  const hasNextPage = arbeitnowHasNext || himalayasHasNext;

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const tasks = [];
      if (arbeitnowHasNext) {
        tasks.push(
          fetchArbeitnowPage(arbeitnowPage + 1).then(ab => {
            setRawArbeitnow(prev => [...prev, ...ab.jobs]);
            setArbeitnowHasNext(ab.hasNextPage);
            setArbeitnowPage(p => p + 1);
          })
        );
      }
      if (himalayasHasNext) {
        tasks.push(
          fetchHimalayasPage(himalayasOffset).then(hi => {
            setRawHimalayas(prev => [...prev, ...hi.jobs]);
            setHimalayasHasNext(hi.hasNextPage);
            setHimalayasOffset(o => o + hi.jobs.length);
          })
        );
      }
      await Promise.all(tasks);
    } catch (e) {
      // Leave already-loaded results in place; just stop the spinner.
    } finally {
      setLoadingMore(false);
    }
  }, [arbeitnowHasNext, arbeitnowPage, himalayasHasNext, himalayasOffset]);

  // Merge all three sources into the shared normalized shape, then apply
  // the global-candidates filter (lib/jobFilters.js) — always on, not a
  // toggle, since a job that isn't open to remote candidates worldwide
  // isn't useful to most GigsKenya visitors anyway.
  const combined = useMemo(() => {
    const normalized = [
      ...rawArbeitnow.map(normalizeArbeitnowJob),
      ...rawHimalayas.map(normalizeHimalayasJob),
      ...theirstackJobs,
    ].filter(isOpenToGlobalCandidates);

    const query = q.trim().toLowerCase();
    const filtered = query
      ? normalized.filter(j =>
          j.title.toLowerCase().includes(query) ||
          j.company.toLowerCase().includes(query) ||
          (j.tags || []).some(t => t.toLowerCase().includes(query))
        )
      : normalized;

    return filtered.sort((a, b) => (b.postedAt || 0) - (a.postedAt || 0));
  }, [rawArbeitnow, rawHimalayas, theirstackJobs, q]);

  const submitSearch = (e) => { e.preventDefault(); setQ(draftQ); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: 64 }}>
      <SEO
        title="International & Remote Jobs"
        description="Browse remote jobs open to candidates worldwide, aggregated from Arbeitnow, TheirStack and Himalayas, alongside local gigs on GigsKenya."
        canonical="/international-jobs"
      />

      {/* Hero */}
      <div style={{ background: 'var(--ink)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#93C5FD', background: 'rgba(37,99,235,.15)', padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>
            <Globe2 size={11} /> Powered by Arbeitnow, TheirStack &amp; Himalayas
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-.03em', marginBottom: 8 }}>
            International &amp; Remote Jobs
          </h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.65)', maxWidth: 640, lineHeight: 1.6, marginBottom: 24 }}>
            Remote roles pulled from three job data sources, filtered down to ones that read as open to
            candidates <strong style={{ color: 'white' }}>anywhere in the world</strong> — not just a
            specific country or timezone. Himalayas jobs are confirmed worldwide-open by their own data;
            Arbeitnow and TheirStack listings are filtered by a best-effort text check, so always confirm
            eligibility on the original listing before applying. Applications happen on each source's own
            site, not on GigsKenya.
          </p>

          <form onSubmit={submitSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="input-wrap" style={{ flex: '1 1 280px' }}>
              <Search size={16} className="icon" />
              <input
                className="input"
                placeholder="Search title, company, tag…"
                value={draftQ}
                onChange={e => setDraftQ(e.target.value)}
                style={{ background: 'white' }}
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px 64px' }}>
        {theirstackStatus === 'credits' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', fontSize: 12.5, fontWeight: 600, padding: '10px 14px', borderRadius: 10, marginBottom: 18 }}>
            <CreditCard size={14} /> TheirStack listings are paused — out of free API credits. Arbeitnow and Himalayas listings below are unaffected.
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <AlertTriangle size={28} color="#D97706" style={{ marginBottom: 10 }} />
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 16 }}>{error}</p>
            <button className="btn-secondary" onClick={loadInitial}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : combined.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 6 }}>No matching jobs right now.</p>
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>Try clearing your search, or load more results below.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
              {combined.length.toLocaleString()} result{combined.length !== 1 ? 's' : ''} open to candidates worldwide
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {combined.map(job => <ExternalJobCard key={job.id} job={job} />)}
            </div>
          </>
        )}

        {!loading && !error && hasNextPage && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button className="btn-secondary" disabled={loadingMore} onClick={loadMore}>
              {loadingMore ? 'Loading…' : 'Load more jobs'}
            </button>
          </div>
        )}

        <SourceAttribution />

        <p style={{ fontSize: 11.5, color: '#C4C4C4', textAlign: 'center', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <ExternalLink size={11} /> All listings and applications are the responsibility of the posting employer and the linked source site.
        </p>
      </div>
    </div>
  );
}
