import { useEffect, useState } from 'react';
import DashboardLayout from '@/component/DashboardLayout';
import withAuth from '@/middleware/withAuth';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

const Dashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    tradingview: '—', fxreplay: '—', propfirm: '—',
    netflix: '—', canva: '—', capcut: '—',
    scribd: '—', zoom: '—',
  });

  useEffect(() => {
    const load = async () => {
       // ── Regular endpoints ─────────────────────────────────────────────────
       const endpoints = [
        { key: 'tradingview', url: '/tradingview', shape: 'array'       },
        { key: 'fxreplay',    url: '/fxreplay',    shape: 'flexible'    },
        { key: 'netflix',     url: '/netflix',     shape: 'data-array'  },
        { key: 'canva',       url: '/canva',       shape: 'data-array'  },
        { key: 'capcut',      url: '/capcut',      shape: 'data-array'  },
        { key: 'scribd',      url: '/scribd',      shape: 'data-single' },
        { key: 'zoom',        url: '/zoom',        shape: 'data-single' },
      ];

      const results = await Promise.allSettled(
        endpoints.map(async ({ key, url, shape }) => {
          const res  = await fetch(API + url, { credentials: 'include' });
          const json = await res.json();
          let count  = 0;
          if (shape === 'array')       count = Array.isArray(json) ? json.length : 0;
          if (shape === 'data-array')  count = Array.isArray(json.data) ? json.data.length : 0;
          if (shape === 'data-single') count = json.data ? 1 : 0;
          if (shape === 'flexible') {
            if (Array.isArray(json.data)) count = json.data.length;
            else if (json.data && typeof json.data === 'object') count = 1;
            else if (Array.isArray(json)) count = json.length;
          }
          return { key, count };
        })
      );

      const updated = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled') updated[r.value.key] = r.value.count;
      });

      // ── Prop Firm: accounts + referrals are separate endpoints ────────────
      try {
        const [accRes, refRes] = await Promise.all([
          fetch(`${API}/prop-firm/accounts`,  { credentials: 'include' }),
          fetch(`${API}/prop-firm/referrals`, { credentials: 'include' }),
        ]);
        const [accJson, refJson] = await Promise.all([accRes.json(), refRes.json()]);
        const accCount = Array.isArray(accJson.data) ? accJson.data.length : 0;
        const refCount = Array.isArray(refJson.data) ? refJson.data.length : 0;
        updated.propfirm = accCount + refCount;
      } catch {
        updated.propfirm = 0;
      }

      setStats((p) => ({ ...p, ...updated }));
    };
    load();
  }, []);
  const statCards = [
    { label: 'TradingView Plans', value: stats.tradingview, color: '#6967FB' },
    { label: 'FxReplay Plans',    value: stats.fxreplay,    color: '#C8F904' },
    { label: 'Prop Firm Plans',   value: stats.propfirm,    color: '#6967FB' },
    { label: 'Netflix Plans',     value: stats.netflix,     color: '#C8F904' },
    { label: 'Canva Plans',       value: stats.canva,       color: '#6967FB' },
    { label: 'CapCut Plans',      value: stats.capcut,      color: '#C8F904' },
    { label: 'Scribd Plans',      value: stats.scribd,      color: '#6967FB' },
    { label: 'Zoom Plans',        value: stats.zoom,        color: '#C8F904' },
  ];

  const quickActions = [
    { label: 'TradingView', icon: '📈', href: '/admin/dashboard/tradingview', desc: 'Essential, Plus & Premium' },
    { label: 'FxReplay',    icon: '🔁', href: '/admin/dashboard/fxreplay',    desc: 'Monthly & Yearly plans'   },
    { label: 'Prop Firm',   icon: '💼', href: '/admin/dashboard/propfirm',    desc: 'Funded account plans'     },
    { label: 'Netflix',     icon: '🎬', href: '/admin/dashboard/netflix',     desc: 'Individual plan'          },
    { label: 'Canva',       icon: '🎨', href: '/admin/dashboard/canva',       desc: 'Monthly & Yearly'         },
    { label: 'CapCut',      icon: '✂️', href: '/admin/dashboard/capcut',      desc: 'Individual plan'          },
    { label: 'Scribd',      icon: '📚', href: '/admin/dashboard/scribd',      desc: 'Monthly subscription'     },
    { label: 'Zoom',        icon: '📹', href: '/admin/dashboard/zoom',        desc: 'Monthly subscription'     },
    { label: 'Settings',    icon: '⚙️', href: '/admin/dashboard/settings',   desc: 'Password & profile'       },
  ];

  return (
    <DashboardLayout title="Overview">
      <div className="mb-8 bg-[#0E1A1F] p-5 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#FFFFFF]">
          Welcome back, <span className="text-[#6967FB]">{admin?.username}</span> 👋
        </h2>
        <p className="text-[#FFFFFF]/50 mt-1 text-sm">Live overview of all active plans.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 bg-[#0E1A1F] p-5 rounded-2xl">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-[#FFFFFF]/5 rounded-2xl p-5 border border-[#FFFFFF]/10">
            <p className="text-[#FFFFFF]/50 text-xs mb-2">{label}</p>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <h3 className="text-base font-bold text-[#6967FB] mb-4">Quick Actions</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#0E1A1F] p-5 rounded-2xl">
        {quickActions.map((a) => (
          <a key={a.label} href={a.href}
            className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 hover:border-[#6967FB]/40 rounded-2xl p-5 flex items-center gap-4 transition-all hover:scale-[1.02] group">
            <span className="text-3xl shrink-0">{a.icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-[#FFFFFF]/80 group-hover:text-[#FFFFFF] text-sm">{a.label}</p>
              <p className="text-xs text-[#FFFFFF]/40 mt-0.5">{a.desc}</p>
            </div>
            <svg className="w-4 h-4 text-[#FFFFFF]/20 ml-auto shrink-0 group-hover:text-[#C8F904] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default withAuth(Dashboard);