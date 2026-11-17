import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { QorveWidgetsProvider } from "../components/QorveWidgetsProvider";
import { AuthGuard } from "../components/AuthGuard";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Virex Portal",
  description: "Secure access to the Virex corporate environment.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable} font-sans antialiased text-virex-deepink bg-virex-warmwhite min-h-screen`}>
        <QorveWidgetsProvider>
          <AuthGuard>{children}</AuthGuard>
        </QorveWidgetsProvider>
      </body>
    </html>
  );
}
