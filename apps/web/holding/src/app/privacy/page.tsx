import { FadeIn } from "@virex/ui";
import { LEGAL_DETAILS } from "@virex/content";

export const metadata = {
  title: "Privacy Policy ",
  description: "Privacy policy and data handling for Virex Holding Group B.V.",
};

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-3xl pt-[clamp(72px,9vw,128px)] pb-32">
      <FadeIn>
        <h1 className="text-4xl md:text-5xl font-serif text-virex-deepink mb-12">Privacy Policy</h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="text-virex-muted space-y-6">
          <p className="text-lg text-virex-deepink mb-10">
            Last updated: September 2026
          </p>

          <p className="leading-relaxed">
            At {LEGAL_DETAILS.companyName} (&quot;Virex&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we respect your privacy and are committed to protecting your personal data. This Privacy Policy informs you about how we look after your personal data when you visit our website and tells you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">1. Information We Collect</h2>
          <p className="leading-relaxed">
            We only collect information that is strictly necessary for the operation of this website and for handling your inquiries. This may include:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 mb-8">
            <li><strong>Identity Data:</strong> First name, last name, title (if you contact us).</li>
            <li><strong>Contact Data:</strong> Email address, telephone number (if you contact us).</li>
            <li><strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting and location, operating system and platform.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website, purely for analytical purposes without identifying you personally.</li>
          </ul>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">2. How We Use Your Data</h2>
          <p className="leading-relaxed">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 mb-8">
            <li>To respond to your inquiries and communicate with you.</li>
            <li>To ensure the security, technical stability, and proper functioning of our website.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
          </ul>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">3. Data Security & Retention</h2>
          <p className="leading-relaxed">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">4. Your Legal Rights</h2>
          <p className="leading-relaxed">
            Under the General Data Protection Regulation (GDPR), you have rights in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
          </p>
          <p className="leading-relaxed">
            If you wish to exercise any of the rights set out above, please contact us at <a href={`mailto:${LEGAL_DETAILS.email.legal}`} className="text-virex-deepink underline underline-offset-4 hover:text-virex-forest">{LEGAL_DETAILS.email.legal}</a>.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
