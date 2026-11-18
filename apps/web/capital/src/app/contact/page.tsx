import { CAPITAL_LEGAL_DETAILS } from "@virex/content";
import { buildMetadata } from "../../lib/metadata";
import { OFFICES } from "../../lib/offices";
import { Accent, Eyebrow } from "../../components/ui";
import { ConnectedContactForm, OfficeProvider, PlanVisitLink, PressEnquiryLink } from "./OfficeContext";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Whether you are building a business, considering a partnership or have a proposal to share, Virex Capital reads every enquiry with care and responds personally.",
  path: "/contact",
});

const STEPS = [
  {
    title: "We read your message",
    body: "Every enquiry is reviewed by a member of our team, not an automated system.",
  },
  {
    title: "We respond personally",
    body: "We aim to respond personally within two business days.",
  },
  {
    title: "A first conversation",
    body: "If there is a fit, we arrange an introduction — by call or at one of our offices.",
  },
];

function Mail({ address, fallback }: { address?: string; fallback: string }) {
  if (!address) return <>{fallback}</>;
  return (
    <a href={`mailto:${address}`} className="text-virex-warmwhite hover:text-virex-warmstone">
      <span className="vx-link">{address}</span>
    </a>
  );
}

export default function ContactPage() {
  const { email, phone } = CAPITAL_LEGAL_DETAILS;
  const contactRows = [
    { label: "General enquiries", value: <Mail address={email.general} fallback="contact@virexcapital.com" /> },
    {
      label: "Investments & partnerships",
      value: <Mail address={email.investments} fallback="investments@virexcapital.com" />,
    },
    {
      label: "Press & media",
      value: <Mail address={email.press} fallback="press@virexcapital.com" />,
    },
    ...(phone ? [{ label: "Telephone", value: phone }] : []),
  ];

  return (
    <OfficeProvider>
      <div className="w-full overflow-x-hidden">
        <section aria-labelledby="ct-title" className="flex flex-wrap border-t border-virex-stone">
          {/* Left: dark introduction panel, aligned to the 1280px grid. */}
          <div className="relative flex min-w-0 flex-[1_1_420px] flex-col overflow-hidden bg-virex-forest pb-[220px] pl-[max(24px,calc((100%-1232px)/2))] pr-[clamp(24px,4vw,72px)] pt-[clamp(64px,8vw,112px)] text-virex-warmwhite">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG artwork */}
            <img
              src={OFFICES[0]?.image ?? "/images/amsterdam.svg"}
              alt=""
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[200px] w-full object-cover object-[50%_80%] opacity-[0.18]"
            />
            <div className="relative max-w-[480px]">
              <Eyebrow tone="dark" className="mb-9">
                Contact
              </Eyebrow>
              <h1 id="ct-title" className="font-serif text-[clamp(46px,5.2vw,80px)] font-light leading-[1.02] tracking-[-0.02em]">
                Let’s start a <Accent tone="dark">conversation.</Accent>
              </h1>
              <p className="mt-8 text-[17px] leading-[1.8] text-virex-stone">
                Whether you are building a business, considering a partnership or have a proposal to share, we read
                every enquiry with care and respond personally.
              </p>

              <dl className="mt-14 border-t border-virex-sage/35">
                {contactRows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-6 border-b border-virex-sage/35 py-5">
                    <dt className="text-[13px] text-virex-sage">{row.label}</dt>
                    <dd className="text-right text-[15px]">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3">
                <a href="#offices" className="inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold text-virex-warmwhite">
                  <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true">
                    <path d="M7 17s6-6.2 6-10.2A6 6 0 0 0 1 6.8C1 10.8 7 17 7 17z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="7" cy="7" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span className="vx-link">{OFFICES.map((o) => o.city).join(" · ")}</span>
                </a>
                <p className="inline-flex items-center gap-2.5 text-[13px] text-virex-sage">
                  <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
                    <rect x="1.5" y="7" width="11" height="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Handled in confidence
                </p>
              </div>
            </div>
          </div>

          {/* Right: form. */}
          <div
            id="form"
            className="min-w-0 flex-[1.35_1_480px] scroll-mt-24 bg-virex-white pb-[clamp(56px,7vw,96px)] pl-[clamp(24px,5vw,88px)] pr-[max(24px,calc((100%-1232px)/2))] pt-[clamp(56px,7vw,104px)]"
          >
            <div className="max-w-[640px]">
              <ConnectedContactForm offices={OFFICES.map(({ id, city }) => ({ id, city }))} />
            </div>
          </div>
        </section>

        <section aria-labelledby="next-title" className="py-[clamp(72px,9vw,120px)]">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-x-24 gap-y-6">
              <h2 id="next-title" className="type-h2-sm flex-[1_1_400px]">
                What happens <Accent>next.</Accent>
              </h2>
              <p className="flex-[0_1_360px] text-[15px] leading-[1.75] text-virex-muted">
                A considered process, from your first message to a first conversation.
              </p>
            </div>
            <ol className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-12">
              {STEPS.map((step, i) => (
                <li key={step.title} className={`border-t py-7 ${i === 0 ? "border-virex-deepink" : "border-virex-stone"}`}>
                  <p aria-hidden="true" className="font-serif text-[56px] font-light leading-none text-virex-forest">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mb-2.5 mt-7 text-lg font-semibold">{step.title}</h3>
                  <p className="text-[15px] leading-[1.7] text-virex-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="press" aria-labelledby="press-title" className="border-t border-virex-stone bg-virex-warmwhite py-[clamp(64px,8vw,104px)]">
          <div className="container">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Eyebrow className="mb-6">Press &amp; media</Eyebrow>
                <h2 id="press-title" className="type-h2-sm">
                  Media enquiries &amp; <Accent>press resources.</Accent>
                </h2>
                <p className="mt-6 max-w-[540px] text-base leading-[1.8] text-virex-body">
                  Journalists, editors and conference organizers can reach our communications team directly for
                  commentary, interview requests, official company facts, or brand assets.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <PressEnquiryLink />
                  <a
                    href={`mailto:${email.press ?? "press@virexcapital.com"}`}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-virex-muted hover:text-virex-deepink"
                  >
                    <span className="vx-link">{email.press ?? "press@virexcapital.com"}</span>
                  </a>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-5 border border-virex-stone bg-virex-white p-[clamp(24px,3.5vw,40px)] sm:grid-cols-2 lg:col-span-5">
                <div className="border-b border-virex-stone pb-4">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">Legal entity</dt>
                  <dd className="mt-2 font-serif text-[20px] font-light text-virex-deepink">
                    {CAPITAL_LEGAL_DETAILS.companyName}
                  </dd>
                </div>
                <div className="border-b border-virex-stone pb-4">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">Press desk</dt>
                  <dd className="mt-2 text-[15px] text-virex-deepink">
                    {email.press ?? "press@virexcapital.com"}
                  </dd>
                </div>
                <div className="border-b border-virex-stone pb-4 sm:border-b-0 sm:pb-0">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">Focus</dt>
                  <dd className="mt-2 text-[15px] text-virex-body">Private markets &amp; listed equities</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">Offices</dt>
                  <dd className="mt-2 text-[15px] text-virex-body">Amsterdam &amp; Utrecht, NL</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section id="offices" aria-labelledby="off-title" className="section-y-sm scroll-mt-24 bg-virex-white">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-x-24 gap-y-6">
              <div className="min-w-0 flex-[1_1_480px]">
                <Eyebrow>Our offices</Eyebrow>
                <h2 id="off-title" className="type-h2">
                  Meet us in <Accent>person.</Accent>
                </h2>
              </div>
              <p className="flex-[0_1_380px] text-base leading-[1.75] text-virex-muted">
                Visits are by appointment. Mention your preferred office in the form and we will arrange the rest.
              </p>
            </div>
            <div className="mt-[72px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-8">
              {OFFICES.map((o, i) => (
                <article
                  key={o.id}
                  aria-labelledby={`office-${o.id}`}
                  className="vx-card flex flex-col border border-virex-stone bg-virex-warmwhite"
                >
                  <div className="relative aspect-video overflow-hidden bg-virex-stone">
                    {/* eslint-disable-next-line @next/next/no-img-element -- static SVG artwork */}
                    <img
                      src={o.image}
                      alt={o.alt}
                      style={{ objectPosition: o.imagePosition }}
                      className="vx-img block size-full object-cover"
                    />
                    <p className="absolute left-5 top-5 bg-virex-warmwhite/90 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-virex-deepink">
                      {String(i + 1).padStart(2, "0")} — {o.city}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col gap-7 p-[clamp(28px,3.5vw,44px)]">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <h3 id={`office-${o.id}`} className="font-serif text-[clamp(36px,3.4vw,48px)] font-light leading-none">
                        {o.city}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.16em] text-virex-muted">{o.country}</p>
                    </div>
                    <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-8 gap-y-5 border-t border-virex-stone pt-6 text-[15px] leading-relaxed">
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">Address</dt>
                        <dd className="mt-2 whitespace-pre-line">{o.address}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">Contact</dt>
                        <dd className="mt-2 whitespace-pre-line">{o.contact}</dd>
                      </div>
                    </dl>
                    <div className="mt-auto flex flex-wrap items-center gap-x-7 gap-y-3">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.mapsQuery ?? o.city)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold text-virex-forest"
                      >
                        <span className="vx-link">Get directions</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                      <PlanVisitLink officeId={o.id} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </OfficeProvider>
  );
}
