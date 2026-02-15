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

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-8 border transition-all hover:scale-105 ${
        isPro
          ? 'bg-[#6967FB] border-[#6967FB]'
          : 'bg-[#FFFFFF]/5 border-[#FFFFFF]/10 hover:border-[#C8F904]/50'
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#C8F904] text-[#0E1A1F] text-xs font-bold px-5 py-2 rounded-full shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}

      {/* Plan Name & Duration */}
      <div className="mb-6 text-center">
        <h3 className="text-3xl font-bold mb-2 text-white">{planLabel}</h3>
        <p className={`text-base font-medium ${isPro ? 'text-white/90' : 'text-[#C8F904]'}`}>
          {durationLabel}
        </p>
      </div>

      {/* Price */}
      <div className="mb-10 text-center">
        <div className="flex items-end justify-center gap-2">
          <span className={`text-5xl lg:text-6xl font-bold ${isPro ? 'text-[#C8F904]' : 'text-white'}`}>
            ₦{plan.price.toLocaleString()}
          </span>
          <span className={`text-xl mb-3 ${isPro ? 'text-white/80' : 'text-white/60'}`}>NGN</span>
        </div>
      </div>

      {/* Description (optional) */}
      {plan.description && (
        <p className="text-center text-white/70 mb-8 leading-relaxed">{plan.description}</p>
      )}

      {/* Features */}
      <ul className="space-y-4 mb-10 flex-1">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPro ? 'bg-[#C8F904]' : 'bg-[#C8F904]/80'}`}>
              <svg className="w-4 h-4 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={`text-base leading-relaxed ${isPro ? 'text-white/95' : 'text-white/85'}`}>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA — WhatsApp */}
      <WhatsAppButton
        service="FXReplay"
        plan={`${planLabel} — ${durationLabel}`}
        price={priceString}
        label={isPro ? 'Get Pro Access' : 'Choose Plan'}
        highlight={isPro}
      />
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
        setLoading(true);
        setError(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fxreplay`);
        if (!res.ok) throw new Error('Failed to load FXReplay plans');
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Request failed');
        setPlans(data.data || []);
      } catch (err) {
        console.error('FXReplay fetch error:', err);
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
            <span className="inline-block text-[#C8F904] text-sm font-semibold px-5 py-2.5 bg-[#C8F904]/10 rounded-full border border-[#C8F904]/30 mb-6">
              Local Payment • Instant Access
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              FXReplay <span className="text-[#C8F904]">Plans</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Choose the perfect access duration for market replay, backtesting, and strategy development — all payable in Naira.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-16 h-16 border-4 border-[#C8F904] border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-white/70 text-xl">Loading plans...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-32">
              <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-10 max-w-lg mx-auto">
                <p className="text-white font-bold text-2xl mb-4">Failed to load plans</p>
                <p className="text-white/70 mb-8">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#C8F904] text-[#0E1A1F] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#C8F904]/90 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          {!loading && !error && plans.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan) => (
                <PlanCard key={plan._id} plan={plan} />
              ))}
            </div>
          )}

          {/* No plans */}
          {!loading && !error && plans.length === 0 && (
            <div className="text-center py-32">
              <p className="text-white/70 text-2xl mb-4">No plans available at the moment</p>
              <p className="text-white/50">Please check back later or contact support.</p>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default FXReplay;