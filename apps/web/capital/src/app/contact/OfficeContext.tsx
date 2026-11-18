"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ContactForm } from "./ContactForm";
import type { EnquiryType } from "../../lib/enquiry";
import type { Office } from "../../lib/offices";

/** Shares the "preferred office" and selected enquiry type between the form and page links. */
const OfficeContext = createContext<{
  office: string;
  setOffice: (id: string) => void;
  enquiryType: EnquiryType | "";
  setEnquiryType: (type: EnquiryType | "") => void;
} | null>(null);

export function OfficeProvider({ children }: { children: ReactNode }) {
  const [office, setOffice] = useState("");
  const [enquiryType, setEnquiryType] = useState<EnquiryType | "">("");
  return (
    <OfficeContext.Provider value={{ office, setOffice, enquiryType, setEnquiryType }}>
      {children}
    </OfficeContext.Provider>
  );
}

function useOffice() {
  const ctx = useContext(OfficeContext);
  if (!ctx) throw new Error("useOffice must be used inside <OfficeProvider>");
  return ctx;
}

export function ConnectedContactForm({ offices }: { offices: Pick<Office, "id" | "city">[] }) {
  const { office, setOffice, enquiryType, setEnquiryType } = useOffice();
  return (
    <ContactForm
      offices={offices}
      office={office}
      onOfficeChange={setOffice}
      enquiryType={enquiryType}
      onEnquiryTypeChange={setEnquiryType}
    />
  );
}

export function PlanVisitLink({ officeId }: { officeId: string }) {
  const { setOffice } = useOffice();
  return (
    <a
      href="#form"
      onClick={() => setOffice(officeId)}
      className="inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold text-virex-muted hover:text-virex-deepink"
    >
      <span className="vx-link">Plan a visit</span>
      <span className="vx-arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}

export function PressEnquiryLink() {
  const { setEnquiryType } = useOffice();
  return (
    <a
      href="#form"
      onClick={() => setEnquiryType("press")}
      className="inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold text-virex-forest hover:text-virex-deepink"
    >
      <span className="vx-link">Send a press enquiry</span>
      <span className="vx-arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}
