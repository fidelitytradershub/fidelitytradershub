import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About Us', href: '/about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-lg border-b border-[#0E1A1F]/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-20">

          {/* Logo + tagline */}
          <Link href="/" className="flex-col items-center gap-3">
            <Image
              src="https://res.cloudinary.com/dllfdzyji/image/upload/v1770914489/L3_sjwekb.png"
              alt="FidelityTradersHub Logo"
              height={52}
              width={180}
              className="object-contain"
              priority
            />
            {/* Vertical divider + tagline */}
            <div className="flex-col justify-center border-l-2 border-[#C8F904] pl-3">
              <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#6967FB] leading-tight">
                Where Traders
              </span>
              <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#0E1A1F] leading-tight"
                >
                Meet Possibilities
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#0E1A1F]/70 hover:text-[#6967FB] font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {/* <Link
              href="/"
              className="bg-[#6967FB] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#6967FB]/90 transition-all hover:scale-105"
            >
              Get Started
            </Link> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#0E1A1F]"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-[#0E1A1F]/10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-[#0E1A1F]/70 hover:text-[#6967FB] transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
          </div>
        )}
      </div>
    </nav>
  );
}