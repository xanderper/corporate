import { FadeIn } from "@virex/ui";
import { LEGAL_DETAILS } from "@virex/content";

export const metadata = {
  title: "Cookie Policy ",
  description: "Cookie policy and tracking information for Virex Holding Group B.V.",
};

export default function CookiePolicy() {
  return (
    <div className="container max-w-3xl pt-40 pb-32">
      <FadeIn>
        <h1 className="text-4xl md:text-5xl font-serif text-virex-deepink mb-12">Cookie Policy</h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="text-virex-muted space-y-6">
          <p className="text-lg text-virex-deepink mb-10">
            Last updated: September 2026
          </p>

          <p className="leading-relaxed">
            {LEGAL_DETAILS.companyName} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies on our website. Our Cookie Policy explains what cookies are, how we use them, and your choices regarding cookies.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">1. What Are Cookies</h2>
          <p className="leading-relaxed">
            Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the website or a third party to recognize you and make your next visit easier and more useful to you.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">2. How We Use Cookies</h2>
          <p className="leading-relaxed">
            We use a minimal number of cookies strictly for the following purposes:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4 mb-8">
            <li><strong>Essential Cookies:</strong> We use essential cookies to authenticate users and prevent fraudulent use of user accounts. These cookies are strictly necessary to provide you with services available through our website and to use some of its features.</li>
            <li><strong>Preferences Cookies:</strong> We use cookies to remember your preferences and various settings, such as whether you have acknowledged our Cookie Consent notice (stored locally via <code>localStorage</code>).</li>
          </ul>
          <p className="leading-relaxed">
            We do <strong>not</strong> use advertising cookies or cross-site tracking cookies.
          </p>

          <h2 className="text-2xl font-serif text-virex-deepink mt-12 mb-4">3. What Are Your Choices Regarding Cookies</h2>
          <p className="leading-relaxed">
            If you&apos;d like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, some features of our website may not function properly.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
