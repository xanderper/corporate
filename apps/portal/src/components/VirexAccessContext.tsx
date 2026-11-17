"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQorveAuth } from "@qorve/react";
import { api, ApiClientError, VirexUser } from "@/lib/api";

export type AccessStatus =
  | "CHECKING"
  | "ACTIVE"
  | "NOT_INVITED"
  | "SUSPENDED"
  | "UNAUTHENTICATED";

export type VirexProfile = VirexUser;

interface VirexAccessContextType {
  virexUser: VirexProfile | null;
  accessStatus: AccessStatus;
  refreshAccess: () => Promise<void>;
}

const VirexAccessContext = createContext<VirexAccessContextType>({
  virexUser: null,
  accessStatus: "CHECKING",
  refreshAccess: async () => {},
});

export function VirexAccessProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isCheckingSession, user } = useQorveAuth();
  const [virexUser, setVirexUser] = useState<VirexProfile | null>(null);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("CHECKING");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshAccess = useCallback(async () => {
    setRefreshTrigger((v) => v + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function sync() {
      if (isCheckingSession) return;

      if (!isAuthenticated || !user) {
        if (!ignore) {
          setVirexUser(null);
          setAccessStatus("UNAUTHENTICATED");
        }
        return;
      }

      try {
        const qorveId =
          (user as unknown as { id?: string; qorveUserId?: string })?.id ||
          (user as unknown as { id?: string; qorveUserId?: string })?.qorveUserId ||
          user.email;

        const name =
          [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

        const data = await api.auth.synchronize({
          qorveUserId: qorveId,
          email: user.email,
          name,
          avatarUrl: (user as unknown as { avatarUrl?: string })?.avatarUrl || null,
        });

        if (ignore) return;

        if (data.allowed && data.user) {
          setVirexUser(data.user);
          setAccessStatus("ACTIVE");
        } else {
          setVirexUser(null);
          setAccessStatus(data.reason === "SUSPENDED" ? "SUSPENDED" : "NOT_INVITED");
        }
      } catch (err: unknown) {
        if (!ignore) {
          if (err instanceof ApiClientError && err.status === 403) {
            setVirexUser(null);
            const reason = (err.details as { reason?: string })?.reason || err.code;
            if (reason === "SUSPENDED") {
              setAccessStatus("SUSPENDED");
            } else {
              setAccessStatus("NOT_INVITED");
            }
          } else {
            console.error("Virex access sync error:", err);
            setAccessStatus("CHECKING");
          }
        }
      }
    }

    sync();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isCheckingSession, user, refreshTrigger]);

  return (
    <VirexAccessContext.Provider
      value={{
        virexUser,
        accessStatus,
        refreshAccess,
      }}
    >
      {children}
    </VirexAccessContext.Provider>
  );
}

export function useVirexAccess() {
  return useContext(VirexAccessContext);
}
