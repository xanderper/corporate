import { Footer } from "@virex/ui";
import { LEGAL_DETAILS } from "@virex/content";
import { GROUP } from "../lib/group";

const registration = [
  LEGAL_DETAILS.companyName ?? "[Registered entity]",
  LEGAL_DETAILS.kvk ? `KvK ${LEGAL_DETAILS.kvk}` : "[Chamber of Commerce no.]",
].join(" · ");

export function SiteFooter() {
  return (
    <Footer
      brand={{ name: "Virex", label: "Holding" }}
      tagline="Building, owning and developing businesses for the long term."
      taglineStyle="serif"
      labelFont="mono"
      sections={[
        {
          title: "Virex Holding",
          links: [
            { name: "Home", href: "/" },
            { name: "Our Group", href: "/group" },
            { name: "About", href: "/about" },
            { name: "Contact", href: "/contact" },
          ],
        },
        {
          title: "Group companies",
          links: GROUP.map((b) => (b.url ? { name: b.name, href: b.url, external: true } : { name: b.name, href: `/group#${b.id}` })),
        },
        {
          title: "Legal",
          links: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Cookie Policy", href: "/cookies" },
            { name: "Terms of Use", href: "/terms" },
            { name: "Legal Notice", href: "/legal" },
          ],
        },
      ]}
      copyright={`© ${new Date().getFullYear()} Virex Holding`}
      registration={registration}
    />
  );
}
