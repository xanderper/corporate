"use client";

import { useQorveAuth } from "@qorve/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

function AccessDeniedContent() {
  const { user, signOut } = useQorveAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("reason");

  const isSuspended = reason === "suspended";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-virex-warmwhite">
      {/* Left Security Branding Panel */}
      <div className="w-full md:w-5/12 lg:w-1/3 bg-virex-forest text-virex-warmwhite flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-pattern-denied"
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
            <rect width="100%" height="100%" fill="url(#grid-pattern-denied)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col mb-20">
            <span className="font-sans text-sm font-semibold tracking-[0.25em] leading-tight">
              VIREX
            </span>
            <span className="font-sans text-[10px] tracking-[0.25em] text-virex-sage leading-tight mt-1">
              CORPORATE SECURITY
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl text-virex-warmwhite mb-8 leading-snug">
            Access <br />
            Control Gate
          </h2>
          <p className="font-sans text-sm text-virex-sage leading-relaxed max-w-sm">
            Virex operates a zero-trust gateway. Authentication through Qorve confirms identity, but explicit invitation and authorization from Virex Holding Group B.V. is mandatory.
          </p>
        </div>

        <div className="relative z-10 mt-16 md:mt-0">
          <div className="flex items-center gap-3 text-virex-sage mb-2">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Authorization Required
            </span>
          </div>
          <p className="text-[10px] text-virex-sage/60 uppercase tracking-widest pl-8">
            Policy 14-B (Role Isolation)
          </p>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col justify-center items-center p-8 md:p-16 relative">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 md:p-12 border border-virex-stone/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-sm text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
              <ShieldAlert className="w-8 h-8 text-amber-700" />
            </div>

            <h1 className="font-serif text-3xl text-virex-deepink mb-4">
              {isSuspended ? "Account Suspended" : "Access Restricted"}
            </h1>

            <p className="font-sans text-sm text-virex-muted leading-relaxed mb-6">
              {isSuspended ? (
                <>
                  Your Virex access has been temporarily suspended by an administrator.
                  Your Qorve identity remains intact.
                </>
              ) : (
                <>
                  Your Qorve account is authenticated, but you haven&apos;t been
                  invited to Virex Portal.
                </>
              )}
            </p>

            {user?.email && (
              <div className="bg-virex-warmwhite p-4 border border-virex-stone/20 rounded-sm mb-8 text-left">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
                  Authenticated Identity
                </span>
                <p className="text-sm font-medium text-virex-deepink truncate">
                  {user.email}
                </p>
                <p className="text-xs text-virex-muted mt-1">
                  Status: <span className="font-medium text-amber-700">{isSuspended ? "Suspended" : "Uninvited"}</span>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-virex-forest text-virex-warmwhite px-6 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out / Switch Account
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full inline-flex items-center justify-center gap-2 border border-virex-stone text-virex-deepink px-6 py-3 text-sm font-medium tracking-wider uppercase hover:bg-virex-stone/20 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-virex-muted">
              Need access? Contact your Virex sponsor or administrator at{" "}
              <a
                href="mailto:access@virex.group"
                className="underline hover:text-virex-deepink transition-colors"
              >
                access@virex.group
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-virex-warmwhite" />}>
      <AccessDeniedContent />
    </Suspense>
  );
}
