import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import WhatsAppButton from '../Whatsappbutton';

const API = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────────────────────────────
// Shared UI Helpers
// ─────────────────────────────────────────────────────────────

const CheckIcon = ({ onDark = false }) => (
  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${onDark ? 'bg-[#C8F904]' : 'bg-[#6967FB]'}`}>
    <svg className={`w-3 h-3 ${onDark ? 'text-[#0E1A1F]' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-[#6967FB]/20" />
      <div className="absolute inset-0 rounded-full border-4 border-[#6967FB] border-t-transparent animate-spin" />
    </div>
    <p className="text-[#0E1A1F]/40 text-sm font-semibold tracking-wide">Loading plans...</p>
  </div>
);

const ErrorBlock = ({ message, onRetry }) => (
  <div className="flex items-center justify-center py-16">
    <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-10 text-center max-w-sm">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-[#0E1A1F] font-black text-lg mb-1">Failed to load</p>
      <p className="text-[#0E1A1F]/50 text-sm mb-6">{message}</p>
      <button onClick={onRetry} className="bg-[#6967FB] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#6967FB]/90 transition-all shadow-md shadow-[#6967FB]/20">
        Try Again
      </button>
    </div>
  </div>
);

const EmptyBlock = () => (
  <div className="py-16 text-center">
    <p className="text-[#0E1A1F]/35 font-medium">No plans available at the moment.</p>
  </div>
);

const SectionWrapper = ({ id, title, subtitle, badge, children }) => (
  <section id={id} className="mb-16">
    <div className="text-center mb-12">
      {badge && (
        <span className="inline-block text-[#6967FB] text-xs font-black tracking-widest uppercase px-4 py-2 bg-[#6967FB]/8 rounded-full border border-[#6967FB]/20 mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-4xl lg:text-5xl font-black mt-2 mb-3 text-[#0E1A1F] leading-tight">{title}</h2>
      {subtitle && <p className="text-[#0E1A1F]/50 max-w-xl mx-auto text-base leading-relaxed">{subtitle}</p>}
    </div>
    {children}
  </section>
);

// ─────────────────────────────────────────────────────────────
// Toggle Button Group
// ─────────────────────────────────────────────────────────────
const TabToggle = ({ options, active, onChange }) => (
  <div className="inline-flex bg-[#0E1A1F]/6 rounded-full p-1 border border-[#0E1A1F]/8">
    {options.map(({ key, label }) => (
      <button key={key} onClick={() => onChange(key)}
        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${active === key
          ? 'bg-[#6967FB] text-white shadow-lg shadow-[#6967FB]/25'
          : 'text-[#0E1A1F]/55 hover:text-[#0E1A1F]'}`}>
        {label}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Plan Card — two variants: dark (highlight) & light
// ─────────────────────────────────────────────────────────────

const PlanCard = ({
  label, sublabel, price, duration, features = [],
  highlight = false, badge = null, disabled = false,
  waService = '', waPlan = '', waPrice = '', waLabel = '',
}) => {
  const durationLabel = duration === 'monthly' ? '/mo' : duration === 'yearly' ? '/yr' : '';
  const formattedPrice = `₦${Number(price).toLocaleString()} NGN${durationLabel}`;

  const baseCard = `relative flex flex-col rounded-3xl p-8 transition-all duration-300 hover:scale-[1.025]`;

  return highlight ? (
    /* ── Dark "hero" card ── */
    <div className={`${baseCard} bg-[#0E1A1F] shadow-2xl shadow-[#0E1A1F]/25`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-[#C8F904] text-[#0E1A1F] text-xs font-black px-5 py-1.5 rounded-full whitespace-nowrap tracking-wider shadow-lg shadow-[#C8F904]/30">
            {badge}
          </span>
        </div>
      )}
      {/* Subtle lime accent line at top */}
      <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[#C8F904]/60 to-transparent rounded-full" />

      <div className="mb-6">
        <h3 className="text-2xl font-black text-white mb-1">{label}</h3>
        {sublabel && <p className="text-white/45 text-sm">{sublabel}</p>}
      </div>

      <div className="mb-8">
        {disabled ? (
          <p className="text-white/30 text-sm">Not available</p>
        ) : (
          <div className="flex items-end gap-1.5">
            <span className="text-5xl font-black text-[#C8F904] leading-none">
              ₦{Number(price).toLocaleString()}
            </span>
            {durationLabel && <span className="text-white/40 text-sm mb-1.5">{durationLabel}</span>}
          </div>
        )}
      </div>

      <ul className="space-y-3.5 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckIcon onDark />
            <span className="text-sm text-white/75 leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>

      <WhatsAppButton service={waService} plan={waPlan || label}
        price={waPrice || formattedPrice} label={waLabel || `Get ${label}`}
        highlight={true} disabled={disabled} />
    </div>
  ) : (
    /* ── Light card ── */
    <div className={`${baseCard} bg-white border-2 border-[#0E1A1F]/7 hover:border-[#6967FB]/30 hover:shadow-xl hover:shadow-[#6967FB]/8 shadow-sm`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-[#6967FB] text-white text-xs font-black px-5 py-1.5 rounded-full whitespace-nowrap tracking-wider shadow-md shadow-[#6967FB]/30">
            {badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-black text-[#0E1A1F] mb-1">{label}</h3>
        {sublabel && <p className="text-[#0E1A1F]/40 text-sm">{sublabel}</p>}
      </div>

      <div className="mb-8">
        {disabled ? (
          <p className="text-[#0E1A1F]/25 text-sm">Not available</p>
        ) : (
          <div className="flex items-end gap-1.5">
            <span className="text-5xl font-black text-[#0E1A1F] leading-none">
              ₦{Number(price).toLocaleString()}
            </span>
            {durationLabel && <span className="text-[#0E1A1F]/35 text-sm mb-1.5">{durationLabel}</span>}
          </div>
        )}
      </div>

      <ul className="space-y-3.5 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckIcon />
            <span className="text-sm text-[#0E1A1F]/65 leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>

      <WhatsAppButton service={waService} plan={waPlan || label}
        price={waPrice || formattedPrice} label={waLabel || `Get ${label}`}
        highlight={false} disabled={disabled} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Netflix Section
// ─────────────────────────────────────────────────────────────
const NetflixSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('individual');

  const fetch_plans = async () => {
    try { setLoading(true); setError(null);
      const res = await fetch(`${API}/netflix`);
      if (!res.ok) throw new Error('Failed to fetch Netflix plans');
      const json = await res.json(); setPlans(json.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { fetch_plans(); }, []);

  const individualPlan = plans.find((p) => p.purchaseOption === 'individual');
  const sharedPrice = individualPlan ? individualPlan.price / 4 : null;

  return (
    <SectionWrapper id="netflix" badge="Streaming"
      title={<>Netflix <span className="text-[#6967FB]">Premium</span></>}
      subtitle="Watch in Ultra HD on 4 screens simultaneously. Pay in Naira, no dollar card needed.">
      <div className="flex justify-center mb-10">
        <TabToggle active={activeTab} onChange={setActiveTab}
          options={[{ key: 'individual', label: 'Individual' }, { key: 'shared', label: 'Shared' }]} />
      </div>
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plans} />}
      {!loading && !error && activeTab === 'individual' && (
        individualPlan
          ? <div className="max-w-sm mx-auto"><PlanCard label="Netflix Premium" sublabel="Individual — your own private account"
              price={individualPlan.price} duration={individualPlan.duration} features={individualPlan.features}
              highlight badge="BEST VALUE" waService="Netflix Premium" waPlan="Individual"
              waPrice={`₦${Number(individualPlan.price).toLocaleString()} NGN/mo`} waLabel="Get Individual Plan" /></div>
          : <EmptyBlock />
      )}
      {!loading && !error && activeTab === 'shared' && (
        individualPlan && sharedPrice !== null
          ? <div className="max-w-sm mx-auto"><PlanCard label="Netflix Premium" sublabel="Shared — split across 4 people"
              price={sharedPrice} duration={individualPlan.duration} features={individualPlan.features}
              badge="SHARED PLAN" waService="Netflix Premium" waPlan="Shared (1 of 4 slots)"
              waPrice={`₦${sharedPrice.toLocaleString()} NGN/mo per person`} waLabel="Get Shared Plan" /></div>
          : <EmptyBlock />
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// Canva Section
// ─────────────────────────────────────────────────────────────
const CanvaSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('monthly');

  const fetch_plans = async () => {
    try { setLoading(true); setError(null);
      const res = await fetch(`${API}/canva`);
      if (!res.ok) throw new Error('Failed to fetch Canva plans');
      const json = await res.json(); setPlans(json.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { fetch_plans(); }, []);

  const availableDurations = ['monthly', 'yearly'].filter((d) => plans.some((p) => p.duration === d));
  const activeDuration = availableDurations.includes(selectedDuration) ? selectedDuration : availableDurations[0] || 'monthly';
  const filtered = plans.filter((p) => p.duration === activeDuration);

  return (
    <SectionWrapper id="canva" badge="Design"
      title={<>Canva <span className="text-[#6967FB]">Pro</span></>}
      subtitle="Unlock premium templates, brand kit, background remover and more — paid in Naira.">
      {!loading && !error && availableDurations.length > 1 && (
        <div className="flex justify-center mb-10">
          <TabToggle active={activeDuration} onChange={setSelectedDuration}
            options={availableDurations.map((d) => ({
              key: d,
              label: d === 'yearly' ? '🏷️ Yearly — SAVE' : 'Monthly',
            }))} />
        </div>
      )}
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plans} />}
      {!loading && !error && filtered.length === 0 && <EmptyBlock />}
      {!loading && !error && filtered.length > 0 && (
        <div className="max-w-sm mx-auto">
          {filtered.map((plan) => (
            <PlanCard key={plan._id} label="Canva Pro" sublabel={`Billed ${plan.duration}`}
              price={plan.price} duration={plan.duration} features={plan.features}
              highlight={plan.duration === 'yearly'} badge={plan.duration === 'yearly' ? 'BEST DEAL' : null}
              waService="Canva Pro" waPlan={`Canva Pro — ${plan.duration}`}
              waPrice={`₦${Number(plan.price).toLocaleString()} NGN/${plan.duration === 'yearly' ? 'yr' : 'mo'}`}
              waLabel="Get Canva Pro" />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// CapCut Section
// ─────────────────────────────────────────────────────────────
const CapCutSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [activeType, setActiveType] = useState('individual');

  const fetch_plans = async () => {
    try { setLoading(true); setError(null);
      const res = await fetch(`${API}/capcut`);
      if (!res.ok) throw new Error('Failed to fetch CapCut plans');
      const json = await res.json(); setPlans(json.data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { fetch_plans(); }, []);

  const availableDurations = ['monthly', 'yearly'].filter((d) => plans.some((p) => p.duration === d));
  const activeDuration = availableDurations.includes(selectedDuration) ? selectedDuration : availableDurations[0] || 'monthly';
  const individualPlan = plans.find((p) => p.duration === activeDuration && p.purchaseType === 'individual');
  const sharedPrice = individualPlan ? individualPlan.price / 2 : null;
  const durationSuffix = activeDuration === 'yearly' ? '/yr' : '/mo';

  return (
    <SectionWrapper id="capcut" badge="Video Editing"
      title={<>CapCut <span className="text-[#6967FB]">Pro</span></>}
      subtitle="Export without watermarks, use AI tools and premium effects. Pay in Naira.">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        {!loading && !error && availableDurations.length > 1 && (
          <TabToggle active={activeDuration} onChange={setSelectedDuration}
            options={availableDurations.map((d) => ({ key: d, label: d === 'yearly' ? '🏷️ Yearly — SAVE' : 'Monthly' }))} />
        )}
        <TabToggle active={activeType} onChange={setActiveType}
          options={[{ key: 'individual', label: 'Individual' }, { key: 'shared', label: 'Shared' }]} />
      </div>
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plans} />}
      {!loading && !error && !individualPlan && <EmptyBlock />}
      {!loading && !error && individualPlan && activeType === 'individual' && (
        <div className="max-w-sm mx-auto">
          <PlanCard label="CapCut Pro" sublabel={`Individual · Billed ${activeDuration}`}
            price={individualPlan.price} duration={activeDuration} features={individualPlan.features} highlight
            waService="CapCut Pro" waPlan={`CapCut Pro — Individual — ${activeDuration}`}
            waPrice={`₦${Number(individualPlan.price).toLocaleString()} NGN${durationSuffix}`} waLabel="Get Individual" />
        </div>
      )}
      {!loading && !error && individualPlan && activeType === 'shared' && (
        <div className="max-w-sm mx-auto">
          <PlanCard label="CapCut Pro" sublabel={`Shared · Split between 2 · Billed ${activeDuration}`}
            price={sharedPrice} duration={activeDuration} features={individualPlan.features}
            waService="CapCut Pro" waPlan={`CapCut Pro — Shared (1 of 2) — ${activeDuration}`}
            waPrice={`₦${sharedPrice.toLocaleString()} NGN${durationSuffix} per person`} waLabel="Get Shared" />
        </div>
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// Scribd Section
// ─────────────────────────────────────────────────────────────
const ScribdSection = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_plan = async () => {
    try { setLoading(true); setError(null);
      const res = await fetch(`${API}/scribd`);
      if (!res.ok) throw new Error('Failed to fetch Scribd plan');
      const json = await res.json(); setPlan(json.data || null);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { fetch_plan(); }, []);

  return (
    <SectionWrapper id="scribd" badge="Reading"
      title={<>Scribd <span className="text-[#6967FB]">Plus</span></>}
      subtitle="Unlimited ebooks, audiobooks and magazines. All in Naira, no restrictions.">
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plan} />}
      {!loading && !error && !plan && <EmptyBlock />}
      {!loading && !error && plan && (
        <div className="max-w-sm mx-auto">
          <PlanCard label="Scribd Plus" sublabel="Monthly subscription"
            price={plan.price} duration={plan.duration} features={plan.features} highlight
            waService="Scribd Plus" waPlan="Scribd Plus — Monthly"
            waPrice={`₦${Number(plan.price).toLocaleString()} NGN/mo`} waLabel="Get Scribd Plus" />
        </div>
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// Zoom Section
// ─────────────────────────────────────────────────────────────
const ZoomSection = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_plan = async () => {
    try { setLoading(true); setError(null);
      const res = await fetch(`${API}/zoom`);
      if (!res.ok) throw new Error('Failed to fetch Zoom plan');
      const json = await res.json(); setPlan(json.data || null);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { fetch_plan(); }, []);

  return (
    <SectionWrapper id="zoom" badge="Meetings"
      title={<>Zoom <span className="text-[#6967FB]">Pro</span></>}
      subtitle="Host unlimited meetings with up to 100 participants. Paid in Naira.">
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plan} />}
      {!loading && !error && !plan && <EmptyBlock />}
      {!loading && !error && plan && (
        <div className="max-w-sm mx-auto">
          <PlanCard label="Zoom Pro" sublabel="Monthly subscription"
            price={plan.price} duration={plan.duration} features={plan.features} highlight
            waService="Zoom Pro" waPlan="Zoom Pro — Monthly"
            waPrice={`₦${Number(plan.price).toLocaleString()} NGN/mo`} waLabel="Get Zoom Pro" />
        </div>
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
const services = [
  { id: 'netflix', label: '🎬 Netflix' },
  { id: 'canva',   label: '🎨 Canva'   },
  { id: 'capcut',  label: '✂️ CapCut'  },
  { id: 'scribd',  label: '📚 Scribd'  },
  { id: 'zoom',    label: '📹 Zoom'    },
];

const DigitalProducts = () => {
  const [activeTab, setActiveTab] = useState('netflix');

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'netflix': return <NetflixSection />;
      case 'canva':   return <CanvaSection />;
      case 'capcut':  return <CapCutSection />;
      case 'scribd':  return <ScribdSection />;
      case 'zoom':    return <ZoomSection />;
      default:        return <NetflixSection />;
    }
  };

  return (
    <Layout>
      <div className="py-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Page Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-10 bg-[#C8F904]" />
              <span className="text-[#6967FB] text-xs font-black tracking-widest uppercase px-4 py-2 bg-[#6967FB]/8 rounded-full border border-[#6967FB]/20">
                No Dollar Card Needed
              </span>
              <div className="h-px w-10 bg-[#C8F904]" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-black mb-5 text-[#0E1A1F] leading-tight tracking-tight">
              Digital <span className="text-[#6967FB]">Products</span>
            </h1>
            <p className="text-lg text-[#0E1A1F]/50 max-w-2xl mx-auto leading-relaxed">
              Access Netflix, Canva, CapCut, Scribd, Zoom and more — all paid in Naira
              with instant delivery and zero international payment stress.
            </p>
          </div>

          {/* Service Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                className={`
                  px-6 py-3 rounded-full font-bold text-sm transition-all duration-300
                  ${activeTab === service.id
                    ? 'bg-[#0E1A1F] text-white shadow-xl shadow-[#0E1A1F]/20 scale-105'
                    : 'bg-white text-[#0E1A1F]/60 border-2 border-[#0E1A1F]/10 hover:border-[#6967FB]/40 hover:text-[#6967FB] hover:bg-[#6967FB]/4'
                  }
                `}
              >
                {service.label}
              </button>
            ))}
          </div>

          {/* Active Section */}
          <div className="min-h-[500px]">
            {renderActiveSection()}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default DigitalProducts;