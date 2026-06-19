import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSK Forms",
  description:
    "Moderne Form- & Bewerbungs-Plattform mit Status-Feedback und Discord-Integration.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className="font-body">{children}</body>
    </html>
  );
}
