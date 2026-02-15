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
];

const DashboardLayout = ({ children, title }) => {
  const { admin, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0E1A1F] text-[#FFFFFF] flex">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0E1A1F] border-r border-[#FFFFFF]/10 flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        <div className="p-6 border-b border-[#FFFFFF]/10">
          <div className="flex items-center gap-3">
            <Image
                            src="https://res.cloudinary.com/dllfdzyji/image/upload/v1770914488/L4_bnpq15.png"
                            alt="FidelityTradersHub Logo"
                            height={80}
                            width={270}
                            className="object-contain relative"
                            priority // Good for header logo (loads faster)
                          />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${isActive ? 'bg-[#6967FB] text-[#FFFFFF]' : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/5'}`}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C8F904]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#FFFFFF]/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#6967FB]/30 border border-[#6967FB] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#6967FB]">{admin?.username?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#FFFFFF] truncate">{admin?.username}</p>
              <p className="text-xs text-[#FFFFFF]/40 truncate">{admin?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 justify-center bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#FFFFFF]/5 border-b border-[#FFFFFF]/10 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#FFFFFF]/60 hover:text-[#FFFFFF]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-[#FFFFFF]">{title}</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;