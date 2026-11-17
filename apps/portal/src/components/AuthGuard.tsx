"use client";

import { useQorveAuth } from "@qorve/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useVirexAccess } from "./VirexAccessContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isCheckingSession } = useQorveAuth();
  const { accessStatus } = useVirexAccess();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isCheckingSession) return;

    // Public / bypass routes: invitations and access denied pages
    const isInviteRoute = pathname.startsWith("/invite");
    const isAccessDeniedRoute = pathname === "/access-denied";

    if (isInviteRoute || isAccessDeniedRoute) {
      return;
    }

    // 1. Unauthenticated users cannot access dashboard or admin/portal areas
    if (!isAuthenticated) {
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/portal")) {
        router.push("/");
      }
      return;
    }

    // 2. Authenticated with Qorve — check Virex authorization status
    if (accessStatus === "CHECKING") {
      return;
    }

    if (accessStatus === "NOT_INVITED") {
      router.push("/access-denied");
      return;
    }

    if (accessStatus === "SUSPENDED") {
      router.push("/access-denied?reason=suspended");
      return;
    }

    // 3. User is ACTIVE: redirect away from root login screen to dashboard
    if (accessStatus === "ACTIVE" && pathname === "/") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isCheckingSession, accessStatus, pathname, router]);

  const isBypass = pathname.startsWith("/invite") || pathname === "/access-denied";

  if (isBypass) {
    return <>{children}</>;
  }

  if (isCheckingSession || (isAuthenticated && accessStatus === "CHECKING")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-virex-warmwhite">
        <div className="w-6 h-6 border-2 border-virex-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Prevent rendering protected routes if unauthorized
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/portal");

  if (isProtected && (!isAuthenticated || accessStatus !== "ACTIVE")) {
    return <div className="min-h-screen bg-virex-warmwhite" />;
  }

  // Prevent rendering root login if active
  if (pathname === "/" && isAuthenticated && accessStatus === "ACTIVE") {
    return <div className="min-h-screen bg-virex-warmwhite" />;
  }

  return <>{children}</>;
}
