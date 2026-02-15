import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import WhatsAppButton from '../Whatsappbutton';

// ─────────────────────────────────────────────
// Plan Card Component
// ─────────────────────────────────────────────
const PlanCard = ({ plan, selectedDuration, selectedPurchaseType }) => {
  const isPremium = plan.type === 'premium';
  const isPlus = plan.type === 'plus';

  // ─── Find the BASE pricing (always look for individual first) ───
  const basePricing = plan.pricing.find(
    (p) =>
      p.duration === selectedDuration &&
      p.purchaseType === 'individual'
  );

  // If no individual pricing exists for this duration → no price available
  let matchedPricing = null;
  let finalPrice = null;
  let showDiscount = false;
  let isPartnership = selectedPurchaseType === 'partnership';

  if (basePricing) {
    finalPrice = basePricing.price;
    showDiscount = basePricing.discount > 0 && !isPartnership;

    if (isPartnership) {
      finalPrice = basePricing.price / 2;
    }

    matchedPricing = { ...basePricing, price: finalPrice };
  }

  const planLabels = {
    essential: 'Essential',
    plus: 'Plus',
    premium: 'Premium',
  };

  // Build readable price string for WhatsApp message
  const priceString = matchedPricing
    ? `₦${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}/${selectedDuration === 'monthly' ? 'mo' : 'yr'}${isPartnership ? ' per person (shared)' : ''}`
    : null;

  const planLabel = `TradingView ${planLabels[plan.type]}${isPartnership ? ' (Partnership)' : ''} — ${selectedDuration}`;

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-8 border transition-all hover:scale-105 ${
        isPremium
          ? 'bg-[#6967FB] border-[#6967FB]'
          : 'bg-[#FFFFFF]/5 border-[#FFFFFF]/10 hover:border-[#6967FB]/40'
      }`}
    >
      {/* Popular Badge */}
      {isPremium && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#C8F904] text-[#0E1A1F] text-xs font-bold px-4 py-1.5 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}

      {/* Plan Name */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-1 text-[#FFFFFF]">
          {planLabels[plan.type]}
        </h3>
        <p className={`text-sm ${isPremium ? 'text-[#FFFFFF]/80' : 'text-[#FFFFFF]/50'}`}>
          TradingView {planLabels[plan.type]} Plan
        </p>
      </div>

      {/* Price */}
      <div className="mb-8">
        {matchedPricing ? (
          <div>
            <div className="flex items-end gap-1">
              <span className={`text-5xl font-bold ${isPremium ? 'text-[#C8F904]' : 'text-[#FFFFFF]'}`}>
                ₦{finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
              <span className={`text-sm mb-2 ${isPremium ? 'text-[#FFFFFF]/80' : 'text-[#FFFFFF]/50'}`}>
                /{selectedDuration === 'monthly' ? 'mo' : 'yr'}
              </span>
              {isPartnership && (
                <span className="text-sm ml-3 text-[#C8F904]/90 font-medium mb-2">
                  per person (shared)
                </span>
              )}
            </div>
            {showDiscount && (
              <span className="inline-block mt-2 bg-[#C8F904]/20 text-[#C8F904] text-xs font-semibold px-3 py-1 rounded-full">
                {basePricing.discount}% OFF
              </span>
            )}
          </div>
        ) : (
          <p className={`text-sm ${isPremium ? 'text-[#FFFFFF]/80' : 'text-[#FFFFFF]/50'}`}>
            Not available for selected options
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPremium ? 'bg-[#C8F904]' : 'bg-[#6967FB]'}`}>
              <svg className={`w-3 h-3 ${isPremium ? 'text-[#0E1A1F]' : 'text-[#FFFFFF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={`text-sm ${isPremium ? 'text-[#FFFFFF]/90' : 'text-[#FFFFFF]/70'}`}>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA — WhatsApp */}
      <WhatsAppButton
        service="TradingView"
        plan={planLabel}
        price={priceString || 'Price unavailable'}
        label={isPartnership ? `Get Shared ${planLabels[plan.type]}` : `Get ${planLabels[plan.type]}`}
        highlight={isPremium}
        disabled={!matchedPricing}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Main TradingView Page
// ─────────────────────────────────────────────
const Tradingview = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [selectedPurchaseType, setSelectedPurchaseType] = useState('individual');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tradingview`);
        if (!res.ok) throw new Error('Failed to fetch plans');
        const data = await res.json();
        setPlans(data);
      } catch (err) {
        console.error('Fetch plans error:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // ── Determine which durations actually have pricing data ──
  const availableDurations = ['monthly', 'yearly'].filter((dur) =>
    plans.some((plan) => plan.pricing?.some((p) => p.duration === dur))
  );

  // If currently selected duration has no data, fall back to first available
  const activeDuration = availableDurations.includes(selectedDuration)
    ? selectedDuration
    : availableDurations[0] || 'monthly';

  return (
    <Layout>
      <div className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="text-center mb-16">
            <span className="text-[#C8F904] text-sm font-semibold px-4 py-2 bg-[#C8F904]/10 rounded-full border border-[#C8F904]/30">
              No Dollar Card Needed
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-6 mb-4 text-[#FFFFFF]">
              TradingView{' '}
              <span className="text-[#6967FB]">Plans</span>
            </h1>
            <p className="text-xl text-[#FFFFFF]/70 max-w-2xl mx-auto">
              Get discounted access to TradingView Pro, Pro+, and Premium plans —
              paid directly in Naira with zero international payment stress.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">

            {/* Duration Toggle — only show if more than one duration available */}
            {availableDurations.length > 1 && (
              <div className="bg-[#FFFFFF]/5 rounded-full p-1 flex border border-[#FFFFFF]/10">
                {availableDurations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-6 py-2.5 rounded-full font-semibold text-sm capitalize transition-all ${
                      activeDuration === duration
                        ? 'bg-[#6967FB] text-[#FFFFFF]'
                        : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF]'
                    }`}
                  >
                    {duration}
                    {duration === 'yearly' && (
                      <span className="ml-2 text-[#C8F904] text-xs font-bold">SAVE</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Purchase Type Toggle */}
            <div className="bg-[#FFFFFF]/5 rounded-full p-1 flex border border-[#FFFFFF]/10">
              {['individual', 'partnership'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedPurchaseType(type)}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm capitalize transition-all ${
                    selectedPurchaseType === type
                      ? 'bg-[#6967FB] text-[#FFFFFF]'
                      : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF]'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Partnership Hint */}
          {selectedPurchaseType === 'partnership' && (
            <div className="text-center text-[#C8F904] text-sm font-medium mb-8 max-w-3xl mx-auto">
              Partnership plan — split the cost with one other trader (50% each). Prices shown are per person.
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#6967FB] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#FFFFFF]/70">Loading plans...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-20">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[#FFFFFF] font-semibold mb-2">Failed to load plans</p>
                <p className="text-[#FFFFFF]/60 text-sm mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#6967FB] text-[#FFFFFF] px-6 py-2.5 rounded-full font-semibold hover:bg-[#6967FB]/90 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          {!loading && !error && plans.length > 0 && (
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {plans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  selectedDuration={activeDuration}
                  selectedPurchaseType={selectedPurchaseType}
                />
              ))}
            </div>
          )}

          {/* No Plans State */}
          {!loading && !error && plans.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-[#FFFFFF]/70 text-lg">No plans available at the moment.</p>
                <p className="text-[#FFFFFF]/40 text-sm mt-2">Please check back later.</p>
              </div>
            </div>
          )}

          {/* FAQs / Info Section */}
          <div className="mt-20 bg-[#FFFFFF]/5 rounded-3xl p-8 lg:p-12 border border-[#FFFFFF]/10">
            <h2 className="text-3xl font-bold mb-8 text-[#FFFFFF]">
              Why Buy Through{' '}
              <span className="text-[#6967FB]">FidelityTradersHub?</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'No Dollar Card Needed', desc: 'Pay directly in Naira using your local bank account or mobile money.' },
                { title: 'Discounted Prices', desc: 'Get TradingView plans at up to 30% less than the standard international price.' },
                { title: 'Instant Activation', desc: 'Your subscription is activated immediately after payment is confirmed.' },
                { title: '24/7 Support', desc: 'Our team is available round the clock to help with any issues.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-[#C8F904] rounded-full flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-4 h-4 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FFFFFF] mb-1">{item.title}</h4>
                    <p className="text-[#FFFFFF]/60 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Tradingview;