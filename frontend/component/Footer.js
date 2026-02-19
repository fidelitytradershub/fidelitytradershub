'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '/about' },
  ];

  const legalLinks = [
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
  ];

  const socialLinks = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/@the_fidelity',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/the_fidelity',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@fidelitytraders_hub',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-[#0E1A1F] text-white pt-16 pb-8 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Top CTA band */}
        <div className="bg-[#C8F904] rounded-3xl px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 mb-14">
          <div>
            <p className="text-[#0E1A1F] font-black text-xl">Ready to start?</p>
            <p className="text-[#0E1A1F]/70 text-sm">Join thousands of Nigerian traders today.</p>
          </div>
          <a
            href="https://wa.me/+2348035823744"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0E1A1F] text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-[#6967FB] transition-all hover:scale-105 shrink-0"
          >
            Get Started →
          </a>
        </div>

        <div className="grid md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex flex-col gap-1 mb-4">
              <Image
                src="https://res.cloudinary.com/dllfdzyji/image/upload/v1770914488/L4_bnpq15.png"
                alt="FidelityTradersHub Logo"
                height={44}
                width={150}
                className="object-contain brightness-200"
                priority
              />
              <div className="flex-col justify-center border-l-2 border-[#C8F904] pl-3">
              <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#6967FB] leading-tight">
                Where Traders
              </span>
              <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#C8F904] leading-tight"
                style={{ WebkitTextStroke: '0.3px #0E1A1F' }}>
                Meet Possibilities
              </span>
            </div>
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-5 text-[#C8F904] text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-3 text-white/60 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-[#C8F904] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-5 text-[#C8F904] text-sm uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3 text-white/60 text-sm">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-[#C8F904] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-5 text-[#C8F904] text-sm uppercase tracking-widest">Contact</h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li>
                <a href="mailto:fidelitytradershub@gmail.com" className="hover:text-[#C8F904] transition-colors break-all">
                  Fidelitytradershub@gmail.com
                </a>
              </li>
              <li className="text-white/40">Support: 24/7 Available</li>
              <li className="flex gap-4 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-white/40 hover:text-[#C8F904] transition-colors"
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">© {currentYear} FidelityTradersHub. All rights reserved.</p>
          <p className="text-[#C8F904]/60 text-xs font-medium tracking-wider">Where Traders Meet Possibilities</p>
        </div>

      </div>
    </footer>
  );
}