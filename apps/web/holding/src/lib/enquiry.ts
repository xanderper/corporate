/** Contact-form model and validation, shared by the client form and the server action. */

export type EnquirySubject = "business" | "partnership" | "other";

export interface Enquiry {
  type: EnquirySubject | "";
  name: string;
  email: string;
  org: string;
  message: string;
}

export type EnquiryErrors = Partial<Record<"type" | "name" | "email" | "message", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEnquiry(f: Enquiry): EnquiryErrors {
  const e: EnquiryErrors = {};
  if (!f.name.trim()) e.name = "Please enter your name.";
  if (!f.email.trim()) e.email = "Please enter your email address.";
  else if (!EMAIL.test(f.email.trim())) e.email = "Please enter a valid email address.";
  if (!f.type) e.type = "Please choose a subject.";
  if (f.message.trim().length < 20) e.message = "Please write at least 20 characters.";
  return e;
}
