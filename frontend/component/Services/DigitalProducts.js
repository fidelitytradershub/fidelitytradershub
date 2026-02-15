import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import WhatsAppButton from '../Whatsappbutton';

const API = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────────────────────────────
// Shared UI Helpers
// ─────────────────────────────────────────────────────────────

const CheckIcon = ({ dark = false }) => (
  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${dark ? 'bg-[#C8F904]' : 'bg-[#6967FB]'}`}>
    <svg className={`w-3 h-3 ${dark ? 'text-[#0E1A1F]' : 'text-[#FFFFFF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-10 h-10 border-4 border-[#6967FB] border-t-transparent rounded-full animate-spin" />
    <p className="text-[#FFFFFF]/60 text-sm">Loading plans...</p>
  </div>
);

const ErrorBlock = ({ message, onRetry }) => (
  <div className="flex items-center justify-center py-16">
    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-sm">
      <svg className="w-10 h-10 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-[#FFFFFF] font-semibold mb-2">Failed to load</p>
      <p className="text-[#FFFFFF]/50 text-sm mb-5">{message}</p>
      <button onClick={onRetry} className="bg-[#6967FB] text-[#FFFFFF] px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#6967FB]/90 transition-all">
        Try Again
      </button>
    </div>
  </div>
);

const EmptyBlock = () => (
  <div className="py-16 text-center">
    <p className="text-[#FFFFFF]/50">No plans available at the moment.</p>
  </div>
);

const SectionWrapper = ({ id, title, subtitle, badge, children }) => (
  <section id={id} className="mb-16">
    <div className="text-center mb-10">
      {badge && (
        <span className="text-[#C8F904] text-sm font-semibold px-4 py-2 bg-[#C8F904]/10 rounded-full border border-[#C8F904]/30">
          {badge}
        </span>
      )}
      <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-3 text-[#FFFFFF]">{title}</h2>
      {subtitle && <p className="text-[#FFFFFF]/60 max-w-xl mx-auto">{subtitle}</p>}
    </div>
    {children}
  </section>
);

// ─────────────────────────────────────────────────────────────
// Generic Plan Card
// ─────────────────────────────────────────────────────────────

const PlanCard = ({
  label,
  sublabel,
  price,
  currency = 'NGN',
  duration,
  features = [],
  highlight = false,
  badge = null,
  disabled = false,
  // WhatsApp props
  waService = '',
  waPlan = '',
  waPrice = '',
  waLabel = '',
}) => {
  const symbol = '₦';
  const durationLabel = duration === 'monthly' ? '/mo' : duration === 'yearly' ? '/yr' : '';

  const formattedPrice = `₦${Number(price).toLocaleString()} NGN${durationLabel}`;

  return (
    <div className={`relative flex flex-col rounded-3xl p-8 border transition-all hover:scale-105 ${highlight ? 'bg-[#6967FB] border-[#6967FB]' : 'bg-[#FFFFFF]/5 border-[#FFFFFF]/10 hover:border-[#6967FB]/40'}`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#C8F904] text-[#0E1A1F] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">{badge}</span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#FFFFFF] mb-1">{label}</h3>
        {sublabel && <p className={`text-sm ${highlight ? 'text-[#FFFFFF]/80' : 'text-[#FFFFFF]/50'}`}>{sublabel}</p>}
      </div>

      <div className="mb-8">
        {disabled ? (
          <p className="text-[#FFFFFF]/40 text-sm">Not available</p>
        ) : (
          <div className="flex items-end gap-1">
            <span className={`text-5xl font-bold ${highlight ? 'text-[#C8F904]' : 'text-[#FFFFFF]'}`}>
              {symbol}{Number(price).toLocaleString()}
            </span>
            {durationLabel && (
              <span className={`text-sm mb-2 ${highlight ? 'text-[#FFFFFF]/80' : 'text-[#FFFFFF]/50'}`}>
                {durationLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckIcon dark={highlight} />
            <span className={`text-sm ${highlight ? 'text-[#FFFFFF]/90' : 'text-[#FFFFFF]/70'}`}>{f}</span>
          </li>
        ))}
      </ul>

      <WhatsAppButton
        service={waService}
        plan={waPlan || label}
        price={waPrice || formattedPrice}
        label={waLabel || `Get ${label}`}
        highlight={highlight}
        disabled={disabled}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Netflix Section
// Netflix individual = 1 card (highlighted)
// Netflix shared     = 1 card showing individual price ÷ 4
// No yearly toggle — Netflix is monthly only
// ─────────────────────────────────────────────────────────────

const NetflixSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'shared'

  const fetch_plans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/netflix`);
      if (!res.ok) throw new Error('Failed to fetch Netflix plans');
      const json = await res.json();
      setPlans(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_plans(); }, []);

  // The shared price is the individual plan price divided by 4
  const individualPlan = plans.find((p) => p.purchaseOption === 'individual');
  const sharedPricePerPerson = individualPlan ? individualPlan.price / 4 : null;

  // Netflix is monthly only — no duration toggle shown
  return (
    <SectionWrapper
      id="netflix"
      badge="Streaming"
      title={<>Netflix <span className="text-[#6967FB]">Premium</span></>}
      subtitle="Watch in Ultra HD on 4 screens simultaneously. Pay in Naira, no dollar card needed."
    >
      {/* Individual / Shared tab */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#FFFFFF]/5 rounded-full p-1 flex border border-[#FFFFFF]/10">
          {[
            { key: 'individual', label: 'Individual' },
            { key: 'shared',     label: 'Shared' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === key ? 'bg-[#6967FB] text-[#FFFFFF]' : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plans} />}

      {/* Individual */}
      {!loading && !error && activeTab === 'individual' && (
        <>
          {individualPlan ? (
            <div className="max-w-sm mx-auto">
              <PlanCard
                label="Netflix Premium"
                sublabel="Individual — your own private account"
                price={individualPlan.price}
                currency={individualPlan.currency}
                duration={individualPlan.duration}
                features={individualPlan.features}
                highlight
                badge="BEST VALUE"
                waService="Netflix Premium"
                waPlan="Individual"
                waPrice={`₦${Number(individualPlan.price).toLocaleString()} NGN/mo`}
                waLabel="Get Individual Plan"
              />
            </div>
          ) : (
            <EmptyBlock />
          )}
        </>
      )}

      {/* Shared — 1 card, price = individual ÷ 4 */}
      {!loading && !error && activeTab === 'shared' && (
        <>
          {individualPlan && sharedPricePerPerson !== null ? (
            <div className="max-w-sm mx-auto">
              <PlanCard
                label="Netflix Premium"
                sublabel="Shared — split across 4 people"
                price={sharedPricePerPerson}
                currency={individualPlan.currency}
                duration={individualPlan.duration}
                features={individualPlan.features}
                highlight={false}
                badge="SHARED PLAN"
                waService="Netflix Premium"
                waPlan="Shared (1 of 4 slots)"
                waPrice={`₦${sharedPricePerPerson.toLocaleString()} NGN/mo per person`}
                waLabel="Get Shared Plan"
              />
            </div>
          ) : (
            <EmptyBlock />
          )}
        </>
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// Canva Section
// Has monthly + yearly — show duration toggle
// ─────────────────────────────────────────────────────────────

const CanvaSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('monthly');

  const fetch_plans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/canva`);
      if (!res.ok) throw new Error('Failed to fetch Canva plans');
      const json = await res.json();
      setPlans(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_plans(); }, []);

  // Only show toggle if BOTH durations exist
  const availableDurations = ['monthly', 'yearly'].filter((d) =>
    plans.some((p) => p.duration === d)
  );
  const activeDuration = availableDurations.includes(selectedDuration)
    ? selectedDuration
    : availableDurations[0] || 'monthly';

  const filtered = plans.filter((p) => p.duration === activeDuration);

  return (
    <SectionWrapper
      id="canva"
      badge="Design"
      title={<>Canva <span className="text-[#6967FB]">Pro</span></>}
      subtitle="Unlock premium templates, brand kit, background remover and more — paid in Naira."
    >
      {/* Duration toggle — only shown if multiple durations exist */}
      {!loading && !error && availableDurations.length > 1 && (
        <div className="flex justify-center mb-10">
          <div className="bg-[#FFFFFF]/5 rounded-full p-1 flex border border-[#FFFFFF]/10">
            {availableDurations.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDuration(d)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm capitalize transition-all ${activeDuration === d ? 'bg-[#6967FB] text-[#FFFFFF]' : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF]'}`}
              >
                {d} {d === 'yearly' && <span className="ml-1 text-[#C8F904] text-xs font-bold">SAVE</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plans} />}
      {!loading && !error && filtered.length === 0 && <EmptyBlock />}
      {!loading && !error && filtered.length > 0 && (
        <div className="max-w-sm mx-auto">
          {filtered.map((plan) => (
            <PlanCard
              key={plan._id}
              label="Canva Pro"
              sublabel={`Billed ${plan.duration}`}
              price={plan.price}
              currency={plan.currency}
              duration={plan.duration}
              features={plan.features}
              highlight={plan.duration === 'yearly'}
              badge={plan.duration === 'yearly' ? 'BEST DEAL' : null}
              waService="Canva Pro"
              waPlan={`Canva Pro — ${plan.duration}`}
              waPrice={`₦${Number(plan.price).toLocaleString()} NGN/${plan.duration === 'yearly' ? 'yr' : 'mo'}`}
              waLabel="Get Canva Pro"
            />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// CapCut Section
// Individual tab  — 1 card, price from API
// Shared tab      — 1 card, individual price ÷ 2
// Duration toggle only shown if both monthly + yearly exist
// ─────────────────────────────────────────────────────────────

const CapCutSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [activeType, setActiveType] = useState('individual'); // 'individual' | 'shared'

  const fetch_plans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/capcut`);
      if (!res.ok) throw new Error('Failed to fetch CapCut plans');
      const json = await res.json();
      setPlans(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_plans(); }, []);

  // Only show duration toggle if more than one duration actually exists
  const availableDurations = ['monthly', 'yearly'].filter((d) =>
    plans.some((p) => p.duration === d)
  );
  const activeDuration = availableDurations.includes(selectedDuration)
    ? selectedDuration
    : availableDurations[0] || 'monthly';

  // Shared price is always derived from individual ÷ 2
  const individualPlan = plans.find((p) => p.duration === activeDuration && p.purchaseType === 'individual');
  const sharedPrice = individualPlan ? individualPlan.price / 2 : null;
  const durationSuffix = activeDuration === 'yearly' ? '/yr' : '/mo';

  return (
    <SectionWrapper
      id="capcut"
      badge="Video Editing"
      title={<>CapCut <span className="text-[#6967FB]">Pro</span></>}
      subtitle="Export without watermarks, use AI tools and premium effects. Pay in Naira."
    >
      {/* Toggles row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">

        {/* Duration toggle — only shown if multiple durations exist */}
        {!loading && !error && availableDurations.length > 1 && (
          <div className="bg-[#FFFFFF]/5 rounded-full p-1 flex border border-[#FFFFFF]/10">
            {availableDurations.map((d) => (
              <button key={d} onClick={() => setSelectedDuration(d)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm capitalize transition-all ${activeDuration === d ? 'bg-[#6967FB] text-[#FFFFFF]' : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF]'}`}>
                {d} {d === 'yearly' && <span className="ml-1 text-[#C8F904] text-xs font-bold">SAVE</span>}
              </button>
            ))}
          </div>
        )}

        {/* Individual / Shared toggle */}
        <div className="bg-[#FFFFFF]/5 rounded-full p-1 flex border border-[#FFFFFF]/10">
          {[
            { key: 'individual', label: 'Individual' },
            { key: 'shared',     label: 'Shared'     },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveType(key)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeType === key ? 'bg-[#6967FB] text-[#FFFFFF]' : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plans} />}
      {!loading && !error && !individualPlan && <EmptyBlock />}

      {/* Individual tab */}
      {!loading && !error && individualPlan && activeType === 'individual' && (
        <div className="max-w-sm mx-auto">
          <PlanCard
            label="CapCut Pro"
            sublabel={`Individual · Billed ${activeDuration}`}
            price={individualPlan.price}
            currency={individualPlan.currency}
            duration={activeDuration}
            features={individualPlan.features}
            highlight
            waService="CapCut Pro"
            waPlan={`CapCut Pro — Individual — ${activeDuration}`}
            waPrice={`₦${Number(individualPlan.price).toLocaleString()} NGN${durationSuffix}`}
            waLabel="Get Individual"
          />
        </div>
      )}

      {/* Shared tab — single card, price = individual ÷ 2 */}
      {!loading && !error && individualPlan && activeType === 'shared' && (
        <div className="max-w-sm mx-auto">
          <PlanCard
            label="CapCut Pro"
            sublabel={`Shared · Split between 2 · Billed ${activeDuration}`}
            price={sharedPrice}
            currency={individualPlan.currency}
            duration={activeDuration}
            features={individualPlan.features}
            highlight={false}
            waService="CapCut Pro"
            waPlan={`CapCut Pro — Shared (1 of 2) — ${activeDuration}`}
            waPrice={`₦${sharedPrice.toLocaleString()} NGN${durationSuffix} per person`}
            waLabel="Get Shared"
          />
        </div>
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// Scribd Section — monthly only, no toggle
// ─────────────────────────────────────────────────────────────

const ScribdSection = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_plan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/scribd`);
      if (!res.ok) throw new Error('Failed to fetch Scribd plan');
      const json = await res.json();
      setPlan(json.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_plan(); }, []);

  return (
    <SectionWrapper
      id="scribd"
      badge="Reading"
      title={<>Scribd <span className="text-[#6967FB]">Plus</span></>}
      subtitle="Unlimited ebooks, audiobooks and magazines. All in Naira, no restrictions."
    >
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plan} />}
      {!loading && !error && !plan && <EmptyBlock />}
      {!loading && !error && plan && (
        <div className="max-w-sm mx-auto">
          <PlanCard
            label="Scribd Plus"
            sublabel="Monthly subscription"
            price={plan.price}
            currency={plan.currency}
            duration={plan.duration}
            features={plan.features}
            highlight
            waService="Scribd Plus"
            waPlan="Scribd Plus — Monthly"
            waPrice={`₦${Number(plan.price).toLocaleString()} NGN/mo`}
            waLabel="Get Scribd Plus"
          />
        </div>
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// Zoom Section — monthly only, no toggle
// ─────────────────────────────────────────────────────────────

const ZoomSection = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_plan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/zoom`);
      if (!res.ok) throw new Error('Failed to fetch Zoom plan');
      const json = await res.json();
      setPlan(json.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_plan(); }, []);

  return (
    <SectionWrapper
      id="zoom"
      badge="Meetings"
      title={<>Zoom <span className="text-[#6967FB]">Pro</span></>}
      subtitle="Host unlimited meetings with up to 100 participants. Paid in Naira."
    >
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorBlock message={error} onRetry={fetch_plan} />}
      {!loading && !error && !plan && <EmptyBlock />}
      {!loading && !error && plan && (
        <div className="max-w-sm mx-auto">
          <PlanCard
            label="Zoom Pro"
            sublabel="Monthly subscription"
            price={plan.price}
            currency={plan.currency}
            duration={plan.duration}
            features={plan.features}
            highlight
            waService="Zoom Pro"
            waPlan="Zoom Pro — Monthly"
            waPrice={`₦${Number(plan.price).toLocaleString()} NGN/mo`}
            waLabel="Get Zoom Pro"
          />
        </div>
      )}
    </SectionWrapper>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
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
            <span className="text-[#C8F904] text-sm font-semibold px-4 py-2 bg-[#C8F904]/10 rounded-full border border-[#C8F904]/30">
              No Dollar Card Needed
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-6 mb-4 text-[#FFFFFF]">
              Digital <span className="text-[#6967FB]">Products</span>
            </h1>
            <p className="text-xl text-[#FFFFFF]/70 max-w-2xl mx-auto">
              Access Netflix, Canva, CapCut, Scribd, Zoom and more — all paid in Naira
              with instant delivery and zero international payment stress.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                className={`
                  px-6 py-3 rounded-full font-semibold text-base transition-all duration-300
                  ${activeTab === service.id
                    ? 'bg-[#6967FB] text-white shadow-lg shadow-[#6967FB]/30 scale-105'
                    : 'bg-[#FFFFFF]/5 text-[#FFFFFF]/70 border border-[#FFFFFF]/10 hover:text-white hover:border-[#6967FB]/50 hover:bg-[#FFFFFF]/10'
                  }
                `}
              >
                {service.label}
              </button>
            ))}
          </div>

          {/* Active Service Content */}
          <div className="transition-opacity duration-300 min-h-[500px]">
            {renderActiveSection()}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default DigitalProducts;