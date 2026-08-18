// Single source of truth for ad categories — used at creation (PostAdForm)
// and at filter time (Browse) so the two never drift out of sync. Each
// entry doubles as both the id and the stored `ad.category` value.
export const CATEGORIES = [
  'Tech & Dev',
  'Design',
  'Writing & Content',
  'Digital Marketing',
  'Photo & Video',
  'Business & Finance',
  'Customer Support',
  'Translation',
  'Education & Tutoring',
  'Other',
];
