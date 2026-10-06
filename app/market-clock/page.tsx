"use client";

import { useEffect, useMemo, useState } from "react";

type Timeframe = "H1" | "H2" | "H3" | "H4" | "DAILY";

const CLOSE_HOURS: Record<Timeframe, number[]> = {
  H1: Array.from({ length: 24 }, (_, i) => i),
  H2: Array.from({ length: 12 }, (_, i) => i * 2),
  H3: [0, 3, 6, 9, 12, 15, 18, 21],
  H4: [0, 4, 8, 12, 16, 20],
  DAILY: [17],
};

const TIMEFRAMES: Timeframe[] = ["H1", "H2", "H3", "H4", "DAILY"];

function getParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const result: Record<string, number> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      result[part.type] = Number(part.value);
    }
  }

  return result;
}

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getNewYorkOffset(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).formatToParts(date);

  return parts.find((part) => part.type === "timeZoneName")?.value || "ET";
}

function getSession(hour: number) {
  if (hour >= 0 && hour < 8) {
    return {
      name: "ASIA",
      description: "Asian trading session",
    };
  }

  if (hour >= 8 && hour < 13) {
    return {
      name: "LONDON",
      description: "London trading session",
    };
  }

  if (hour >= 13 && hour < 17) {
    return {
      name: "LONDON / NEW YORK OVERLAP",
      description: "Highest liquidity window",
    };
  }

  if (hour >= 17 && hour < 22) {
    return {
      name: "NEW YORK",
      description: "New York trading session",
    };
  }

  return {
    name: "AFTER HOURS",
    description: "Major sessions closed",
  };
}

function getNextClose(date: Date, timeframe: Timeframe) {
  const ny = getParts(date, "America/New_York");

  const nowMinutes = ny.hour * 60 + ny.minute + ny.second / 60;

  const hours = CLOSE_HOURS[timeframe];

  let nextHour: number | null = null;

  for (const hour of hours) {
    if (hour * 60 > nowMinutes) {
      nextHour = hour;
      break;
    }
  }

  const target = new Date(date);

  if (nextHour === null) {
    nextHour = hours[0];

    target.setTime(date.getTime() + 24 * 60 * 60 * 1000);
  }

  const targetParts = getParts(target, "America/New_York");

  const targetYear = targetParts.year;
  const targetMonth = targetParts.month;
  const targetDay = targetParts.day;

  const approximateUtc = Date.UTC(
    targetYear,
    targetMonth - 1,
    targetDay,
    nextHour,
    0,
    0
  );

  let candidate = new Date(approximateUtc);

  for (let i = 0; i < 3; i++) {
    const check = getParts(candidate, "America/New_York");

    const difference =
      nextHour -
      check.hour +
      (targetDay - check.day) * 24;

    candidate = new Date(
      candidate.getTime() + difference * 60 * 60 * 1000
    );
  }

  return candidate;
}

function countdown(target: Date, now: Date) {
  const seconds = Math.max(
    0,
    Math.floor((target.getTime() - now.getTime()) / 1000)
  );

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

function getCardLabel(timeframe: Timeframe) {
  if (timeframe === "DAILY") return "DAILY CLOSE";
  return `${timeframe} CLOSE`;
}

export default function MarketClockPage() {
  /*
   * IMPORTANT:
   * We start with null so the server and browser render the same
   * initial HTML. The real clock starts after the component mounts.
   */
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
   * Keep this hook unconditional.
   * This prevents React hook-order errors.
   */
  const nextCandle = useMemo(() => {
    if (!now) {
      return null;
    }

    const closes = TIMEFRAMES.map((timeframe) => ({
      timeframe,
      target: getNextClose(now, timeframe),
    }));

    return closes.sort(
      (a, b) => a.target.getTime() - b.target.getTime()
    )[0];
  }, [now]);

  /*
   * Server/client-safe loading state.
   */
  if (!now || !nextCandle) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
              Fidelity Traders Hub
            </div>

            <div className="mt-3 text-2xl font-black">
              Loading Market Clock...
            </div>

            <div className="mt-2 text-sm text-slate-500">
              Initializing live Nigeria time
            </div>
          </div>
        </div>
      </main>
    );
  }

  const nigeriaTime = formatTime(now, "Africa/Lagos");
  const newYorkTime = formatTime(now, "America/New_York");
  const nigeriaDate = formatDate(now, "Africa/Lagos");
  const newYorkOffset = getNewYorkOffset(now);

  const nyParts = getParts(now, "America/New_York");
  const session = getSession(nyParts.hour);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
                Fidelity Traders Hub
              </p>

              <h1 className="mt-2 text-3xl font-black md:text-4xl">
                Market Clock
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Session Monitor • Candle Close • Nigeria WAT
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-4 text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-blue-300">
                Nigeria Time
              </div>

              <div className="mt-1 text-3xl font-black tabular-nums">
                {nigeriaTime}
              </div>

              <div className="mt-1 text-xs text-slate-400">
                {nigeriaDate}
              </div>
            </div>

          </div>
        </div>

        {/* SESSION */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Current Market Session
            </p>

            <h2 className="mt-3 text-2xl font-black text-blue-400">
              {session.name}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {session.description}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              New York Time
            </p>

            <div className="mt-3 text-2xl font-black tabular-nums">
              {newYorkTime}
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Timezone status: {newYorkOffset}
            </p>
          </div>

        </section>

        {/* NEXT CLOSE */}
        <section className="mb-6 rounded-3xl border border-blue-500/30 bg-blue-500/10 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                Next Candle Close
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {getCardLabel(nextCandle.timeframe)}
              </h2>
            </div>

            <div className="text-4xl font-black tabular-nums text-blue-300">
              {countdown(nextCandle.target, now)}
            </div>

          </div>
        </section>

        {/* TIMEFRAME CARDS */}
        <section>
          <div className="mb-4">

            <h2 className="text-xl font-black">
              Candle Close Monitor
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Reminder calculations are shown here. Broker/cTrader candle
              alignment remains the source of truth for scanner execution.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {TIMEFRAMES.map((timeframe) => {
              const target = getNextClose(now, timeframe);

              return (
                <div
                  key={timeframe}
                  className="rounded-3xl border border-white/10 bg-slate-900 p-5"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-black">
                      {getCardLabel(timeframe)}
                    </span>

                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400">
                      READY
                    </span>

                  </div>

                  <div className="mt-5 text-2xl font-black tabular-nums">
                    {countdown(target, now)}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Next close countdown
                  </p>

                </div>
              );
            })}

          </div>
        </section>

        {/* TELEGRAM */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900 p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Telegram Alerts
              </p>

              <h2 className="mt-2 text-xl font-black">
                Fidelity Traders Hub Bot
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Candle-close reminders should be sent through the same
                Telegram bot used by the Fidelity Confluence Scanner.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-center">

              <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Scanner Managed
              </div>

              <div className="mt-1 text-sm font-bold text-white">
                TELEGRAM READY
              </div>

            </div>

          </div>
        </section>

        {/* IMPORTANT NOTE */}
        <section className="mt-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-6">

          <p className="text-sm font-bold text-yellow-300">
            Important
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            This clock is a monitoring and reminder interface. It is not a
            trade signal. Actual Fidelity Scanner signals and broker/cTrader
            candle alignment remain the source of truth.
          </p>

        </section>

      </div>
    </main>
  );
}