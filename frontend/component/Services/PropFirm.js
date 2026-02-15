import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import WhatsAppButton from '../Whatsappbutton';


// ─────────────────────────────────────────────
// Prop Firm Account Card
// ─────────────────────────────────────────────
const PropAccountCard = ({ account }) => {
  const price = account.price;

  const priceString = price
    ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 0 })} USD`
    : 'Price on Request';

  return (
    <div className="relative flex flex-col rounded-3xl p-8 border transition-all hover:scale-105 bg-[#FFFFFF]/5 border-[#FFFFFF]/10 hover:border-[#C8F904]/40">
      {/* Badge */}
      {account.isAvailable ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#C8F904] text-[#0E1A1F] text-xs font-bold px-5 py-1.5 rounded-full">
            AVAILABLE NOW
          </span>
        </div>
      ) : (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-red-500/80 text-white text-xs font-bold px-5 py-1.5 rounded-full">
            SOLD OUT
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-3xl font-bold text-[#FFFFFF] mb-2">{account.company}</h3>
        <p className="text-xl font-semibold text-[#C8F904]">{account.accountType}</p>
      </div>

      {/* Price */}
      <div className="mb-8 text-center">
        {price ? (
          <div className="flex items-end justify-center gap-2">
            <span className="text-5xl font-bold text-[#C8F904]">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xl text-[#FFFFFF]/70 mb-2">USD</span>
          </div>
        ) : (
          <p className="text-2xl font-semibold text-[#FFFFFF]/80">Price on Request</p>
        )}
      </div>

      {/* Description */}
      <p className="text-[#FFFFFF]/80 text-center mb-8 leading-relaxed text-lg">{account.description}</p>

      {/* Features */}
      {account.features?.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-[#C8F904] mb-4 text-center">Key Features</h4>
          <ul className="space-y-3">
            {account.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#C8F904] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#FFFFFF]/80 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {account.benefits?.length > 0 && (
        <div className="mb-10">
          <h4 className="text-lg font-semibold text-[#C8F904] mb-4 text-center">Benefits</h4>
          <ul className="space-y-3">
            {account.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#6967FB] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#FFFFFF]/80 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA — WhatsApp */}
      <div className="mt-auto">
        <WhatsAppButton
          service={`${account.company} — Funded Account`}
          plan={account.accountType}
          price={priceString}
          label={account.isAvailable ? 'Get Funded Account' : 'Currently Unavailable'}
          highlight
          disabled={!account.isAvailable}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Referral Card
// ─────────────────────────────────────────────
const ReferralCard = ({ referral }) => {
  const handleCopy = () => {
    if (referral.referralCode) {
      navigator.clipboard.writeText(referral.referralCode);
      alert('Referral code copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col rounded-3xl p-8 bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 hover:border-[#C8F904]/40 transition-all h-full">
      <div className="mb-6">
        <h3 className="text-3xl font-bold text-[#C8F904] mb-2">{referral.company}</h3>
        <p className="text-lg text-[#FFFFFF]/80">Exclusive Referral Offer</p>
      </div>

      {referral.referralCode && (
        <div className="mb-6">
          <label className="block text-sm text-[#FFFFFF]/70 mb-2 font-medium">Referral Code</label>
          <div className="flex items-center gap-3 bg-[#FFFFFF]/10 rounded-xl p-4 border border-[#FFFFFF]/20">
            <code className="text-xl font-mono text-[#C8F904] flex-1 break-all">{referral.referralCode}</code>
            <button
              onClick={handleCopy}
              className="bg-[#6967FB] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#6967FB]/90 transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {referral.referralLink && (
        <div className="mb-8">
          <label className="block text-sm text-[#FFFFFF]/70 mb-2 font-medium">Direct Referral Link</label>
          <a
            href={referral.referralLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C8F904] hover:underline break-all block text-base leading-relaxed"
          >
            {referral.referralLink}
          </a>
        </div>
      )}

      <div className="mb-10 flex-1">
        <h4 className="text-lg font-semibold text-[#C8F904] mb-3">How to Use</h4>
        <p className="text-[#FFFFFF]/80 leading-relaxed">{referral.instructions}</p>
      </div>

      {/* CTA — WhatsApp */}
      <WhatsAppButton
        service={`${referral.company} — Referral`}
        plan={referral.referralCode ? `Code: ${referral.referralCode}` : 'Referral Link'}
        price=""
        label="Apply Referral"
        highlight
        disabled={!referral.referralLink && !referral.referralCode}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Prop Firm Page
// ─────────────────────────────────────────────
const PropFirm = () => {
  const [accounts, setAccounts] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        // Accounts
        const accRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prop-firm/accounts`);
        if (!accRes.ok) throw new Error('Failed to load prop accounts');
        const accJson = await accRes.json();
        setAccounts(accJson.data || []);

        // Referrals
        const refRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prop-firm/referrals`);
        if (!refRes.ok) throw new Error('Failed to load referrals');
        const refJson = await refRes.json();
        setReferrals(refJson.data || []);

      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <Layout>
      <div className="py-20 px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">

          {/* ─── Header ──────────────────────────────────────── */}
          <div className="text-center mb-16">
            <span className="inline-block text-[#C8F904] text-sm font-semibold px-5 py-2.5 bg-[#C8F904]/10 rounded-full border border-[#C8F904]/30 mb-6">
              Pay in Naira • Instant Access
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#FFFFFF] mb-6">
              Prop Firm <span className="text-[#C8F904]">Accounts</span>
            </h1>
            <p className="text-xl text-[#FFFFFF]/70 max-w-3xl mx-auto leading-relaxed">
              Get funded trading accounts from the best prop firms — local payments in Naira, no dollar card required.
            </p>
          </div>

          {/* ─── Loading ─────────────────────────────────────── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-16 h-16 border-4 border-[#C8F904] border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-[#FFFFFF]/70 text-xl">Loading prop firm offers...</p>
            </div>
          )}

          {/* ─── Error ───────────────────────────────────────── */}
          {error && !loading && (
            <div className="text-center py-32">
              <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-10 max-w-lg mx-auto">
                <p className="text-[#FFFFFF] font-bold text-2xl mb-4">Something went wrong</p>
                <p className="text-[#FFFFFF]/70 mb-8">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#C8F904] text-[#0E1A1F] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#C8F904]/90 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* ─── Accounts Grid ───────────────────────────────── */}
          {!loading && !error && accounts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {accounts.map((account) => (
                <PropAccountCard key={account._id} account={account} />
              ))}
            </div>
          )}

          {!loading && !error && accounts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#FFFFFF]/70 text-2xl mb-4">No funded accounts available right now</p>
              <p className="text-[#FFFFFF]/50">New challenges and accounts are added regularly.</p>
            </div>
          )}

          {/* ─── Referrals Section ───────────────────────────── */}
          {!loading && !error && referrals.length > 0 && (
            <div className="mt-16 pt-16 border-t border-[#FFFFFF]/10">
              <div className="text-center mb-16">
                <span className="inline-block text-[#C8F904] text-sm font-semibold px-5 py-2.5 bg-[#C8F904]/10 rounded-full border border-[#C8F904]/30 mb-6">
                  Save Money
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-[#FFFFFF] mb-6">
                  Referral <span className="text-[#C8F904]">Discounts</span>
                </h2>
                <p className="text-xl text-[#FFFFFF]/70 max-w-3xl mx-auto">
                  Use our exclusive referral codes and links — get better pricing on evaluations and support the community.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {referrals.map((ref) => (
                  <ReferralCard key={ref._id} referral={ref} />
                ))}
              </div>
            </div>
          )}

          {!loading && !error && referrals.length === 0 && accounts.length > 0 && (
            <div className="mt-20 text-center text-[#FFFFFF]/60">
              No active referral offers at the moment — check back later!
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default PropFirm;