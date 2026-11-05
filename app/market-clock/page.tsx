"use client";

import { useEffect, useMemo, useState } from "react";

type Timeframe = "H1" | "H2" | "H3" | "H4" | "H6" | "H8" | "H12" | "DAILY" | "2D" | "WEEKLY" | "MONTHLY";

const CLOSE_HOURS: Record<Timeframe, number[]> = {
  H1: Array.from({ length: 24 }, (_, i) => i),
  H2: Array.from({ length: 12 }, (_, i) => i * 2),
  H3: [0, 3, 6, 9, 12, 15, 18, 21],
  H4: [0, 4, 8, 12, 16, 20],
  H6: [0, 6, 12, 18],
  H8: [0, 8, 16],
  H12: [0, 12],
  DAILY: [17],
  "2D": [],
  WEEKLY: [],
  MONTHLY: [],
};

const TIMEFRAMES: Timeframe[] = ["H4", "H6", "H8", "H12", "DAILY", "2D", "WEEKLY", "MONTHLY"];

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

function nyWallTimeToDate(year: number, month: number, day: number, hour: number) {
  // Convert New York wall-clock time to a real Date while respecting EST/EDT.
  let guess = new Date(Date.UTC(year, month - 1, day, hour));
  for (let i = 0; i < 4; i++) {
    const p = getParts(guess, "America/New_York");
    const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    const wanted = Date.UTC(year, month - 1, day, hour);
    guess = new Date(guess.getTime() + wanted - represented);
  }
  return guess;
}

function addCalendarDays(year: number, month: number, day: number, days: number) {
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), weekday: d.getUTCDay() };
}

function getNextClose(date: Date, timeframe: Timeframe) {
  const ny = getParts(date, "America/New_York");
  const current = { year: ny.year, month: ny.month, day: ny.day, weekday: new Date(Date.UTC(ny.year, ny.month - 1, ny.day)).getUTCDay() };
  const candidates: Date[] = [];

  if (timeframe in CLOSE_HOURS && CLOSE_HOURS[timeframe].length) {
    for (let offset = 0; offset <= 2; offset++) {
      const day = addCalendarDays(current.year, current.month, current.day, offset);
      if (day.weekday === 0 || day.weekday === 6) continue;
      for (const hour of CLOSE_HOURS[timeframe]) {
        const target = nyWallTimeToDate(day.year, day.month, day.day, hour);
        if (target.getTime() > date.getTime()) candidates.push(target);
      }
    }
  } else if (timeframe === "2D") {
    // Two-trading-day cadence, anchored to Monday's 17:00 New York close.
    for (let offset = 0; offset <= 14; offset++) {
      const day = addCalendarDays(current.year, current.month, current.day, offset);
      if (day.weekday === 0 || day.weekday === 6) continue;
      const epochMonday = Date.UTC(1970, 0, 5);
      const dayUtc = Date.UTC(day.year, day.month - 1, day.day);
      const weekIndex = Math.floor((dayUtc - epochMonday) / (7 * 86400000));
      const tradingDayIndex = weekIndex * 5 + day.weekday - 1;
      if (tradingDayIndex % 2 === 0) {
        const target = nyWallTimeToDate(day.year, day.month, day.day, 17);
        if (target.getTime() > date.getTime()) candidates.push(target);
      }
    }
  } else if (timeframe === "WEEKLY") {
    for (let offset = 0; offset <= 14; offset++) {
      const day = addCalendarDays(current.year, current.month, current.day, offset);
      if (day.weekday === 5) {
        const target = nyWallTimeToDate(day.year, day.month, day.day, 17);
        if (target.getTime() > date.getTime()) candidates.push(target);
      }
    }
  } else if (timeframe === "MONTHLY") {
    for (let monthOffset = 0; monthOffset <= 2; monthOffset++) {
      const first = new Date(Date.UTC(current.year, current.month - 1 + monthOffset, 1));
      const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
      let day = last;
      while (day.getUTCDay() === 0 || day.getUTCDay() === 6) day = new Date(day.getTime() - 86400000);
      const target = nyWallTimeToDate(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), 17);
      if (target.getTime() > date.getTime()) candidates.push(target);
    }
  }

  candidates.sort((a, b) => a.getTime() - b.getTime());
  return candidates[0] || nyWallTimeToDate(current.year, current.month, current.day + 1, 17);
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
  if (timeframe === "2D") return "2 DAYS (2D) CLOSE";
  if (timeframe === "WEEKLY") return "WEEKLY (1W) CLOSE";
  if (timeframe === "MONTHLY") return "MONTHLY (1M) CLOSE";
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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