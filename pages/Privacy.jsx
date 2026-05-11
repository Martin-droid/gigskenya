import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const EFFECTIVE_DATE = '8 May 2026';
const DPO_EMAIL      = 'info@gigs254.com';
const LEGAL_EMAIL    = 'info@gigs254.com';
const PLATFORM_URL   = 'gigs254.com';

const S = {
  page:  { paddingTop: 64, minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1a202c' },
  hero:  { background: '#0A0A0A', padding: '52px 24px 44px', textAlign: 'center' },
  wrap:  { maxWidth: 840, margin: '0 auto', padding: '0 16px 80px' },
  card:  { background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: '32px 36px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.04)' },
  h2:    { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: '#1a202c', letterSpacing: '-.02em', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #EEF2FF', display: 'flex', alignItems: 'center', gap: 10 },
  h3:    { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 800, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, marginTop: 22 },
  p:     { fontSize: 14, lineHeight: 1.8, color: '#374151', marginBottom: 12 },
  li:    { fontSize: 14, lineHeight: 1.8, color: '#374151', marginBottom: 6 },
  tbl:   { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 },
  th:    { background: '#EEF2FF', padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: '#4338CA', borderBottom: '2px solid #C7D2FE' },
  td:    { padding: '10px 14px', borderBottom: '1px solid #F1F5F9', color: '#374151', verticalAlign: 'top' },
};

function Num({ n }) {
  return <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#EEF2FF', color: '#4338CA', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>;
}

export default function Privacy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={S.page}>
      {/* Hero */}
      <div style={S.hero}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Legal</p>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: 'white', letterSpacing: '-.03em', marginBottom: 12 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', maxWidth: 560, margin: '0 auto 16px' }}>
          How GigsKenya collects, uses, and protects your personal data — in compliance with the Kenya Data Protection Act, 2019.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {[`Effective: ${EFFECTIVE_DATE}`, 'Kenya Data Protection Act 2019', 'ODPC Compliant'].map(l => (
            <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.55)' }}>{l}</span>
          ))}
        </div>
      </div>

      <div style={{ ...S.wrap, paddingTop: 32 }}>

        {/* Summary box */}
        <div style={{ background: '#EEF2FF', border: '1.5px solid #C7D2FE', borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: '#3730A3', marginBottom: 8 }}>Privacy at a Glance</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {[
              ['🔒', 'We do not sell your data to third parties.'],
              ['📋', 'We collect only what we need to run the platform.'],
              ['✋', 'You can request deletion of your data at any time.'],
              ['🇰🇪', 'We comply with the Kenya Data Protection Act, 2019.'],
            ].map(([e, t]) => (
              <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#3730A3' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{e}</span><span style={{ lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* §1 Who We Are */}
        <div style={S.card} id="p1">
          <h2 style={S.h2}><Num n="1"/> Who We Are — Data Controller</h2>
          <p style={S.p}>
            GigsKenya ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") is the <strong>Data Controller</strong> responsible for your personal data processed through this platform, as defined under the <em>Data Protection Act, 2019 (No. 24 of 2019)</em> of Kenya.
          </p>
          <p style={S.p}>
            Our Data Protection Officer (DPO) can be contacted at: <a href={`mailto:${DPO_EMAIL}`} style={{ color: '#4338CA', fontWeight: 700 }}>{DPO_EMAIL}</a>
          </p>
          <p style={S.p}>
            We are committed to protecting your personal data and handling it in a transparent, lawful, and responsible manner in accordance with the Act and the Data Protection (General) Regulations, 2021.
          </p>
        </div>

        {/* §2 What We Collect */}
        <div style={S.card} id="p2">
          <h2 style={S.h2}><Num n="2"/> What Personal Data We Collect</h2>
          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>Category</th>
                <th style={S.th}>Data Collected</th>
                <th style={S.th}>Who It Applies To</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Identity & Contact', 'Full name, email address, phone number, WhatsApp number', 'All users'],
                ['Account Data', 'Password (hashed), role (Talent/Hirer), registration date', 'All users'],
                ['Profile Data', 'Profile photo, headline, bio, skills, location, availability, rate', 'Talent'],
                ['Professional Data', 'CV / resume, portfolio URL, LinkedIn URL, work experience', 'Talent'],
                ['Business Data', 'Company name, company logo, industry, company size', 'Hirer'],
                ['Activity Data', 'Profile views, contact clicks, message history, ratings given/received', 'All users'],
                ['Uploaded Files', 'Profile photos and CV documents stored on Firebase Storage', 'All users'],
                ['Device & Usage Data', 'Browser type, IP address (via Firebase Analytics), pages visited', 'All users'],
                ['Communications', 'In-platform messages between users', 'All users'],
              ].map(([cat, data, who]) => (
                <tr key={cat}>
                  <td style={{ ...S.td, fontWeight: 700, color: '#1a202c' }}>{cat}</td>
                  <td style={S.td}>{data}</td>
                  <td style={S.td}><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#EEF2FF', color: '#4338CA' }}>{who}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 style={S.h3}>2.1 Data We Do Not Collect</h3>
          <p style={S.p}>We do not knowingly collect: national ID numbers, KRA PIN numbers, financial account details, biometric data, or data concerning children under 18 years of age. Do not submit such data through the platform.</p>
        </div>

        {/* §3 Legal Basis */}
        <div style={S.card} id="p3">
          <h2 style={S.h2}><Num n="3"/> Legal Basis for Processing</h2>
          <p style={S.p}>Under the <em>Data Protection Act, 2019 (Section 30)</em>, we process your personal data on the following legal bases:</p>
          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>Legal Basis</th>
                <th style={S.th}>How We Use It</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Consent', 'When you register and accept these terms; when you voluntarily provide profile data'],
                ['Contract Performance', 'To provide the platform services you have signed up for'],
                ['Legitimate Interests', 'To improve the platform, detect fraud, and maintain security'],
                ['Legal Obligation', 'To comply with applicable Kenyan laws and court orders'],
              ].map(([basis, use]) => (
                <tr key={basis}>
                  <td style={{ ...S.td, fontWeight: 700 }}>{basis}</td>
                  <td style={S.td}>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* §4 How We Use Your Data */}
        <div style={S.card} id="p4">
          <h2 style={S.h2}><Num n="4"/> How We Use Your Personal Data</h2>
          <p style={S.p}>We use personal data for the following purposes:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'Creating and managing your account and profile;',
              'Displaying your Talent profile or job listings to other users;',
              'Enabling in-platform messaging between users;',
              'Calculating and displaying profile views and contact statistics;',
              'Showing aggregate ratings on Talent profiles;',
              'Sending transactional emails (e.g., account verification, password reset);',
              'Improving platform features and user experience;',
              'Detecting, investigating, and preventing fraud, abuse, or policy violations;',
              'Complying with legal obligations under Kenyan law; and',
              'Responding to enquiries and support requests.',
            ].map((t,i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
          <p style={S.p}>We will not use your personal data for automated decision-making or profiling that produces legal or similarly significant effects without your explicit consent.</p>
        </div>

        {/* §5 Sharing */}
        <div style={S.card} id="p5">
          <h2 style={S.h2}><Num n="5"/> Who We Share Your Data With</h2>
          <h3 style={S.h3}>5.1 Other Users</h3>
          <p style={S.p}>
            Information you choose to make public (profile photo, name, headline, location, skills, rate, portfolio) is visible to all visitors of the platform. Contact details (phone number) are shown only to authenticated users who request them, unless you have enabled the "hide phone" option.
          </p>
          <h3 style={S.h3}>5.2 Service Providers (Data Processors)</h3>
          <p style={S.p}>We share data with trusted third-party processors who assist us in operating the platform:</p>
          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>Provider</th>
                <th style={S.th}>Purpose</th>
                <th style={S.th}>Location</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Google Firebase', 'Authentication, database, file storage, analytics', 'USA / EU (SCCs applied)'],
                ['Google Fonts', 'Font delivery (no personal data sent)', 'Global CDN'],
              ].map(([p, pur, loc]) => (
                <tr key={p}>
                  <td style={{ ...S.td, fontWeight: 700 }}>{p}</td>
                  <td style={S.td}>{pur}</td>
                  <td style={S.td}>{loc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={S.p}>All processors are bound by data processing agreements and are required to maintain appropriate security standards.</p>
          <h3 style={S.h3}>5.3 Legal Disclosure</h3>
          <p style={S.p}>We may disclose your personal data where required to do so by law, a court order, or a competent authority under Kenyan law (e.g., the Directorate of Criminal Investigations or the Data Protection Commissioner).</p>
          <h3 style={S.h3}>5.4 No Sale of Data</h3>
          <p style={{ ...S.p, fontWeight: 700, color: '#1a202c' }}>We do not sell, rent, or trade your personal data to any third party for commercial purposes.</p>
        </div>

        {/* §6 Cross-border transfers */}
        <div style={S.card} id="p6">
          <h2 style={S.h2}><Num n="6"/> Cross-Border Data Transfers</h2>
          <p style={S.p}>
            GigsKenya uses Google Firebase, whose infrastructure may process data in data centres outside Kenya (including the United States and European Union). Such transfers are made in compliance with <em>Section 48 of the Data Protection Act, 2019</em>, which permits transfers where the recipient country provides adequate data protection or where appropriate safeguards (such as Standard Contractual Clauses) are in place.
          </p>
          <p style={S.p}>
            Firebase is certified under applicable data protection frameworks and processes data in accordance with Google's Privacy Policy and Data Processing Terms. You can review Google's data processing commitments at <strong>firebase.google.com/support/privacy</strong>.
          </p>
        </div>

        {/* §7 Retention */}
        <div style={S.card} id="p7">
          <h2 style={S.h2}><Num n="7"/> Data Retention</h2>
          <p style={S.p}>We retain your personal data for as long as your account is active or as necessary to provide the platform services. When you delete your account:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'Your public profile and listings are removed immediately;',
              'Your messages and account data are deleted within 30 days;',
              'Anonymised, aggregated usage data (not linked to you) may be retained indefinitely for analytics; and',
              'Certain records may be retained for up to 7 years where required by Kenyan tax or financial laws.',
            ].map((t,i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
        </div>

        {/* §8 Your Rights */}
        <div style={S.card} id="p8">
          <h2 style={S.h2}><Num n="8"/> Your Rights Under the Data Protection Act, 2019</h2>
          <p style={S.p}>Under the <em>Data Protection Act, 2019 (Sections 26–34)</em>, you have the following rights regarding your personal data:</p>
          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>Right</th>
                <th style={S.th}>What It Means</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Right to be informed', 'Know how your data is collected and used (this policy).'],
                ['Right of access', 'Request a copy of the personal data we hold about you.'],
                ['Right to rectification', 'Correct inaccurate or incomplete personal data.'],
                ['Right to erasure', 'Request deletion of your data ("right to be forgotten").'],
                ['Right to object', 'Object to processing based on legitimate interests.'],
                ['Right to restrict processing', 'Ask us to limit how we use your data in certain circumstances.'],
                ['Right to data portability', 'Receive your data in a structured, machine-readable format.'],
                ['Right to withdraw consent', 'Withdraw consent at any time without affecting past processing.'],
              ].map(([right, meaning]) => (
                <tr key={right}>
                  <td style={{ ...S.td, fontWeight: 700, color: '#4338CA' }}>{right}</td>
                  <td style={S.td}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={S.p}>To exercise any of these rights, contact our Data Protection Officer at <a href={`mailto:${DPO_EMAIL}`} style={{ color: '#4338CA', fontWeight: 700 }}>{DPO_EMAIL}</a>. We will respond within <strong>21 days</strong> as required by the Act. You may also lodge a complaint with the <strong>Office of the Data Protection Commissioner (ODPC)</strong> at <strong>odpc.go.ke</strong>.</p>
        </div>

        {/* §9 Security */}
        <div style={S.card} id="p9">
          <h2 style={S.h2}><Num n="9"/> Security Measures</h2>
          <p style={S.p}>We implement appropriate technical and organisational measures to protect your personal data, including:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'TLS/HTTPS encryption for all data in transit;',
              'Firebase Security Rules restricting database read/write access;',
              'Hashed storage of passwords — we never store passwords in plain text;',
              'Firebase Storage access controls for uploaded files;',
              'Role-based access controls within the platform; and',
              'Regular review of security practices.',
            ].map((t,i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
          <p style={S.p}>Despite these measures, no internet transmission is 100% secure. You are responsible for maintaining the security of your login credentials.</p>
        </div>

        {/* §10 Cookies */}
        <div style={S.card} id="p10">
          <h2 style={S.h2}><Num n="10"/> Cookies &amp; Local Storage</h2>
          <p style={S.p}>GigsKenya uses the following technologies to improve your experience:</p>
          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>Technology</th>
                <th style={S.th}>Purpose</th>
                <th style={S.th}>Can You Opt Out?</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Firebase Auth cookies', 'Maintain your logged-in session', 'Yes — log out to clear'],
                ['Browser localStorage', 'Remember UI preferences (e.g., role, tab state)', 'Yes — clear browser data'],
                ['Firebase Analytics', 'Aggregate usage statistics (no personal profiling)', 'Yes — browser settings'],
              ].map(([tech, pur, opt]) => (
                <tr key={tech}>
                  <td style={{ ...S.td, fontWeight: 700 }}>{tech}</td>
                  <td style={S.td}>{pur}</td>
                  <td style={S.td}>{opt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={S.p}>We do not use advertising cookies or track users across other websites.</p>
        </div>

        {/* §11 Children */}
        <div style={S.card} id="p11">
          <h2 style={S.h2}><Num n="11"/> Children's Privacy</h2>
          <p style={S.p}>
            GigsKenya is not directed at, and we do not knowingly collect personal data from, persons under 18 years of age. If you believe a minor has created an account on our platform, please contact us immediately at <a href={`mailto:${LEGAL_EMAIL}`} style={{ color: '#4338CA', fontWeight: 700 }}>{LEGAL_EMAIL}</a> and we will take steps to delete the account and associated data.
          </p>
        </div>

        {/* §12 Changes */}
        <div style={S.card} id="p12">
          <h2 style={S.h2}><Num n="12"/> Changes to This Policy</h2>
          <p style={S.p}>
            We may update this Privacy Policy from time to time. Material changes will be communicated to registered users via email or a prominent in-platform notice at least <strong>14 days</strong> before taking effect. The updated policy will always be accessible at <strong>{PLATFORM_URL}/privacy</strong>.
          </p>
          <p style={S.p}>Continued use of the platform after the effective date of the updated policy constitutes your acceptance of the changes.</p>
        </div>

        {/* §13 Contact DPO */}
        <div style={S.card} id="p13">
          <h2 style={S.h2}><Num n="13"/> Contact &amp; Complaints</h2>
          <p style={S.p}>For any questions or concerns about this Privacy Policy or how your data is handled:</p>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '18px 22px', fontSize: 14, lineHeight: 2, marginBottom: 16 }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>GigsKenya — Data Protection Officer</p>
            <p style={{ margin: 0, color: '#374151' }}>Email: <a href={`mailto:${DPO_EMAIL}`} style={{ color: '#4338CA', fontWeight: 700 }}>{DPO_EMAIL}</a></p>
            <p style={{ margin: 0, color: '#374151' }}>Website: <a href={`https://${PLATFORM_URL}`} style={{ color: '#4338CA', fontWeight: 700 }}>{PLATFORM_URL}</a></p>
            <p style={{ margin: 0, color: '#64748B', fontSize: 12, marginTop: 8 }}>Response time: within 21 days (as required by the Data Protection Act, 2019)</p>
          </div>
          <p style={S.p}>
            If you are not satisfied with our response, you have the right to lodge a complaint with the <strong>Office of the Data Protection Commissioner (ODPC)</strong>:
          </p>
          <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 12, padding: '16px 20px', fontSize: 13, color: '#3730A3', lineHeight: 1.8 }}>
            <p style={{ margin: 0, fontWeight: 700, marginBottom: 4 }}>Office of the Data Protection Commissioner (ODPC)</p>
            <p style={{ margin: 0 }}>Website: <strong>odpc.go.ke</strong></p>
            <p style={{ margin: 0 }}>Location: Nairobi, Kenya</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: '#94A3B8' }}>
          <p>Effective date: <strong>{EFFECTIVE_DATE}</strong> · Last updated: <strong>{EFFECTIVE_DATE}</strong></p>
          <p style={{ marginTop: 8 }}>
            <Link to="/terms" style={{ color: '#4338CA', fontWeight: 600, marginRight: 16 }}>Terms &amp; Conditions →</Link>
            <Link to="/" style={{ color: '#94A3B8' }}>Back to GigsKenya</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
