"use client";

import { QorveProvider } from "@qorve/react";
import {
  QORVE_API_URL,
  QORVE_CHECKOUT_URL,
  QORVE_MERCHANT_PUBLISHABLE_KEY,
} from "../lib/qorve-widget";
import { VirexAccessProvider } from "./VirexAccessContext";
import { OrganizationProvider } from "./OrganizationContext";

export function QorveWidgetsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QorveProvider
      apiKey={QORVE_MERCHANT_PUBLISHABLE_KEY}
      checkoutUrl={QORVE_CHECKOUT_URL}
      apiUrl={QORVE_API_URL}
    >
      <VirexAccessProvider>
        <OrganizationProvider>{children}</OrganizationProvider>
      </VirexAccessProvider>
    </QorveProvider>
  );
}
