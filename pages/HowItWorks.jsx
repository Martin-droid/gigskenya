import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  ArrowRight, FileText, Search, MessageSquare, Phone,
  Users, Briefcase, Zap, Shield, Globe, Star,
} from 'lucide-react';

const HIRER_STEPS = [
  {
    num: '01', icon: FileText,
    title: 'Post a Free Job Ad',
    desc: 'Describe the work, set your budget, and add your contact. Takes 2 minutes. No signup fee — ever.',
  },
  {
    num: '02', icon: Search,
    title: 'Freelancers Find You',
    desc: 'Your ad goes live instantly. Freelancers browse listings by category, city, and budget — and reach out directly.',
  },
  {
    num: '03', icon: MessageSquare,
    title: 'Chat, Agree & Start',
    desc: 'Review freelancer profiles, chat via WhatsApp or our messaging, agree on scope and rate, then get the work done.',
  },
];

const TALENT_STEPS = [
  {
    num: '01', icon: Users,
    title: 'Build Your Free Profile',
    desc: 'Showcase your skills, experience, and set your rate in KES. Your profile is listed publicly for hirers to find you.',
  },
  {
    num: '02', icon: Briefcase,
    title: 'Browse Job Listings',
    desc: 'Search hundreds of active job ads filtered by category, location, and budget. New gigs posted daily across Kenya.',
  },
  {
    num: '03', icon: Phone,
    title: 'Contact, Agree & Get Paid',
    desc: 'Reach out via WhatsApp, phone, or platform message. Agree on terms directly, deliver the work, and get paid your way.',
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Direct & Simple',
    desc: 'Free to post a job or create a talent profile. No middlemen, no approval queues. Connect directly with who you need.',
  },
  {
    icon: Phone,
    title: 'Direct Contact',
    desc: 'Connect via WhatsApp, phone call, or built-in messaging — no middlemen. Negotiate directly with who you\'re working with.',
  },
  {
    icon: Globe,
    title: 'Kenya First',
    desc: 'Rates in KES, cities from Nairobi to Mombasa, and categories built around how Kenya works — formal and informal.',
  },
  {
    icon: FileText,
    title: 'Instant Listings',
    desc: 'Post a job ad or talent profile in minutes. No approval process. Your listing goes live the moment you publish.',
  },
  {
    icon: Shield,
    title: 'Safe & Private',
    desc: 'Phone numbers and contact details are only visible to signed-in users. Your privacy is protected by default.',
  },
  {
    icon: Star,
    title: 'Built-in Messaging',
    desc: 'Every listing has an in-app pitch/message feature. Start a conversation without sharing your number first.',
  },
];

const FAQS = [
  {
    q: 'How much does it cost to post a job or create a profile?',
    a: 'Creating a profile and posting listings is Free. We believe Kenyan talent should connect without unnecessary barriers.',
  },
  {
    q: 'How does payment work between hirers and freelancers?',
    a: 'Payments happen directly between you and the other party — via M-Pesa, bank transfer, cash, or whatever you agree on. GigsKenya does not process or hold any payments.',
  },
  {
    q: 'How do I contact a freelancer or get contacted by one?',
    a: 'On any listing or talent profile, click "Contact" or "Message". This opens in-app messaging or reveals the phone number (WhatsApp-enabled) so you can connect directly.',
  },
  {
    q: 'Is my phone number visible to everyone?',
    a: 'No. Contact details are only shown to users who are logged in and click "Contact" on your listing or profile. Random visitors cannot see your number.',
  },
  {
    q: 'Can anyone post an ad or create a talent profile?',
    a: 'Yes — GigsKenya is open to all Kenyans. There is no vetting or approval process. Simply sign up, complete your profile or post an ad, and you\'re live.',
  },
  {
    q: 'What if the freelancer or hirer doesn\'t follow through?',
    a: 'We encourage both parties to review profiles and communicate clearly before agreeing on any work. Since payments are direct, always agree on terms — and preferably start small — before committing large amounts.',
  },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--grey-200)', borderRadius: 14, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '20px 24px', background: open ? 'var(--green-light)' : 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, transition: 'background 0.2s' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, textAlign: 'left', color: open ? 'var(--green-dark)' : 'var(--ink)' }}>{question}</span>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: open ? 'var(--green)' : 'var(--grey-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: open ? 'white' : 'var(--grey-600)', fontSize: 18, lineHeight: 1, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
        </div>
      </button>
      {open && <div style={{ padding: '0 24px 20px', fontSize: 15, color: 'var(--grey-700)', lineHeight: 1.7 }}>{answer}</div>}
    </div>
  );
}

