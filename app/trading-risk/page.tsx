import Link from "next/link";

export default function TradingRiskPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          ← Back to Fidelity Traders Hub
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Legal
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Trading Risk Disclaimer
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Fidelity Traders Hub
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="text-lg font-bold text-red-300">
            Important Risk Warning
          </h2>

          <p className="mt-3 leading-7 text-slate-300">
            Trading foreign exchange, CFDs, cryptocurrencies,
            proprietary trading accounts, and other leveraged or
            speculative products involves substantial risk and may
            result in significant financial loss.
          </p>

          <p className="mt-3 leading-7 text-slate-300">
            You should never trade money you cannot afford to lose.
          </p>
        </div>

        <div className="mt-10 space-y-10 leading-7 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white">
              1. No Guarantee of Profit
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub does not guarantee profits,
              investment returns, successful funded-account outcomes,
              passing of prop firm challenges, or successful trading
              performance.
            </p>

            <p className="mt-3">
              Past performance, historical statistics, backtests,
              journal results, or previous successful trades do not
              guarantee future results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              2. No Financial or Investment Advice
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub does not provide personalized
              financial advice, investment advice, portfolio
              management, trading signals, or investment
              recommendations.
            </p>

            <p className="mt-3">
              Any educational content, platform features, analytics,
              journal insights, risk tools, statistics, calculators, or
              general information made available through Fidelity
              Traders Hub are provided for informational and
              self-management purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              3. Trading Decisions Are Your Responsibility
            </h2>

            <p className="mt-3">
              All trading decisions remain the sole responsibility of
              the user.
            </p>

            <p className="mt-3">
              You are responsible for deciding whether a trade, trading
              strategy, prop firm product, account, subscription, or
              other trading-related service is appropriate for your own
              circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              4. Leverage Risk
            </h2>

            <p className="mt-3">
              Leveraged trading can amplify both profits and losses.
            </p>

            <p className="mt-3">
              Small market movements can result in substantial changes
              to account equity, margin usage, drawdown, or account
              status.
            </p>

            <p className="mt-3">
              Users should understand leverage, margin, stop-loss
              behavior, execution risk, and the possibility of rapid
              losses before engaging in leveraged trading.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              5. Proprietary Trading Firm Risk
            </h2>

            <p className="mt-3">
              Proprietary trading firms may impose rules relating to
              daily loss, maximum drawdown, consistency, trading
              strategies, news trading, overnight positions, lot sizes,
              prohibited techniques, minimum trading days, and other
              account conditions.
            </p>

            <p className="mt-3">
              These rules vary by provider and may change.
            </p>

            <p className="mt-3">
              A trader may lose access to an account, fail an evaluation,
              lose funded status, or experience other consequences if
              provider rules are breached.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              6. Third-Party Provider Risk
            </h2>

            <p className="mt-3">
              Products and services available through Fidelity Traders
              Hub may depend on third-party platforms, brokers, prop
              firms, software providers, payment providers, and other
              independent businesses.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub does not control market execution,
              spreads, slippage, outages, provider restrictions,
              platform bans, policy changes, price feeds, account
              decisions, or other independent third-party actions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              7. Market Risk
            </h2>

            <p className="mt-3">
              Financial markets may move rapidly and unpredictably.
            </p>

            <p className="mt-3">
              Economic releases, political events, liquidity changes,
              market gaps, volatility, news events, technical failures,
              and other factors may cause prices to move substantially
              before a trade can be entered or closed at the expected
              price.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              8. Execution and Technology Risk
            </h2>

            <p className="mt-3">
              Trading may be affected by internet failures, device
              problems, platform outages, delayed execution, rejected
              orders, incorrect pricing, slippage, data interruptions,
              or other technical problems.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub is not a broker and does not control
              trade execution on independent trading platforms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              9. Trade Journal Analytics
            </h2>

            <p className="mt-3">
              The Fidelity Traders Hub Trade Journal may calculate
              statistics and analytics based on information recorded by
              the user.
            </p>

            <p className="mt-3">
              These may include win rate, profit and loss, average risk,
              risk usage, plan adherence, trading-session performance,
              setup performance, rule violations, streaks, and other
              metrics.
            </p>

            <p className="mt-3">
              These calculations depend on the completeness and accuracy
              of the information entered into the journal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              10. Journal Insights Are Not Predictions
            </h2>

            <p className="mt-3">
              Trade Journal observations, reports, patterns, analytics,
              or insights describe recorded historical behavior.
            </p>

            <p className="mt-3">
              They do not predict whether a future trade will win or
              lose and should not be treated as a signal to enter or
              exit a trade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              11. Risk Plans and Calculators
            </h2>

            <p className="mt-3">
              Risk plans, position-sizing information, drawdown
              tracking, and other calculations provided through the
              platform are tools intended to assist users in organizing
              their own trading rules.
            </p>

            <p className="mt-3">
              They do not eliminate trading risk and do not guarantee
              compliance with a third-party prop firm's rules.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              12. Psychological and Behavioral Risk
            </h2>

            <p className="mt-3">
              Trading can involve emotional and psychological pressures,
              including fear, greed, overconfidence, frustration,
              revenge trading, impulsive decisions, and excessive risk
              taking.
            </p>

            <p className="mt-3">
              Trade Journal psychology features are intended to help
              users reflect on their own behavior. They are not medical,
              psychological, psychiatric, or therapeutic services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              13. Loss of Capital
            </h2>

            <p className="mt-3">
              Users may lose part or all of the money committed to
              trading activity, challenge fees, account purchases,
              subscription services, or other trading-related costs.
            </p>

            <p className="mt-3">
              Trading should only be undertaken after considering your
              own financial circumstances and risk tolerance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              14. No Reliance on Screenshots or Testimonials
            </h2>

            <p className="mt-3">
              Screenshots, testimonials, performance examples, trading
              results, or user experiences shown through Fidelity
              Traders Hub should not be interpreted as typical,
              guaranteed, or expected future performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              15. Educational Information
            </h2>

            <p className="mt-3">
              General educational information may discuss trading
              concepts, risk management, journaling, discipline,
              performance review, or third-party trading products.
            </p>

            <p className="mt-3">
              Such information is general in nature and does not take
              into account your personal financial situation,
              objectives, experience, or risk tolerance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              16. Seek Independent Advice Where Appropriate
            </h2>

            <p className="mt-3">
              If you are uncertain about the financial, legal, tax, or
              regulatory consequences of trading or purchasing a
              trading-related product, you should consider obtaining
              independent professional advice appropriate to your
              circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              17. No Account Management
            </h2>

            <p className="mt-3">
              Unless Fidelity Traders Hub expressly offers a separate
              lawful service stating otherwise, Fidelity Traders Hub
              does not trade client accounts, manage client portfolios,
              control trading decisions, or guarantee account
              performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              18. User Responsibility for Provider Rules
            </h2>

            <p className="mt-3">
              Users are responsible for reviewing and understanding the
              rules of any prop firm, broker, trading platform, or other
              third-party provider they use.
            </p>

            <p className="mt-3">
              Information displayed through Fidelity Traders Hub should
              not replace the official rules published by the
              underlying provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              19. Changes in Market or Provider Conditions
            </h2>

            <p className="mt-3">
              Market conditions, provider rules, product structures,
              platform policies, and trading requirements may change
              without notice from Fidelity Traders Hub.
            </p>

            <p className="mt-3">
              Users should independently verify important provider
              requirements before making trading decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              20. Limitation of Responsibility
            </h2>

            <p className="mt-3">
              To the fullest extent permitted by applicable law,
              Fidelity Traders Hub is not responsible for trading
              losses, account failures, prop firm breaches, missed
              opportunities, losses resulting from user decisions, or
              outcomes resulting from independent third-party provider
              actions.
            </p>

            <p className="mt-3">
              Nothing in this disclaimer excludes any liability that
              cannot lawfully be excluded.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              21. Acceptance of Risk
            </h2>

            <p className="mt-3">
              By using Fidelity Traders Hub trading-related products,
              Trade Journal tools, marketplace services, or
              third-party trading products, you acknowledge that you
              understand trading involves risk and that financial
              outcomes cannot be guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              22. Changes to This Disclaimer
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub may update this Trading Risk
              Disclaimer as products, services, platform features,
              trading markets, or applicable requirements evolve.
            </p>

            <p className="mt-3">
              The current version will be made available through the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              23. Questions
            </h2>

            <p className="mt-3">
              Questions about this Trading Risk Disclaimer may be
              submitted through Fidelity Traders Hub Support.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
              >
                Open Support
              </Link>

              <a
                href="https://wa.me/2348035823744"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-700 px-5 py-3 text-center font-semibold text-slate-200 hover:bg-slate-900"
              >
                WhatsApp Support
              </a>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Email: fidelitytradershub@gmail.com
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold text-white">
              Related Policies
            </h2>

            <div className="mt-4 flex flex-wrap gap-4">
              <Link
                href="/terms"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Terms & Conditions
              </Link>

              <Link
                href="/privacy"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Privacy Policy
              </Link>

              <Link
                href="/refund-policy"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Refund Policy
              </Link>

              <Link
                href="/wallet-policy"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Wallet & Payments
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-14 border-t border-slate-800 pt-8">
          <p className="text-sm text-slate-500">
            This Trading Risk Disclaimer is a working platform draft
            and should receive final legal review before public launch.
          </p>
        </div>
      </div>
    </main>
  );
}