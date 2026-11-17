import { QorveSignInButton } from "./QorveSignInButton";

export function LoginScreen() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-virex-warmwhite">
      {/* Left Panel: Brand & Security Information */}
      <div className="w-full md:w-5/12 lg:w-1/3 bg-virex-forest text-virex-warmwhite flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        {/* Subtle architectural grid pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col mb-20">
            <span className="font-sans text-sm font-semibold tracking-[0.25em] leading-tight">
              VIREX
            </span>
            <span className="font-sans text-[10px] tracking-[0.25em] text-virex-sage leading-tight mt-1">
              CORPORATE PORTAL
            </span>
          </div>
          
          <h2 className="font-serif text-4xl md:text-5xl text-virex-warmwhite mb-8 leading-snug">
            Restricted <br /> Environment
          </h2>
          <p className="font-sans text-sm text-virex-sage leading-relaxed max-w-sm">
            This system is strictly for authorized personnel, partners, and stakeholders of Virex Holding Group B.V. and its subsidiaries. All activities within this portal are logged and securely monitored.
          </p>
        </div>
        
        <div className="relative z-10 mt-16 md:mt-0">
          <div className="flex items-center gap-3 text-virex-sage mb-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-bold tracking-widest uppercase">End-to-End Encrypted</span>
          </div>
          <p className="text-[10px] text-virex-sage/60 uppercase tracking-widest pl-8">
            ISO 27001 Compliant Infrastructure
          </p>
        </div>
      </div>

      {/* Right Panel: Login Action */}
      <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col justify-center items-center p-8 md:p-16 relative">
        <div className="max-w-md w-full">
          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-virex-deepink mb-4">
              Sign In
            </h1>
            <p className="font-sans text-virex-muted text-base">
              Access your personalized dashboard, corporate data rooms, and internal governance tools.
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 border border-virex-stone/20 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-virex-warmwhite rounded-full flex items-center justify-center mb-6 border border-virex-stone/30">
                <svg className="w-7 h-7 text-virex-deepink" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="font-sans font-medium text-virex-deepink text-lg mb-2">Qorve Authentication</h3>
              <p className="font-sans text-sm text-virex-muted mb-8 leading-relaxed px-4">
                Identity and access management is securely handled through Qorve SSO.
              </p>
              
              <QorveSignInButton />

            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-xs text-virex-muted tracking-wide">
              Having trouble accessing your account?<br />Contact <a href="mailto:it@virex.group" className="underline hover:text-virex-deepink transition-colors mt-1 inline-block">IT Support</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
