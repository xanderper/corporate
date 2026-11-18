"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const subscribe = () => () => {};

export function CookieConsent({ storageKey }: { storageKey: string }) {
  const [dismissed, setDismissed] = useState(false);
  const hasConsent = useSyncExternalStore(
    subscribe,
    () => Boolean(localStorage.getItem(storageKey)),
    () => true
  );

  const accept = () => {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  };

  if (hasConsent || dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 pb-4 sm:pb-6 z-50 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto overflow-hidden bg-virex-deepink text-virex-warmwhite border border-virex-stone/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex-grow">
          <p className="text-sm leading-relaxed text-virex-warmwhite/80">
            We use strictly necessary cookies to ensure the proper functioning of our website. By using our site, you acknowledge our{" "}
            <Link href="/cookies" className="underline underline-offset-4 hover:text-virex-warmwhite transition-colors">
              Cookie Policy
            </Link>.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={accept}
            className="text-sm font-semibold tracking-widest uppercase bg-virex-forest text-virex-warmwhite px-6 py-3 hover:bg-virex-forest/80 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
