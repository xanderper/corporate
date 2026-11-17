"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global critical portal error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#f8f7f4] text-[#1b2a26] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 md:p-12 border border-[#ded8cf] shadow-xl text-center rounded-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-6">
            <AlertOctagon className="w-7 h-7 text-red-700" />
          </div>

          <span className="text-[10px] font-mono tracking-widest text-[#7a8880] uppercase block mb-1">
            CRITICAL APPLICATION FAULT
          </span>

          <h1 className="font-serif text-3xl text-[#1b2a26] mb-3">
            System Unavailable
          </h1>

          <p className="font-sans text-xs text-[#52635a] leading-relaxed mb-6">
            A fatal error occurred at the portal root level. The application environment has intercepted the process safely.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#1b2a26] text-[#f8f7f4] py-3 text-xs font-semibold tracking-wider uppercase hover:bg-[#2c403a] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Portal
          </button>
        </div>
      </body>
    </html>
  );
}
