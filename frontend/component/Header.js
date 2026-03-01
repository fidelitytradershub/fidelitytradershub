'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';


//fixed
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'About Us', href: '/about' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white border-b border-[#0E1A1F]/10 shadow-sm'
          : 'bg-transparent border-b border-transparent shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-20">

          {/* Logo + tagline */}
          <Link href="/" className="flex-col items-center gap-3">
            {/* When scrolled → dark logo; when transparent → white logo */}
            <Image
              src={
                scrolled
                  ? 'https://res.cloudinary.com/dy4tmq3gh/image/upload/v1771504875/L2_s2sfhj.png'
                  : 'https://res.cloudinary.com/dy4tmq3gh/image/upload/v1771504875/L2_s2sfhj.png'
              }
              alt="FidelityTradersHub Logo"
              height={52}
              width={180}
              className={`object-contain transition-all duration-300 `}
              priority
            />
            <div className="flex-col justify-center border-l-2 border-[#C8F904] pl-3">
              <span className={`text-[10px] font-black tracking-[0.18em] uppercase leading-tight block transition-colors duration-300 ${scrolled ? 'text-[#6967FB]' : 'text-[#6967FB]'}`}>
                Where Traders
              </span>
              <span className={`text-[10px] font-black tracking-[0.18em] uppercase leading-tight block transition-colors duration-300 ${scrolled ? 'text-[#0E1A1F]' : 'text-[#C8F904]'}`}>
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
                className={`font-medium transition-colors duration-300 ${
                  scrolled
                    ? 'text-[#0E1A1F]/70 hover:text-[#6967FB]'
                    : 'text-[#C8F904] hover:text-[#C8F904]/90'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden transition-colors duration-300 ${scrolled ? 'text-[#0E1A1F]' : 'text-white'}`}
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
          <div className={`md:hidden py-4 space-y-3 border-t ${scrolled ? 'border-[#0E1A1F]/10 bg-white' : 'border-white/20 bg-black/60 backdrop-blur-md'}`}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block transition-colors py-2 font-medium ${scrolled ? 'text-[#0E1A1F]/70 hover:text-[#6967FB]' : 'text-white/80 hover:text-[#C8F904]'}`}
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