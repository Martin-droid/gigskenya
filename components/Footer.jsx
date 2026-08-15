import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'white', paddingTop: 52 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Main row ── */}
        <div style={{
          display: 'flex', gap: 40, justifyContent: 'space-between',
          alignItems: 'flex-start', paddingBottom: 40,
          borderBottom: '1px solid rgba(255,255,255,.08)',
          flexWrap: 'wrap',
        }}>

          {/* Brand */}
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 34, height: 34, background: 'var(--green)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color="white" fill="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19 }}>
                Gigs<span style={{ color: 'var(--green)' }}>Kenya</span>
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14, lineHeight: 1.8 }}>
              Kenya's freelance marketplace. Find skilled professionals or post a gig — direct contact, no middleman.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
              letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--green)', marginBottom: 16,
            }}>Explore</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { to: '/browse',               label: 'Browse Listings'   },
                { to: '/talent',               label: 'Hire Freelancers'  },
                { to: '/how-it-works',         label: 'How It Works'      },
                { to: '/register?role=talent', label: 'Join as Freelancer' },
                { to: '/register?role=hirer',  label: 'Post a Job'        },
              ].map(({ to, label }) => (
                <Link
                  key={to} to={to}
                  style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, textDecoration: 'none', transition: 'color .15s' }}
                  onMouseOver={e => e.currentTarget.style.color = 'white'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.55)'}
                >{label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
              letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--green)', marginBottom: 16,
            }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <a
                href="mailto:info@gigs254.com"
                style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, textDecoration: 'none', transition: 'color .15s' }}
                onMouseOver={e => e.currentTarget.style.color = 'white'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.55)'}
              >
                info@gigs254.com
              </a>
              <p style={{ color: 'rgba(255,255,255,.28)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                Nairobi, Kenya
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {[
                  { to: '/terms',   label: 'Terms & Conditions' },
                  { to: '/privacy', label: 'Privacy Policy'     },
                ].map(({ to, label }) => (
                  <Link
                    key={to} to={to}
                    style={{ color: 'rgba(255,255,255,.38)', fontSize: 13, textDecoration: 'none', transition: 'color .15s' }}
                    onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,.7)'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.38)'}
                  >{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 0', flexWrap: 'wrap', gap: 10,
        }}>
          <p style={{ color: 'rgba(255,255,255,.28)', fontSize: 12 }}>
            © {new Date().getFullYear()} GigsKenya. Built with 🇰🇪 in Nairobi.
          </p>
          <p style={{ color: 'rgba(255,255,255,.2)', fontSize: 12 }}>
            The home of Kenyan freelancers &amp; gig workers.
          </p>
        </div>
      </div>
    </footer>
  );
}