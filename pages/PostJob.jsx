import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { goToPostJob } from '../lib/authGuard';
import {
  ArrowRight, FileText, Wallet, Send, Zap, Shield, MessageSquare, Clock,
} from 'lucide-react';

const STEPS = [
  { num: '01', icon: FileText, title: 'Describe the role', desc: 'Job title, category, and a few lines on what you need done.' },
  { num: '02', icon: Wallet,   title: 'Set your budget',   desc: 'Fixed price, hourly, or just mark it negotiable — in KES.' },
  { num: '03', icon: Send,     title: 'Publish',           desc: 'Your ad goes live instantly. No approval queue, no waiting.' },
];

const TRUST = [
  { icon: Zap,           title: 'Free, always',        desc: 'No listing fee, no commission on what you agree to pay.' },
  { icon: Clock,         title: 'Live in under a minute', desc: 'No review queue — your ad is visible the moment you publish.' },
  { icon: MessageSquare, title: 'Direct contact',       desc: 'Freelancers reach you by phone or WhatsApp — no middleman.' },
  { icon: Shield,        title: 'Your number stays private', desc: "Only shown to signed-in users who click \"Contact\"." },
];

const FAQS = [
  { q: 'Is it really free to post a job?', a: 'Yes — posting a job ad on GigsKenya is completely free, and there is no commission on any work you agree to pay for. We never touch the payment between you and the freelancer.' },
  { q: 'How fast will I get responses?', a: 'Your ad goes live the moment you publish it — no approval process. Most hirers get their first message or call within hours, since freelancers are browsing new listings daily.' },
  { q: 'Do I need to create a profile first?', a: "You'll need a free GigsKenya account so freelancers know who they're contacting, but posting the job itself takes under a minute." },
  { q: 'Can I edit or take down my job ad later?', a: 'Yes — manage all your listings from your Dashboard. Edit the details or remove the ad any time once the role is filled.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--grey-200)', borderRadius: 14, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '18px 22px', background: open ? 'var(--green-light)' : 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, textAlign: 'left', transition: 'background .2s' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: open ? 'var(--green-dark)' : 'var(--ink)' }}>{q}</span>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: open ? 'var(--green)' : 'var(--grey-200)', color: open ? 'white' : 'var(--grey-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, lineHeight: 1, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <div style={{ padding: '0 22px 18px', fontSize: 14, color: 'var(--grey-700)', lineHeight: 1.7 }}>{a}</div>}
    </div>
  );
}

export default function PostJob() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const yr = new Date().getFullYear();
  const postClick = e => goToPostJob(navigate, isAuthenticated, e);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Post a Job on GigsKenya',
    description: 'Post a free job ad on GigsKenya in under a minute and get contacted directly by Kenyan freelancers.',
    totalTime: 'PT1M',
    step: STEPS.map(s => ({ '@type': 'HowToStep', position: Number(s.num), name: s.title, text: s.desc })),
  };

  return (
    <>
    <SEO
      title={`Post a Job in Kenya ${yr} | Free, Live in Under a Minute`}
      description="Post a job ad on GigsKenya in under a minute — completely free, no commission, ever. Reach thousands of Kenyan freelancers directly by phone or WhatsApp."
      keywords="post a job Kenya, post a job free Kenya, free job posting Kenya, advertise a vacancy Kenya, post vacancy Nairobi, post a job in a minute, hire in Kenya, employer post job Kenya, job posting site Kenya, recruit freelancers Kenya, hire freelancers fast Kenya, post job online Kenya"
      canonical="/post-a-job"
      jsonLd={jsonLd}
    />
    <div style={{ paddingTop: 68 }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 100%)', padding: '84px 24px 76px', textAlign: 'center' }}>
        <div className="tag tag-green" style={{ marginBottom: 20, display: 'inline-flex' }}>Free · No Commission · Live Instantly</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, color: 'white', marginBottom: 18, lineHeight: 1.1, letterSpacing: '-.02em' }}>
          Post a Job in<br/>Under a Minute
        </h1>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 17, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Describe the role, set a budget, publish. Your ad is live instantly and Kenyan freelancers can reach you directly — no commission, no middleman.
        </p>
        <Link to="/register?role=hirer" onClick={postClick} className="btn-primary" style={{ padding: '15px 34px', fontSize: 15 }}>
          Post a Job Free <ArrowRight size={18} />
        </Link>
      </section>

      {/* 3 steps */}
      <section style={{ background: 'white', padding: '72px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,32px)', fontWeight: 800, marginBottom: 48, color: 'var(--ink)' }}>
            Three steps. Sixty seconds.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            {STEPS.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} style={{ padding: 24, borderRadius: 16, border: '1px solid var(--grey-200)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 0 0 6px var(--green-light)' }}>
                  <Icon size={19} color="white" />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', marginBottom: 4, letterSpacing: 1 }}>STEP {num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--grey-600)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bullets */}
      <section style={{ background: 'var(--grey-100)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {TRUST.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'white', border: '1px solid var(--grey-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} color="var(--green)" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 700, marginBottom: 3, color: 'var(--ink)' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'white', padding: '72px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800, marginBottom: 32, color: 'var(--ink)' }}>
            Questions hirers ask
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 100%)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>
          Your next hire is a minute away.
        </h2>
        <Link to="/register?role=hirer" onClick={postClick} className="btn-primary" style={{ padding: '15px 34px', fontSize: 15, margin: '0 auto' }}>
          Post a Job Free <ArrowRight size={18} />
        </Link>
      </section>

    </div>
    </>
  );
}
