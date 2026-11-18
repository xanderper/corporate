import { LEGAL_DETAILS } from "@virex/content";
import { buildMetadata } from "../../lib/metadata";
import { GROUP } from "../../lib/group";
import { Accent, Eyebrow } from "../../components/ui";
import { ContactForm } from "./ContactForm";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Virex Holding for corporate matters, business enquiries and partnerships at group level. We read every message and respond personally.",
  path: "/contact",
});

export default function ContactPage() {
  const { companyName, address, email, phone, kvk } = LEGAL_DETAILS;
  const details = [
    { label: "Company", value: companyName ?? "Virex Holding [legal form]" },
    {
      label: "Address",
      value: address ? (
        <>
          {address.line1}
          <br />
          {address.line2}
        </>
      ) : (
        <>
          [Street and number]
          <br />
          [Postcode, city]
        </>
      ),
    },
    {
      label: "E-mail",
      value: email.general ? (
        <a href={`mailto:${email.general}`} className="text-virex-warmwhite hover:text-virex-warmstone">
          <span className="vx-link">{email.general}</span>
        </a>
      ) : (
        "[corporate e-mail]"
      ),
    },
    { label: "Telephone", value: phone ?? "[phone number]" },
    { label: "Chamber of Commerce", value: kvk ?? "[KvK number]" },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <section aria-labelledby="ct-title" className="flex flex-wrap">
        <div className="min-w-0 flex-[1_1_420px] bg-virex-deepink pb-[clamp(56px,7vw,96px)] pl-[max(24px,calc((100%-1232px)/2))] pr-[clamp(24px,4vw,72px)] pt-[clamp(64px,8vw,112px)] text-virex-warmwhite">
          <div className="max-w-[460px]">
            <Eyebrow tone="dark" className="mb-9">
              Contact
            </Eyebrow>
            <h1 id="ct-title" className="font-serif text-[clamp(44px,5vw,76px)] font-light leading-[1.03] tracking-[-0.02em]">
              Get in touch with <Accent tone="dark">Virex Holding.</Accent>
            </h1>
            <p className="mt-8 text-[17px] leading-[1.8] text-virex-stone">
              For corporate matters, business enquiries and partnerships at group level. We read every message and
              respond personally.
            </p>
            <h2 className="mt-16 font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-virex-sage">
              Corporate details
            </h2>
            <dl className="mt-5 border-t border-virex-sage/30 text-[15px]">
              {details.map((d) => (
                <div key={d.label} className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-virex-sage/30 py-[18px]">
                  <dt className="font-mono text-xs text-virex-sage">{d.label}</dt>
                  <dd className="text-right">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div
          id="form"
          className="min-w-0 flex-[1.35_1_480px] pb-[clamp(56px,7vw,96px)] pl-[clamp(24px,5vw,88px)] pr-[max(24px,calc((100%-1232px)/2))] pt-[clamp(56px,7vw,104px)]"
        >
          <div className="max-w-[640px]">
            <ContactForm />
          </div>
        </div>
      </section>

      <section aria-labelledby="dir-title" className="border-t border-virex-stone bg-virex-white py-[clamp(80px,10vw,136px)]">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-x-24 gap-y-6">
            <div className="min-w-0 flex-[1_1_480px]">
              <Eyebrow className="mb-7">Group companies</Eyebrow>
              <h2 id="dir-title" className="font-serif text-[clamp(32px,3.6vw,52px)] font-light leading-[1.1]">
                Looking for one of <Accent>our businesses?</Accent>
              </h2>
            </div>
            <p className="flex-[0_1_380px] text-base leading-[1.75] text-virex-muted">
              Customers and partners of a specific business are helped fastest through that company directly.
            </p>
          </div>
          <div className="mt-14 border-t border-virex-deepink">
            {GROUP.map((b) => {
              const inner = (
                <>
                  <span className="flex-[1_1_260px] font-serif text-[30px]">{b.name}</span>
                  <span className="flex-[1_1_260px] text-[15px] text-virex-muted">{b.contactLine}</span>
                  <span className="text-sm font-semibold text-virex-forest">
                    <span className="vx-link">Contact {b.name}</span> {b.url ? "↗" : ""}
                  </span>
                </>
              );
              const className =
                "group flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2 border-b border-virex-stone py-7 text-virex-deepink transition-colors duration-300 hover:bg-virex-warmwhite";
              return b.url ? (
                <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer" className={className}>
                  {inner}
                </a>
              ) : (
                <div key={b.id} className={className}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
