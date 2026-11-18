import { Footer } from "@virex/ui";
import { CAPITAL_LEGAL_DETAILS } from "@virex/content";

const registration = CAPITAL_LEGAL_DETAILS.kvk
  ? `${CAPITAL_LEGAL_DETAILS.companyName} · KvK ${CAPITAL_LEGAL_DETAILS.kvk}`
  : "[Registered entity & address — to be supplied]";

export function SiteFooter() {
  return (
    <Footer
      brand={{ name: "Virex", label: "Capital" }}
      tagline="A private investment firm building long-term value alongside ambitious businesses. Part of the Virex ecosystem."
      sections={[
        {
          title: "Company",
          links: [
            { name: "Virex Capital", href: "/" },
            { name: "About", href: "/about" },
            { name: "Investment Strategy", href: "/strategy" },
            { name: "Portfolio", href: "/portfolio" },
          ],
        },
        {
          title: "Resources",
          links: [
            { name: "Insights", href: "/insights" },
            { name: "Contact", href: "/contact" },
          ],
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
      copyright={`© ${new Date().getFullYear()} Virex Capital. All rights reserved.`}
      registration={registration}
      note="Virex Capital B.V. operates exclusively as a proprietary investment company managing the capital of its shareholders. We do not manage third-party funds, solicit external capital, or provide financial, investment, or advisory services to the public. Nothing on this website should be construed as an offer, solicitation, or recommendation to invest."
    />
  );
}
