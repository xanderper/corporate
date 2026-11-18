import { FadeIn } from "@virex/ui";
import { LEGAL_DETAILS } from "@virex/content";

export const metadata = {
  title: "Legal Notice ",
  description: "Information pursuant to corporate and legal requirements.",
};

export default function LegalNotice() {
  return (
    <div className="container max-w-3xl pt-[clamp(72px,9vw,128px)] pb-32">
      <FadeIn>
        <h1 className="text-4xl md:text-5xl font-serif text-virex-deepink mb-12">Legal Notice</h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="text-virex-muted space-y-6">
          <p className="text-lg text-virex-deepink mb-10">
            Information pursuant to corporate and legal requirements for {LEGAL_DETAILS.companyName}
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">Corporate Information</h2>
          <p className="leading-relaxed">
            <strong className="text-virex-deepink font-medium">{LEGAL_DETAILS.companyName}</strong>
            {LEGAL_DETAILS.address && (
              <>
                <br />
                {LEGAL_DETAILS.address.line1}<br />
                {LEGAL_DETAILS.address.line2}<br />
                {LEGAL_DETAILS.address.country}
              </>
            )}
          </p>
          <p className="leading-relaxed">
            <strong className="text-virex-deepink font-medium">Registration:</strong> Registered with the Dutch Chamber of Commerce (Kamer van Koophandel).
            {LEGAL_DETAILS.kvk && <><br /><strong className="text-virex-deepink font-medium">KVK Number:</strong> {LEGAL_DETAILS.kvk}</>}
            {LEGAL_DETAILS.vat && <><br /><strong className="text-virex-deepink font-medium">VAT ID:</strong> {LEGAL_DETAILS.vat}</>}
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">Contact</h2>
          <p className="leading-relaxed">
            Email: <a href={`mailto:${LEGAL_DETAILS.email.legal}`} className="text-virex-deepink hover:text-virex-forest transition-colors">{LEGAL_DETAILS.email.legal}</a>
            {LEGAL_DETAILS.phone && <><br />Phone: {LEGAL_DETAILS.phone}</>}
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">Governance</h2>
          <p className="leading-relaxed">
            Virex Holding Group B.V. acts as the ultimate parent company overseeing its subsidiaries, including Virex Capital B.V., Qorve Holding B.V., and Northgrid Holding B.V. The holding company itself does not engage in public commercial activities, offer financial products, or provide regulated investment advice to third parties.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">Copyright & Trademarks</h2>
          <p className="leading-relaxed">
            All content published on this website, including texts, images, graphics, design, and layout, is subject to copyright and intellectual property laws. Any unauthorized use, reproduction, or distribution is strictly prohibited. &quot;Virex&quot;, &quot;Virex Holding Group&quot;, and the associated logos are registered trademarks.
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
