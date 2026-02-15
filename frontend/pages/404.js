import React from 'react';
import Link from 'next/link';
import Layout from '@/component/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0E1A1F] via-[#111827] to-black flex items-center justify-center px-5 py-20">
        <div className="max-w-2xl mx-auto text-center">

          {/* Large 404 */}
          <div className="relative mb-8 select-none">
            <p className="text-[160px] sm:text-[220px] font-black leading-none text-white/5">
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl sm:text-8xl">📡</span>
            </div>
          </div>

          {/* Badge */}
          <span className="inline-block text-[#C8F904] text-xs font-bold tracking-widest uppercase px-4 py-2 bg-[#C8F904]/10 rounded-full border border-[#C8F904]/20 mb-6">
            Page Not Found
          </span>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Looks like you&apos;ve gone <span className="text-[#6967FB]">off-chart</span>
          </h1>

          {/* Subtext */}
          <p className="text-white/60 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#6967FB] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#6967FB]/90 transition-all hover:scale-105"
            >
              ← Back to Home
            </Link>
            <a
              href="https://wa.me/+2348035823744"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 px-8 py-4 rounded-full font-bold text-base hover:border-[#6967FB]/40 hover:text-white transition-all hover:scale-105"
            >
              Contact Support
            </a>
          </div>

          {/* Quick links */}
          <div className="mt-16 pt-10 border-t border-white/10">
            <p className="text-white/40 text-sm mb-5">Or jump to a page:</p>
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
                  className="text-sm text-white/60 hover:text-[#C8F904] transition-colors px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:border-[#C8F904]/30"
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