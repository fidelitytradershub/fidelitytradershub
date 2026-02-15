'use client';

import Footer from "@/component/Footer";
import Header from "@/component/Header";
import Link from "next/link";
import { useState } from "react";

// ── Replace with your actual numbers ──────────────────────────
const WA_SUPPORT   = '+2348035823744'; // trade / support line
const WA_COMMUNITY = 'https://chat.whatsapp.com/F00u9rV9jx26kLTmyJtLtB?mode=gi_t'; // community group invite link number
// ─────────────────────────────────────────────────────────────

// ── Crypto Trade Modal ────────────────────────────────────────
const CryptoModal = ({ onClose }) => {
  const [side, setSide]       = useState('buy');   // 'buy' | 'sell'
  const [coin, setCoin]       = useState('');
  const [amount, setAmount]   = useState('');
  const [message, setMessage] = useState('');

  const handleTrade = () => {
    const lines = [
      `Hi! I'd like to *${side.toUpperCase()}* crypto on FidelityTradersHub.`,
      coin   ? `Coin/Token: *${coin}*`     : null,
      amount ? `Amount : *$${amount}*`       : null,
      message? `Additional info: ${message}` : null,
      'Please assist me with this trade. Thank you!',
    ].filter(Boolean);

    const url = `https://wa.me/${WA_SUPPORT}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  // close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-[#0E1A1F] border border-[#FFFFFF]/10 rounded-3xl p-7 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-[#C8F904] font-bold tracking-widest uppercase mb-1">Crypto Trade</p>
            <h2 className="text-xl font-black text-[#FFFFFF]">What would you like to do?</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFFFFF]/5 hover:bg-[#FFFFFF]/10 text-[#FFFFFF]/50 hover:text-[#FFFFFF] transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Buy / Sell toggle */}
        <div className="flex gap-3 mb-6">
          {[
            { key: 'buy',  label: '📈 Buy Crypto',  active: 'bg-[#C8F904] text-[#0E1A1F]'  },
            { key: 'sell', label: '📉 Sell Crypto', active: 'bg-[#6967FB] text-[#FFFFFF]'  },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => setSide(key)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                side === key
                  ? active
                  : 'bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 text-[#FFFFFF]/50 hover:text-[#FFFFFF]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-[#FFFFFF]/50 uppercase tracking-wider mb-2">
              Coin / Token
            </label>
            <input
              type="text"
              placeholder="e.g. Bitcoin, USDT, ETH"
              value={coin}
              onChange={(e) => setCoin(e.target.value)}
              className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/25 focus:outline-none focus:border-[#6967FB] transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#FFFFFF]/50 uppercase tracking-wider mb-2">
              Amount (USD)
            </label>
            <input
              type="text"
              placeholder="e.g. $100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/25 focus:outline-none focus:border-[#6967FB] transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#FFFFFF]/50 uppercase tracking-wider mb-2">
              Additional Info <span className="normal-case font-normal text-[#FFFFFF]/30">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="the network or wallet address you want to use..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/25 focus:outline-none focus:border-[#6967FB] transition-colors resize-none text-sm"
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleTrade}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] ${
            side === 'buy'
              ? 'bg-[#C8F904] text-[#0E1A1F] hover:bg-[#C8F904]/90'
              : 'bg-[#6967FB] text-[#FFFFFF] hover:bg-[#6967FB]/90'
          }`}
        >
          {/* WhatsApp icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Trade Now on WhatsApp
        </button>

      </div>
    </div>
  );
};

// ── Main Landing Page ─────────────────────────────────────────
export default function FidelityLandingPage() {
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);

  // WhatsApp: Get Started Now
  const getStartedWA = () => {
    const msg = encodeURIComponent("Hi! I'd like to get started with FidelityTradersHub. Please guide me on available services. Thank you!");
    window.open(`https://wa.me/${WA_SUPPORT}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp: Join Community
  const joinCommunityWA = () => {
    window.open(`${WA_COMMUNITY}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#0E1A1F] text-[#FFFFFF]">

      {/* Crypto trade modal */}
      {cryptoModalOpen && <CryptoModal onClose={() => setCryptoModalOpen(false)} />}

      {/* Reusable Header Component */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Access Global{' '}
                <span className="text-[#6967FB]">Trading Tools</span>{' '}
                with Ease.
              </h1>

              <p className="text-xl text-[#FFFFFF]/70 mb-8 leading-relaxed">
                Say goodbye to dollar card restrictions. Access prop firm accounts, TradingView,
                fxreplay, and premium trading tools directly from your local account. Secure, fast,
                and built for Nigerian traders.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#C8F904] text-[#0E1A1F] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#C8F904]/90 transition-all hover:scale-105 shadow-lg shadow-[#C8F904]/20 flex items-center justify-center gap-2"
                >
                  View All Services
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Content - Card Display */}
            <div className="relative">
              <div className="bg-[#FFFFFF]/5 rounded-3xl p-8 border border-[#FFFFFF]/10 shadow-2xl shadow-[#6967FB]/10 backdrop-blur-lg">
                {/* Mock Browser Header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                {/* Account Stats */}
                <div className="bg-[#FFFFFF]/5 rounded-2xl p-6 mb-6 border border-[#FFFFFF]/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#C8F904] rounded-xl flex items-center justify-center">
                        <span className="text-2xl">₿</span>
                      </div>
                      <div>
                        <p className="text-sm text-[#FFFFFF]/60">Prop Firm Account</p>
                        <p className="text-xl font-bold text-[#FFFFFF]">$94,320.12</p>
                      </div>
                    </div>
                    <div className="text-[#C8F904] font-semibold">+8.2%</div>
                  </div>
                </div>

                {/* Service Card */}
                <div className="bg-[#6967FB] rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFFFFF]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#FFFFFF]/20 rounded-lg backdrop-blur-sm"></div>
                      <span className="text-sm font-medium text-[#FFFFFF]">DIGITAL NOMAD CARD</span>
                    </div>
                    <p className="text-sm text-[#FFFFFF]/80 mb-4">Balance</p>
                    <p className="text-4xl font-bold mb-6 text-[#FFFFFF]">$4,250.00</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#FFFFFF]/60">Active • Verified</span>
                      <svg className="w-6 h-6 text-[#FFFFFF]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating blobs */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#C8F904] rounded-2xl opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#6967FB] rounded-2xl opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 lg:px-8 bg-[#FFFFFF]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              One Platform,{' '}
              <span className="text-[#6967FB]">Infinite Access</span>
            </h2>
            <p className="text-xl text-[#FFFFFF]/70 max-w-2xl mx-auto">
              Everything you need to succeed in global markets, all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Card 1 — Prop Firm */}
            <div className="bg-[#FFFFFF]/5 p-8 rounded-3xl border border-[#FFFFFF]/10 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#6967FB] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#FFFFFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#FFFFFF]">Prop Firm Accounts</h3>
              <p className="text-[#FFFFFF]/70 mb-4">
                Access funded trading accounts from top prop firms without dollar card restrictions.
              </p>
              <Link href="/services/propfirm" className="text-[#C8F904] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Card 2 — TradingView */}
            <div className="bg-[#FFFFFF]/5 p-8 rounded-3xl border border-[#FFFFFF]/10 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#C8F904] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#FFFFFF]">TradingView</h3>
              <p className="text-[#FFFFFF]/70 mb-4">
                Get discounted access to TradingView Pro, Pro+, and Premium plans paid in Naira.
              </p>
              <Link href="/services/tradingview" className="text-[#C8F904] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Card 3 — FXReplay */}
            <div className="bg-[#FFFFFF]/5 p-8 rounded-3xl border border-[#FFFFFF]/10 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#6967FB] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#FFFFFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#FFFFFF]">fxreplay Access</h3>
              <p className="text-[#FFFFFF]/70 mb-4">
                Practice with historical market data using fxreplay without international payment hassles.
              </p>
              <Link href="/services/fxreplay" className="text-[#C8F904] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Card 4 — Trade Your Crypto (was Trading Education) */}
            <div className="bg-[#FFFFFF]/5 p-8 rounded-3xl border border-[#FFFFFF]/10 hover:border-[#C8F904]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#C8F904] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {/* Bitcoin/crypto icon */}
                <svg className="w-7 h-7 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#FFFFFF]">Trade Your Crypto</h3>
              <p className="text-[#FFFFFF]/70 mb-4">
                Buy and sell crypto securely with us — fast execution, fair rates, and local payment options.
              </p>
              <button
                onClick={() => setCryptoModalOpen(true)}
                className="text-[#C8F904] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                Trade Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Card 5 — Community Support */}
            <div className="bg-[#FFFFFF]/5 p-8 rounded-3xl border border-[#FFFFFF]/10 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#6967FB] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#FFFFFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#FFFFFF]">Community Support</h3>
              <p className="text-[#FFFFFF]/70 mb-4">
                Join a thriving community of traders, creators, and students sharing insights.
              </p>
              <button
                onClick={joinCommunityWA}
                className="text-[#C8F904] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                Join Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Card 6 — Digital Products */}
            <div className="bg-[#FFFFFF]/5 p-8 rounded-3xl border border-[#FFFFFF]/10 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#C8F904] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#FFFFFF]">Digital Products</h3>
              <p className="text-[#FFFFFF]/70 mb-4">
                Access Netflix, Canva, and other digital services with local payment options.
              </p>
              <Link href="/services/digital-services" className="text-[#C8F904] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                About{' '}
                <span className="text-[#6967FB]">FidelityTradersHub</span>
              </h2>
              <p className="text-xl text-[#FFFFFF]/70 mb-6 leading-relaxed">
                We are on a mission to democratize access to global trading tools for Nigerian traders,
                creators, and students. No more dollar card restrictions, no more payment barriers.
              </p>
              <p className="text-lg text-[#FFFFFF]/70 mb-8 leading-relaxed">
                Whether you need prop firm accounts, TradingView subscriptions, educational resources,
                or digital services, we provide seamless local payment solutions and dedicated support
                to help you thrive in the digital economy.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-4xl font-bold text-[#C8F904] mb-2">99.9%</p>
                  <p className="text-[#FFFFFF]/70">Uptime</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#C8F904] mb-2">24/7</p>
                  <p className="text-[#FFFFFF]/70">Support</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#C8F904] mb-2">100%</p>
                  <p className="text-[#FFFFFF]/70">Secure</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#FFFFFF]/5 rounded-3xl p-1 border border-[#6967FB]/20">
                <div className="bg-[#0E1A1F] rounded-3xl p-8">
                  <h3 className="text-2xl font-bold mb-6 text-[#FFFFFF]">Our Mission</h3>
                  <ul className="space-y-4">
                    {[
                      'Bridge the gap between Nigerian traders and global markets',
                      'Eliminate payment barriers with local solutions',
                      'Build a supportive community for traders and creators',
                      'Provide education and guidance for sustainable success',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#C8F904] rounded-full flex items-center justify-center shrink-0 mt-1">
                          <svg className="w-4 h-4 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-[#FFFFFF]/70">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#6967FB] rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFFFFF]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C8F904]/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-[#FFFFFF]">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-[#FFFFFF]/90 mb-8 max-w-2xl mx-auto">
                Join thousands of Nigerian traders who have unlocked global opportunities with FidelityTradersHub.
              </p>
              <button
                onClick={getStartedWA}
                className="bg-[#C8F904] text-[#0E1A1F] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#C8F904]/90 transition-all hover:scale-105 shadow-lg inline-flex items-center gap-2.5"
              >
                {/* WhatsApp icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Footer Component */}
      <Footer />
    </div>
  );
}