import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import WhatsAppButton from '../Whatsappbutton';

// ─────────────────────────────────────────────
// Plan Card Component
// ─────────────────────────────────────────────
const PlanCard = ({ plan, selectedDuration, selectedPurchaseType }) => {
  const isPremium = plan.type === 'premium';

  const basePricing = plan.pricing.find(
    (p) => p.duration === selectedDuration && p.purchaseType === 'individual'
  );

  let matchedPricing = null;
  let finalPrice = null;
  let showDiscount = false;
  const isPartnership = selectedPurchaseType === 'partnership';

  if (basePricing) {
    finalPrice = isPartnership ? basePricing.price / 2 : basePricing.price;
    showDiscount = basePricing.discount > 0 && !isPartnership;
    matchedPricing = { ...basePricing, price: finalPrice };
  }

  const planLabels = { essential: 'Essential', plus: 'Plus', premium: 'Premium' };
  const priceString = matchedPricing
    ? `₦${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}/${selectedDuration === 'monthly' ? 'mo' : 'yr'}${isPartnership ? ' per person' : ''}`
    : null;
  const planLabel = `TradingView ${planLabels[plan.type]}${isPartnership ? ' (Partnership)' : ''} — ${selectedDuration}`;

  if (isPremium) {
    return (
      <div className="relative flex flex-col rounded-3xl p-8 bg-[#0E1A1F] transition-all hover:scale-[1.025] shadow-2xl shadow-[#0E1A1F]/25">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#C8F904] text-[#0E1A1F] text-xs font-black px-5 py-1.5 rounded-full tracking-wider shadow-lg shadow-[#C8F904]/30">
            MOST POPULAR
          </span>
        </div>
        {/* Lime accent line */}
        <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[#C8F904]/70 to-transparent rounded-full" />

        <div className="mb-6 pt-2">
          <h3 className="text-2xl font-black text-white mb-1">{planLabels[plan.type]}</h3>
          <p className="text-white/40 text-sm">TradingView {planLabels[plan.type]} Plan</p>
        </div>

        <div className="mb-8">
          {matchedPricing ? (
            <div>
              <div className="flex items-end gap-1.5 flex-wrap">
                <span className="text-5xl font-black text-[#C8F904] leading-none">
                  ₦{finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </span>
                <span className="text-white/40 text-sm mb-1.5">
                  /{selectedDuration === 'monthly' ? 'mo' : 'yr'}
                </span>
                {isPartnership && (
                  <span className="text-[#C8F904]/80 text-xs font-bold mb-1.5 ml-1">per person</span>
                )}
              </div>
              {showDiscount && (
                <span className="inline-block mt-3 bg-[#C8F904] text-[#0E1A1F] text-xs font-black px-3 py-1 rounded-full">
                  {basePricing.discount}% OFF
                </span>
              )}
            </div>
          ) : (
            <p className="text-white/40 text-sm">Not available for selected options</p>
          )}
        </div>

        <ul className="space-y-3.5 mb-8 flex-1">
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

        <WhatsAppButton service="TradingView" plan={planLabel}
          price={priceString || 'Price unavailable'}
          label={isPartnership ? `Get Shared ${planLabels[plan.type]}` : `Get ${planLabels[plan.type]}`}
          highlight={true} disabled={!matchedPricing} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col rounded-3xl p-8 bg-white border-2 border-[#0E1A1F]/8 transition-all hover:scale-[1.025] hover:border-[#6967FB]/30 hover:shadow-xl hover:shadow-[#6967FB]/8 shadow-sm">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-[#0E1A1F] mb-1">{planLabels[plan.type]}</h3>
        <p className="text-[#0E1A1F]/40 text-sm">TradingView {planLabels[plan.type]} Plan</p>
      </div>

      <div className="mb-8">
        {matchedPricing ? (
          <div>
            <div className="flex items-end gap-1.5 flex-wrap">
              <span className="text-5xl font-black text-[#0E1A1F] leading-none">
                ₦{finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
              <span className="text-[#0E1A1F]/35 text-sm mb-1.5">
                /{selectedDuration === 'monthly' ? 'mo' : 'yr'}
              </span>
              {isPartnership && (
                <span className="text-[#6967FB] text-xs font-bold mb-1.5 ml-1">per person</span>
              )}
            </div>
            {showDiscount && (
              <span className="inline-block mt-3 bg-[#6967FB]/10 text-[#6967FB] text-xs font-black px-3 py-1 rounded-full border border-[#6967FB]/20">
                {basePricing.discount}% OFF
              </span>
            )}
          </div>
        ) : (
          <p className="text-[#0E1A1F]/35 text-sm">Not available for selected options</p>
        )}
      </div>

      <ul className="space-y-3.5 mb-8 flex-1">
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

      <WhatsAppButton service="TradingView" plan={planLabel}
        price={priceString || 'Price unavailable'}
        label={isPartnership ? `Get Shared ${planLabels[plan.type]}` : `Get ${planLabels[plan.type]}`}
        highlight={false} disabled={!matchedPricing} />
    </div>
  );
};

// ─────────────────────────────────────────────
// Toggle Button Group
// ─────────────────────────────────────────────
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
        setPlans(await res.json());
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const availableDurations = ['monthly', 'yearly'].filter((dur) =>
    plans.some((plan) => plan.pricing?.some((p) => p.duration === dur))
  );
  const activeDuration = availableDurations.includes(selectedDuration)
    ? selectedDuration : availableDurations[0] || 'monthly';

  return (
    <Layout>
      <div className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-10 bg-[#C8F904]" />
              <span className="text-[#6967FB] text-xs font-black tracking-widest uppercase px-4 py-2 bg-[#6967FB]/8 rounded-full border border-[#6967FB]/20">
                No Dollar Card Needed
              </span>
              <div className="h-px w-10 bg-[#C8F904]" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-black mb-5 text-[#0E1A1F] tracking-tight leading-tight">
              TradingView <span className="text-[#6967FB]">Plans</span>
            </h1>
            <p className="text-lg text-[#0E1A1F]/50 max-w-2xl mx-auto leading-relaxed">
              Get discounted access to TradingView Pro, Pro+, and Premium plans —
              paid directly in Naira with zero international payment stress.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            {availableDurations.length > 1 && (
              <TabToggle active={activeDuration} onChange={setSelectedDuration}
                options={availableDurations.map((d) => ({
                  key: d,
                  label: d === 'yearly' ? '🏷️ Yearly — SAVE' : 'Monthly',
                }))} />
            )}
            <TabToggle active={selectedPurchaseType} onChange={setSelectedPurchaseType}
              options={[
                { key: 'individual', label: 'Individual' },
                { key: 'partnership', label: 'Partnership' },
              ]} />
          </div>

          {/* Partnership hint */}
          {selectedPurchaseType === 'partnership' && (
            <div className="text-center mb-10">
              <span className="inline-block bg-[#6967FB]/8 text-[#6967FB] text-sm font-bold px-6 py-2.5 rounded-full border border-[#6967FB]/20">
                💡 Split the cost 50/50 with one other trader — prices shown per person
              </span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-[#6967FB]/20" />
                <div className="absolute inset-0 rounded-full border-4 border-[#6967FB] border-t-transparent animate-spin" />
              </div>
              <p className="text-[#0E1A1F]/40 font-semibold">Loading plans...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center justify-center py-20">
              <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-10 text-center max-w-md">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[#0E1A1F] font-black text-xl mb-2">Failed to load plans</p>
                <p className="text-[#0E1A1F]/50 text-sm mb-7">{error}</p>
                <button onClick={() => window.location.reload()}
                  className="bg-[#6967FB] text-white px-8 py-3 rounded-full font-black hover:bg-[#6967FB]/90 transition shadow-lg shadow-[#6967FB]/25">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          {!loading && !error && plans.length > 0 && (
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {plans.map((plan) => (
                <PlanCard key={plan._id} plan={plan}
                  selectedDuration={activeDuration}
                  selectedPurchaseType={selectedPurchaseType} />
              ))}
            </div>
          )}

          {/* No Plans */}
          {!loading && !error && plans.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#0E1A1F]/40 text-xl font-semibold mb-2">No plans available at the moment.</p>
              <p className="text-[#0E1A1F]/30 text-sm">Please check back later.</p>
            </div>
          )}

          {/* Why Buy Section */}
          <div className="mt-20 rounded-3xl p-8 lg:p-12 border-2 border-[#0E1A1F]/7 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-[#C8F904] rounded-full" />
              <h2 className="text-3xl font-black text-[#0E1A1F]">
                Why Buy Through <span className="text-[#6967FB]">FidelityTradersHub?</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'No Dollar Card Needed', desc: 'Pay directly in Naira using your local bank account or mobile money.' },
                { title: 'Discounted Prices', desc: 'Get TradingView plans at up to 30% less than the standard international price.' },
                { title: 'Instant Activation', desc: 'Your subscription is activated immediately after payment is confirmed.' },
                { title: '24/7 Support', desc: 'Our team is available round the clock to help with any issues.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-5 rounded-2xl bg-[#0E1A1F]/3 border border-[#0E1A1F]/5">
                  <div className="w-8 h-8 bg-[#C8F904] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-[#0E1A1F] mb-1">{item.title}</h4>
                    <p className="text-[#0E1A1F]/50 text-sm leading-relaxed">{item.desc}</p>
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