"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useQorveAuth } from "@qorve/react";
import { Organization, Membership, api } from "@/lib/api";

interface OrganizationContextType {
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization) => void;
  organizations: Organization[];
  memberships: Membership[];
  currentMembership: Membership | null;
  isHoldingExecutive: boolean;
  loading: boolean;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType>({
  currentOrganization: null,
  setCurrentOrganization: () => {},
  organizations: [],
  memberships: [],
  currentMembership: null,
  isHoldingExecutive: false,
  loading: true,
  refreshOrganizations: async () => {},
});

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isCheckingSession, user } = useQorveAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [currentOrgState, setCurrentOrgState] = useState<Organization | null>(null);
  const [isHoldingExecutive, setIsHoldingExecutive] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshOrganizations = useCallback(async () => {
    if (isCheckingSession || !isAuthenticated || !user) return;
    try {
      const qorveId =
        (user as unknown as { id?: string; qorveUserId?: string })?.id ||
        (user as unknown as { id?: string; qorveUserId?: string })?.qorveUserId ||
        user.email;

      const data = await api.organizations.getMyMemberships({
        qorveUserId: qorveId,
        email: user.email || undefined,
      });

      setOrganizations(data.organizations || []);
      setMemberships(data.memberships || []);
      setIsHoldingExecutive(data.isHoldingExecutive || false);
    } catch (err) {
      console.error("Error refreshing organizations:", err);
    }
  }, [isAuthenticated, isCheckingSession, user]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (isCheckingSession || !isAuthenticated || !user) {
        if (!ignore) setLoading(false);
        return;
      }

      try {
        const qorveId =
          (user as unknown as { id?: string; qorveUserId?: string })?.id ||
          (user as unknown as { id?: string; qorveUserId?: string })?.qorveUserId ||
          user.email;

        const data = await api.organizations.getMyMemberships({
          qorveUserId: qorveId,
          email: user.email || undefined,
        });

        if (ignore) return;

        setOrganizations(data.organizations || []);
        setMemberships(data.memberships || []);
        setIsHoldingExecutive(data.isHoldingExecutive || false);

        const savedSlug =
          typeof window !== "undefined"
            ? localStorage.getItem("virex_active_org_slug")
            : null;

        const matchedSaved = (data.organizations || []).find(
          (o: Organization) => o.slug === savedSlug
        );

        if (matchedSaved) {
          setCurrentOrgState(matchedSaved);
        } else if (data.organizations && data.organizations.length > 0) {
          const holding = data.organizations.find(
            (o: Organization) => o.slug === "virex-holding"
          );
          setCurrentOrgState(holding || data.organizations[0]);
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isCheckingSession, user]);

  const setCurrentOrganization = useCallback((org: Organization) => {
    setCurrentOrgState(org);
    if (typeof window !== "undefined") {
      localStorage.setItem("virex_active_org_slug", org.slug);
    }
  }, []);

  const currentMembership = useMemo(() => {
    if (!currentOrgState) return null;
    return (
      memberships.find((m) => m.organization_id === currentOrgState.id) || null
    );
  }, [currentOrgState, memberships]);

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization: currentOrgState,
        setCurrentOrganization,
        organizations,
        memberships,
        currentMembership,
        isHoldingExecutive,
        loading,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  return useContext(OrganizationContext);
}
