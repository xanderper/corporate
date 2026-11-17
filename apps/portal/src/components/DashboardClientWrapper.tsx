"use client";

import { useQorveAuth } from "@qorve/react";
import { PortalHeader } from "./PortalHeader";
import { AccountDashboard } from "./AccountDashboard";

export function DashboardClientWrapper() {
  const { user, signOut } = useQorveAuth();

  if (!user) return null; // Fallback, caught by AuthGuard

  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <>
      <PortalHeader name={name} onSignOut={signOut} />
      <AccountDashboard name={name} email={user.email} onSignOut={signOut} />
    </>
  );
}
