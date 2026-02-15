import React from 'react';
import Layout from '@/component/Layout';

const TERMS_SECTIONS = [
  {
    title: null,
    body: `Fidelity Traders Hub ("we", "our", "us") is an independent digital service provider established to facilitate access to trading tools, digital subscriptions, and proprietary trading firm account processing. We are not the owner, creator, or official distributor of the third-party platforms we provide access to.`,
  },
  {
    title: 'Scope of Services',
    body: `Our services may include, but are not limited to, TradingView subscriptions, proprietary trading firm accounts, FXReplay, Canva, CapCut, Netflix, Scribd, Zoom, and other digital products or software subscriptions. All trademarks, company names, and platform rights belong to their respective owners.`,
  },
  {
    title: 'No Official Affiliation',
    body: `Fidelity Traders Hub is not affiliated with, endorsed by, partnered with, or officially connected to TradingView, any proprietary trading firm, FXReplay, Canva, CapCut, Netflix, Scribd, Zoom, or any other third-party platform unless explicitly stated. We operate strictly as a third-party facilitator to help users access these services at competitive and affordable rates.`,
  },
  {
    title: 'Proprietary Trading Firm Accounts',
    body: `All proprietary trading firm accounts processed through our platform are owned by independent third parties. We do not create, fund, manage, or control any prop firm accounts. Buyers and sellers are solely responsible for complying with the terms and policies of the respective prop firm. We shall not be liable for account suspensions, rule violations, funding loss, or termination resulting from user actions.`,
  },
  {
    title: 'Digital Subscriptions & Software Services',
    body: `For all digital subscriptions and software services (including Prop Firm accounts, TradingView, FXReplay, Canva, CapCut, Netflix, Scribd, Zoom, and others), users understand and agree that:`,
    bullets: [
      'Access is subject to the policies and terms of the original platform provider.',
      'Service interruptions, account restrictions, password changes, regional limitations, or policy updates are beyond our control.',
      'We do not control platform updates, bans, subscription modifications, or account limitations imposed by the original provider.',
    ],
  },
  {
    title: 'No Financial Advice',
    body: `We do not provide financial advice, investment advice, trading signals, or profit guarantees. All trading and financial decisions remain the sole responsibility of the user.`,
  },
  {
    title: 'Assumption of Risk',
    body: `By purchasing or using our services, you acknowledge that digital products and subscription-based services carry certain risks, including suspension, policy enforcement, or changes made by the original platform provider. Fidelity Traders Hub shall not be responsible for losses, damages, or interruptions arising from third-party platform decisions.`,
  },
  {
    title: 'Indemnification',
    body: `Users agree to indemnify and hold harmless Fidelity Traders Hub from any claims, liabilities, disputes, losses, or legal actions arising from misuse of accounts, violation of third-party platform policies, fraudulent activity, or breach of terms by the user.`,
  },
  {
    title: 'Right to Refuse Service',
    body: `We reserve the right to refuse service, cancel transactions, or suspend access if fraudulent, suspicious, or abusive activity is detected.`,
  },
  {
    title: 'Payments & Refunds',
    body: `All payments made for digital services are considered final unless otherwise stated. Refund eligibility, where applicable, shall be subject to our internal review and policies.`,
  },
  {
    title: 'Changes to Terms',
    body: `We reserve the right to update or modify these Terms & Conditions at any time without prior notice. Continued use of our services constitutes acceptance of any updated terms.`,
  },
  {
    title: 'Governing Law',
    body: `This agreement shall be governed and interpreted in accordance with the laws of the Federal Republic of Nigeria.`,
  },
];

const Terms = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#0E1A1F] to-black py-20 px-5 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-14">
            <span className="inline-block text-[#C8F904] text-xs font-bold tracking-widest uppercase px-4 py-2 bg-[#C8F904]/10 rounded-full border border-[#C8F904]/20 mb-6">
              Legal
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Terms &amp; <span className="text-[#6967FB]">Conditions</span>
            </h1>
            <p className="text-white/50 text-sm">
              Effective date: January 1, 2022 &nbsp;·&nbsp; Fidelity Traders Hub
            </p>
          </div>

          {/* Intro banner */}
          <div className="bg-[#6967FB]/10 border border-[#6967FB]/20 rounded-2xl px-6 py-5 mb-12">
            <p className="text-white/80 leading-relaxed text-sm">
              Please read these Terms &amp; Conditions carefully before using our platform. By accessing or purchasing
              any service from Fidelity Traders Hub, you agree to be bound by these terms.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {TERMS_SECTIONS.map((section, idx) => (
              <div key={idx} className="border-b border-white/8 pb-10 last:border-0">
                {section.title && (
                  <h2 className="text-lg font-bold text-[#C8F904] mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C8F904]/10 border border-[#C8F904]/20 flex items-center justify-center text-xs font-black text-[#C8F904]">
                      {idx}
                    </span>
                    {section.title}
                  </h2>
                )}
                {section.body && (
                  <p className="text-white/70 leading-relaxed text-sm">{section.body}</p>
                )}
                {section.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6967FB] shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-16 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-center">
            <p className="text-white/50 text-sm">
              Questions about these terms?{' '}
              <a
                href="https://wa.me/+2348035823744"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6967FB] hover:text-[#C8F904] transition-colors font-medium"
              >
                Contact us on WhatsApp
              </a>
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Terms;