export default function HowItWorks() {
  const [tab, setTab] = useState('hirer');
  const navigate = useNavigate();
  const steps = tab === 'hirer' ? HIRER_STEPS : TALENT_STEPS;

  return (
    <>
    <SEO
      title="How GigsKenya Works | Find Jobs, Hire Talent & Earn via M-Pesa in Kenya"
      description="Learn how GigsKenya connects Kenyan freelancers with businesses. Post a free job ad, browse top talent, contact directly. No commission, no middleman. Freelancers get paid via M-Pesa. Start in under 2 minutes."
      keywords="how to hire freelancers Kenya, how to find work Kenya, how to get a job in Kenya, how to start freelancing in Kenya, freelancing in Kenya for beginners, how to get clients as a freelancer Kenya, best freelancing platforms Kenya, how to make money freelancing Kenya, freelance marketplace Kenya, post job Kenya, find gigs Nairobi, earn money online Kenya M-Pesa, how GigsKenya works, ajira digital Kenya, kazi online Kenya, side hustle Kenya, legit online jobs Kenya"
      canonical="/how-it-works"
    />
    <div style={{ paddingTop: 68 }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div className="tag tag-green" style={{ marginBottom: 20, display: 'inline-flex' }}>Simple. Free. Direct.</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, color: 'white', marginBottom: 20, lineHeight: 1.1 }}>
          How GigsKenya Works
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7 }}>
          A free marketplace connecting Kenyan freelancers and hirers — directly, with no middlemen and no fees.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
            Post a Job Ad <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{ color: 'white', background: 'transparent', border: '2px solid rgba(255,255,255,0.25)', padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'white'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
          >
            Join as Freelancer
          </button>
        </div>
      </section>

      {/* Steps */}
      <section style={{ background: 'white', padding: '96px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="tag tag-green" style={{ marginBottom: 16 }}>Step by Step</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, marginBottom: 32 }}>
              {tab === 'hirer' ? 'How to Hire on GigsKenya' : 'How to Earn on GigsKenya'}
            </h2>
            <div style={{ display: 'inline-flex', background: 'var(--grey-100)', borderRadius: 12, padding: 4, gap: 4 }}>
              {[{ id: 'hirer', label: 'I want to Hire' }, { id: 'talent', label: 'I want to Earn' }].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{ padding: '10px 24px', borderRadius: 9, border: 'none', cursor: 'pointer', background: tab === id ? 'var(--green)' : 'transparent', color: tab === id ? 'white' : 'var(--grey-600)', fontWeight: 700, fontSize: 15, transition: 'all 0.2s', fontFamily: 'var(--font-display)' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={num} style={{ display: 'flex', gap: 24, position: 'relative', paddingBottom: i < steps.length - 1 ? 48 : 0 }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', left: 24, top: 56, bottom: 0, width: 2, background: 'linear-gradient(to bottom, var(--green), var(--grey-200))' }} />
                )}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, boxShadow: '0 0 0 6px var(--green-light)' }}>
                  <Icon size={20} color="white" />
                </div>
                <div style={{ paddingTop: 8, flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', marginBottom: 4, letterSpacing: 1 }}>STEP {num}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--grey-600)', lineHeight: 1.7, maxWidth: 520 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate(tab === 'hirer' ? '/dashboard' : '/register')}
              className="btn-primary"
              style={{ padding: '14px 36px', fontSize: 15 }}
            >
              {tab === 'hirer' ? 'Post a Job Ad Free' : 'Create Your Profile'} <ArrowRight size={18} />
            </button>
            {tab === 'hirer' && (
              <button
                onClick={() => navigate('/talent')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-body)' }}
              >
                Or browse Kenyan freelancers directly →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* What makes it different */}
      <section style={{ background: 'var(--grey-100)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="tag tag-green" style={{ marginBottom: 16 }}>Why GigsKenya</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800 }}>
              Built for Kenya. No Barriers.
            </h2>
            <p style={{ color: 'var(--grey-600)', fontSize: 16, maxWidth: 520, margin: '16px auto 0', lineHeight: 1.7 }}>
              No approval process, no gatekeeping — just Kenyans connecting to work.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                style={{ background: 'white', borderRadius: 20, padding: '28px', border: '1px solid var(--grey-200)', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={22} color="var(--green)" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--grey-600)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How payments work callout */}
      <section style={{ background: 'white', padding: '72px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderRadius: 24, padding: '48px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💸</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: 'var(--green-dark)', marginBottom: 14 }}>
            Payments Go Directly Between You
          </h2>
          <p style={{ fontSize: 16, color: '#166534', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 28px' }}>
            GigsKenya does not process, hold, or take a cut from any payment. When you agree on a price, you pay the freelancer directly — via <strong>M-Pesa</strong>, bank transfer, or whatever works for both of you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['M-Pesa', 'Bank Transfer', 'Cash', 'Airtel Money'].map(m => (
              <span key={m} style={{ padding: '8px 18px', borderRadius: 'var(--r-full)', background: 'white', border: '1.5px solid #86EFAC', color: 'var(--green-dark)', fontSize: 14, fontWeight: 700 }}>{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--grey-100)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="tag tag-green" style={{ marginBottom: 16 }}>FAQ</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800 }}>Questions? Answered.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map(({ q, a }) => <FAQItem key={q} question={q} answer={a} />)}
          </div>
        </div>
      </section>

      {/* Safety tips */}
      <section style={{ background: 'white', padding: '60px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 20, padding: '32px 36px' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <Shield size={24} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#92400E', marginBottom: 10 }}>A few safety tips</h3>
              <ul style={{ fontSize: 14, color: '#B45309', lineHeight: 2, paddingLeft: 18 }}>
                <li>Always review a freelancer's profile and previous reviews before agreeing on work.</li>
                <li>For large jobs, start with a small paid trial before committing the full amount.</li>
                <li>Agree on the scope, deliverables, and payment terms in writing (WhatsApp message is fine).</li>
                <li>Never pay a large upfront sum to someone you haven't verified or worked with before.</li>
                <li>Meet in a public place for in-person work. Tell someone where you're going.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--green-dark), var(--green))', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
          Ready to Get Started?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, marginBottom: 40, lineHeight: 1.6 }}>
          No approval process. Just Kenya working together.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'white', color: 'var(--green)', padding: '15px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'transform 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
          >
            Post a Job Ad
          </button>
          <button
            onClick={() => navigate('/register?role=talent')}
            style={{ background: 'transparent', color: 'white', padding: '15px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, border: '2px solid rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'white'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
          >
            Join as Freelancer
          </button>
        </div>
      </section>

    </div>
    </>
  );
}
