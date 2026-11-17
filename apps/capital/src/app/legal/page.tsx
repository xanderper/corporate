import { FadeIn } from "@virex/ui";
import { CAPITAL_LEGAL_DETAILS } from "@virex/content";
import { buildMetadata } from "../../lib/metadata";

export const metadata = buildMetadata({
  title: "Legal Notice — Virex Capital",
  description: "Corporate and legal information for Virex Capital B.V.",
  path: "/legal",
});

export default function LegalNotice() {
  return (
    <div className="container max-w-3xl pt-40 pb-32">
      <FadeIn>
        <h1 className="text-4xl md:text-5xl font-serif text-virex-deepink mb-12">Legal Notice</h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="text-virex-muted space-y-6">
          <p className="text-lg text-virex-deepink mb-10">
            Information pursuant to corporate and legal requirements for {CAPITAL_LEGAL_DETAILS.companyName}
          </p>
          
          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">Corporate Information</h2>
          <p className="leading-relaxed">
            <strong className="text-virex-deepink font-medium">{CAPITAL_LEGAL_DETAILS.companyName}</strong>
            {CAPITAL_LEGAL_DETAILS.address && (
              <>
                <br />
                {CAPITAL_LEGAL_DETAILS.address.line1}<br />
                {CAPITAL_LEGAL_DETAILS.address.line2}<br />
                {CAPITAL_LEGAL_DETAILS.address.country}
              </>
            )}
          </p>
          <p className="leading-relaxed">
            <strong className="text-virex-deepink font-medium">Registration:</strong> Registered with the Dutch Chamber of Commerce (Kamer van Koophandel).
            {CAPITAL_LEGAL_DETAILS.kvk && <><br /><strong className="text-virex-deepink font-medium">KVK Number:</strong> {CAPITAL_LEGAL_DETAILS.kvk}</>}
            {CAPITAL_LEGAL_DETAILS.vat && <><br /><strong className="text-virex-deepink font-medium">VAT ID:</strong> {CAPITAL_LEGAL_DETAILS.vat}</>}
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">Contact</h2>
          <p className="leading-relaxed">
            Email: <a href={`mailto:${CAPITAL_LEGAL_DETAILS.email.legal}`} className="text-virex-deepink hover:text-virex-forest transition-colors">{CAPITAL_LEGAL_DETAILS.email.legal}</a><br />
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">Regulatory Status</h2>
          <p className="leading-relaxed">
            Virex Capital B.V. operates as a proprietary investment company managing its own capital. We do not provide investment advice, asset management services, or financial services to third parties. We do not solicit outside capital from the public. Consequently, Virex Capital B.V. is not subject to supervision by the Dutch Authority for the Financial Markets (AFM) or the Dutch Central Bank (DNB) as a regulated financial institution.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">Copyright & Trademarks</h2>
          <p className="leading-relaxed">
            All content published on this website, including texts, images, graphics, design, and layout, is subject to copyright and intellectual property laws. Any unauthorized use, reproduction, or distribution is strictly prohibited. &quot;Virex Capital&quot; and the associated logos are trademarks of Virex Holding Group B.V.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">Disclaimer</h2>
          <p className="leading-relaxed">
            The information contained on this website is for general informational purposes only. While we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability with respect to the website or the information contained on the website for any purpose. Any reliance you place on such information is strictly at your own risk.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
