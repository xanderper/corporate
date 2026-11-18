"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { submitEnquiry } from "./actions";
import { validateEnquiry, type Enquiry, type EnquiryErrors, type EnquiryType } from "../../lib/enquiry";

const EMPTY: Omit<Enquiry, "type" | "office"> = { name: "", email: "", company: "", message: "" };

const TYPES: { id: EnquiryType; label: string; desc: string }[] = [
  { id: "general", label: "General enquiry", desc: "About Virex Capital and how we work." },
  { id: "investment", label: "Investment & partnership", desc: "For founders, owners and co-investors." },
  { id: "proposal", label: "Business proposal", desc: "Share an opportunity in confidence." },
  { id: "press", label: "Press & media", desc: "For journalists, interviews and media requests." },
];

const field =
  "border bg-virex-warmwhite px-4 text-base text-virex-deepink transition-colors focus:border-virex-forest focus:bg-virex-white focus:outline-none";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm({
  offices,
  office,
  onOfficeChange,
  enquiryType,
  onEnquiryTypeChange,
}: {
  offices: { id: string; city: string }[];
  office: string;
  onOfficeChange: (id: string) => void;
  enquiryType: EnquiryType | "";
  onEnquiryTypeChange: (type: EnquiryType | "") => void;
}) {
  const [f, setF] = useState<Omit<Enquiry, "type" | "office">>({ ...EMPTY });
  const [err, setErr] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const form: Enquiry = { ...f, type: enquiryType, office };

  const set = (key: keyof Omit<Enquiry, "type" | "office">) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...f, [key]: e.target.value };
    setF(next);
    if (key in err) {
      setErr((prev) => ({ ...prev, [key]: validateEnquiry({ ...next, type: enquiryType, office })[key as keyof EnquiryErrors] }));
    }
    if (status === "error") setStatus("idle");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateEnquiry(form);
    if (Object.keys(errors).length) {
      setErr(errors);
      const first = Object.keys(errors)[0];
      document.getElementById(first === "type" ? "f-type-general" : `f-${first}`)?.focus();
      return;
    }
    setErr({});
    setStatus("loading");
    const result = await submitEnquiry(form);
    if (result.ok) setStatus("success");
    else {
      if (result.errors) setErr(result.errors);
      setStatus("error");
    }
  };

  const reset = () => {
    setF({ ...EMPTY });
    onEnquiryTypeChange("");
    onOfficeChange("");
    setErr({});
    setStatus("idle");
  };

  if (status === "success") {
    const firstName = f.name.trim().split(" ")[0] || "you";
    return (
      <div role="status" className="flex min-h-[620px] flex-col justify-center gap-5">
        <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
          <circle cx="28" cy="28" r="27" fill="none" stroke="#17372F" strokeWidth="1.2" />
          <path d="M18 28.5l7 7 13-15" fill="none" stroke="#17372F" strokeWidth="1.4" />
        </svg>
        <h2 className="mt-4 font-serif text-[44px] font-light leading-[1.1]">
          Thank you, <em className="italic text-virex-forest">{firstName}.</em>
        </h2>
        <p className="max-w-[440px] text-base leading-[1.75] text-virex-muted">
          Your message has been received. A member of our team will review it and respond personally.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 min-h-11 self-start text-sm font-semibold text-virex-forest"
        >
          <span className="vx-link">Send another message</span>
        </button>
      </div>
    );
  }

  const loading = status === "loading";
  const border = (k: keyof EnquiryErrors) => (err[k] ? "border-virex-error" : "border-virex-stone");

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby="form-title" className="flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-virex-stone pb-6">
        <h2 id="form-title" className="font-serif text-[34px] font-light">
          Send us a message
        </h2>
        <p className="text-[13px] text-virex-muted">* Required</p>
      </div>

      {status === "error" && (
        <div role="alert" className="border border-virex-error bg-[#FBF4F2] px-5 py-4 text-sm leading-relaxed text-[#7A2C22]">
          Something went wrong while sending your message. Your text is kept — please try again in a moment.
        </div>
      )}

      <fieldset aria-describedby="e-type">
        <legend className="mb-3.5 text-[13px] font-semibold">What would you like to discuss? *</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TYPES.map((t) => {
            const on = enquiryType === t.id;
            return (
              <label
                key={t.id}
                className={`relative flex min-h-11 cursor-pointer flex-col gap-2 border px-[18px] pb-5 pt-[18px] transition-colors hover:border-virex-forest ${
                  on ? "border-virex-forest bg-virex-forest" : err.type ? "border-virex-error bg-virex-white" : "border-virex-stone bg-virex-white"
                }`}
              >
                <input
                  id={`f-type-${t.id}`}
                  type="radio"
                  name="enquiry"
                  value={t.id}
                  checked={on}
                  onChange={() => {
                    onEnquiryTypeChange(t.id);
                    setErr((prev) => ({ ...prev, type: undefined }));
                  }}
                  className={`absolute right-[18px] top-[18px] m-0 ${on ? "accent-virex-warmstone" : "accent-virex-forest"}`}
                />
                <span className={`pr-6 text-sm font-semibold ${on ? "text-virex-warmwhite" : "text-virex-deepink"}`}>
                  {t.label}
                </span>
                <span className={`text-[13px] leading-normal ${on ? "text-virex-stone" : "text-virex-muted"}`}>{t.desc}</span>
              </label>
            );
          })}
        </div>
        <p id="e-type" className="mt-2 min-h-[18px] text-[13px] text-virex-error">
          {err.type}
        </p>
      </fieldset>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-6 gap-y-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="f-name" className="text-[13px] font-semibold">
            Name *
          </label>
          <input
            id="f-name"
            type="text"
            autoComplete="name"
            value={f.name}
            onChange={set("name")}
            aria-invalid={!!err.name}
            aria-describedby="e-name"
            className={`h-[54px] ${field} ${border("name")}`}
          />
          <p id="e-name" className="min-h-[18px] text-[13px] text-virex-error">
            {err.name}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="f-email" className="text-[13px] font-semibold">
            Email *
          </label>
          <input
            id="f-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={f.email}
            onChange={set("email")}
            aria-invalid={!!err.email}
            aria-describedby="e-email"
            className={`h-[54px] ${field} ${border("email")}`}
          />
          <p id="e-email" className="min-h-[18px] text-[13px] text-virex-error">
            {err.email}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="f-company" className="text-[13px] font-semibold">
            {enquiryType === "press" ? "Publication / organization" : "Company"}{" "}
            <span className="font-normal text-virex-muted">(optional)</span>
          </label>
          <input
            id="f-company"
            type="text"
            autoComplete="organization"
            value={f.company}
            onChange={set("company")}
            className={`h-[54px] ${field} border-virex-stone`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="f-office" className="text-[13px] font-semibold">
            Preferred office <span className="font-normal text-virex-muted">(optional)</span>
          </label>
          <select
            id="f-office"
            value={office}
            onChange={(e) => onOfficeChange(e.target.value)}
            className={`h-[54px] ${field} border-virex-stone px-3.5`}
          >
            <option value="">No preference</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-4">
          <label htmlFor="f-message" className="text-[13px] font-semibold">
            Message *
          </label>
          <span aria-hidden="true" className="text-xs text-virex-muted">
            {f.message.trim().length} / 20 min.
          </span>
        </div>
        <textarea
          id="f-message"
          rows={6}
          value={f.message}
          onChange={set("message")}
          aria-invalid={!!err.message}
          aria-describedby="h-msg e-msg"
          className={`resize-y py-3.5 leading-relaxed ${field} ${border("message")}`}
        />
        <p id="h-msg" className="text-[13px] text-virex-muted">
          A few sentences about you and what you have in mind is enough.
        </p>
        <p id="e-msg" className="min-h-[18px] text-[13px] text-virex-error">
          {err.message}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-t border-virex-stone pt-6">
        <p className="flex-[1_1_220px] text-[13px] leading-relaxed text-virex-muted">
          We use your details only to respond to your enquiry. See our{" "}
          <Link href="/privacy" className="text-virex-forest underline">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className={`inline-flex min-h-[54px] min-w-[210px] items-center justify-center gap-3 bg-virex-forest px-7 text-sm font-semibold tracking-[0.02em] text-virex-warmwhite transition-colors hover:bg-virex-deepink max-[600px]:w-full ${loading ? "opacity-70" : ""}`}
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
