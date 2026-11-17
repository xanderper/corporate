"use client";

import { useQorveAuth } from "@qorve/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { api } from "@/lib/api";

interface InvitationData {
  id: string;
  email: string;
  invitedBy: string;
  expiresAt: string;
}

export function InviteAcceptClient({ token }: { token: string }) {
  const { isAuthenticated, isCheckingSession, user, signIn, signOut } =
    useQorveAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [accepting, setAccepting] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  // Derive identity mismatch without calling setState inside an effect
  const isAuth = isAuthenticated && !isCheckingSession && !!user;
  const identityMismatch = useMemo(() => {
    if (!invitation || !isAuth || !user?.email) return null;
    const invitedEmail = invitation.email.trim().toLowerCase();
    const authEmail = user.email.trim().toLowerCase();
    if (invitedEmail !== authEmail) {
      return {
        invitedEmail: invitation.email,
        authEmail: user.email,
      };
    }
    return null;
  }, [invitation, isAuth, user]);

  // 1. Verify token validity on mount
  useEffect(() => {
    let isMounted = true;
    async function verify() {
      try {
        const data = await api.auth.getInvite(token);

        if (!isMounted) return;

        if (!data || !data.valid) {
          setErrorStatus(data?.reason || "INVALID");
          setErrorMessage(data?.message || "Invalid or expired invitation");
          setLoading(false);
          return;
        }

        setInvitation(data.invitation || null);
        setLoading(false);
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Verification error:", err);
        setErrorStatus("NETWORK_ERROR");
        const message =
          err instanceof Error
            ? err.message
            : "Unable to verify invitation. Please check your network.";
        setErrorMessage(message);
        setLoading(false);
      }
    }

    verify();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // 2. When user is authenticated and token is verified, perform identity check and acceptance
  useEffect(() => {
    if (
      !invitation ||
      !isAuthenticated ||
      isCheckingSession ||
      !user ||
      accepting ||
      acceptedSuccess ||
      identityMismatch
    ) {
      return;
    }

    // Match! Accept invitation and link identity
    async function accept() {
      setAccepting(true);
      try {
        const qorveId =
          (user as unknown as { id?: string; qorveUserId?: string })?.id ||
          (user as unknown as { id?: string; qorveUserId?: string })?.qorveUserId ||
          user?.email ||
          "";

        const name =
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          user?.email ||
          "";

        const data = await api.auth.acceptInvite(token, {
          qorveUserId: qorveId,
          email: user?.email || "",
          name,
          avatarUrl: (user as unknown as { avatarUrl?: string })?.avatarUrl || null,
        });

        if (data && data.success) {
          setAcceptedSuccess(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          setErrorStatus("ACCEPT_ERROR");
          setErrorMessage("Failed to accept invitation");
        }
      } catch (err: unknown) {
        console.error("Accept error:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Network error while accepting invitation";
        setErrorMessage(message);
      } finally {
        setAccepting(false);
      }
    }

    accept();
  }, [
    invitation,
    isAuthenticated,
    isCheckingSession,
    user,
    accepting,
    acceptedSuccess,
    identityMismatch,
    token,
    router,
  ]);

  if (loading || isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-virex-warmwhite">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-virex-forest animate-spin" />
          <p className="font-sans text-sm text-virex-muted tracking-wide">
            Verifying invitation credentials...
          </p>
        </div>
      </div>
    );
  }

  // Token invalid, expired, revoked, or already accepted
  if (errorStatus || !invitation) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-virex-warmwhite p-6">
        <div className="max-w-md w-full bg-white p-8 md:p-12 border border-virex-stone/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-sm text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="font-serif text-3xl text-virex-deepink mb-4">
            Invitation Invalid
          </h1>

          <p className="font-sans text-sm text-virex-muted leading-relaxed mb-8">
            {errorMessage ||
              "This invitation link is expired, invalid, or has already been consumed."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full inline-flex items-center justify-center gap-2 bg-virex-forest text-virex-warmwhite px-6 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors"
          >
            Go to Virex Portal
          </button>
        </div>
      </div>
    );
  }

  // Success screen
  if (acceptedSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-virex-warmwhite p-6">
        <div className="max-w-md w-full bg-white p-8 md:p-12 border border-virex-stone/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <h1 className="font-serif text-3xl text-virex-deepink mb-4">
            Access Granted
          </h1>

          <p className="font-sans text-sm text-virex-muted leading-relaxed mb-6">
            Your Qorve identity has been securely linked to your Virex account.
            Redirecting to your dashboard...
          </p>

          <div className="flex items-center justify-center gap-2 text-virex-forest text-xs font-semibold uppercase tracking-widest">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Initializing Workspace
          </div>
        </div>
      </div>
    );
  }

  // Identity Mismatch Screen (Rule 3)
  if (identityMismatch) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-virex-warmwhite p-6">
        <div className="max-w-lg w-full bg-white p-8 md:p-12 border border-virex-stone/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-sm text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>

          <h1 className="font-serif text-3xl text-virex-deepink mb-3">
            Identity Mismatch
          </h1>

          <p className="font-sans text-sm text-virex-muted leading-relaxed mb-6">
            This invitation was strictly issued for a different email address.
            To prevent unauthorized access, Qorve credentials must match the invitation.
          </p>

          <div className="bg-virex-warmwhite p-4 border border-virex-stone/20 rounded-sm mb-8 text-left space-y-3">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block">
                Target Invitation Address
              </span>
              <p className="text-sm font-semibold text-emerald-800">
                {identityMismatch.invitedEmail}
              </p>
            </div>
            <div className="border-t border-virex-stone/20 pt-2">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block">
                Authenticated Qorve Identity
              </span>
              <p className="text-sm font-semibold text-red-700">
                {identityMismatch.authEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                signOut();
                signIn();
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-virex-forest text-virex-warmwhite px-6 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign In With Different Account
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full text-xs text-virex-muted hover:text-virex-deepink transition-colors mt-2"
            >
              Cancel and Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active invitation ready for acceptance
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-virex-warmwhite">
      {/* Left Panel */}
      <div className="w-full md:w-5/12 lg:w-1/3 bg-virex-forest text-virex-warmwhite flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col mb-20">
            <span className="font-sans text-sm font-semibold tracking-[0.25em] leading-tight">
              VIREX
            </span>
            <span className="font-sans text-[10px] tracking-[0.25em] text-virex-sage leading-tight mt-1">
              HOLDINGS GROUP
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl text-virex-warmwhite mb-8 leading-snug">
            Official <br />
            Invitation
          </h2>
          <p className="font-sans text-sm text-virex-sage leading-relaxed max-w-sm">
            You have been granted access to the private corporate portal of Virex
            Holding Group B.V.
          </p>
        </div>

        <div className="relative z-10 mt-16 md:mt-0">
          <div className="flex items-center gap-3 text-virex-sage mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Secure Onboarding
            </span>
          </div>
          <p className="text-[10px] text-virex-sage/60 uppercase tracking-widest pl-8">
            Single-Use Cryptographic Token
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col justify-center items-center p-8 md:p-16 relative">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 md:p-12 border border-virex-stone/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-sm text-center">
            <div className="w-16 h-16 bg-virex-warmwhite rounded-full flex items-center justify-center mx-auto mb-6 border border-virex-stone/30">
              <ShieldCheck className="w-8 h-8 text-virex-forest" />
            </div>

            <span className="text-[10px] font-bold tracking-[0.25em] text-virex-forest uppercase block mb-2">
              Virex Holdings Group
            </span>

            <h1 className="font-serif text-3xl md:text-4xl text-virex-deepink mb-4">
              You&apos;ve Been Invited
            </h1>

            <p className="font-sans text-sm text-virex-muted leading-relaxed mb-6">
              Your invitation was issued by <strong>{invitation.invitedBy}</strong> for:
            </p>

            <div className="bg-virex-warmwhite py-3 px-4 border border-virex-stone/20 rounded-sm mb-8">
              <p className="font-sans font-semibold text-virex-deepink text-base">
                {invitation.email}
              </p>
            </div>

            {accepting ? (
              <div className="py-4 flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 text-virex-forest animate-spin" />
                <span className="text-xs uppercase tracking-widest text-virex-deepink font-semibold">
                  Linking Qorve Identity...
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn()}
                className="w-full inline-flex items-center justify-center gap-3 bg-virex-forest text-virex-warmwhite px-8 py-4 text-sm font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors shadow-sm"
              >
                Continue with Qorve
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <p className="font-sans text-xs text-virex-muted mt-6">
              Already have a Qorve account? Simply sign in with{" "}
              <span className="font-medium text-virex-deepink">{invitation.email}</span>.
              New users can register instantly during sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
