import { Navigation } from "@virex/ui";

const navLinks = [
  { name: "Investments", href: "/investments" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Approach", href: "/approach" },
  { name: "About", href: "/about" },
  { name: "Structure", href: "/structure" },
  { name: "Contact", href: "/contact" },
];

export function SiteHeader() {
  return (
    <Navigation
      brand={{ line1: "VIREX", line2: "CAPITAL" }}
      navLinks={navLinks}
    />
  );
}
