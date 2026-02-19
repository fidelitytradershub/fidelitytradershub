import React from 'react';
import Link from 'next/link';
import Layout from '@/component/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-white flex items-center justify-center px-5 py-20">
        <div className="max-w-2xl mx-auto text-center">

          {/* Big colour block behind the 404 */}
          <div className="relative mb-10 select-none">
            {/* Purple background blob */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 sm:w-80 sm:h-80 bg-[#6967FB] rounded-full opacity-10 blur-3xl" />
            </div>
            {/* Ghost number */}
            <p className="text-[160px] sm:text-[220px] font-black leading-none text-[#0E1A1F]/5 select-none">
              404
            </p>
            {/* Emoji overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#C8F904] w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center shadow-xl rotate-3">
                <span className="text-5xl sm:text-6xl">📡</span>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#6967FB] text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full mb-6 shadow-lg shadow-[#6967FB]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8F904] animate-pulse" />
            Page Not Found
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-black text-[#0E1A1F] mb-4 leading-tight">
            Looks like you&apos;ve gone{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-white">off-chart</span>
              <span className="absolute inset-0 bg-[#6967FB] rounded-lg -rotate-1 z-0" />
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-[#0E1A1F]/60 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#C8F904] text-[#0E1A1F] px-8 py-4 rounded-full font-black text-base hover:bg-[#C8F904]/90 transition-all hover:scale-105 shadow-lg shadow-[#C8F904]/30"
            >
              ← Back to Home
            </Link>
            <a
              href="https://wa.me/+2348035823744"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border-2 border-[#6967FB] text-[#6967FB] px-8 py-4 rounded-full font-black text-base hover:bg-[#6967FB] hover:text-white transition-all hover:scale-105"
            >
              Contact Support
            </a>
          </div>

          {/* Quick links */}
          <div className="mt-16 pt-10 border-t-2 border-[#0E1A1F]/8">
            <p className="text-[#0E1A1F]/40 text-sm mb-5 font-medium">Or jump to a page:</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { href: '/digital-products', label: '🎬 Digital Products' },
                { href: '/tradingview',       label: '📊 TradingView'      },
                { href: '/prop-firm',         label: '💼 Prop Firm'        },
                { href: '/fxreplay',          label: '🔁 FXReplay'         },
                { href: '/about',             label: '👋 About Us'         },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#0E1A1F]/70 hover:text-[#6967FB] font-semibold transition-colors px-5 py-2.5 bg-[#0E1A1F]/5 rounded-full border border-[#0E1A1F]/10 hover:border-[#6967FB]/40 hover:bg-[#6967FB]/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default NotFound;