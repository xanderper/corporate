import { FadeIn } from "@virex/ui";
import { CAPITAL_LEGAL_DETAILS } from "@virex/content";
import { MapPin, Mail, Send } from "lucide-react";
import { buildMetadata } from "../../lib/metadata";

export const metadata = buildMetadata({
  title: "Contact — Virex Capital",
  description: "Contact Virex Capital B.V. for investment proposals and general enquiries.",
  path: "/contact",
});

export default function Contact() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30 bg-virex-stone/5">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              Contact
            </span>
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-virex-deepink leading-[1.05] mb-8 tracking-tight">
                Contact <span className="text-virex-forest italic">Virex Capital.</span>
              </h1>
              <p className="text-xl text-virex-muted leading-relaxed">
                Direct inquiries to the relevant team below.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">

            {/* Office */}
            <FadeIn>
              <div className="h-full bg-virex-white p-10 md:p-14 border border-virex-stone/30">
                <MapPin className="w-8 h-8 text-virex-forest mb-8" />
                <h2 className="text-3xl font-serif text-virex-deepink mb-8">Office</h2>
                <div className="w-12 h-px bg-virex-stone mb-8"></div>
                <div className="text-virex-muted leading-loose text-lg">
                  <p className="font-semibold text-virex-deepink">{CAPITAL_LEGAL_DETAILS.companyName}</p>
                  {CAPITAL_LEGAL_DETAILS.address ? (
                    <>
                      <p>{CAPITAL_LEGAL_DETAILS.address.line1}</p>
                      <p>{CAPITAL_LEGAL_DETAILS.address.line2}</p>
                      <p>{CAPITAL_LEGAL_DETAILS.address.country}</p>
                    </>
                  ) : (
                    <p>The Netherlands · By appointment only</p>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Enquiries */}
            <FadeIn delay={0.1}>
              <div className="h-full bg-virex-deepink text-virex-white p-10 md:p-14 relative overflow-hidden">
                <div className="relative z-10">
                  <Mail className="w-8 h-8 text-virex-sage mb-8" />
                  <h2 className="text-3xl font-serif mb-8">Enquiries</h2>
                  <div className="w-12 h-px bg-virex-sage/50 mb-8"></div>
                  <div className="space-y-10">
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-virex-sage uppercase mb-2">General</p>
                      <a href={`mailto:${CAPITAL_LEGAL_DETAILS.email.general}`} className="text-xl text-virex-white hover:text-virex-forest transition-colors flex items-center gap-2 group">
                        {CAPITAL_LEGAL_DETAILS.email.general}
                        <Send className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-virex-forest" />
                      </a>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-virex-sage uppercase mb-2">Investment Proposals</p>
                      <a href={`mailto:${CAPITAL_LEGAL_DETAILS.email.investments}`} className="text-xl text-virex-white hover:text-virex-forest transition-colors flex items-center gap-2 group">
                        {CAPITAL_LEGAL_DETAILS.email.investments}
                        <Send className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-virex-forest" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>
    </div>
  );
}
