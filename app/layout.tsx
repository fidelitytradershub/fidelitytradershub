import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import ThemeToggle from "./themetoggle";
import ReferralLinkTracker from "./ReferralLinkTracker";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fidelitytradershub.com"),

  title: {
    default: "Fidelity Traders Hub",
    template: "%s | Fidelity Traders Hub",
  },

  description:
    "Trading tools, prop firm opportunities, TradingView access, flexible Pay Small Small plans and professional trade journaling from Fidelity Traders Hub.",

  applicationName: "Fidelity Traders Hub",

  icons: {
    icon: "/brand/fidelity-mark.png",
    shortcut: "/brand/fidelity-mark.png",
    apple: "/brand/fidelity-mark.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",

  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#F8F7FF",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#070A0E",
    },
  ],
};

const themeScript = `
(function () {
  try {
    const STORAGE_KEY = "fth-theme";

    const saved = localStorage.getItem(STORAGE_KEY);

    const systemDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme =
      saved === "light" || saved === "dark"
        ? saved
        : systemDark
          ? "dark"
          : "light";

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <script
          id="fth-theme-script"
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body
        className="
          fth-app-root
          min-h-screen
          font-sans
          antialiased
        "
      >
        <ReferralLinkTracker />

        <div id="fth-app">
          {children}
        </div>

        <ThemeToggle />
      </body>
    </html>
  );
}