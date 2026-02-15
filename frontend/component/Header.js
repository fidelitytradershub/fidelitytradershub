import { useState } from 'react';
import Image from 'next/image'; // ← Use Next.js Image for optimization
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About Us', href: '/about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0E1A1F]/95 backdrop-blur-lg border-b border-[#FFFFFF]/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-20">
          {/* Logo – now using Cloudinary image */}
          <Link href="/" className="flex items-center space-x-3">
              <Image
                src="https://res.cloudinary.com/dllfdzyji/image/upload/v1770914488/L4_bnpq15.png"
                alt="FidelityTradersHub Logo"
                height={80}
                width={270}
                className="object-contain relative"
                priority // Good for header logo (loads faster)
              />
           
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#FFFFFF]/70 hover:text-[#FFFFFF] transition-colors"
              >
                {link.name}
              </Link>
            ))}
           
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#FFFFFF]"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-[#FFFFFF]/10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-[#FFFFFF]/70 hover:text-[#FFFFFF] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button className="w-full bg-[#6967FB] text-[#FFFFFF] px-6 py-2.5 rounded-full font-semibold mt-2">
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}