import type { Metadata } from "next";
import { Fraunces, Manrope, Space_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CookieConsent } from "@virex/ui";
import { LEGAL_DETAILS } from "@virex/content";
import { GROUP } from "../lib/group";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
// const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

const DESCRIPTION =
  "Virex Holding brings together a group of distinct businesses under one long-term vision, strategy and entrepreneurial philosophy.";

export const metadata: Metadata = {
  title: {
    default: "Virex Holding",
    template: "%s — Virex Holding",
  },
  description: DESCRIPTION,
  metadataBase: new URL("https://virex.group"),
  openGraph: {
    title: "Virex Holding",
    description: DESCRIPTION,
    url: "https://virex.group",
    siteName: "Virex Holding",
    locale: "en_US",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Corporation",
  name: "Virex Holding",
  legalName: LEGAL_DETAILS.companyName,
  url: "https://virex.group",
  subOrganization: GROUP.map((b) => ({
    "@type": "Corporation",
    name: b.name,
    ...(b.url ? { url: b.url } : {}),
  })),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className={`font-sans antialiased text-virex-deepink bg-virex-warmwhite flex flex-col min-h-screen`}>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteHeader />
        <main id="main" className="flex-grow flex flex-col">{children}</main>
        <SiteFooter />
        <CookieConsent storageKey="virex-holding-cookie-consent" />
      </body>
    </html>
  );
}
