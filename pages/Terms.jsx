import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const EFFECTIVE_DATE = '8 May 2026';
const CONTACT_EMAIL  = 'info@gigs254.com';
const PLATFORM_NAME  = 'GigsKenya';
const PLATFORM_URL   = 'gigs254.com';

const S = {
  page:    { paddingTop: 64, minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#1a202c' },
  hero:    { background: '#0A0A0A', padding: '52px 24px 44px', textAlign: 'center' },
  wrap:    { maxWidth: 840, margin: '0 auto', padding: '0 16px 80px' },
  card:    { background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: '32px 36px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.04)' },
  h2:      { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: '#1a202c', letterSpacing: '-.02em', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #F0FDF4', display: 'flex', alignItems: 'center', gap: 10 },
  h3:      { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, marginTop: 22 },
  p:       { fontSize: 14, lineHeight: 1.8, color: '#374151', marginBottom: 12 },
  li:      { fontSize: 14, lineHeight: 1.8, color: '#374151', marginBottom: 6 },
  badge:   { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, letterSpacing: '.04em' },
  tbl:     { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 },
  th:      { background: '#F0FDF4', padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: '#15803D', borderBottom: '2px solid #BBF7D0' },
  td:      { padding: '10px 14px', borderBottom: '1px solid #F1F5F9', color: '#374151', verticalAlign: 'top' },
};

function Num({ n }) {
  return <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#F0FDF4', color: '#15803D', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>;
}

function Chip({ label, color = '#15803D', bg = '#F0FDF4' }) {
  return <span style={{ ...S.badge, background: bg, color }}>{label}</span>;
}

export default function Terms() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={S.page}>
      {/* Hero */}
      <div style={S.hero}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Legal</p>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: 'white', letterSpacing: '-.03em', marginBottom: 12 }}>Terms &amp; Conditions</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', maxWidth: 520, margin: '0 auto 16px' }}>
          These terms govern your use of {PLATFORM_NAME}. Please read them carefully before creating an account.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Chip label="Effective: 8 May 2026" color="rgba(255,255,255,.6)" bg="rgba(255,255,255,.08)" />
          <Chip label="Governed by Laws of Kenya" color="rgba(255,255,255,.6)" bg="rgba(255,255,255,.08)" />
        </div>
      </div>

      <div style={{ ...S.wrap, paddingTop: 32 }}>

        {/* Navigation */}
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 24px', marginBottom: 24, fontSize: 13 }}>
          <p style={{ fontWeight: 700, color: '#1a202c', marginBottom: 10, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#94A3B8' }}>Jump to section</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px' }}>
            {['About GigsKenya','Eligibility','Accounts','Platform Role','Talent Terms','Hirer Terms','Prohibited Conduct','Content & IP','Payments','Data Protection','Dispute Resolution','Liability','Governing Law','Contact'].map((s, i) => (
              <a key={i} href={`#s${i+1}`} style={{ color: '#16A34A', textDecoration: 'none', fontWeight: 600, lineHeight: 2 }}>§{i+1} {s}</a>
            ))}
          </div>
        </div>

        {/* §1 About GigsKenya */}
        <div style={S.card} id="s1">
          <h2 style={S.h2}><Num n="1"/> About GigsKenya</h2>
          <p style={S.p}>
            GigsKenya ("<strong>{PLATFORM_NAME}</strong>", "<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") is an online marketplace that connects independent freelancers ("Talent") with individuals and businesses seeking services ("Hirers") across Kenya and the East African region.
          </p>
          <p style={S.p}>
            GigsKenya is operated as a digital platform accessible at <strong>{PLATFORM_URL}</strong>. By creating an account or using any part of the platform, you agree to be bound by these Terms and Conditions ("Terms"), our Privacy Policy, and any additional guidelines or policies we may publish from time to time.
          </p>
          <p style={S.p}>
            These Terms constitute a legally binding agreement between you and GigsKenya. If you do not agree with any part of these Terms, you must not use the platform.
          </p>
        </div>

        {/* §2 Eligibility */}
        <div style={S.card} id="s2">
          <h2 style={S.h2}><Num n="2"/> Eligibility</h2>
          <p style={S.p}>To use GigsKenya you must:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'Be at least 18 years of age;',
              'Be legally capable of entering into a binding contract under the laws of Kenya;',
              'Not be a person barred from using online services under applicable Kenyan law;',
              'Provide accurate, truthful, and complete information when registering; and',
              'Comply with all applicable national and county government laws and regulations of Kenya.',
            ].map((t, i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
          <p style={S.p}>
            GigsKenya is primarily intended for persons residing or operating in Kenya. International users may access the platform but must comply with the laws of their own jurisdiction in addition to these Terms.
          </p>
          <p style={{ ...S.p, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#991B1B' }}>
            <strong>Important:</strong> If you register on behalf of a business or organisation, you represent and warrant that you have authority to bind that entity to these Terms and that the entity is duly registered and compliant with the Business Registration Service Act, 2015 (Kenya) or any other applicable legislation.
          </p>
        </div>

        {/* §3 Account Registration */}
        <div style={S.card} id="s3">
          <h2 style={S.h2}><Num n="3"/> Account Registration &amp; Security</h2>
          <h3 style={S.h3}>3.1 Registration</h3>
          <p style={S.p}>You must register for an account to access most features of GigsKenya. You agree to provide accurate, current, and complete information during registration, and to update such information to keep it accurate, current, and complete at all times.</p>
          <h3 style={S.h3}>3.2 Account Security</h3>
          <p style={S.p}>You are responsible for maintaining the confidentiality of your login credentials. You must immediately notify us at <strong>{CONTACT_EMAIL}</strong> if you suspect any unauthorised use of your account. GigsKenya will not be liable for any loss or damage arising from your failure to protect your credentials.</p>
          <h3 style={S.h3}>3.3 One Account Per User</h3>
          <p style={S.p}>Each person may only hold one active account per role (Talent or Hirer). Creating multiple accounts to circumvent bans, limits, or policies is prohibited and may result in permanent suspension.</p>
          <h3 style={S.h3}>3.4 Role Selection</h3>
          <p style={S.p}>At registration you choose one role: <strong>Talent</strong> or <strong>Hirer</strong>. Roles cannot be changed after registration. If you need to switch roles, contact us at <strong>{CONTACT_EMAIL}</strong>. Your role determines which terms in §5 and §6 apply to you.</p>
        </div>

        {/* §4 Platform Role */}
        <div style={S.card} id="s4">
          <h2 style={S.h2}><Num n="4"/> The Platform's Role — What We Are and Are Not</h2>
          <p style={S.p}>
            GigsKenya is a <strong>marketplace and communications platform only</strong>. We connect Talent and Hirers but we are not a party to any agreement, contract, or transaction entered into between them.
          </p>
          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>GigsKenya IS</th>
                <th style={S.th}>GigsKenya IS NOT</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['A marketplace connecting Talent and Hirers','An employer of any Talent listed on the platform'],
                ['A communications tool for direct contact','A staffing agency or employment bureau'],
                ['A discovery platform for freelance services','A guarantor of the quality or delivery of services'],
                ['A free-to-use listing service','A payment processor or escrow service'],
                ['A platform governed by Kenyan law','A party to any contract between users'],
              ].map(([a, b], i) => (
                <tr key={i}>
                  <td style={S.td}>✔ {a}</td>
                  <td style={S.td}>✘ {b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={S.p}>
            All contracts for services are formed directly between the Talent and the Hirer. GigsKenya is not involved in negotiations, service delivery, or payments between users.
          </p>
        </div>

        {/* §5 Talent Terms */}
        <div style={S.card} id="s5">
          <h2 style={S.h2}><Num n="5"/> Talent-Specific Terms</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: '#FEF3C7', color: '#D97706', fontSize: 12, fontWeight: 700, marginBottom: 18 }}>✦ Applies to Talent / Freelancer accounts</div>

          <h3 style={S.h3}>5.1 Independent Contractor Status</h3>
          <p style={S.p}>
            You are an <strong>independent contractor</strong>, not an employee, agent, partner, or joint venture of GigsKenya. Nothing in these Terms shall create any employment, partnership, or agency relationship between you and GigsKenya. You retain full control over how you perform services for Hirers.
          </p>
          <p style={{ ...S.p, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', color: '#92400E' }}>
            <strong>Note:</strong> Whether you are an employee or an independent contractor of a Hirer is determined by the facts of your arrangement with that Hirer, not by GigsKenya's classification. Where applicable, the <em>Employment Act, 2007 (Cap. 226)</em> and associated regulations may govern your working relationship with a Hirer.
          </p>

          <h3 style={S.h3}>5.2 Tax Obligations</h3>
          <p style={S.p}>
            As a self-employed individual or freelancer operating in Kenya, you are solely responsible for:
          </p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'Registering with the Kenya Revenue Authority (KRA) and obtaining a Personal Identification Number (PIN);',
              'Filing annual income tax returns under the Income Tax Act (Cap. 470);',
              'Paying any applicable taxes on income earned through the platform, including withholding tax where applicable;',
              'Compliance with the Digital Service Tax provisions where relevant; and',
              'Any VAT obligations if your annual taxable supplies exceed the registration threshold.',
            ].map((t, i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
          <p style={S.p}>GigsKenya does not withhold or remit taxes on your behalf. You are strongly encouraged to consult a qualified tax professional or visit <strong>kra.go.ke</strong> for guidance.</p>

          <h3 style={S.h3}>5.3 NSSF &amp; NHIF / SHIF</h3>
          <p style={S.p}>
            Self-employed freelancers are encouraged to register voluntarily with the National Social Security Fund (NSSF) and the Social Health Insurance Fund (SHIF, formerly NHIF) in accordance with the NSSF Act, 2013 and the Social Health Insurance Act, 2023. GigsKenya does not make these contributions on your behalf.
          </p>

          <h3 style={S.h3}>5.4 Professional Accuracy &amp; Misrepresentation</h3>
          <p style={S.p}>You must ensure your profile is accurate, honest, and up-to-date. You must not:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'Falsely claim qualifications, certifications, or professional memberships you do not hold;',
              'Use another person\'s identity, photo, or credentials;',
              'Inflate your experience, portfolio, or past client base; or',
              'List services you are not qualified or legally permitted to provide (e.g., unlicensed legal, medical, or financial advice).',
            ].map((t, i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>

          <h3 style={S.h3}>5.5 Service Delivery</h3>
          <p style={S.p}>
            Once you accept a contract from a Hirer (whether verbally, via message, or in writing), you are bound by the terms agreed with that Hirer. Persistent failure to deliver agreed services may result in reports, negative ratings, and removal from the platform.
          </p>

          <h3 style={S.h3}>5.6 Licences &amp; Regulatory Compliance</h3>
          <p style={S.p}>
            Certain categories of services (e.g., legal advice, medical services, financial planning, engineering, architecture) require professional licences in Kenya. You must hold all required licences and comply with the relevant regulatory body's code of conduct (e.g., Law Society of Kenya, Kenya Medical Practitioners and Dentists Council, Engineers Board of Kenya).
          </p>
        </div>

        {/* §6 Hirer Terms */}
        <div style={S.card} id="s6">
          <h2 style={S.h2}><Num n="6"/> Hirer-Specific Terms</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: '#F0FDF4', color: '#15803D', fontSize: 12, fontWeight: 700, marginBottom: 18 }}>◈ Applies to Hirer / Client accounts</div>

          <h3 style={S.h3}>6.1 Accurate Job Postings</h3>
          <p style={S.p}>All job advertisements you post must be genuine, accurate, and lawful. You must not post misleading, fake, or discriminatory listings. Listings that violate any provision of the <em>National Cohesion and Integration Act, 2008</em> — including discrimination based on ethnicity, race, gender, disability, religion, or social origin — are strictly prohibited and constitute grounds for immediate account termination.</p>

          <h3 style={S.h3}>6.2 Non-Discrimination</h3>
          <p style={S.p}>You must not discriminate against Talent on the basis of:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {['Race, ethnicity, tribe, or nationality','Religion or belief','Gender or marital status','Disability or health status','Age (subject to eligibility requirements)','Political affiliation','HIV/AIDS status (prohibited under the HIV and AIDS Prevention and Control Act, 2006)'].map((t,i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>

          <h3 style={S.h3}>6.3 Employment Law Compliance</h3>
          <p style={S.p}>
            If your engagement with a Talent transitions into an employment relationship (as defined under the <em>Employment Act, 2007</em>), you are fully responsible for compliance with all applicable employment laws, including but not limited to: written contracts, minimum wage requirements under the Regulation of Wages Orders, NSSF contributions, SHIF contributions, PAYE deductions, and leave entitlements.
          </p>
          <p style={S.p}>GigsKenya is not responsible for, and has no visibility into, any employment arrangements that may arise from connections made on the platform.</p>

          <h3 style={S.h3}>6.4 Timely Payment</h3>
          <p style={S.p}>
            You are solely responsible for honouring any payment agreed with a Talent. GigsKenya does not process payments between users. Failure to pay for delivered services may expose you to legal liability under general contract law as applied in Kenya. We encourage all Hirers to use written agreements or purchase orders before work commences.
          </p>

          <h3 style={S.h3}>6.5 Business Users</h3>
          <p style={S.p}>
            If you are a business hiring through GigsKenya, you warrant that your business is duly registered under the <em>Business Registration Service Act, 2015</em> (or equivalent legislation) and that you have the authority to engage freelance services in connection with your business operations.
          </p>

          <h3 style={S.h3}>6.6 Vetting Responsibility</h3>
          <p style={S.p}>
            GigsKenya does not verify the credentials, qualifications, background, or identity of Talent. You are solely responsible for conducting your own due diligence — including verifying qualifications, requesting references, and performing background checks as appropriate — before engaging any Talent.
          </p>
        </div>

        {/* §7 Prohibited Conduct */}
        <div style={S.card} id="s7">
          <h2 style={S.h2}><Num n="7"/> Prohibited Conduct</h2>
          <p style={S.p}>The following are prohibited on GigsKenya and may result in immediate account suspension, permanent ban, and where required, reporting to relevant authorities:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'Fraud, misrepresentation, or any attempt to deceive other users or GigsKenya;',
              'Posting or sharing content that is defamatory, obscene, pornographic, or otherwise unlawful under the Computer Misuse and Cybercrimes Act, 2018 (No. 5 of 2018);',
              'Harassment, bullying, threats, or intimidation of any user;',
              'Posting content that promotes or incites hate speech, violence, or discrimination in violation of the National Cohesion and Integration Act, 2008;',
              'Soliciting payments outside the agreed terms or demanding advance payments without service delivery;',
              'Creating fake reviews, ratings, or endorsements;',
              'Attempting to circumvent platform features (e.g., creating multiple accounts after a ban);',
              'Scraping, copying, or reproducing platform content without express written consent;',
              'Using the platform to conduct any activity in violation of the Proceeds of Crime and Anti-Money Laundering Act, 2009;',
              'Sharing or uploading content that infringes the intellectual property rights of any third party;',
              'Using the platform for spam, phishing, or unsolicited commercial communications; and',
              'Any conduct that GigsKenya, in its reasonable discretion, determines is harmful to the platform, its users, or the public.',
            ].map((t,i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
        </div>

        {/* §8 Content & IP */}
        <div style={S.card} id="s8">
          <h2 style={S.h2}><Num n="8"/> Content &amp; Intellectual Property</h2>
          <h3 style={S.h3}>8.1 Your Content</h3>
          <p style={S.p}>You retain ownership of all content you post on GigsKenya (including profile information, portfolio items, and job listings). By posting content, you grant GigsKenya a non-exclusive, royalty-free, worldwide licence to use, display, and reproduce that content solely for the purpose of operating and promoting the platform.</p>
          <h3 style={S.h3}>8.2 GigsKenya's IP</h3>
          <p style={S.p}>All intellectual property rights in the GigsKenya platform, brand, logo, design, and software belong to GigsKenya. You may not copy, modify, distribute, or create derivative works from any part of the platform without our express written consent.</p>
          <h3 style={S.h3}>8.3 Work Product</h3>
          <p style={S.p}>Ownership of work created by Talent for a Hirer is governed exclusively by the contract between those two parties. GigsKenya has no claim over any work product created through engagements on the platform.</p>
        </div>

        {/* §9 Payments */}
        <div style={S.card} id="s9">
          <h2 style={S.h2}><Num n="9"/> Payments &amp; Fees</h2>
          <p style={S.p}>Creating a profile and posting listings is Free. GigsKenya does not facilitate payments between users and is not party to any transaction.</p>
          <p style={S.p}>All payments are negotiated and transacted directly between Talent and Hirers through their preferred means (M-Pesa, bank transfer, cash, etc.). GigsKenya is not a payment processor, does not hold funds, and is not liable for payment disputes.</p>
          <p style={{ ...S.p, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', color: '#1e40af' }}>
            <strong>Best Practice:</strong> We strongly recommend that all parties agree on payment terms in writing (via message or a formal contract) before work begins, and that Hirers do not pay the full amount upfront before receiving satisfactory work.
          </p>
          <p style={S.p}>GigsKenya reserves the right to introduce premium features or paid plans in the future. Users will be given reasonable notice before any charges apply.</p>
        </div>

        {/* §10 Data Protection */}
        <div style={S.card} id="s10">
          <h2 style={S.h2}><Num n="10"/> Data Protection &amp; Privacy</h2>
          <p style={S.p}>
            GigsKenya collects and processes personal data in accordance with the <em>Data Protection Act, 2019 (Act No. 24 of 2019)</em> of Kenya and the regulations made thereunder, including the Data Protection (General) Regulations, 2021.
          </p>
          <p style={S.p}>By using the platform you consent to the collection, processing, and storage of your personal data as described in our <Link to="/privacy" style={{ color: '#16A34A', fontWeight: 700 }}>Privacy Policy</Link>, which forms part of these Terms.</p>
          <p style={S.p}>Key data protection principles we observe:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'Your data is collected for specified, explicit, and legitimate purposes;',
              'We process only the minimum data necessary for the platform to function;',
              'We do not sell your personal data to third parties;',
              'You may exercise your rights under the Act, including the right to access, correct, delete, or object to processing of your data; and',
              'We maintain appropriate technical and organisational security measures to protect your data.',
            ].map((t, i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
          <p style={S.p}>
            Complaints relating to data protection may be directed to our Data Protection Officer at <strong>{CONTACT_EMAIL}</strong> or to the <strong>Office of the Data Protection Commissioner (ODPC)</strong> at <strong>odpc.go.ke</strong>.
          </p>
        </div>

        {/* §11 Dispute Resolution */}
        <div style={S.card} id="s11">
          <h2 style={S.h2}><Num n="11"/> Dispute Resolution</h2>
          <h3 style={S.h3}>11.1 Between Users</h3>
          <p style={S.p}>GigsKenya is not a party to disputes between Talent and Hirers. We encourage users to resolve disputes amicably and in good faith. Where a dispute cannot be resolved directly, parties may consider:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'Mediation through a recognised Kenyan Alternative Dispute Resolution body;',
              'The Business Disputes Tribunal where applicable; or',
              'Litigation before the competent courts of Kenya.',
            ].map((t,i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
          <h3 style={S.h3}>11.2 With GigsKenya</h3>
          <p style={S.p}>Any dispute between you and GigsKenya shall first be referred to good-faith negotiations. If unresolved within 30 days, the dispute shall be submitted to binding arbitration under the Arbitration Act, 1995 (Cap. 4A) of Kenya, with the seat of arbitration in Nairobi. The arbitration shall be conducted in English.</p>
          <h3 style={S.h3}>11.3 Platform Reports</h3>
          <p style={S.p}>If you believe another user has violated these Terms, you may use the "Report" feature on any listing or profile. GigsKenya will review reports and take appropriate action at its sole discretion, including removing content or suspending accounts.</p>
        </div>

        {/* §12 Liability */}
        <div style={S.card} id="s12">
          <h2 style={S.h2}><Num n="12"/> Limitation of Liability</h2>
          <p style={S.p}>To the maximum extent permitted by applicable Kenyan law:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'GigsKenya provides the platform "as is" and "as available" without warranties of any kind, express or implied;',
              'GigsKenya is not liable for the quality, safety, legality, or delivery of services arranged through the platform;',
              'GigsKenya is not liable for any loss or damage arising from reliance on information posted by users;',
              'GigsKenya\'s total aggregate liability to any user in connection with these Terms shall not exceed KES 5,000 (five thousand Kenya shillings); and',
              'GigsKenya is not liable for any indirect, incidental, special, consequential, or punitive damages.',
            ].map((t,i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
          <p style={S.p}>Nothing in these Terms limits liability that cannot be excluded under the <em>Consumer Protection Act, 2012</em> or any other mandatory Kenyan law.</p>
        </div>

        {/* §13 Governing Law */}
        <div style={S.card} id="s13">
          <h2 style={S.h2}><Num n="13"/> Governing Law &amp; Jurisdiction</h2>
          <p style={S.p}>These Terms and any disputes arising from or related to them shall be governed by and construed in accordance with the <strong>laws of the Republic of Kenya</strong>.</p>
          <p style={S.p}>Subject to the arbitration clause in §11.2, the parties submit to the exclusive jurisdiction of the courts of Kenya, with Nairobi as the preferred seat.</p>
          <p style={S.p}>The following Kenyan statutes are particularly relevant to use of this platform:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            {[
              'Data Protection Act, 2019 (No. 24 of 2019)',
              'Computer Misuse and Cybercrimes Act, 2018 (No. 5 of 2018)',
              'Employment Act, 2007 (Cap. 226)',
              'Income Tax Act (Cap. 470)',
              'Consumer Protection Act, 2012',
              'National Cohesion and Integration Act, 2008',
              'Arbitration Act, 1995 (Cap. 4A)',
              'Law of Contract Act (Cap. 23)',
              'Proceeds of Crime and Anti-Money Laundering Act, 2009',
              'HIV and AIDS Prevention and Control Act, 2006',
              'Business Registration Service Act, 2015',
              'Social Health Insurance Act, 2023',
              'NSSF Act, 2013',
            ].map((t,i) => <li key={i} style={S.li}>{t}</li>)}
          </ul>
        </div>

        {/* §14 Amendments */}
        <div style={S.card} id="s14">
          <h2 style={S.h2}><Num n="14"/> Amendments &amp; Updates</h2>
          <p style={S.p}>GigsKenya reserves the right to update or modify these Terms at any time. Where changes are material, we will notify registered users via email or a prominent notice on the platform at least <strong>14 days</strong> before the changes take effect.</p>
          <p style={S.p}>Continued use of the platform after the effective date of any update constitutes your acceptance of the revised Terms. If you do not agree with revised Terms, you must deactivate your account before the effective date.</p>
        </div>

        {/* §15 Contact */}
        <div style={S.card} id="s15">
          <h2 style={S.h2}><Num n="15"/> Contact Us</h2>
          <p style={S.p}>For questions, concerns, or legal notices relating to these Terms, please contact:</p>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '18px 22px', fontSize: 14, lineHeight: 2 }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>GigsKenya — Legal &amp; Compliance</p>
            <p style={{ margin: 0, color: '#374151' }}>Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#16A34A', fontWeight: 700 }}>{CONTACT_EMAIL}</a></p>
            <p style={{ margin: 0, color: '#374151' }}>Website: <a href={`https://${PLATFORM_URL}`} style={{ color: '#16A34A', fontWeight: 700 }}>{PLATFORM_URL}</a></p>
            <p style={{ margin: 0, color: '#64748B', fontSize: 12, marginTop: 8 }}>We aim to respond to all legal queries within 5 business days.</p>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: '#94A3B8' }}>
          <p>Effective date: <strong>{EFFECTIVE_DATE}</strong> · Last updated: <strong>{EFFECTIVE_DATE}</strong></p>
          <p style={{ marginTop: 8 }}>
            <Link to="/privacy" style={{ color: '#16A34A', fontWeight: 600, marginRight: 16 }}>Privacy Policy →</Link>
            <Link to="/" style={{ color: '#94A3B8' }}>Back to GigsKenya</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
