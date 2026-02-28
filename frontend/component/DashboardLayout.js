import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const navItems = [
  { label: 'Overview',    href: '/admin/dashboard',               icon: '🏠' },
  { label: 'TradingView', href: '/admin/dashboard/tradingview',   icon: '📈' },
  { label: 'FxReplay',    href: '/admin/dashboard/fxreplay',      icon: '🔁' },
  { label: 'Prop Firm',   href: '/admin/dashboard/propfirm',      icon: '💼' },
  { label: 'Netflix',     href: '/admin/dashboard/netflix',       icon: '🎬' },
  { label: 'Canva',       href: '/admin/dashboard/canva',         icon: '🎨' },
  { label: 'CapCut',      href: '/admin/dashboard/capcut',        icon: '✂️' },
  { label: 'Scribd',      href: '/admin/dashboard/scribd',        icon: '📚' },
  { label: 'Zoom',        href: '/admin/dashboard/zoom',          icon: '📹' },
  { label: 'Settings',    href: '/admin/dashboard/settings',      icon: '⚙️' },
  { label: 'Exchange Rate',  icon: '💱', href: '/admin/dashboard/exchange-rate',  desc: 'Buy & sell USD/NGN rates'   }, // ← added

];

const DashboardLayout = ({ children, title }) => {
  const { admin, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#0E1A1F] flex">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-[#0E1A1F]/40 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full w-96 bg-white border-r-2 border-[#0E1A1F]/8 flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="px-5 py-5 border-b-2 border-[#0E1A1F]/8">
        <Link href="/admin/dashboard" className="flex-col items-center gap-3">
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
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#6967FB] text-white shadow-lg shadow-[#6967FB]/20'
                    : 'text-[#0E1A1F]/50 hover:text-[#0E1A1F] hover:bg-[#0E1A1F]/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C8F904]" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t-2 border-[#0E1A1F]/8">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#6967FB] flex items-center justify-center shrink-0 shadow-md shadow-[#6967FB]/25">
              <span className="text-xs font-black text-white">{admin?.username?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-[#0E1A1F] truncate">{admin?.username}</p>
              <p className="text-xs text-[#0E1A1F]/40 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center bg-red-50 border-2 border-red-100 text-red-500 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b-2 border-[#0E1A1F]/8 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border-2 border-[#0E1A1F]/10 text-[#0E1A1F]/50 hover:text-[#0E1A1F] hover:border-[#6967FB]/40 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 bg-[#C8F904] rounded-full" />
            <h1 className="text-base font-black text-[#0E1A1F]">{title}</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto bg-[#0E1A1F]/2">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;