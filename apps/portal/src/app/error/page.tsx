"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  FileQuestion,
  ServerCrash,
  Hammer,
  LayoutDashboard,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

interface ErrorDescriptor {
  status: string;
  badge: string;
  title: string;
  description: string;
  technicalDetails: string;
  icon: React.ReactNode;
}

const ERROR_MAP: Record<string, ErrorDescriptor> = {
  "400": {
    status: "400",
    badge: "BAD REQUEST",
    title: "Invalid Request Payload",
    description:
      "The server could not understand the request due to invalid syntax, missing required fields, or a malformed transmission.",
    technicalDetails: "HTTP 400 (Bad Request) — Header or payload validation failed.",
    icon: <AlertTriangle className="w-7 h-7 text-amber-600" />,
  },
  "401": {
    status: "401",
    badge: "UNAUTHORIZED",
    title: "Authentication Required",
    description:
      "You must be authenticated with a verified Qorve corporate identity to access this endpoint.",
    technicalDetails: "HTTP 401 (Unauthorized) — Bearer token or session credentials absent.",
    icon: <ShieldAlert className="w-7 h-7 text-red-600" />,
  },
  "403": {
    status: "403",
    badge: "FORBIDDEN",
    title: "Access Restricted by Policy",
    description:
      "Your identity is authenticated, but you do not possess the required entity membership or governance role.",
    technicalDetails: "HTTP 403 (Forbidden) — Policy 14-B (Role Isolation) enforced.",
    icon: <ShieldAlert className="w-7 h-7 text-amber-700" />,
  },
  "404": {
    status: "404",
    badge: "NOT FOUND",
    title: "Resource Not Located",
    description:
      "The specified document, report, or organization record does not exist or has been archived.",
    technicalDetails: "HTTP 404 (Not Found) — Target URI does not resolve to an active entity.",
    icon: <FileQuestion className="w-7 h-7 text-virex-forest" />,
  },
  "500": {
    status: "500",
    badge: "SERVER ERROR",
    title: "Corporate Server Exception",
    description:
      "An unexpected server-side exception occurred while processing the requested operation.",
    technicalDetails: "HTTP 500 (Internal Server Error) — Unhandled application state.",
    icon: <ServerCrash className="w-7 h-7 text-red-700" />,
  },
  "503": {
    status: "503",
    badge: "SERVICE UNAVAILABLE",
    title: "Maintenance in Progress",
    description:
      "The portal infrastructure is temporarily undergoing scheduled maintenance or database index optimization.",
    technicalDetails: "HTTP 503 (Service Unavailable) — Temporary service interruption.",
    icon: <Hammer className="w-7 h-7 text-amber-700" />,
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || searchParams.get("status") || "500";
  const customMessage = searchParams.get("message");

  const descriptor = ERROR_MAP[code] || {
    status: code,
    badge: "ERROR",
    title: "Application Error",
    description:
      customMessage ||
      "An unexpected error occurred while processing your portal session.",
    technicalDetails: `HTTP ${code} (Error) — Diagnostic reference: ${code}`,
    icon: <HelpCircle className="w-7 h-7 text-virex-deepink" />,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-virex-warmwhite">
      {/* Left Security Branding Panel */}
      <div className="w-full md:w-5/12 lg:w-1/3 bg-virex-forest text-virex-warmwhite flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-pattern-error-page"
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
            <rect width="100%" height="100%" fill="url(#grid-pattern-error-page)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col mb-16">
            <span className="font-sans text-sm font-semibold tracking-[0.25em] leading-tight">
              VIREX
            </span>
            <span className="font-sans text-[10px] tracking-[0.25em] text-virex-sage leading-tight mt-1">
              SYSTEM GATEWAY
            </span>
          </div>

          <span className="font-mono text-sm tracking-widest text-virex-sage uppercase block mb-2">
            Status Code: {descriptor.status}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-virex-warmwhite mb-6 leading-tight">
            {descriptor.title.split(" ")[0]} <br />
            {descriptor.title.split(" ").slice(1).join(" ")}
          </h2>
          <p className="font-sans text-xs text-virex-sage leading-relaxed max-w-sm">
            All portal transactions are validated against institutional security policies and group governance frameworks.
          </p>
        </div>

        <div className="relative z-10 mt-12 md:mt-0">
          <p className="text-[10px] text-virex-sage/80 font-mono">
            Virex Group Telemetry · {descriptor.badge}
          </p>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col justify-center items-center p-8 md:p-16 relative">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 md:p-12 border border-virex-stone/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-sm">
            <div className="w-14 h-14 rounded-full bg-virex-warmwhite border border-virex-stone/30 flex items-center justify-center mb-6">
              {descriptor.icon}
            </div>

            <span className="text-[10px] font-mono tracking-widest text-virex-muted uppercase block mb-1">
              HTTP {descriptor.status} · {descriptor.badge}
            </span>

            <h1 className="font-serif text-2xl md:text-3xl text-virex-deepink mb-4">
              {descriptor.title}
            </h1>

            <p className="font-sans text-xs text-virex-muted leading-relaxed mb-6">
              {customMessage || descriptor.description}
            </p>

            <div className="bg-virex-warmwhite p-3 border border-virex-stone/20 rounded-sm mb-8">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-virex-muted block mb-0.5">
                Technical Context
              </span>
              <p className="text-xs font-mono text-virex-deepink">
                {descriptor.technicalDetails}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-virex-forest text-virex-warmwhite px-6 py-3 text-xs font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Return to Dashboard
              </Link>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 border border-virex-stone text-virex-deepink px-6 py-3 text-xs font-medium tracking-wider uppercase hover:bg-virex-stone/20 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reload
              </button>
            </div>
          </div>

          <div className="mt-8 text-center md:text-left flex items-center justify-between text-xs text-virex-muted">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-virex-deepink transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Portal Sign In
            </Link>

            <a
              href="mailto:it-support@virex.group"
              className="underline hover:text-virex-deepink transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-virex-warmwhite" />}>
      <ErrorContent />
    </Suspense>
  );
}
