import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import ThemeToggle from "./themetoggle";
import ReferralLinkTracker from "./ReferralLinkTracker";
import WhatsAppSupport from "./WhatsAppSupport";

import "./globals.css";

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
    // Use an existing brand asset. The old fidelity-mark.png path no longer exists,
    // which caused browsers to fall back to a generic favicon.
    icon: "/brand/fidelity-circle-light.png",
    shortcut: "/brand/fidelity-circle-light.png",
    apple: "/brand/fidelity-circle-light.png",
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
      className="h-full"
    >
      <head>
        <script
          id="fth-theme-script"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>

      <body className="fth-app-root min-h-screen font-sans antialiased">
        <ReferralLinkTracker />

        <div id="fth-app">{children}</div>

        <WhatsAppSupport />
        <ThemeToggle />
      </body>
    </html>
  );
}