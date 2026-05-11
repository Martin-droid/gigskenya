import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle, Briefcase, Clock, DollarSign, Tag, FileText, Users, Zap } from 'lucide-react';

const categories = [
  'Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design',
  'Content Writing & Copywriting', 'SEO & Digital Marketing', 'Social Media Management',
  'Video Production & Editing', 'Photography', 'Data Analysis', 'Accounting & Finance',
  'Virtual Assistant', 'Translation', 'Business Consulting', 'Customer Support',
];

const budgetRanges = [
  { label: 'KES 500 – 2,000', value: '500-2000', desc: 'Quick tasks' },
  { label: 'KES 2,000 – 10,000', value: '2000-10000', desc: 'Small projects' },
  { label: 'KES 10,000 – 50,000', value: '10000-50000', desc: 'Medium projects' },
  { label: 'KES 50,000 – 200,000', value: '50000-200000', desc: 'Large projects' },
  { label: 'KES 200,000+', value: '200000+', desc: 'Enterprise' },
  { label: 'Negotiable', value: 'negotiable', desc: 'Open to offers' },
];

export default function PostGig() {
  const [step, setStep] = useState(1);
  const [gig, setGig] = useState({ title: '', category: '', description: '', budget: '', deadline: '', skills: '', type: 'fixed' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const update = (k, v) => setGig(prev => ({ ...prev, [k]: v }));

  const next = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else {
      setLoading(true);
      setTimeout(() => { setLoading(false); setDone(true); }, 2000);
    }
  };

  const inputStyle = { width: '100%', padding: '13px 14px', borderRadius: 10, border: '2px solid var(--grey-200)', fontSize: 15, color: 'var(--grey-900)', transition: 'border-color 0.2s' };
  const focus = e => e.target.style.borderColor = 'var(--green)';
  const blur = e => e.target.style.borderColor = 'var(--grey-200)';

  if (done) {
    return (
      <div style={{ paddingTop: 68, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--grey-100)' }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '60px', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'float 3s infinite' }}>
            <CheckCircle size={40} color="var(--green)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, marginBottom: 12 }}>Gig Posted! 🎉</h1>
          <p style={{ color: 'var(--grey-500)', fontSize: 16, marginBottom: 12, lineHeight: 1.7 }}>
            <strong>"{gig.title || 'Your Gig'}"</strong> is now live.
            Expect your first proposals within <strong style={{ color: 'var(--green)' }}>2 hours</strong>.
          </p>
          <div style={{ background: 'var(--grey-100)', borderRadius: 12, padding: '16px 20px', marginBottom: 32, display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>50K+</div>
              <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>Freelancers notified</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>~2hrs</div>
              <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>First proposals</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>100%</div>
              <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>Payment protected</div>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginBottom: 12 }}>
            View My Dashboard →
          </button>
          <button onClick={() => { setGig({ title: '', category: '', description: '', budget: '', deadline: '', skills: '', type: 'fixed' }); setStep(1); setDone(false); }} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
            Post Another Gig
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--grey-100)' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div className="tag tag-green" style={{ marginBottom: 12 }}>Post a Gig</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
            {step === 1 && 'Describe Your Project'}
            {step === 2 && 'Budget & Timeline'}
            {step === 3 && 'Review & Publish'}
          </h1>
          <p style={{ color: 'var(--grey-500)', fontSize: 15 }}>
            {step === 1 && 'Clear descriptions attract better freelancers faster.'}
            {step === 2 && 'Set your budget and get proposals that match.'}
            {step === 3 && 'Review your gig before it goes live to 50,000+ freelancers.'}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 4, background: n <= step ? 'var(--green)' : 'var(--grey-200)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
          {/* Main form */}
          <div style={{ background: 'white', borderRadius: 20, padding: '36px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <form onSubmit={next}>
              {step === 1 && (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--grey-700)', marginBottom: 8 }}>Gig Title *</label>
                    <input required type="text" placeholder="e.g. 'Build a React e-commerce website for my shop'" value={gig.title} onChange={e => update('title', e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
                    <p style={{ fontSize: 12, color: 'var(--grey-400)', marginTop: 6 }}>Be specific — "Build a React Native food delivery app" beats "Mobile app developer needed"</p>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--grey-700)', marginBottom: 8 }}>Category *</label>
                    <select required value={gig.category} onChange={e => update('category', e.target.value)} style={{ ...inputStyle, appearance: 'none', background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center white` }} onFocus={focus} onBlur={blur}>
                      <option value="">Select a category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--grey-700)', marginBottom: 8 }}>Project Description *</label>
                    <textarea
                      rows={7} required
                      placeholder={`Describe your project in detail:\n\n• What do you need built/done?\n• What's the expected output?\n• Any specific tools or technologies?\n• Are there examples or references?`}
                      value={gig.description} onChange={e => update('description', e.target.value)}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                      onFocus={focus} onBlur={blur}
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--grey-700)', marginBottom: 8 }}>Required Skills</label>
                    <input type="text" placeholder="e.g. React, Node.js, MySQL (comma-separated)" value={gig.skills} onChange={e => update('skills', e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Project type */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--grey-700)', marginBottom: 12 }}>Payment Type *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[{ id: 'fixed', label: 'Fixed Price', icon: DollarSign, desc: 'One total payment for the full project' }, { id: 'hourly', label: 'Hourly Rate', icon: Clock, desc: 'Pay per hour of work done' }].map(({ id, label, icon: Icon, desc }) => (
                        <button type="button" key={id} onClick={() => update('type', id)} style={{
                          padding: '18px', borderRadius: 12, border: `2px solid ${gig.type === id ? 'var(--green)' : 'var(--grey-200)'}`,
                          background: gig.type === id ? 'var(--green-light)' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        }}>
                          <Icon size={20} color={gig.type === id ? 'var(--green)' : 'var(--grey-500)'} style={{ marginBottom: 8 }} />
                          <div style={{ fontWeight: 700, fontSize: 14, color: gig.type === id ? 'var(--green)' : 'var(--grey-900)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--grey-700)', marginBottom: 12 }}>Budget Range *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {budgetRanges.map(({ label, value, desc }) => (
                        <button type="button" key={value} onClick={() => update('budget', value)} style={{
                          padding: '12px 16px', borderRadius: 10, border: `2px solid ${gig.budget === value ? 'var(--green)' : 'var(--grey-200)'}`,
                          background: gig.budget === value ? 'var(--green-light)' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: gig.budget === value ? 'var(--green)' : 'var(--grey-900)' }}>{label}</div>
                          <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--grey-700)', marginBottom: 8 }}>Project Deadline</label>
                    <input type="date" value={gig.deadline} onChange={e => update('deadline', e.target.value)} style={inputStyle} onFocus={focus} onBlur={blur} min={new Date().toISOString().split('T')[0]} />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--grey-900)' }}>Gig Summary</h3>
                  {[
                    { label: 'Title', value: gig.title || 'Not set', icon: FileText },
                    { label: 'Category', value: gig.category || 'Not set', icon: Tag },
                    { label: 'Budget', value: gig.budget ? `KES ${gig.budget}` : 'Not set', icon: DollarSign },
                    { label: 'Type', value: gig.type === 'fixed' ? 'Fixed Price' : 'Hourly Rate', icon: Clock },
                    { label: 'Deadline', value: gig.deadline || 'Flexible', icon: Clock },
                    { label: 'Skills', value: gig.skills || 'None specified', icon: Users },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} style={{ display: 'flex', gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--grey-100)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color="var(--grey-500)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--grey-900)' }}>{value}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ background: 'var(--green-light)', border: '1px solid rgba(0,165,80,0.2)', borderRadius: 12, padding: '16px 20px', marginTop: 8 }}>
                    <p style={{ fontSize: 13, color: 'var(--green-dark)', lineHeight: 1.6 }}>
                      ✅ Posting is <strong>100% free</strong>. You only pay when you hire — and only after you're satisfied. All payments are secured with escrow.
                    </p>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'flex-end' }}>
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary" style={{ padding: '13px 24px' }}>
                    Back
                  </button>
                )}
                <button type="submit" className="btn-primary" style={{ padding: '13px 32px' }} disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                      Publishing…
                    </span>
                  ) : step < 3 ? (
                    <>Continue <ChevronRight size={16} /></>
                  ) : (
                    <>Publish Gig 🚀</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Tips sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Zap size={18} color="var(--green)" />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>Pro Tips</h4>
              </div>
              {step === 1 && [
                'Use specific job titles — "React Native developer" over "mobile developer"',
                'Mention the end goal, not just the task',
                'Include examples of similar work you love',
              ].map(tip => (
                <div key={tip} style={{ fontSize: 13, color: 'var(--grey-600)', marginBottom: 12, paddingLeft: 16, borderLeft: '3px solid var(--green-light)', lineHeight: 1.6 }}>{tip}</div>
              ))}
              {step === 2 && [
                'Kenyan developers average KES 2,000–5,000/hr',
                'Design projects: KES 5,000–50,000 typically',
                'Fixed price works best for defined scope',
              ].map(tip => (
                <div key={tip} style={{ fontSize: 13, color: 'var(--grey-600)', marginBottom: 12, paddingLeft: 16, borderLeft: '3px solid var(--green-light)', lineHeight: 1.6 }}>{tip}</div>
              ))}
              {step === 3 && [
                'Gigs go live instantly after publishing',
                'You\'ll get email + SMS notifications for proposals',
                'Edit or close your gig any time',
              ].map(tip => (
                <div key={tip} style={{ fontSize: 13, color: 'var(--grey-600)', marginBottom: 12, paddingLeft: 16, borderLeft: '3px solid var(--green-light)', lineHeight: 1.6 }}>{tip}</div>
              ))}
            </div>

            <div style={{ background: 'var(--charcoal)', borderRadius: 16, padding: '24px', color: 'white' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Average time to first proposal</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>1.8 hours</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Based on last 30 days of gigs</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @media(max-width: 768px) {
          .post-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
