"use client";

import { useState } from "react";

export function ShareLinks({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — nothing to do.
    }
  };

  return (
    <aside aria-label="Article tools" className="flex flex-[0_0_160px] flex-col gap-3.5 text-[13px] text-virex-muted">
      <p className="text-[11px] uppercase tracking-[0.22em]">Share</p>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-virex-body hover:text-virex-deepink"
      >
        <span className="vx-link">LinkedIn</span>
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
        className="text-virex-body hover:text-virex-deepink"
      >
        <span className="vx-link">Email</span>
      </a>
      <button type="button" onClick={copy} className="text-left text-virex-body hover:text-virex-deepink">
        <span className="vx-link">{copied ? "Link copied" : "Copy link"}</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </aside>
  );
}
