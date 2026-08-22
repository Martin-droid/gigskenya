// Neither Arbeitnow nor TheirStack expose an explicit "open to candidates
// worldwide" field, so this is a best-effort text heuristic applied to
// normalized jobs (see normalizeArbeitnowJob in lib/arbeitnow.js and
// normalizeTheirStackJob in lib/theirstack.js — both produce { remote,
// location, descriptionText, ... }).
//
// It only considers jobs already marked remote, then excludes ones whose
// location/description clearly restricts eligibility to a specific
// country, citizenship, or timezone window. Anything left after that is
// treated as open — there's no reliable way to positively confirm
// "worldwide" from free text, so once a job clears the exclusion list we
// err toward including it rather than demanding an explicit "anywhere"
// statement that most listings simply never bother to write.
//
// This will occasionally get a call wrong in both directions. Tighten or
// loosen RESTRICTIVE_PATTERNS as you see false positives/negatives.

const RESTRICTIVE_PATTERNS = [
  /\bmust (be |currently )?(based|located|residing|resident) in\b/i,
  /\bmust reside in\b/i,
  /\bmust have (the )?right to work in\b/i,
  /\bauthoriz(ed|ation) to work in\b/i,
  /\b(US|U\.S\.|USA|UK|U\.K\.)[\s-]?(citizens?|residents?|based)\s+only\b/i,
  /\bcitizens? only\b/i,
  /\bwithin the (US|USA|UK|EU|United States|United Kingdom|European Union)\b/i,
  /\b(US|UK|EU)[\s-]only\b/i,
  /\b(EST|PST|CST|MST|GMT|CET)\s*(±|\+|-)\s*\d/i,
  /\btimezones?\s*(overlap|within)\b.{0,20}(EST|PST|CST|MST|GMT|CET|UTC)/i,
  /\bopen only to\b/i,
  /\bcandidates? (from|in|located in) the (US|UK|EU)\b/i,
];

export function isOpenToGlobalCandidates(job) {
  if (!job?.remote) return false;
  // Some sources (Himalayas) give us a structured signal instead of free
  // text — trust it directly rather than pattern-matching a description
  // that's already been confirmed unrestricted upstream.
  if (job.worldwideConfirmed) return true;
  const text = `${job.location || ''} ${job.descriptionText || ''}`;
  return !RESTRICTIVE_PATTERNS.some((re) => re.test(text));
}
