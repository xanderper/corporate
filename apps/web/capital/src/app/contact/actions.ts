"use server";

import { validateEnquiry, type Enquiry, type EnquiryErrors } from "../../lib/enquiry";

/**
 * Delivers an enquiry. Set CONTACT_WEBHOOK_URL to forward enquiries as JSON
 * (e.g. to the API or a mail relay). Without it, development logs the enquiry
 * and production reports a failure so no message is silently lost.
 */
export async function submitEnquiry(
  f: Enquiry,
): Promise<{ ok: true } | { ok: false; errors?: EnquiryErrors }> {
  const errors = validateEnquiry(f);
  if (Object.keys(errors).length) return { ok: false, errors };

  const payload = {
    site: "virex-capital",
    ...f,
    name: f.name.trim().slice(0, 200),
    email: f.email.trim().slice(0, 200),
    company: f.company.trim().slice(0, 200),
    message: f.message.trim().slice(0, 5000),
    receivedAt: new Date().toISOString(),
  };

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] enquiry (CONTACT_WEBHOOK_URL not set):", payload);
      return { ok: true };
    }
    return { ok: false };
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok ? { ok: true } : { ok: false };
  } catch {
    return { ok: false };
  }
}
