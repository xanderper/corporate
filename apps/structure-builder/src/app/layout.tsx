import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400", "500", "600", "700"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Virex Structure Builder",
    template: "%s — Virex Corporate Architecture",
  },
  description: "Corporate architecture, ownership modeling & regulatory mapping across the Virex ecosystem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable} ${mono.variable}`}>
      <body className="font-sans antialiased text-virex-deepink bg-virex-warmwhite">{children}</body>
    </html>
  );
}

