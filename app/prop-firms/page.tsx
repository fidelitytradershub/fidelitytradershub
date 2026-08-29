"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PropFirmProduct = {
  id: string;
  program_id: string;
  name: string;
  prop_firm: string;
  account_size: number;
  phase: string;
  native_currency: string;
  price: number;
  currency: string;
  description: string | null;
  features: string[];
  stock_quantity: number;
  allow_buy_now: boolean;
  allow_pay_small_small: boolean;
};

export default function PropFirmsPage() {
  const [user, setUser] = useState<any>(null);

  const [products, setProducts] = useState<PropFirmProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [buyingOfferId, setBuyingOfferId] = useState<string | null>(null);
  const [savingOfferId, setSavingOfferId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  // Request-account form
  const [requestFirm, setRequestFirm] = useState("");
  const [requestAccountSize, setRequestAccountSize] = useState("");
  const [requestPhase, setRequestPhase] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    async function loadPage() {
      const { data: sessionData } =
        await supabase.auth.getSession();

      setUser(sessionData.session?.user ?? null);

      const [
        { data: firms, error: firmsError },
        { data: programs, error: programsError },
        { data: offers, error: offersError },
      ] = await Promise.all([
        supabase
          .from("prop_firms")
          .select("id, name, active")
          .eq("active", true),

        supabase
          .from("prop_programs")
          .select("id, firm_id, name, phase, native_currency, account_sizes, rules"),

        supabase
          .from("prop_offers")
          .select(
            "id, program_id, account_size, price, currency, description, features, stock_quantity, allow_buy_now, allow_pay_small_small, active, created_at"
          )
          .eq("active", true)
          .gt("stock_quantity", 0)
          .order("created_at", { ascending: false }),
      ]);

      const firstError = firmsError || programsError || offersError;

      if (firstError) {
        console.error("Prop firms error:", firstError);
        setErrorMessage(firstError.message);
        setLoading(false);
        return;
      }

      const firmMap = new Map(
        (firms ?? []).map((firm: any) => [firm.id, firm])
      );

      const programMap = new Map(
        (programs ?? []).map((program: any) => [program.id, program])
      );

      const joinedProducts: PropFirmProduct[] = (offers ?? [])
        .map((offer: any) => {
          const program: any = programMap.get(offer.program_id);

          if (!program) return null;

          const firm: any = firmMap.get(program.firm_id);

          if (!firm) return null;

          return {
            id: offer.id,
            program_id: offer.program_id,
            name: program.name || "Prop Firm Account",
            prop_firm: firm.name,
            account_size: Number(offer.account_size),
            phase: program.phase || "Not specified",
            native_currency: program.native_currency || "USD",
            price: Number(offer.price),
            currency: offer.currency || "NGN",
            description: offer.description,
            features: Array.isArray(offer.features) ? offer.features : [],
            stock_quantity: Number(offer.stock_quantity ?? 0),
            allow_buy_now: Boolean(offer.allow_buy_now),
            allow_pay_small_small: Boolean(offer.allow_pay_small_small),
          };
        })
        .filter(Boolean) as PropFirmProduct[];

      setProducts(joinedProducts);
      setLoading(false);
    }

    loadPage();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const searchable = [
        product.name,
        product.prop_firm,
        String(product.account_size),
        product.phase,
        ...(product.features ?? []),
        product.description ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [products, search]);

  function formatPrice(
    product: PropFirmProduct
  ) {
    const currency =
      product.currency?.toUpperCase() ||
      "NGN";

    if (currency === "NGN") {
      return `₦${Number(
        product.price
      ).toLocaleString()}`;
    }

    return `${currency} ${Number(
      product.price
    ).toLocaleString()}`;
  }

  async function buyProduct(
    product: PropFirmProduct
  ) {
    if (!user) {
      alert(
        "Please sign in before purchasing an account."
      );

      window.location.href = "/logins";
      return;
    }

    const confirmed = window.confirm(
      `Buy ${product.prop_firm} ${product.name} — ${product.native_currency} ${Number(
        product.account_size
      ).toLocaleString()} for ${formatPrice(product)} from your wallet?`
    );

    if (!confirmed) return;

    setBuyingOfferId(product.id);

    const { data, error } = await supabase.rpc(
      "buy_prop_offer",
      {
        p_offer_id: product.id,
      }
    );

    if (error) {
      console.error("Prop offer purchase error:", error);

      const message = error.message || "Purchase failed.";

      if (message.toLowerCase().includes("insufficient wallet balance")) {
        alert(
          `${message}\n\nPlease fund your wallet from the dashboard and try again.`
        );
      } else if (message.toLowerCase().includes("out of stock")) {
        alert(
          "This account has just gone out of stock. The page will refresh now."
        );
        window.location.reload();
      } else {
        alert(message);
      }

      setBuyingOfferId(null);
      return;
    }

    setBuyingOfferId(null);

    alert(
      `${data?.message || "Prop firm account purchased successfully."}\n\nYour new trading account has been added to your Trade Journal.`
    );

    window.location.href = "/dashboard";
  }

  async function saveTowardProduct(
    product: PropFirmProduct
  ) {
    if (!user) {
      alert(
        "Please sign in before creating a savings goal."
      );

      window.location.href = "/logins";
      return;
    }

    const confirmed = window.confirm(
      `Start Pay Small Small for ${product.prop_firm} ${product.name} — ${product.native_currency} ${Number(
        product.account_size
      ).toLocaleString()} with a target of ${formatPrice(product)}?`
    );

    if (!confirmed) return;

    setSavingOfferId(product.id);

    const { data, error } = await supabase.rpc(
      "create_prop_savings_goal",
      {
        p_offer_id: product.id,
      }
    );

    if (error) {
      console.error("Create savings goal error:", error);
      alert(
        error.message ||
          "Could not create Pay Small Small goal."
      );
      setSavingOfferId(null);
      return;
    }

    setSavingOfferId(null);

    const goalId =
      typeof data === "number" || typeof data === "string"
        ? String(data)
        : "";

    alert(
      "Pay Small Small goal is ready. You can now add money from your Fidelity Wallet."
    );

    window.location.href = goalId
      ? `/dashboard?goal=${encodeURIComponent(goalId)}#pay-small-small`
      : "/dashboard#pay-small-small";
  }

  async function submitRequest(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!user) {
      alert(
        "Please sign in before requesting a prop firm account."
      );

      window.location.href = "/logins";
      return;
    }

    const firm = requestFirm.trim();

    if (!firm) {
      alert(
        "Enter the prop firm you are looking for."
      );
      return;
    }

    setSubmittingRequest(true);

    const { error } = await supabase
      .from("prop_firm_requests")
      .insert({
        user_id: user.id,
        prop_firm: firm,
        account_size:
          requestAccountSize.trim() ||
          null,
        phase:
          requestPhase.trim() ||
          null,
        notes:
          requestNotes.trim() ||
          null,
        status: "pending",
      });

    if (error) {
      console.error(
        "Prop firm request error:",
        error
      );

      alert(
        `Could not submit request: ${error.message}`
      );

      setSubmittingRequest(false);
      return;
    }

    setRequestFirm("");
    setRequestAccountSize("");
    setRequestPhase("");
    setRequestNotes("");

    setSubmittingRequest(false);

    alert(
      "Your prop firm request has been submitted successfully."
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}

      <header className="border-b border-slate-800 bg-[#071A33]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-5 md:flex-row md:items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 font-black text-[#071A33]">
              F
            </div>

            <div>
              <p className="font-bold">
                Fidelity Traders Hub
              </p>

              <p className="text-xs text-slate-400">
                Prop Firm Center
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-slate-300 hover:bg-white/5"
            >
              Home
            </Link>

            <Link
              href="/prop-firms"
              className="rounded-xl bg-white/10 px-4 py-2 font-semibold"
            >
              Prop Firms
            </Link>

            <Link
              href="/marketplace"
              className="rounded-xl px-4 py-2 text-slate-300 hover:bg-white/5"
            >
              Marketplace
            </Link>

            <Link
              href="/dashboard#pay-small-small"
              className="rounded-xl px-4 py-2 text-slate-300 hover:bg-white/5"
            >
              Pay Small Small
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* HERO */}

        <section className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#071A33] via-slate-900 to-blue-950 p-7 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Fidelity Prop Firm Center
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">
            Find the trading account
            that fits your journey.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Buy accounts currently
            available from Fidelity
            Traders Hub, save toward one
            with Pay Small Small, or
            request a prop firm we do not
            currently have in stock.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#available"
              className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-[#071A33]"
            >
              View Available Accounts
            </a>

            <a
              href="#request"
              className="rounded-xl border border-white/10 px-5 py-3 font-semibold"
            >
              Request an Account
            </a>
          </div>
        </section>

        {/* SEARCH */}

        <section
          id="available"
          className="mt-10"
        >
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                Available Now
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Accounts From Fidelity
                Traders Hub
              </h2>

              <p className="mt-2 text-slate-400">
                These products are posted
                and managed directly from
                your Fidelity Traders Hub
                inventory.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <label
                htmlFor="search"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Search Accounts
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Funding Pips, $100K, 2-Step..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {loading && (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              Loading available accounts...
            </div>
          )}

          {errorMessage && (
            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <p className="font-semibold text-red-400">
                Could not load available
                accounts.
              </p>

              <p className="mt-2 text-sm text-red-300">
                {errorMessage}
              </p>
            </div>
          )}

          {!loading &&
            !errorMessage &&
            filteredProducts.length ===
              0 && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-slate-400">
                  No matching accounts
                  are currently available.
                </p>
              </div>
            )}

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map(
              (product) => (
                <article
                  key={product.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-amber-400">
                        {
                          product.prop_firm
                        }
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {product.name}
                      </h3>
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      Available
                    </span>
                  </div>

                  {product.description && (
                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      {
                        product.description
                      }
                    </p>
                  )}

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between border-b border-slate-800 pb-3">
                      <span className="text-sm text-slate-500">
                        Account Size
                      </span>

                      <span className="font-semibold">
                        {product.native_currency}{" "}
                        {Number(
                          product.account_size
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800 pb-3">
                      <span className="text-sm text-slate-500">
                        Phase
                      </span>

                      <span className="font-semibold">
                        {product.phase}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-3">
                      <span className="text-sm text-slate-500">
                        Stock
                      </span>

                      <span className="font-semibold text-emerald-400">
                        {product.stock_quantity} available
                      </span>
                    </div>

                    <div className="flex justify-between pb-3">
                      <span className="text-sm text-slate-500">
                        Price
                      </span>

                      <span className="text-lg font-bold text-amber-400">
                        {formatPrice(
                          product
                        )}
                      </span>
                    </div>
                  </div>

                  {product.features.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Features
                      </p>

                      <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        {product.features.slice(0, 6).map((feature) => (
                          <li key={feature}>✓ {feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {product.allow_buy_now && (
                    <button
                      type="button"
                      onClick={() =>
                        buyProduct(
                          product
                        )
                      }
                      disabled={buyingOfferId === product.id}
                      className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {buyingOfferId === product.id
                        ? "Purchasing..."
                        : "Buy Now"}
                    </button>
                    )}

                    {product.allow_pay_small_small && (
                    <button
                      type="button"
                      onClick={() =>
                        saveTowardProduct(
                          product
                        )
                      }
                      disabled={savingOfferId === product.id}
                      className="rounded-xl border border-amber-500/40 px-4 py-3 text-sm font-semibold text-amber-300 hover:bg-amber-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingOfferId === product.id
                        ? "Creating Goal..."
                        : "Pay Small Small"}
                    </button>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        {/* HOW BOTH SYSTEMS WORK */}

        <section className="mt-14 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl">
              ⚡
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Available From Fidelity
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              These are accounts you
              currently have available.
              Clients can purchase
              immediately using their
              wallet or start saving
              toward them.
            </p>

            <p className="mt-4 text-sm text-emerald-400">
              Admin controls stock,
              pricing, descriptions and
              availability.
            </p>
          </div>

          <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-xl">
              🔎
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Can't Find Your Firm?
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Customers can request
              Funding Pips, FundedNext,
              FTMO, Instant Funding or
              another account even when
              Fidelity Traders Hub does
              not currently have it
              listed.
            </p>

            <a
              href="#request"
              className="mt-5 inline-block font-semibold text-purple-400"
            >
              Request an account →
            </a>
          </div>
        </section>

        {/* REQUEST FORM */}

        <section
          id="request"
          className="mt-14"
        >
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-purple-400">
                  Custom Request
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Request a Prop Firm
                  Account
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Tell Fidelity Traders
                  Hub what you are
                  looking for. Your
                  request will be sent
                  to Admin for review.
                </p>

                <div className="mt-6 space-y-3 text-sm text-slate-400">
                  <p>
                    ✓ Choose any prop
                    firm.
                  </p>
                  <p>
                    ✓ Enter the account
                    size you want.
                  </p>
                  <p>
                    ✓ Add the challenge
                    type or phase.
                  </p>
                  <p>
                    ✓ Admin can contact
                    you after reviewing
                    the request.
                  </p>
                </div>
              </div>

              <form
                onSubmit={
                  submitRequest
                }
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="requestFirm"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Prop Firm *
                  </label>

                  <input
                    id="requestFirm"
                    type="text"
                    required
                    value={requestFirm}
                    onChange={(e) =>
                      setRequestFirm(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Funding Pips"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="requestSize"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Account Size
                    </label>

                    <input
                      id="requestSize"
                      type="text"
                      value={
                        requestAccountSize
                      }
                      onChange={(e) =>
                        setRequestAccountSize(
                          e.target.value
                        )
                      }
                      placeholder="$100K"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="requestPhase"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Phase / Type
                    </label>

                    <input
                      id="requestPhase"
                      type="text"
                      value={
                        requestPhase
                      }
                      onChange={(e) =>
                        setRequestPhase(
                          e.target.value
                        )
                      }
                      placeholder="2-Step / Instant"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="requestNotes"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Additional Details
                  </label>

                  <textarea
                    id="requestNotes"
                    rows={5}
                    value={requestNotes}
                    onChange={(e) =>
                      setRequestNotes(
                        e.target.value
                      )
                    }
                    placeholder="Tell us the exact challenge, budget, special requirements, etc."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    submittingRequest
                  }
                  className="w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingRequest
                    ? "Submitting Request..."
                    : "Submit Account Request"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* BOTTOM */}

        <section className="mt-14 rounded-3xl bg-[#071A33] p-7 text-center sm:p-10">
          <h2 className="text-3xl font-bold">
            Don't have the full amount
            today?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Start with what you have and
            save toward the account you
            want through Fidelity Pay
            Small Small.
          </p>

          <Link
            href="/dashboard#pay-small-small"
            className="mt-6 inline-block rounded-xl bg-amber-400 px-6 py-3 font-bold text-[#071A33]"
          >
            Start Saving
          </Link>
        </section>
      </div>
    </main>
  );
}
