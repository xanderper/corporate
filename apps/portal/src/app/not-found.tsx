import Link from "next/link";
import { ArrowLeft, LayoutDashboard, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-virex-warmwhite">
      {/* Left Brand Panel */}
      <div className="w-full md:w-5/12 lg:w-1/3 bg-virex-forest text-virex-warmwhite flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-pattern-404"
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
            <rect width="100%" height="100%" fill="url(#grid-pattern-404)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col mb-16">
            <span className="font-sans text-sm font-semibold tracking-[0.25em] leading-tight">
              VIREX
            </span>
            <span className="font-sans text-[10px] tracking-[0.25em] text-virex-sage leading-tight mt-1">
              CORPORATE PORTAL
            </span>
          </div>

          <span className="font-mono text-sm tracking-widest text-virex-sage uppercase block mb-2">
            Status Code: 404
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-virex-warmwhite mb-6 leading-tight">
            Endpoint <br /> Not Found
          </h2>
          <p className="font-sans text-xs text-virex-sage leading-relaxed max-w-sm">
            The resource, document, or entity endpoint you requested does not exist or may have been restricted under institutional access controls.
          </p>
        </div>

        <div className="relative z-10 mt-12 md:mt-0">
          <div className="flex items-center gap-2 text-virex-sage text-xs">
            <ShieldAlert className="w-4 h-4 text-virex-sage" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Virex Holding Group B.V.
            </span>
          </div>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col justify-center items-center p-8 md:p-16 relative">
        <div className="max-w-md w-full text-center md:text-left">
          <div className="bg-white p-8 md:p-12 border border-virex-stone/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-sm">
            <span className="text-[11px] font-mono tracking-widest text-virex-muted uppercase block mb-2">
              HTTP 404 / NOT FOUND
            </span>

            <h1 className="font-serif text-3xl md:text-4xl text-virex-deepink mb-4">
              Page Not Located
            </h1>

            <p className="font-sans text-sm text-virex-muted leading-relaxed mb-8">
              We couldn&apos;t locate the page you were looking for. Please check the URL or navigate back to the authorized portal overview.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-virex-forest text-virex-warmwhite px-6 py-3 text-xs font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Return to Dashboard
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-virex-stone text-virex-deepink px-6 py-3 text-xs font-medium tracking-wider uppercase hover:bg-virex-stone/20 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Portal Gate
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center md:text-left">
            <p className="text-xs text-virex-muted">
              Need assistance? Contact{" "}
              <a
                href="mailto:support@virex.group"
                className="underline hover:text-virex-deepink transition-colors"
              >
                Virex Technical Support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
