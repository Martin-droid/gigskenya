/**
 * injectGlobalStyles.js
 *
 * Call this once from any page (Home, Browse, Talent, etc.).
 * The id guard ensures the <style> tag is only appended once
 * regardless of how many components call it or in what order.
 *
 * Usage:
 *   import { injectGlobalStyles } from '../lib/injectGlobalStyles';
 *   useEffect(() => { injectGlobalStyles(); }, []);
 */

const GK_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  :root {
    --ink: #0A0A0A;
    --green: #00A550;
    --green-dark: #007A3A;
    --green-light: #E8F8EF;
    --green-mid: #00C060;
    --red: #CE1126;
    --gold: #D4A017;
    --gold-light: #FEF3C7;
    --cream: #F8F6F1;
    --grey-50: #FAFAFA;
    --grey-100: #F4F4F5;
    --grey-150: #EBEBEE;
    --grey-200: #E4E4E7;
    --grey-300: #D1D1D6;
    --grey-400: #A1A1AA;
    --grey-500: #71717A;
    --grey-600: #52525B;
    --r-xs: 6px;  --r-sm: 10px; --r-md: 14px; --r-lg: 18px;
    --r-xl: 22px; --r-2xl: 32px; --r-full: 9999px;
    --shadow-xs: 0 1px 3px rgba(0,0,0,.06);
    --shadow-sm: 0 2px 8px rgba(0,0,0,.08);
    --shadow-md: 0 8px 24px rgba(0,0,0,.10);
    --shadow-lg: 0 16px 48px rgba(0,0,0,.13);
    --font-display: 'Plus Jakarta Sans', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --ease: cubic-bezier(.4,0,.2,1);
  }

  *, *::before, *::after { box-sizing: border-box; }

  body {
    font-family: var(--font-body);
    color: var(--ink);
    margin: 0;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Buttons ───────────────────────────────────────────────── */
  .gk-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--green); color: white; border: none; cursor: pointer;
    font-family: var(--font-display); font-weight: 700;
    border-radius: var(--r-sm);
    transition: all .2s var(--ease);
    white-space: nowrap; text-decoration: none;
  }
  .gk-btn-primary:hover {
    background: var(--green-dark);
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0,165,80,.3);
  }
  .gk-btn-primary:active { transform: none; }

  .gk-btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: rgba(255,255,255,.75);
    border: 1.5px solid rgba(255,255,255,.2); cursor: pointer;
    font-family: var(--font-display); font-weight: 600;
    border-radius: var(--r-sm);
    transition: all .2s var(--ease);
  }
  .gk-btn-ghost:hover {
    color: white; border-color: white;
    background: rgba(255,255,255,.08);
  }

  /* ── Cards ─────────────────────────────────────────────────── */
  .gk-card {
    transition: transform .2s var(--ease), box-shadow .2s var(--ease);
  }
  .gk-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .gk-card-link {
    display: block; text-decoration: none; color: inherit;
    border-radius: var(--r-xl); overflow: hidden;
    border: 1.5px solid var(--grey-200);
    background: white;
    transition: transform .2s var(--ease), box-shadow .2s var(--ease), border-color .2s var(--ease);
    position: relative; cursor: pointer;
  }
  .gk-card-link:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: var(--grey-300);
  }
  .gk-card-link.boosted { border-color: var(--green); }
  .gk-card-link.boosted:hover {
    border-color: var(--green-dark);
    box-shadow: 0 8px 28px rgba(0,165,80,.18);
  }

  /* ── Skeleton loader ───────────────────────────────────────── */
  .gk-skeleton {
    background: linear-gradient(
      90deg,
      var(--grey-150) 25%,
      var(--grey-100) 50%,
      var(--grey-150) 75%
    );
    background-size: 200% 100%;
    border-radius: var(--r-sm);
    animation: gk-shimmer 1.5s infinite;
  }

  /* ── Tags ──────────────────────────────────────────────────── */
  .gk-tag {
    display: inline-flex; align-items: center;
    font-size: 10px; font-weight: 700;
    padding: 2px 9px; border-radius: var(--r-full);
    letter-spacing: .05em; text-transform: uppercase;
  }

  /* ── Pill (hero search suggestions) ───────────────────────── */
  .gk-pill {
    font-size: 12px; padding: 5px 13px;
    border-radius: var(--r-full);
    border: 1px solid rgba(255,255,255,.14);
    background: transparent;
    color: rgba(255,255,255,.58);
    cursor: pointer;
    transition: all .2s var(--ease);
    font-family: var(--font-body);
  }
  .gk-pill:hover {
    border-color: var(--green-mid);
    color: var(--green-mid);
    background: rgba(0,165,80,.08);
  }

  /* ── Animations ────────────────────────────────────────────── */
  @keyframes gk-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes gk-pulse {
    0%, 100% { opacity: 1;  transform: scale(1); }
    50%       { opacity: .5; transform: scale(.8); }
  }
  @keyframes gk-fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .gk-fade-up { animation: gk-fade-up .55s ease both; }
  .gk-d1 { animation-delay: .10s; }
  .gk-d2 { animation-delay: .22s; }
  .gk-d3 { animation-delay: .34s; }
  .gk-d4 { animation-delay: .46s; }

  /* ── Responsive grids ──────────────────────────────────────── */
  .gk-g2  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .gk-g3  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .gk-g4  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .gk-ga  { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

  .gk-sec-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    gap: 12px;
  }

  @media (max-width: 960px) {
    .gk-g4 { grid-template-columns: repeat(2, 1fr); }
    .gk-g3 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .gk-g2  { grid-template-columns: 1fr; }
    .gk-g3  { grid-template-columns: 1fr; }
    .gk-ga  { grid-template-columns: 1fr; }
    .gk-g4  { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .gk-hero-h1  { font-size: 36px !important; line-height: 1.05 !important; }
    .gk-hero-sub { font-size: 14px !important; }
    .gk-hero-btns  { flex-direction: column !important; }
    .gk-hero-btns > * { width: 100% !important; justify-content: center !important; }
    .gk-stats      { gap: 20px !important; }
    .gk-sec-header { flex-direction: column !important; align-items: flex-start !important; }
    .gk-popular    { display: none !important; }
    .gk-search-wrap  { flex-direction: column !important; }
    .gk-search-wrap input { width: 100%; min-width: 0; }
    .gk-tabs { width: 100% !important; }
    .gk-tabs button { flex: 1; }
    .gk-search-btn   { width: 100%; justify-content: center; }
    .gk-filter-label { display: none; }
  }
`;

export function injectGlobalStyles() {
  if (typeof document === 'undefined') return; // SSR guard
  if (document.getElementById('gk-global-styles')) return; // already injected
  const el = document.createElement('style');
  el.id = 'gk-global-styles';
  el.textContent = GK_CSS;
  document.head.appendChild(el);
}