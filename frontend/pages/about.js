import Layout from '@/component/Layout';
import React, { useEffect, useState } from 'react';

const SERVICES = [
  { icon: '📊', label: 'FXReplay' },
  { icon: '🎨', label: 'Canva' },
  { icon: '✂️', label: 'CapCut' },
  { icon: '📹', label: 'Zoom' },
  { icon: '🎬', label: 'Netflix' },
  { icon: '📚', label: 'Scribd' },
];

const AboutUs = () => {
  // Still fetch so imageUrl and updatedAt can be used from the API
  const [about, setAbout] = useState(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/about`);
        if (!res.ok) return;
        const data = await res.json();
        setAbout(data);
      } catch {
        // silently ignore — static content is shown regardless
      }
    };
    fetchAbout();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0E1A1F] via-[#111827] to-black">

        {/* ── HERO: two-column ── */}
        <div className="px-5 sm:px-8 lg:px-16 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

            {/* ── LEFT ── */}
            <div className="flex-1 w-full">

              {/* Badge */}
              <div className="flex items-center gap-2 mb-8">
                <span className="text-[#C8F904] text-lg">⚡</span>
                <span className="text-[#C8F904] text-xs font-bold tracking-widest uppercase">
                  Who We Are
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                <span className="text-white">FidelityTradersHub</span>
                <br />
                <span className="text-[#6967FB]">Builds Access</span>
                <br />
                <span className="text-white">&amp; </span>
                <span className="text-[#C8F904]">Opportunity</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
                Making premium trading tools and digital services accessible to everyone in Nigeria —
                without dollar cards or international payment barriers.
              </p>

              {/* Founded badge */}
              <div className="flex items-center gap-3 mb-10">
                <span className="bg-[#6967FB]/20 border border-[#6967FB]/30 text-[#6967FB] text-xs font-bold px-4 py-2 rounded-full">
                  Founded 2022
                </span>
                <span className="bg-[#C8F904]/10 border border-[#C8F904]/20 text-[#C8F904] text-xs font-bold px-4 py-2 rounded-full">
                  Nigeria 🇳🇬
                </span>
              </div>

              {/* Last updated from API (only shown if available) */}
              {about?.updatedAt && (
                <p className="text-white/25 text-xs">
                  Last updated:{' '}
                  {new Date(about.updatedAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* ── RIGHT: image card ── */}
            <div className="w-full lg:w-[420px] lg:shrink-0">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-3 border border-white/20 shadow-2xl">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#6967FB]/30 to-[#C8F904]/20 aspect-[4/5] flex items-center justify-center">
                  {about?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={about.imageUrl}
                      alt="About FidelityTradersHub"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                      <div className="w-24 h-24 rounded-full bg-[#6967FB]/30 flex items-center justify-center text-5xl">
                        📈
                      </div>
                      <p className="text-white/40 text-sm">FidelityTradersHub</p>
                    </div>
                  )}
                </div>
                <div className="px-4 py-5 text-center">
                  <p className="text-white font-bold text-lg leading-snug">Ready to level up?</p>
                  <p className="text-white/60 text-sm mt-1">Let&apos;s trade and grow together</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── STORY SECTION ── */}
        <div className="px-5 sm:px-8 lg:px-16 pb-16">
          <div className="max-w-4xl mx-auto space-y-8">

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-5">
                Our <span className="text-[#6967FB]">Story</span>
              </h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  Fidelity Traders Hub was founded in 2022 with a clear mission — to bridge the gap between
                  traders and access to essential digital tools and funded trading opportunities.
                </p>
                <p>
                  We identified a major challenge within the trading community: payment restrictions, high
                  subscription costs, and limited access to premium platforms like TradingView. Many traders
                  desire these tools to improve their market analysis and performance but face difficulties
                  accessing them at affordable rates. Our goal from the beginning has been to make these tools
                  more accessible, affordable, and reliable.
                </p>
                <p>
                  Fidelity Traders Hub provides discounted access to TradingView subscriptions, including
                  Premium and Essential plans, helping traders overcome payment barriers while maintaining
                  quality service and trust.
                </p>
                <p>
                  We also facilitate access to proprietary trading firm (Prop Firm) accounts. Many traders win
                  funded accounts through legitimate giveaways or programs but may not utilise them, while
                  others are actively seeking funded opportunities to accelerate their trading careers. We help
                  bridge this gap by professionally processing and connecting traders in a structured and
                  transparent manner.
                </p>
              </div>
            </div>

            {/* Services grid */}
            <div>
              <h3 className="text-lg font-bold text-[#C8F904] mb-5">
                Additional Digital Tools We Offer
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SERVICES.map((s) => (
                  <div key={s.label}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 hover:border-[#6967FB]/40 transition-all">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-white/80 text-sm font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission statement */}
            <div className="bg-[#6967FB]/10 border border-[#6967FB]/20 rounded-2xl px-6 py-6">
              <p className="text-white/80 leading-relaxed text-sm mb-3">
                Our platform is built on reliability, transparency, and customer satisfaction. Every service
                we provide is handled with professionalism and a strong commitment to trust.
              </p>
              <p className="text-white/80 leading-relaxed text-sm mb-4">
                At Fidelity Traders Hub, we believe success in trading and business starts with access to
                the right tools and opportunities.
              </p>
              <p className="text-[#C8F904] font-bold text-sm">
                Fidelity Traders Hub — Where Traders Meet Possibilities
              </p>
            </div>

          </div>
        </div>

        {/* ── PROMISE SECTION ── */}
        <div className="px-5 sm:px-8 lg:px-16 pb-24">
          <div className="max-w-7xl mx-auto bg-white/5 rounded-3xl p-8 lg:p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-10 text-center">
              Our Promise to You
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: '₦',  bg: 'bg-[#6967FB]/20', title: 'Pay in Naira',    desc: 'Local payments, no conversion stress.' },
                { icon: '⚡', bg: 'bg-[#C8F904]/20', title: 'Instant Access',  desc: 'Get started within minutes.'           },
                { icon: '🛡️',bg: 'bg-[#6967FB]/20', title: 'Trusted Support', desc: '24/7 help when you need it.'           },
              ].map((item) => (
                <div key={item.title}>
                  <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-5`}>
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AboutUs;