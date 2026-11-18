import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./prose-legal.css";
import { CookieConsent } from "@virex/ui";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: {
    default: "Virex Capital",
    template: "%s — Virex Capital"
  },
  description: "Private investment & operating group.",
  metadataBase: new URL('https://virexcapital.com'),
  openGraph: {
    title: 'Virex Capital',
    description: 'Private investment & operating group.',
    url: 'https://virexcapital.com',
    siteName: 'Virex Capital',
    locale: 'en_US',
    type: 'website',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Corporation",
  "name": "Virex Capital B.V.",
  "legalName": "Virex Capital B.V.",
  "url": "https://virexcapital.com",
  "parentOrganization": {
    "@type": "Corporation",
    "name": "Virex Holding Group B.V.",
    "url": "https://virex.group"
  }
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
        <CookieConsent storageKey="virex-capital-cookie-consent" />
      </body>
    </html>
  );
}
