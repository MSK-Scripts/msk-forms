import type { Metadata } from "next";
import { DM_Sans, Space_Mono, Syne } from "next/font/google";

import "./globals.css";

// Self-hosted via next/font (CSP-safe: served from /_next/static, font-src 'self').
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MSK Forms: application forms with a status loop",
  description:
    "Build application forms, collect submissions, and let applicants track their status live. With a Discord bot any server can invite.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${spaceMono.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
