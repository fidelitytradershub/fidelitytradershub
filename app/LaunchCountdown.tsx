"use client";

import { useEffect, useState } from "react";

const LAUNCH_TIME = new Date("2026-09-05T00:00:00+01:00").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  launched: boolean;
};

function calculateTimeLeft(): TimeLeft {
  const difference = Math.max(0, LAUNCH_TIME - Date.now());

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
    launched: difference === 0,
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

export default function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => setTimeLeft(calculateTimeLeft());

    update();
    const timer = window.setInterval(update, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  if (timeLeft?.launched) {
    return (
      <div className="relative z-10 mx-auto mt-6 max-w-[1100px] px-5 lg:px-8">
        <div className="rounded-2xl border border-[var(--home-brand)]/30 bg-[var(--home-surface)] px-5 py-4 text-center shadow-[var(--home-shadow)]">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[var(--home-brand-dark)]">
            🚀 Fidelity Traders Hub is live
          </p>
          <p className="mt-1 text-sm text-[var(--home-muted)]">
            Explore the marketplace, flexible payments and professional Trade Journal.
          </p>
        </div>
      </div>
    );
  }

  const values = [
    [timeLeft ? pad(timeLeft.days) : "--", "Days"],
    [timeLeft ? pad(timeLeft.hours) : "--", "Hours"],
    [timeLeft ? pad(timeLeft.minutes) : "--", "Minutes"],
    [timeLeft ? pad(timeLeft.seconds) : "--", "Seconds"],
  ];

  return (
    <div className="relative z-10 mx-auto mt-6 max-w-[1100px] px-5 lg:px-8">
      <div className="rounded-2xl border border-[var(--home-brand)]/25 bg-[var(--home-surface)] px-4 py-4 shadow-[var(--home-shadow)] sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--home-brand-dark)] sm:text-sm">
              🚀 Official launch · 5 September 2026
            </p>
            <p className="mt-1 text-sm text-[var(--home-muted)]">
              A better trading-services experience is almost here.
            </p>
          </div>

          <div
            className="grid w-full max-w-md grid-cols-4 gap-2 sm:gap-3"
            aria-label="Time remaining until Fidelity Traders Hub launches"
            aria-live="off"
          >
            {values.map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl bg-[var(--home-surface-soft)] px-2 py-2.5 text-center sm:px-3"
              >
                <strong className="block text-xl font-black leading-none text-[var(--home-brand-dark)] sm:text-2xl">
                  {value}
                </strong>
                <span className="mt-1.5 block text-[9px] font-black uppercase tracking-wide text-[var(--home-muted)] sm:text-[10px]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
