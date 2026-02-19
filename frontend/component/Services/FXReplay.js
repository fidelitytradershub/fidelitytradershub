import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import WhatsAppButton from '../Whatsappbutton';

// ─────────────────────────────────────────────
// Plan Card Component
// ─────────────────────────────────────────────
const PlanCard = ({ plan }) => {
  const isPro = plan.name === 'pro';
  const isPopular = plan.name === 'intermediate';

  const planLabels = {
    'basic-5-days': 'Basic 5-Day',
    'basic-monthly': 'Basic Monthly',
    intermediate: 'Intermediate',
    pro: 'Pro',
  };

  const durationText = {
    'basic-5-days': '5 Days Access',
    'basic-monthly': '30 Days Access',
    intermediate: '30 Days Access',
    pro: '30 Days Access',
  };

  const priceString = `₦${plan.price.toLocaleString()} NGN`;
  const planLabel = planLabels[plan.name] || plan.name;
  const durationLabel = durationText[plan.name] || `${plan.durationDays} Days`;

  if (isPro) {
    return (
      <div className="relative flex flex-col rounded-3xl p-8 bg-[#0E1A1F] transition-all hover:scale-[1.025] shadow-2xl shadow-[#0E1A1F]/25">
        {/* Lime accent line */}
        <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[#C8F904]/70 to-transparent rounded-full" />

        <div className="mb-6 text-center">
          <span className="inline-block bg-[#C8F904] text-[#0E1A1F] text-xs font-black px-4 py-1 rounded-full tracking-widest uppercase mb-3">
            Pro Access
          </span>
          <h3 className="text-3xl font-black text-white mb-1">{planLabel}</h3>
          <p className="text-[#C8F904] text-sm font-bold">{durationLabel}</p>
        </div>

        <div className="mb-10 text-center">
          <div className="flex items-end justify-center gap-2">
            <span className="text-6xl font-black text-[#C8F904] leading-none">
              ₦{plan.price.toLocaleString()}
            </span>
            <span className="text-xl text-white/40 mb-2">NGN</span>
          </div>
        </div>

        {plan.description && (
          <p className="text-center text-white/55 mb-8 leading-relaxed text-sm">{plan.description}</p>
        )}

        <ul className="space-y-3.5 mb-10 flex-1">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#C8F904] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-white/75 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        <WhatsAppButton service="FXReplay" plan={`${planLabel} — ${durationLabel}`}
          price={priceString} label="Get Pro Access" highlight={true} />
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col rounded-3xl p-8 bg-white border-2 transition-all hover:scale-[1.025]
      ${isPopular
        ? 'border-[#6967FB] shadow-xl shadow-[#6967FB]/15'
        : 'border-[#0E1A1F]/8 hover:border-[#6967FB]/30 hover:shadow-lg hover:shadow-[#6967FB]/8 shadow-sm'
      }`}>

      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#6967FB] text-white text-xs font-black px-5 py-1.5 rounded-full shadow-md shadow-[#6967FB]/30 tracking-wider">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="mb-6 text-center">
        <h3 className="text-2xl font-black text-[#0E1A1F] mb-1">{planLabel}</h3>
        <p className="text-[#6967FB] text-sm font-bold">{durationLabel}</p>
      </div>

      <div className="mb-10 text-center">
        <div className="flex items-end justify-center gap-2">
          <span className="text-5xl font-black text-[#0E1A1F] leading-none">
            ₦{plan.price.toLocaleString()}
          </span>
          <span className="text-lg text-[#0E1A1F]/35 mb-2">NGN</span>
        </div>
      </div>

      {plan.description && (
        <p className="text-center text-[#0E1A1F]/50 mb-8 leading-relaxed text-sm">{plan.description}</p>
      )}

      <ul className="space-y-3.5 mb-10 flex-1">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#6967FB] flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-[#0E1A1F]/65 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <WhatsAppButton service="FXReplay" plan={`${planLabel} — ${durationLabel}`}
        price={priceString} label="Choose Plan" highlight={false} />
    </div>
  );
};

// ─────────────────────────────────────────────
// Main FXReplay Page
// ─────────────────────────────────────────────
const FXReplay = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fxreplay`);
        if (!res.ok) throw new Error('Failed to load FXReplay plans');
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Request failed');
        setPlans(data.data || []);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <Layout>
      <div className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-10 bg-[#C8F904]" />
              <span className="text-[#6967FB] text-xs font-black tracking-widest uppercase px-4 py-2 bg-[#6967FB]/8 rounded-full border border-[#6967FB]/20">
                Local Payment • Instant Access
              </span>
              <div className="h-px w-10 bg-[#C8F904]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#0E1A1F] mb-5 tracking-tight leading-tight">
              FXReplay <span className="text-[#6967FB]">Plans</span>
            </h1>
            <p className="text-lg text-[#0E1A1F]/50 max-w-2xl mx-auto leading-relaxed">
              Choose the perfect access duration for market replay, backtesting, and strategy development — all payable in Naira.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-5">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-[#6967FB]/20" />
                <div className="absolute inset-0 rounded-full border-4 border-[#6967FB] border-t-transparent animate-spin" />
              </div>
              <p className="text-[#0E1A1F]/40 font-semibold">Loading plans...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-32">
              <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-12 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[#0E1A1F] font-black text-2xl mb-3">Failed to load plans</p>
                <p className="text-[#0E1A1F]/50 mb-8">{error}</p>
                <button onClick={() => window.location.reload()}
                  className="bg-[#6967FB] text-white px-10 py-3.5 rounded-full font-black hover:bg-[#6967FB]/90 transition shadow-lg shadow-[#6967FB]/25">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          {!loading && !error && plans.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {plans.map((plan) => <PlanCard key={plan._id} plan={plan} />)}
            </div>
          )}

          {/* No plans */}
          {!loading && !error && plans.length === 0 && (
            <div className="text-center py-32">
              <p className="text-[#0E1A1F]/40 text-xl font-semibold mb-3">No plans available at the moment</p>
              <p className="text-[#0E1A1F]/30">Please check back later or contact support.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FXReplay;