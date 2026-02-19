import React from 'react';
import Layout from '@/component/Layout';

const PRIVACY_SECTIONS = [
  {
    title: 'Introduction',
    body: `Fidelity Traders Hub ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform or purchase our services. By using our platform, you consent to the practices described in this policy.`,
  },
  {
    title: 'Information We Collect',
    body: `We may collect the following types of information when you interact with our platform:`,
    bullets: [
      'Contact information: name, phone number, and messaging handles (e.g. WhatsApp) you provide when placing an order.',
      'Transaction information: details of services purchased, payment confirmations, and order history.',
      'Device & usage data: browser type, IP address, pages visited, and time spent on our platform (collected automatically via cookies or analytics tools).',
      'Communications: messages, inquiries, or feedback you send to us via WhatsApp or any other channel.',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: `We use the information we collect for the following purposes:`,
    bullets: [
      'To process and fulfil your orders and deliver purchased services.',
      'To communicate with you regarding your order status, updates, or support requests.',
      'To improve our platform, products, and customer experience.',
      'To detect, prevent, and address fraud or misuse of our services.',
      'To comply with applicable legal obligations.',
    ],
  },
  {
    title: 'Sharing of Information',
    body: `We do not sell, trade, or rent your personal information to third parties. We may share information only in the following limited circumstances:`,
    bullets: [
      'Service delivery: where necessary to fulfil an order, such as communicating account credentials from a third-party provider.',
      'Legal compliance: when required by law, court order, or government authority.',
      'Business protection: to protect the rights, property, or safety of Fidelity Traders Hub, our users, or others.',
    ],
  },
  {
    title: 'Data Retention',
    body: `We retain your personal information for as long as necessary to fulfil the purposes described in this policy, or as required by law. Order and transaction records may be kept for a minimum of 12 months for dispute resolution and business records.`,
  },
  {
    title: 'Cookies & Tracking',
    body: `Our platform may use cookies and similar tracking technologies to enhance your browsing experience and collect usage analytics. You may configure your browser to refuse cookies; however, some features of our platform may not function correctly without them.`,
  },
  {
    title: 'Third-Party Platforms',
    body: `Our services involve third-party platforms such as TradingView, Netflix, Canva, CapCut, Scribd, Zoom, FXReplay, and prop trading firms. When you access services from these platforms, their own privacy policies and data practices apply. We are not responsible for the privacy practices of any third-party service.`,
  },
  {
    title: 'Security',
    body: `We take reasonable technical and organisational measures to protect your personal information against unauthorised access, disclosure, or misuse. However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security and encourage you to use strong, unique passwords and keep your account credentials confidential.`,
  },
  {
    title: `Children's Privacy`,
    body: `Our services are not directed at individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with their information, please contact us immediately and we will take steps to remove such information.`,
  },
  {
    title: 'Your Rights',
    body: `Depending on your jurisdiction, you may have the following rights regarding your personal data:`,
    bullets: [
      'The right to access the personal information we hold about you.',
      'The right to request correction of inaccurate or incomplete data.',
      'The right to request deletion of your personal data, subject to legal obligations.',
      'The right to withdraw consent where processing is based on consent.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: `We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with an updated effective date. Continued use of our platform after changes constitutes your acceptance of the revised policy.`,
  },
  {
    title: 'Contact Us',
    body: `If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us via WhatsApp or through our official communication channels. We are committed to addressing your inquiries promptly.`,
  },
];

const Privacy = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-white py-20 px-5 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-14">
            <span className="inline-block text-[#C8F904] text-xs font-bold tracking-widest uppercase px-4 py-2 bg-[#C8F904]/10 rounded-full border border-[#C8F904]/30 mb-6">
              Legal
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Privacy <span className="text-[#6967FB]">Policy</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Effective date: January 1, 2022 &nbsp;·&nbsp; Fidelity Traders Hub
            </p>
          </div>

          {/* Intro banner */}
          <div className="bg-[#6967FB]/5 border border-[#6967FB]/25 rounded-2xl px-6 py-5 mb-12">
            <p className="text-gray-700 leading-relaxed text-sm">
              Your privacy matters to us. This policy explains clearly how we collect, use, and protect
              your personal information. We do not sell your data to third parties.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {PRIVACY_SECTIONS.map((section, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-10 last:border-0">
                <h2 className="text-lg font-bold text-[#C8F904] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#C8F904]/10 border border-[#C8F904]/30 flex items-center justify-center text-xs font-black text-[#C8F904]">
                    {idx + 1}
                  </span>
                  {section.title}
                </h2>
                {section.body && (
                  <p className="text-gray-700 leading-relaxed text-sm">{section.body}</p>
                )}
                {section.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
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
          <div className="mt-16 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-center">
            <p className="text-gray-600 text-sm">
              Questions about this policy?{' '}
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

export default Privacy;