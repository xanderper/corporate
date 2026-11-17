import { FadeIn } from "@virex/ui";
import { GROUP_COMPANIES } from "@virex/content";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Companies ",
  description: "The businesses owned and governed by Virex Holding Group B.V.",
};

export default function Companies() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              Companies
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-8">
                <h1 className="text-5xl md:text-6xl font-serif text-virex-deepink leading-[1.1] mb-8">
                  The businesses of <br />
                  <span className="text-virex-forest italic">Virex Holding Group.</span>
                </h1>
                <p className="text-xl text-virex-muted leading-relaxed max-w-2xl">
                  Virex Holding Group provides the permanent ownership structure for
                  three distinct operating businesses operating at the intersection of capital, financial technology, and digital infrastructure.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Companies List */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <div className="border-t border-virex-deepink">
            {GROUP_COMPANIES.map((company, index) => (
              <a
                key={company.id}
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col lg:flex-row py-12 lg:py-14 hover:bg-virex-white transition-colors duration-500 -mx-6 px-6 lg:-mx-8 lg:px-8"
              >
                {/* Left Col */}
                <div className="w-full lg:w-4/12 flex flex-col mb-8 lg:mb-0 pr-8">
                  <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-3xl lg:text-4xl text-virex-deepink tracking-tight font-normal">
                    {company.name}
                  </h2>
                </div>

                {/* Middle Col */}
                <div className="w-full lg:w-5/12 flex flex-col mb-8 lg:mb-0 pr-8">
                  <span className="text-[10px] font-bold tracking-widest text-virex-forest uppercase mb-6">
                    {company.descriptor}
                  </span>
                  <p className="text-virex-muted text-base leading-relaxed max-w-md">
                    {company.description}
                  </p>
                </div>

                {/* Right Col */}
                <div className="w-full lg:w-3/12 flex flex-col justify-between items-start lg:items-end">
                  <div className="bg-virex-stone/30 px-3 py-1.5 rounded-sm mb-6 lg:mb-0">
                    <span className="text-[11px] text-virex-deepink">
                      {company.ownership}% Stake
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-virex-deepink group-hover:text-virex-forest transition-colors mt-auto">
                    VIEW ENTITY <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
