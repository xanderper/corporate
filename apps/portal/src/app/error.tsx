"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, LayoutDashboard, Shield } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected exceptions to telemetry/monitoring
    console.error("Portal application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-virex-warmwhite">
      {/* Left Brand / Security Panel */}
      <div className="w-full md:w-5/12 lg:w-1/3 bg-virex-forest text-virex-warmwhite flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-pattern-error"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-error)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col mb-16">
            <span className="font-sans text-sm font-semibold tracking-[0.25em] leading-tight">
              VIREX
            </span>
            <span className="font-sans text-[10px] tracking-[0.25em] text-virex-sage leading-tight mt-1">
              SYSTEM INTEGRITY
            </span>
          </div>

          <span className="font-mono text-sm tracking-widest text-red-300 uppercase block mb-2">
            Status Code: 500
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-virex-warmwhite mb-6 leading-tight">
            System <br /> Exception
          </h2>
          <p className="font-sans text-xs text-virex-sage leading-relaxed max-w-sm">
            An internal application error occurred while processing your request. State boundaries have been secured and logged.
          </p>
        </div>

        <div className="relative z-10 mt-12 md:mt-0">
          <div className="flex items-center gap-2 text-virex-sage text-xs">
            <Shield className="w-4 h-4 text-virex-sage" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Fault Isolation Protocol Active
            </span>
          </div>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col justify-center items-center p-8 md:p-16 relative">
        <div className="max-w-md w-full text-center md:text-left">
          <div className="bg-white p-8 md:p-12 border border-virex-stone/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-sm">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-6 mx-auto md:mx-0">
              <AlertOctagon className="w-6 h-6 text-red-700" />
            </div>

            <span className="text-[11px] font-mono tracking-widest text-virex-muted uppercase block mb-2">
              HTTP 500 / INTERNAL ERROR
            </span>

            <h1 className="font-serif text-3xl md:text-4xl text-virex-deepink mb-4">
              Something went wrong
            </h1>

            <p className="font-sans text-sm text-virex-muted leading-relaxed mb-6">
              A server or application exception prevented the portal from rendering this view. You can attempt to retry the operation or return to your dashboard.
            </p>

            {error.digest && (
              <div className="bg-virex-warmwhite p-3 border border-virex-stone/30 rounded-sm mb-6 text-left">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-virex-muted block mb-0.5">
                  Error Diagnostic Digest
                </span>
                <code className="text-xs font-mono text-virex-deepink select-all">
                  {error.digest}
                </code>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center justify-center gap-2 bg-virex-forest text-virex-warmwhite px-6 py-3 text-xs font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Operation
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 border border-virex-stone text-virex-deepink px-6 py-3 text-xs font-medium tracking-wider uppercase hover:bg-virex-stone/20 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center md:text-left">
            <p className="text-xs text-virex-muted">
              If this error persists, contact{" "}
              <a
                href="mailto:it-ops@virex.group"
                className="underline hover:text-virex-deepink transition-colors"
              >
                it-ops@virex.group
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
