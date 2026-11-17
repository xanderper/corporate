import { Navigation } from "@virex/ui";

const navLinks = [
  { name: "Group", href: "/group" },
  { name: "Companies", href: "/companies" },
  { name: "Ownership", href: "/ownership" },
  { name: "Governance", href: "/governance" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function SiteHeader() {
  return (
    <Navigation 
      brand={{ line1: "VIREX", line2: "HOLDING GROUP" }}
      navLinks={navLinks}
    />
  );
}
