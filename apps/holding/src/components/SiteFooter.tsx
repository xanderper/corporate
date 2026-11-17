import { Footer } from "@virex/ui";

const navLinks = [
  { name: "Group", href: "/group" },
  { name: "Companies", href: "/companies" },
  { name: "Ownership", href: "/ownership" },
  { name: "Governance", href: "/governance" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const groupLinks = [
  { name: "Virex Capital", href: "https://virexcapital.com", external: true },
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
      brand={{ line1: "VIREX", line2: "HOLDING GROUP" }}
      subtitle="Long-term ownership and governance."
      columns={[
        [
          { title: "Virex Holding Group", links: navLinks }
        ],
        [
          { title: "Companies", links: groupLinks },
        ],
        [
          { title: "Legal", links: legalLinks }
        ]
      ]}
      copyrightEntity="Virex Holding Group B.V."
      bottomText="The Netherlands"
      extraNote="Virex Holding Group B.V. is a privately held ownership entity. We provide long-term capital backing, governance, and structural stability to our dedicated group of companies. The information provided on this website is for informational purposes only and does not constitute financial, investment, or legal advice."
      gridCols={3}
    />
  );
}
