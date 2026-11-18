"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { submitEnquiry } from "./actions";
import { validateEnquiry, type Enquiry, type EnquiryErrors, type EnquirySubject } from "../../lib/enquiry";

const EMPTY: Enquiry = { type: "", name: "", email: "", org: "", message: "" };

const SUBJECTS: { id: EnquirySubject; label: string; desc: string }[] = [
  { id: "business", label: "Business enquiry", desc: "Corporate matters concerning the group." },
  { id: "partnership", label: "Partnership", desc: "Collaboration at group level." },
  { id: "other", label: "Other", desc: "Anything else for Virex Holding." },
];

const field =
  "border bg-virex-white px-4 text-base text-virex-deepink transition-colors focus:border-virex-deepink focus:outline-none";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [f, setF] = useState<Enquiry>({ ...EMPTY });
  const [err, setErr] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const set = (key: "name" | "email" | "org" | "message") => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...f, [key]: e.target.value };
    setF(next);
    if (key in err) setErr((prev) => ({ ...prev, [key]: validateEnquiry(next)[key as keyof EnquiryErrors] }));
    if (status === "error") setStatus("idle");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateEnquiry(f);
    if (Object.keys(errors).length) {
      setErr(errors);
      const first = Object.keys(errors)[0];
      document.getElementById(first === "type" ? "f-type-business" : `f-${first}`)?.focus();
      return;
    }
    setErr({});
    setStatus("loading");
    const result = await submitEnquiry(f);
    if (result.ok) setStatus("success");
    else {
      if (result.errors) setErr(result.errors);
      setStatus("error");
    }
  };

  const reset = () => {
    setF({ ...EMPTY });
    setErr({});
    setStatus("idle");
  };

  if (status === "success") {
    return (
      <div role="status" className="flex min-h-[560px] flex-col justify-center gap-5">
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.08em] text-virex-forest">
          <span aria-hidden="true" className="inline-block size-[7px] bg-virex-signal" />
          Message received
        </p>
        <h2 className="font-serif text-[44px] font-light leading-[1.1]">
          Thank you, <em className="italic text-virex-forest">{f.name.trim().split(" ")[0] || "you"}.</em>
        </h2>
        <p className="max-w-[440px] text-base leading-[1.75] text-virex-muted">
          Your message has reached Virex Holding. We will review it and respond personally.
        </p>
        <button type="button" onClick={reset} className="mt-4 min-h-11 self-start text-sm font-semibold text-virex-forest">
          <span className="vx-link">Send another message</span>
        </button>
      </div>
    );
  }

  const loading = status === "loading";
  const border = (k: keyof EnquiryErrors) => (err[k] ? "border-virex-error" : "border-virex-stone");

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="form-title" className="flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-virex-deepink pb-6">
        <h2 id="form-title" className="font-serif text-[34px] font-light">
          Send a message
        </h2>
        <p className="font-mono text-[11px] uppercase text-virex-muted">* Required</p>
      </div>

      {status === "error" && (
        <div role="alert" className="border border-virex-error bg-[#FBF4F2] px-5 py-4 text-sm leading-relaxed text-[#7A2C22]">
          Something went wrong while sending your message. Your text is kept — please try again in a moment.
        </div>
      )}

      <fieldset aria-describedby="e-type">
        <legend className="mb-3.5 text-[13px] font-semibold">Subject *</legend>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-2.5">
          {SUBJECTS.map((t, i) => {
            const on = f.type === t.id;
            return (
              <label
                key={t.id}
                className={`relative flex min-h-11 cursor-pointer flex-col gap-2 border px-[18px] pb-5 pt-[18px] transition-colors hover:border-virex-deepink ${
                  on ? "border-virex-deepink bg-virex-deepink" : err.type ? "border-virex-error bg-virex-white" : "border-virex-stone bg-virex-white"
                }`}
              >
                <input
                  id={`f-type-${t.id}`}
                  type="radio"
                  name="subject"
                  value={t.id}
                  checked={on}
                  onChange={() => {
                    setF({ ...f, type: t.id });
                    setErr((prev) => ({ ...prev, type: undefined }));
                  }}
                  className={`absolute right-[18px] top-[18px] m-0 ${on ? "accent-virex-signal" : "accent-virex-deepink"}`}
                />
                <span className={`font-mono text-[11px] ${on ? "text-virex-sage" : "text-virex-muted"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`pr-6 text-sm font-semibold ${on ? "text-virex-warmwhite" : "text-virex-deepink"}`}>
                  {t.label}
                </span>
                <span className={`text-[13px] leading-normal ${on ? "text-virex-sage" : "text-virex-muted"}`}>{t.desc}</span>
              </label>
            );
          })}
        </div>
        <p id="e-type" className="mt-2 min-h-[18px] text-[13px] text-virex-error">
          {err.type}
        </p>
      </fieldset>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-6 gap-y-2">
        {(["name", "email"] as const).map((k) => (
          <div key={k} className="flex flex-col gap-2">
            <label htmlFor={`f-${k}`} className="text-[13px] font-semibold">
              {k === "name" ? "Name" : "Email"} *
            </label>
            <input
              id={`f-${k}`}
              type={k === "email" ? "email" : "text"}
              autoComplete={k}
              inputMode={k === "email" ? "email" : undefined}
              value={f[k]}
              onChange={set(k)}
              aria-invalid={!!err[k]}
              aria-describedby={`e-${k}`}
              className={`h-[54px] ${field} ${border(k)}`}
            />
            <p id={`e-${k}`} className="min-h-[18px] text-[13px] text-virex-error">
              {err[k]}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="f-org" className="text-[13px] font-semibold">
          Organisation <span className="font-normal text-virex-muted">(optional)</span>
        </label>
        <input
          id="f-org"
          type="text"
          autoComplete="organization"
          value={f.org}
          onChange={set("org")}
          className={`h-[54px] ${field} border-virex-stone`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-4">
          <label htmlFor="f-message" className="text-[13px] font-semibold">
            Message *
          </label>
          <span aria-hidden="true" className="font-mono text-[11px] text-virex-muted">
            {f.message.trim().length} / 20 MIN
          </span>
        </div>
        <textarea
          id="f-message"
          rows={6}
          value={f.message}
          onChange={set("message")}
          aria-invalid={!!err.message}
          aria-describedby="e-msg"
          className={`resize-y py-3.5 leading-relaxed ${field} ${border("message")}`}
        />
        <p id="e-msg" className="min-h-[18px] text-[13px] text-virex-error">
          {err.message}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-t border-virex-stone pt-6">
        <p className="flex-[1_1_220px] text-[13px] leading-relaxed text-virex-muted">
          We use your details only to respond to your message. See our{" "}
          <Link href="/privacy" className="text-virex-forest underline">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className={`inline-flex min-h-[54px] min-w-[210px] items-center justify-center gap-3 bg-virex-deepink px-7 text-sm font-semibold tracking-[0.02em] text-virex-warmwhite transition-colors hover:bg-virex-forest max-[600px]:w-full ${loading ? "opacity-70" : ""}`}
        >
          {loading ? (
            "Sending…"
          ) : (
            <>
              Send message <span className="vx-arrow" aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
