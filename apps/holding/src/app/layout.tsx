import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CookieConsent } from "@virex/ui";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: {
    default: "Virex Holding Group",
    template: "%s — Virex Holding Group"
  },
  description: "Long-term ownership and governance for capital, financial infrastructure, and digital infrastructure.",
  metadataBase: new URL('https://virex.group'),
  openGraph: {
    title: 'Virex Holding Group',
    description: 'Long-term ownership and governance for capital, financial infrastructure, and digital infrastructure.',
    url: 'https://virex.group',
    siteName: 'Virex Holding Group',
    locale: 'en_US',
    type: 'website',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Corporation",
  "name": "Virex Holding Group B.V.",
  "legalName": "Virex Holding Group B.V.",
  "url": "https://virex.group",
  "subOrganization": [
    {
      "@type": "Corporation",
      "name": "Virex Capital B.V.",
      "url": "https://virexcapital.com"
    },
    {
      "@type": "Corporation",
      "name": "Qorve Holding B.V.",
      "url": "https://qorve.com"
    },
    {
      "@type": "Corporation",
      "name": "Northgrid Holding B.V.",
      "url": "https://northgrid.eu"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable} font-sans antialiased text-virex-deepink bg-virex-warmwhite flex flex-col min-h-screen`}>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteHeader />
        <main className="flex-grow flex flex-col">{children}</main>
        <SiteFooter />
        <CookieConsent storageKey="virex-holding-cookie-consent" />
      </body>
    </html>
  );
}
