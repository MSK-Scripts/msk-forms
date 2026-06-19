import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSK Forms",
  description:
    "A modern form & application platform with status feedback and Discord integration.",
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
