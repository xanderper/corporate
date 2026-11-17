import { Footer } from "@virex/ui";
import Link from "next/link";

const navLinks = [
  { name: "Investments", href: "/investments" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Approach", href: "/approach" },
  { name: "About", href: "/about" },
  { name: "Structure", href: "/structure" },
  { name: "Contact", href: "/contact" },
];

const groupLinks = [
  { name: "Virex Holding Group", href: "https://virex.group", external: true },
  { name: "Qorve", href: "https://qorve.com", external: true },
  { name: "Northgrid", href: "https://northgrid.eu", external: true },
];

const legalLinks = [
  { name: "Legal Notice", href: "/legal" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Use", href: "/terms" },
  { name: "Cookie Policy", href: "/cookies" },
];

export function SiteFooter() {
  return (
    <Footer
      columnWidth="40/60"
      brand={{ line1: "VIREX", line2: "CAPITAL" }}
      subtitle="Capital with a long-term perspective."
      columns={[
        [
          { title: "Virex Capital", links: navLinks }
        ],
        [
          // { title: "Virex Group", links: groupLinks },
          { title: "Legal", links: legalLinks }
        ]
      ]}
      copyrightEntity="Virex Capital B.V."
      bottomText={
        <>
          The Netherlands · Part of{" "}
          <Link
            href="https://virex.group"
            target="_blank"
            rel="noopener noreferrer"
            className="text-virex-sage hover:text-virex-white transition-colors"
          >
            Virex Holding Group
          </Link>
        </>
      }
      extraNote="Virex Capital B.V. operates exclusively as a proprietary investment company managing the capital of its shareholders. We do not manage third-party funds, solicit external capital, or provide financial, investment, or advisory services to the public. Nothing on this website should be construed as an offer, solicitation, or recommendation to invest."
    />
  );
}
