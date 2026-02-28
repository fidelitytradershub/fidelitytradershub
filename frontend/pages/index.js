'use client';

import Footer from "@/component/Footer";
import Header from "@/component/Header";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const WA_SUPPORT   = '+2348035823744';
const WA_COMMUNITY = 'https://chat.whatsapp.com/F00u9rV9jx26kLTmyJtLtB?mode=gi_t';
const API = process.env.NEXT_PUBLIC_API_URL;

// ── Hero images — swap these 3 URLs for your own ──────────────────────────
const HERO_SLIDES = [
  {
    image: 'https://res.cloudinary.com/dy4tmq3gh/image/upload/v1772305745/WhatsApp_Image_2026-02-28_at_19.32.31_qcle2f.jpg',
    headline: <>Access Global <span className="text-[#C8F904]">Trading Tools</span> with Ease.</>,
    sub: 'Say goodbye to dollar card restrictions. Access Prop Firm accounts, TradingView, FXReplay, and premium trading tools directly from your local account.',
  },
  {
    image: 'https://res.cloudinary.com/dy4tmq3gh/image/upload/v1772305745/WhatsApp_Image_2026-02-28_at_19.32.320_i9bsd7.jpg',
    headline: <>Funded <span className="text-[#C8F904]">Prop Firm</span> Accounts.</>,
    sub: 'Get access to top-tier proprietary trading accounts without international payment barriers. Secure, fast, and built for Nigerian traders.',
  },
  {
    image: 'https://res.cloudinary.com/dy4tmq3gh/image/upload/v1772305745/WhatsApp_Image_2026-02-28_at_19.32.328_rh2w5n.jpg',
    headline: <>Trade Crypto at <span className="text-[#C8F904]">Fair Rates.</span></>,
    sub: 'Buy and sell cryptocurrency with competitive NGN rates and instant WhatsApp support. No hidden fees, no stress.',
  },
];

