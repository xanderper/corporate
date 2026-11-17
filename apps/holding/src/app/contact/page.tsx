import { FadeIn } from "@virex/ui";
import { Mail, MapPin, Building, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Contact Virex Holding Group B.V.",
};

export default function Contact() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              Contact & Enquiries
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-8">
                <h1 className="text-5xl md:text-6xl font-serif text-virex-deepink leading-[1.1] mb-8">
                  Get in touch.
                </h1>
                <p className="text-xl text-virex-muted leading-relaxed max-w-2xl">
                  Virex Holding Group does not maintain a public-facing corporate campus. Meetings are strictly by appointment only.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-24">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* HQ */}
              <div className="bg-virex-stone/5 border border-virex-stone/50 p-10 flex flex-col">
                <MapPin className="w-6 h-6 text-virex-forest mb-6" />
                <h2 className="text-xl font-serif text-virex-deepink mb-6">Headquarters</h2>
                <div className="text-virex-muted leading-relaxed flex-grow">
                  <p className="font-semibold text-virex-deepink mb-2">Virex Holding Group B.V.</p>
                  <p>The Netherlands</p>
                  <p>By appointment only</p>
                </div>
              </div>
              
              {/* Contact */}
              <div className="bg-virex-stone/5 border border-virex-stone/50 p-10 flex flex-col">
                <Mail className="w-6 h-6 text-virex-forest mb-6" />
                <h2 className="text-xl font-serif text-virex-deepink mb-6">Direct Enquiries</h2>
                <div className="space-y-8 flex-grow">
                  <div>
                    <p className="text-[10px] font-semibold tracking-widest text-virex-forest uppercase mb-2">General Administration</p>
                    <a href="mailto:contact@virex.group" className="text-virex-deepink font-medium hover:text-virex-forest transition-colors">
                      contact@virex.group
                    </a>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-widest text-virex-forest uppercase mb-2">Media & Press</p>
                    <a href="mailto:press@virex.group" className="text-virex-deepink font-medium hover:text-virex-forest transition-colors">
                      press@virex.group
                    </a>
                  </div>
                </div>
              </div>

              {/* Operating Companies */}
              <div className="bg-virex-forest text-virex-warmwhite border border-virex-forest p-10 flex flex-col">
                <Building className="w-6 h-6 text-virex-sage mb-6" />
                <h2 className="text-xl font-serif mb-6">Subsidiaries</h2>
                <p className="text-sm text-virex-sage/90 mb-8 leading-relaxed flex-grow">
                  For operational queries, commercial partnerships, or employment opportunities, please contact the respective operating companies directly:
                </p>
                <div className="space-y-4">
                  <a href="https://virexcapital.com" className="flex items-center justify-between text-virex-white hover:text-virex-sage transition-colors border-b border-virex-white/20 pb-2">
                    <span className="font-serif">Virex Capital</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <a href="https://qorve.com" className="flex items-center justify-between text-virex-white hover:text-virex-sage transition-colors border-b border-virex-white/20 pb-2">
                    <span className="font-serif">Qorve</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <a href="https://northgrid.eu" className="flex items-center justify-between text-virex-white hover:text-virex-sage transition-colors border-b border-virex-white/20 pb-2">
                    <span className="font-serif">Northgrid</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
