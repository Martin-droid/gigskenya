import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Globe2, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import ExternalJobCard from '../components/ExternalJobCard';
import { fetchArbeitnowPage, filterJobs } from '../lib/arbeitnow';

/* Required by Arbeitnow's Terms of Service (§11, API): "You also agree to
   providing a link back to Arbeitnow.com on your platform." This banner is
   that link-back and should not be removed if this integration stays live. */
function ArbeitnowAttribution() {
  return (
    <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 28 }}>
      International & remote listings powered by{' '}
      <a href="https://arbeitnow.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-600)', fontWeight: 600, textDecoration: 'underline' }}>
        Arbeitnow.com
      </a>. Applications are handled entirely on their site — GigsKenya doesn't collect or store your application data for these listings.
    </p>
  );
}

export default function ExternalJobs() {
  const [rawJobs, setRawJobs]     = useState([]);
  const [page, setPage]           = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]         = useState(null);

  const [draftQ, setDraftQ]       = useState('');
  const [q, setQ]                 = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const loadPage = useCallback(async (pageNum, { append } = {}) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const { jobs, hasNextPage: next } = await fetchArbeitnowPage(pageNum);
      setRawJobs(prev => (append ? [...prev, ...jobs] : jobs));
      setHasNextPage(next);
      setPage(pageNum);
    } catch (e) {
      setError('Could not load jobs from Arbeitnow right now. Please try again in a moment.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadPage(1); }, [loadPage]);

  const filtered = useMemo(
    () => filterJobs(rawJobs, { search: q, remoteOnly }),
    [rawJobs, q, remoteOnly]
  );

  const submitSearch = (e) => { e.preventDefault(); setQ(draftQ); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: 64 }}>
      <SEO
        title="International & Remote Jobs"
        description="Browse remote and international job openings from Arbeitnow, alongside local gigs on GigsKenya."
        canonical="/international-jobs"
      />

      {/* Hero */}
      <div style={{ background: 'var(--ink)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#93C5FD', background: 'rgba(37,99,235,.15)', padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>
            <Globe2 size={11} /> Powered by Arbeitnow
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-.03em', marginBottom: 8 }}>
            International &amp; Remote Jobs
          </h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.65)', maxWidth: 620, lineHeight: 1.6, marginBottom: 24 }}>
            These listings come live from Arbeitnow, a job board mostly covering Germany and Europe.
            Locations won't be Kenya-specific — filter by <strong style={{ color: 'white' }}>Remote</strong> for roles
            you can do from anywhere. Applications happen on Arbeitnow's site, not on GigsKenya.
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
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', fontSize: 13, fontWeight: 600, padding: '0 4px' }}>
              <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} />
              Remote only
            </label>
          </form>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px 64px' }}>
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
            <button className="btn-secondary" onClick={() => loadPage(1)}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 6 }}>No matching jobs on this page.</p>
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>Try clearing filters, or load more results below.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
              {filtered.length.toLocaleString()} result{filtered.length !== 1 ? 's' : ''} loaded
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filtered.map(job => <ExternalJobCard key={job.slug} job={job} />)}
            </div>
          </>
        )}

        {!loading && !error && hasNextPage && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button className="btn-secondary" disabled={loadingMore} onClick={() => loadPage(page + 1, { append: true })}>
              {loadingMore ? 'Loading…' : 'Load more jobs'}
            </button>
          </div>
        )}

        <ArbeitnowAttribution />

        <p style={{ fontSize: 11.5, color: '#C4C4C4', textAlign: 'center', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <ExternalLink size={11} /> All listings and applications are the responsibility of the posting employer and Arbeitnow.com.
        </p>
      </div>
    </div>
  );
}
