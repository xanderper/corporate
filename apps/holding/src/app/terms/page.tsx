import { FadeIn } from "@virex/ui";
import { LEGAL_DETAILS } from "@virex/content";

export const metadata = {
  title: "Terms of Use ",
  description: "Terms and conditions of use for Virex Holding Group B.V.",
};

export default function TermsOfUse() {
  return (
    <div className="container max-w-3xl pt-40 pb-32">
      <FadeIn>
        <h1 className="text-4xl md:text-5xl font-serif text-virex-deepink mb-12">Terms of Use</h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="text-virex-muted space-y-6">
          <p className="text-lg text-virex-deepink mb-10">
            Last updated: September 2026
          </p>

          <p className="leading-relaxed">
            By accessing and using the {LEGAL_DETAILS.companyName} website, you accept and agree to be bound by the terms and provisions of this agreement.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">1. Use of Website</h2>
          <p className="leading-relaxed">
            This website is provided for informational purposes only. It does not constitute an offer to sell, or a solicitation of an offer to buy, any securities, shares, or financial instruments. The content provided is intended solely for general corporate information and should not be construed as investment, financial, legal, or tax advice.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">2. Intellectual Property Rights</h2>
          <p className="leading-relaxed">
            All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of {LEGAL_DETAILS.companyName} or its content suppliers and is protected by international copyright laws. You may not modify, copy, reproduce, republish, upload, post, transmit, or distribute any material from this site without prior written permission.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">3. Limitation of Liability</h2>
          <p className="leading-relaxed">
            {LEGAL_DETAILS.companyName} shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, or use of, this website. We do not warrant that the website will be uninterrupted or error-free, that defects will be corrected, or that the site or the server that makes it available are free of viruses or other harmful components.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">4. Links to Third-Party Sites</h2>
          <p className="leading-relaxed">
            Our website may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">5. Governing Law</h2>
          <p className="leading-relaxed">
            These terms of use are governed by and construed in accordance with the laws of the Netherlands. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of the Netherlands.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
