import { Helmet } from 'react-helmet-async';

const SITE      = 'GigsKenya';
const SITE_URL  = 'https://gigskenya.co.ke';
const OG_IMAGE  = `${SITE_URL}/og-image.jpg`;
const TWITTER   = '@GigsKenya';
const YEAR      = new Date().getFullYear();

export { YEAR };

export default function SEO({
  title,
  description,
  keywords,
  canonical,
  ogType   = 'website',
  ogImage  = OG_IMAGE,
  noindex  = false,
  jsonLd   = null,
}) {
  const fullTitle = title
    ? `${title} | ${SITE}`
    : `${SITE} | Jobs in Kenya ${YEAR} — Freelance Work, Hire Talent, Kazi Kenya`;

  const canon = canonical ? `${SITE_URL}${canonical}` : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords    && <meta name="keywords"    content={keywords} />}
      <meta name="author" content={SITE} />
      {noindex
        ? <meta name="robots" content="noindex,nofollow" />
        : <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
      }
      {canon && <link rel="canonical" href={canon} />}

      {/* Open Graph */}
      <meta property="og:site_name"    content={SITE} />
      <meta property="og:type"         content={ogType} />
      <meta property="og:title"        content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {canon       && <meta property="og:url"         content={canon} />}
      <meta property="og:image"        content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale"       content="en_KE" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER} />
      <meta name="twitter:title"       content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image"       content={ogImage} />

      {/* Structured data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
