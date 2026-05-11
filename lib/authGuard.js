/**
 * authGuard.js
 * ------------
 * Single source of truth for pre-auth intent storage and post-auth routing.
 *
 * INTENT SHAPE:
 * {
 *   type:     'pitch' | 'generic',   // what the user was trying to do
 *   returnTo: '/messages',            // path to navigate to after auth + setup
 *   params:   { with, name, pitch }, // query-string params for returnTo
 *   source:   '/ad/abc123',          // page they came from (for "back" links)
 *   label:    'Jane Doe',            // human-readable name shown in the banner
 * }
 *
 * TYPICAL FLOW:
 *
 *   1. Unauthenticated user clicks "Pitch to Hirer" in AdDetail
 *      → requireAuth() saves intent → redirects to /register?role=talent
 *
 *   2. User registers / logs in → navigates to /dashboard
 *
 *   3. Dashboard reads intent via peekIntent()
 *      a) No profile yet → show profile form with IntentBanner
 *         → on save → resolvePostLoginDestination(navigate)
 *      b) Profile exists → resolvePostLoginDestination(navigate) immediately
 *
 *   4. resolvePostLoginDestination consumes intent → navigates to
 *      /messages?with=...&name=...&pitch=true
 */

const INTENT_KEY = 'gk_login_intent';

// ── Storage helpers ───────────────────────────────────────────────

/** Save an intent before redirecting to login/register. */
export function saveIntent(intent) {
  try { sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent)); } catch {}
}

/** Read the intent without consuming it (safe to call many times). */
export function peekIntent() {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Read AND remove the intent (call once when you're acting on it). */
export function consumeIntent() {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    sessionStorage.removeItem(INTENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Remove the intent without reading it. */
export function clearIntent() {
  try { sessionStorage.removeItem(INTENT_KEY); } catch {}
}

// ── requireAuth ───────────────────────────────────────────────────

/**
 * Call before any auth-gated action.
 *
 * @param {boolean}  isAuthenticated
 * @param {function} navigate         react-router navigate
 * @param {object}   location         react-router location
 * @param {object}   [intent]         What to do after auth (see shape above)
 * @param {string}   [redirectTo]     Where to send unauthenticated users.
 *                                    Default: '/login'
 *                                    Pitch actions should pass '/register?role=talent'
 *
 * Returns true  → user is authenticated, proceed.
 * Returns false → user redirected, stop the handler.
 */
export function requireAuth({
  isAuthenticated,
  navigate,
  location,
  intent = null,
  redirectTo = '/login',
}) {
  if (isAuthenticated) return true;

  saveIntent(
    intent ?? {
      type: 'generic',
      returnTo: location.pathname + (location.search || ''),
      source:   location.pathname,
      label:    null,
    }
  );

  navigate(redirectTo, { state: { from: location.pathname } });
  return false;
}

// ── resolvePostLoginDestination ───────────────────────────────────

/**
 * Call from Dashboard after the user's profile is confirmed (saved or
 * pre-existing). Consumes the stored intent and navigates accordingly.
 *
 * If no intent (or intent has no meaningful returnTo), falls back to
 * showing the dashboard overview — caller is responsible for that UI.
 *
 * @param {function} navigate   react-router navigate
 * @param {string}   [fallback] Where to go when there is no intent.
 *                              Default: '/dashboard' (caller stays in place)
 * @returns {boolean}           true if a redirect happened, false if fallback used
 */
export function resolvePostLoginDestination(navigate, fallback = '/dashboard') {
  const intent = consumeIntent();

  if (!intent?.returnTo || intent.returnTo === '/dashboard') {
    // No meaningful destination — caller handles the "stay on dashboard" case
    navigate(fallback, { replace: true });
    return false;
  }

  const qs =
    intent.params && Object.keys(intent.params).length > 0
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(intent.params).map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : '';

  navigate(`${intent.returnTo}${qs}`, { replace: true });
  return true;
}

// ── Intent inspection helpers ─────────────────────────────────────

/** True if the stored intent is a pitch-to-hirer action. */
export function intentIsPitch() {
  return peekIntent()?.type === 'pitch';
}

/** True if the stored intent will redirect somewhere other than /dashboard. */
export function intentHasDestination() {
  const i = peekIntent();
  return !!(i?.returnTo && i.returnTo !== '/dashboard');
}

/**
 * Human-readable summary for the Dashboard onboarding banner.
 * Returns null when no relevant intent is stored.
 *
 * @returns {{ action: string, label: string|null } | null}
 */
export function intentSummary() {
  const i = peekIntent();
  if (!i) return null;
  if (i.type === 'pitch') return { action: 'pitch', label: i.label ?? null };
  return null;
}