// ── Crypto Trade Modal ────────────────────────────────────────
const CryptoModal = ({ onClose }) => {
  const [side, setSide]                 = useState('buy');
  const [coin, setCoin]                 = useState('');
  const [amount, setAmount]             = useState('');
  const [message, setMessage]           = useState('');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [rateLoading, setRateLoading]   = useState(true);
  const [rateError, setRateError]       = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setRateLoading(true);
        const res  = await fetch(`${API}/exchange-rate/get`);
        const json = await res.json();
        if (json.success && json.data) setExchangeRate(json.data);
        else setRateError(true);
      } catch { setRateError(true); }
      finally { setRateLoading(false); }
    };
    fetchRate();
  }, []);

  const activeRate = exchangeRate
    ? (side === 'buy' ? exchangeRate.buyRateNgn : exchangeRate.sellRateNgn)
    : null;

  const ngnEquivalent =
    activeRate && amount && !isNaN(Number(amount)) && Number(amount) > 0
      ? (Number(amount) * activeRate).toLocaleString('en-NG', { maximumFractionDigits: 2 })
      : null;

  const handleTrade = () => {
    const lines = [
      `Hi! I'd like to *${side.toUpperCase()}* crypto on FidelityTradersHub.`,
      coin   ? `Coin/Token: *${coin}*`        : null,
      amount ? `Amount    : *$${amount} USD*`  : null,
      ngnEquivalent && activeRate
        ? `NGN Equivalent: *₦${ngnEquivalent}* (@ ₦${activeRate.toLocaleString()}/USD)`
        : null,
      message ? `Additional info: ${message}` : null,
      'Please assist me with this trade. Thank you!',
    ].filter(Boolean);
    window.open(`https://wa.me/${WA_SUPPORT}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-[#0E1A1F]/10 rounded-3xl p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-[#6967FB] font-bold tracking-widest uppercase mb-1">Crypto Trade</p>
            <h2 className="text-xl font-black text-[#0E1A1F]">What would you like to do?</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0E1A1F]/6 hover:bg-[#0E1A1F]/10 text-[#0E1A1F]/40 hover:text-[#0E1A1F] transition-all text-sm">✕</button>
        </div>

        <div className="mb-5">
          {rateLoading ? (
            <div className="flex items-center gap-2 bg-[#0E1A1F]/4 border border-[#0E1A1F]/8 rounded-xl px-4 py-2.5">
              <div className="w-3 h-3 border-2 border-[#6967FB] border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-xs text-[#0E1A1F]/40">Fetching exchange rate…</p>
            </div>
          ) : rateError || !exchangeRate ? (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <p className="text-xs text-red-500">Unable to load exchange rate.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[#0E1A1F]/4 border border-[#0E1A1F]/8 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#0E1A1F]/40 uppercase tracking-wider">Rate</span>
                <span className="w-1 h-1 rounded-full bg-[#0E1A1F]/20" />
                <span className="text-xs font-bold text-[#6967FB]">
                  {side === 'buy' ? `Buy ₦${exchangeRate.buyRateNgn.toLocaleString()}/USD` : `Sell ₦${exchangeRate.sellRateNgn.toLocaleString()}/USD`}
                </span>
              </div>
              <span className="text-[10px] text-[#0E1A1F]/25">
                {new Date(exchangeRate.lastUpdated).toLocaleDateString('en-NG')}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mb-6">
          {[
            { key: 'buy',  label: '📈 Buy Crypto',  active: 'bg-[#C8F904] text-[#0E1A1F]' },
            { key: 'sell', label: '📉 Sell Crypto', active: 'bg-[#6967FB] text-white'      },
          ].map(({ key, label, active }) => (
            <button key={key} onClick={() => setSide(key)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${side === key ? active : 'bg-[#0E1A1F]/6 border border-[#0E1A1F]/10 text-[#0E1A1F]/40 hover:text-[#0E1A1F]'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-[#0E1A1F]/40 uppercase tracking-wider mb-2">Coin / Token</label>
            <input type="text" placeholder="e.g. Bitcoin, USDT, ETH" value={coin} onChange={(e) => setCoin(e.target.value)}
              className="w-full bg-[#0E1A1F]/4 border border-[#0E1A1F]/10 rounded-xl px-4 py-3 text-[#0E1A1F] placeholder-[#0E1A1F]/25 focus:outline-none focus:border-[#6967FB] transition-colors text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0E1A1F]/40 uppercase tracking-wider mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E1A1F]/30 text-sm font-semibold">$</span>
              <input type="number" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0E1A1F]/4 border border-[#0E1A1F]/10 rounded-xl pl-8 pr-4 py-3 text-[#0E1A1F] placeholder-[#0E1A1F]/25 focus:outline-none focus:border-[#6967FB] transition-colors text-sm" />
            </div>
            {ngnEquivalent && activeRate ? (
              <div className={`mt-2 flex items-center justify-between px-3 py-2 rounded-lg ${side === 'buy' ? 'bg-[#C8F904]/10 border border-[#C8F904]/20' : 'bg-[#6967FB]/10 border border-[#6967FB]/20'}`}>
                <span className="text-xs text-[#0E1A1F]/50">NGN Equivalent</span>
                <span className={`text-sm font-bold ${side === 'buy' ? 'text-[#5a7200]' : 'text-[#6967FB]'}`}>₦{ngnEquivalent}</span>
              </div>
            ) : null}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0E1A1F]/40 uppercase tracking-wider mb-2">
              Additional Info <span className="normal-case font-normal text-[#0E1A1F]/25">(optional)</span>
            </label>
            <textarea rows={3} placeholder="network or wallet address..." value={message} onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#0E1A1F]/4 border border-[#0E1A1F]/10 rounded-xl px-4 py-3 text-[#0E1A1F] placeholder-[#0E1A1F]/25 focus:outline-none focus:border-[#6967FB] transition-colors resize-none text-sm" />
          </div>
        </div>

        <button onClick={handleTrade}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] ${side === 'buy' ? 'bg-[#C8F904] text-[#0E1A1F] hover:bg-[#C8F904]/90' : 'bg-[#6967FB] text-white hover:bg-[#6967FB]/90'}`}>
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
  const [activeSlide, setActiveSlide]         = useState(0);
  const intervalRef                           = useRef(null);

  // Auto-advance every 5 s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (idx) => {
    setActiveSlide(idx);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
  };

  const getStartedWA = () => {
    const msg = encodeURIComponent("Hi! I'd like to get started with FidelityTradersHub. Please guide me on available services. Thank you!");
    window.open(`https://wa.me/${WA_SUPPORT}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const joinCommunityWA = () => {
    window.open(WA_COMMUNITY, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white text-[#0E1A1F]">
      {cryptoModalOpen && <CryptoModal onClose={() => setCryptoModalOpen(false)} />}
      <Header />

      {/* ── Full-screen Hero Carousel ─────────────────────────────────── */}
      <section className="relative w-full h-[80vh] lg:h-screen overflow-hidden">

        {/* ── Layer 1: only the background IMAGES fade ─────────────────
             The overlay and text live above this layer and never move.  */}
        <div className="absolute inset-0">
          {HERO_SLIDES.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt={`Hero slide ${idx + 1}`}
              style={{
                transition: 'opacity 1800ms cubic-bezier(0.4, 0, 0.2, 1), transform 7000ms ease-in-out',
                opacity:    idx === activeSlide ? 1 : 0,
                transform:  idx === activeSlide ? 'scale(1.07)' : 'scale(1)',
              }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ))}
        </div>

        {/* ── Layer 2: static overlay — never fades, no stacking ──────── */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* ── Layer 3: text — fully static, zero CSS transition/animation ── */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
                {HERO_SLIDES[activeSlide].headline}
              </h1>
              <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed max-w-xl">
                {HERO_SLIDES[activeSlide].sub}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#C8F904] text-[#0E1A1F] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#C8F904]/90 hover:scale-105 shadow-lg shadow-[#C8F904]/20 flex items-center justify-center gap-2"
                >
                  View All Services
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button
                  onClick={getStartedWA}
                  className="border-2 border-white/50 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white flex items-center justify-center gap-2"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Layer 4: dot indicators ──────────────────────────────────── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              style={{ transition: 'all 400ms ease' }}
              className={`rounded-full ${
                idx === activeSlide
                  ? 'w-8 h-2.5 bg-[#C8F904]'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </section>
      {/* ──────────────────────────────────────────────────────────────── */}

      {/* Services Section */}
      <section id="services" className="py-20 px-6 lg:px-8 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-[#0E1A1F]">
              One Platform,{' '}
              <span className="text-[#6967FB]">Infinite Access</span>
            </h2>
            <p className="text-xl text-[#0E1A1F]/60 max-w-2xl mx-auto">
              Everything you need to succeed in global markets, all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 — Prop Firm */}
            <div className="bg-white p-8 rounded-3xl border border-[#0E1A1F]/8 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#6967FB] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#0E1A1F]">Prop Firm Accounts</h3>
              <p className="text-[#0E1A1F]/60 mb-4">Access funded trading accounts from top Prop Firms without dollar card restrictions.</p>
              <Link href="/services/propfirm" className="text-[#6967FB] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Card 2 — TradingView */}
            <div className="bg-white p-8 rounded-3xl border border-[#0E1A1F]/8 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#C8F904] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#0E1A1F]">TradingView</h3>
              <p className="text-[#0E1A1F]/60 mb-4">Get discounted access to TradingView Pro, Pro+, and Premium plans paid in Naira.</p>
              <Link href="/services/tradingview" className="text-[#6967FB] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Card 3 — FXReplay */}
            <div className="bg-white p-8 rounded-3xl border border-[#0E1A1F]/8 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#6967FB] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#0E1A1F]">FXReplay Access</h3>
              <p className="text-[#0E1A1F]/60 mb-4">Practice with historical market data using FXReplay without international payment hassles.</p>
              <Link href="/services/fxreplay" className="text-[#6967FB] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Card 4 — Trade Your Crypto */}
            <div className="bg-white p-8 rounded-3xl border border-[#0E1A1F]/8 hover:border-[#C8F904]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#C8F904] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#0E1A1F]">Trade Your Crypto</h3>
              <p className="text-[#0E1A1F]/60 mb-4">Buy and sell crypto securely with us — fast execution, fair rates, and local payment options.</p>
              <button onClick={() => setCryptoModalOpen(true)} className="text-[#6967FB] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Trade Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Card 5 — Community Support */}
            <div className="bg-white p-8 rounded-3xl border border-[#0E1A1F]/8 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#6967FB] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#0E1A1F]">Community Support</h3>
              <p className="text-[#0E1A1F]/60 mb-4">Join a thriving community of traders, creators, and students sharing insights.</p>
              <button onClick={joinCommunityWA} className="text-[#6967FB] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Join Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Card 6 — Digital Products */}
            <div className="bg-white p-8 rounded-3xl border border-[#0E1A1F]/8 hover:border-[#6967FB]/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-[#C8F904] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#0E1A1F]">Digital Products</h3>
              <p className="text-[#0E1A1F]/60 mb-4">Access Netflix, Canva, and other digital services with local payment options.</p>
              <Link href="/services/digital-services" className="text-[#6967FB] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
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
      <section id="about" className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-[#0E1A1F]">
                About{' '}
                <span className="text-[#6967FB]">FidelityTradersHub</span>
              </h2>
              <p className="text-xl text-[#0E1A1F]/60 mb-6 leading-relaxed">
                We are on a mission to democratize access to global trading tools for Nigerian traders,
                creators, and students. No more dollar card restrictions, no more payment barriers.
              </p>
              <p className="text-lg text-[#0E1A1F]/60 mb-8 leading-relaxed">
                Whether you need Prop Firm accounts, TradingView subscriptions, educational resources,
                or digital services, we provide seamless local payment solutions and dedicated support
                to help you thrive in the digital economy.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-4xl font-bold text-[#6967FB] mb-2">99.9%</p>
                  <p className="text-[#0E1A1F]/60">Uptime</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#6967FB] mb-2">24/7</p>
                  <p className="text-[#0E1A1F]/60">Support</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#6967FB] mb-2">100%</p>
                  <p className="text-[#0E1A1F]/60">Secure</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl p-1 border border-[#6967FB]/20 shadow-xl shadow-[#6967FB]/10">
                <div className="bg-[#0E1A1F] rounded-3xl p-8">
                  <h3 className="text-2xl font-bold mb-6 text-white">Our Mission</h3>
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
                        <p className="text-white/70">{item}</p>
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
      <section className="py-20 px-6 lg:px-8 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#6967FB] rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C8F904]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">Ready to Start Trading?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of Nigerian traders who have unlocked global opportunities with FidelityTradersHub.
              </p>
              <button onClick={getStartedWA}
                className="bg-[#C8F904] text-[#0E1A1F] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#C8F904]/90 transition-all hover:scale-105 shadow-lg inline-flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}