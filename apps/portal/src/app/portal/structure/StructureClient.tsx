"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  GitBranch,
  Layers,
  Table2,
  Search,
  ChevronRight,
  Info,
  X,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useQorveAuth } from "@qorve/react";
import { useOrganization } from "@/components/OrganizationContext";
import { PortalHeader } from "@/components/PortalHeader";
import { Organization, OwnershipRelationship, api } from "@/lib/api";
import { AcquireCompanyModal } from "@/components/AcquireCompanyModal";

export function StructureClient() {
  const router = useRouter();
  const { user, signOut } = useQorveAuth();
  const {
    currentOrganization,
    setCurrentOrganization,
    refreshOrganizations,
  } = useOrganization();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [hierarchy, setHierarchy] = useState<OwnershipRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"topology" | "matrix" | "registry">("topology");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [acquireOpen, setAcquireOpen] = useState(false);
  const [acquireOwnerSlug, setAcquireOwnerSlug] = useState<string | undefined>(undefined);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Authorized User";

  // Initial load
  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const data = await api.organizations.getStructure();
        if (ignore) return;
        setOrganizations(data.organizations || []);
        setHierarchy(data.hierarchy || []);
      } catch (err) {
        console.error("Failed to load group structure:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  // Manual refresh for refresh button
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await api.organizations.getStructure();
      setOrganizations(data.organizations || []);
      setHierarchy(data.hierarchy || []);
    } catch (err) {
      console.error("Failed to refresh structure:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtered organizations for registry
  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.legal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === "ALL" || org.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [organizations, searchQuery, filterType]);

  // Derived parents & children for selectedOrg
  const selectedOrgParents = useMemo(() => {
    if (!selectedOrg) return [];
    return hierarchy.filter((h) => h.owned_organization_id === selectedOrg.id);
  }, [selectedOrg, hierarchy]);

  const selectedOrgChildren = useMemo(() => {
    if (!selectedOrg) return [];
    return hierarchy.filter((h) => h.owner_organization_id === selectedOrg.id);
  }, [selectedOrg, hierarchy]);

  // Core pillars
  const holdingOrg = useMemo(
    () =>
      organizations.find((o) => o.slug === "virex-holding") ||
      organizations.find((o) => o.type === "HOLDING") ||
      organizations[0],
    [organizations]
  );

  const northgridOrg = useMemo(
    () => organizations.find((o) => o.slug === "northgrid"),
    [organizations]
  );

  const qorveOrg = useMemo(
    () => organizations.find((o) => o.slug === "qorve"),
    [organizations]
  );

  const virexCapitalOrg = useMemo(
    () => organizations.find((o) => o.slug === "virex-capital"),
    [organizations]
  );

  // Helper to get child organizations for any parent org
  const getChildrenOfOrg = (orgId?: string) => {
    if (!orgId) return [];
    return hierarchy
      .filter((h) => {
        if (h.owner_organization_id !== orgId) return false;
        // Don't treat Qorve -> Northgrid cross-ownership as a child of Qorve in the branch container
        if (orgId === qorveOrg?.id && h.owned_organization_id === northgridOrg?.id) {
          return false;
        }
        return true;
      })
      .map((h) => {
        const org = organizations.find((o) => o.id === h.owned_organization_id);
        const pct = Number(h.ownership_percentage);
        return { rel: h, org, pct };
      })
      .filter((item): item is { rel: OwnershipRelationship; org: Organization; pct: number } => Boolean(item.org));
  };

  const northgridChildren = useMemo(
    () => getChildrenOfOrg(northgridOrg?.id),
    [hierarchy, organizations, northgridOrg, qorveOrg]
  );

  const qorveChildren = useMemo(
    () => getChildrenOfOrg(qorveOrg?.id),
    [hierarchy, organizations, qorveOrg, northgridOrg]
  );

  const capitalChildren = useMemo(
    () => getChildrenOfOrg(virexCapitalOrg?.id),
    [hierarchy, organizations, virexCapitalOrg, qorveOrg, northgridOrg]
  );

  // Additional direct subsidiaries of holding that are not the 3 main pillars
  const otherRootChildren = useMemo(() => {
    if (!holdingOrg) return [];
    return hierarchy
      .filter(
        (h) =>
          h.owner_organization_id === holdingOrg.id &&
          h.owned_organization_id !== northgridOrg?.id &&
          h.owned_organization_id !== qorveOrg?.id &&
          h.owned_organization_id !== virexCapitalOrg?.id
      )
      .map((h) => ({
        rel: h,
        org: organizations.find((o) => o.id === h.owned_organization_id),
        pct: Number(h.ownership_percentage),
      }))
      .filter((item): item is { rel: OwnershipRelationship; org: Organization; pct: number } => Boolean(item.org));
  }, [hierarchy, organizations, holdingOrg, northgridOrg, qorveOrg, virexCapitalOrg]);

  // Unassigned / standalone entities (not root, and not owned by any entity in hierarchy)
  const unassignedOrgs = useMemo(() => {
    const rootId = holdingOrg?.id;
    return organizations.filter((o) => {
      if (o.id === rootId) return false;
      const isOwned = hierarchy.some((h) => h.owned_organization_id === o.id);
      return !isOwned;
    });
  }, [organizations, hierarchy, holdingOrg]);

  // Total portfolio/operating assets across group
  const totalPortfolioCount = useMemo(() => {
    return capitalChildren.length + northgridChildren.length + qorveChildren.length;
  }, [capitalChildren, northgridChildren, qorveChildren]);

  // Acquisition success handler
  const handleAcquireSuccess = async (
    newOrg: Organization,
    relationship?: OwnershipRelationship
  ) => {
    // 1. Optimistic updates
    setOrganizations((prev) => {
      if (prev.some((o) => o.id === newOrg.id || o.slug === newOrg.slug)) {
        return prev.map((o) => (o.id === newOrg.id || o.slug === newOrg.slug ? newOrg : o));
      }
      return [...prev, newOrg];
    });

    if (relationship) {
      setHierarchy((prev) => {
        if (prev.some((h) => h.id === relationship.id)) {
          return prev.map((h) => (h.id === relationship.id ? relationship : h));
        }
        return [...prev, relationship];
      });
    }

    // 2. Select newly created entity
    setSelectedOrg(newOrg);

    // 3. Background server refresh
    try {
      await Promise.allSettled([handleRefresh(), refreshOrganizations()]);
    } catch (e) {
      console.error("Error refreshing after acquisition:", e);
    }
  };

  // Handle switching active organization and redirecting to dashboard
  const handleSelectAndGoToDashboard = (org: Organization) => {
    setCurrentOrganization(org);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-virex-warmwhite flex flex-col">
      {/* Universal Header */}
      <PortalHeader name={name} onSignOut={signOut} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-virex-muted mb-4 font-mono">
          <Link href="/dashboard" className="hover:text-virex-deepink transition-colors">
            Portal
          </Link>
          <span>/</span>
          <span className="text-virex-deepink font-semibold">Group Structure</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white border border-virex-stone/30 shadow-xs rounded-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-virex-stone/20">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold tracking-[0.25em] text-virex-forest uppercase">
                  Virex Group Registry
                </span>
                <span className="text-virex-stone">·</span>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live Governance Topology
                </span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-virex-deepink">
                Legal Hierarchy & Ownership Topology
              </h1>
              <p className="font-sans text-xs md:text-sm text-virex-muted mt-2 max-w-2xl leading-relaxed">
                Comprehensive governance model illustrating parent holdings, cross-shareholder joint ventures, and majority-controlled operating portfolio entities across European jurisdictions.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-virex-warmwhite border border-virex-stone/30 rounded-sm shrink-0 self-start lg:self-center">
              <button
                type="button"
                onClick={() => setViewMode("topology")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs transition-all ${
                  viewMode === "topology"
                    ? "bg-white text-virex-deepink shadow-xs font-semibold"
                    : "text-virex-muted hover:text-virex-deepink"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5 text-virex-forest" />
                Topology Tree
              </button>

              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs transition-all ${
                  viewMode === "matrix"
                    ? "bg-white text-virex-deepink shadow-xs font-semibold"
                    : "text-virex-muted hover:text-virex-deepink"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-virex-forest" />
                Cap Table Matrix
              </button>

              <button
                type="button"
                onClick={() => setViewMode("registry")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs transition-all ${
                  viewMode === "registry"
                    ? "bg-white text-virex-deepink shadow-xs font-semibold"
                    : "text-virex-muted hover:text-virex-deepink"
                }`}
              >
                <Table2 className="w-3.5 h-3.5 text-virex-forest" />
                Entity Register
              </button>

              <button
                type="button"
                onClick={() => setAcquireOpen(true)}
                title="Add / Acquire Company"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-virex-deepink text-white rounded-xs hover:bg-virex-deepink/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Acquire
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                title="Refresh Registry Data"
                className="p-1.5 text-virex-muted hover:text-virex-deepink transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <div className="p-4 bg-virex-warmwhite/60 border border-virex-stone/20 rounded-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-virex-muted block mb-1">
                Total Legal Entities
              </span>
              <span className="font-serif text-2xl font-bold text-virex-deepink block">
                {organizations.length}
              </span>
              <span className="text-[10px] text-virex-muted mt-0.5 block">
                Across EU jurisdictions
              </span>
            </div>

            <div className="p-4 bg-virex-warmwhite/60 border border-virex-stone/20 rounded-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-virex-muted block mb-1">
                Parent Governance
              </span>
              <span className="font-serif text-lg font-bold text-virex-forest truncate block">
                {holdingOrg?.name || "Virex Holding B.V."}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
                STAK Trust Controlled
              </span>
            </div>

            <div className="p-4 bg-virex-warmwhite/60 border border-virex-stone/20 rounded-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-virex-muted block mb-1">
                Cross-Holdings & JV
              </span>
              <span className="font-serif text-lg font-bold text-virex-deepink block">
                Northgrid (51% / 49%)
              </span>
              <span className="text-[10px] text-virex-muted mt-0.5 block">
                Holding & Qorve co-ownership
              </span>
            </div>

            <div className="p-4 bg-virex-warmwhite/60 border border-virex-stone/20 rounded-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-virex-muted block mb-1">
                Portfolio Holdings
              </span>
              <span className="font-serif text-2xl font-bold text-virex-deepink block">
                {totalPortfolioCount} {totalPortfolioCount === 1 ? "Company" : "Companies"}
              </span>
              <span className="text-[10px] text-virex-muted mt-0.5 block">
                Across Operating Arms
              </span>
            </div>
          </div>
        </div>

        {/* VIEW 1: TOPOLOGY TREE */}
        {viewMode === "topology" && (
          <div className="bg-white p-6 md:p-10 border border-virex-stone/30 rounded-sm shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-forest block mb-1">
                  Interactive Corporate Chart
                </span>
                <h2 className="font-serif text-xl md:text-2xl text-virex-deepink">
                  Virex Group Ownership Hierarchy
                </h2>
                <p className="text-xs text-virex-muted mt-1 max-w-xl">
                  Click any entity card to inspect legal registry details, voting rights, and switch your active portal context.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-virex-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-virex-forest" />
                  Holding / Parent
                </span>
                <span className="flex items-center gap-1.5 text-virex-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Subsidiary (&gt;50%)
                </span>
                <span className="flex items-center gap-1.5 text-virex-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  Minority / Venture
                </span>
              </div>
            </div>

            {/* Tree Flow Container */}
            <div className="p-8 bg-virex-warmwhite/40 border border-virex-stone/30 rounded-sm overflow-x-auto">
              <div className="min-w-[780px] flex flex-col items-center">
                {/* LEVEL 0: ROOT - Virex Holding Group */}
                <button
                  type="button"
                  onClick={() => {
                    if (holdingOrg) setSelectedOrg(holdingOrg);
                  }}
                  className="group border-2 border-virex-forest bg-virex-forest text-virex-warmwhite px-8 py-5 rounded-sm text-center shadow-lg hover:shadow-xl transition-all max-w-md w-full relative"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="w-3.5 h-3.5 text-virex-sage" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-virex-sage block font-bold mb-0.5">
                    Ultimate Parent · STAK Controlled
                  </span>
                  <span className="font-serif text-xl font-bold tracking-wide block">
                    {holdingOrg?.name?.toUpperCase() || "VIREX HOLDING GROUP B.V."}
                  </span>
                  <span className="text-[11px] text-virex-warmwhite/80 block mt-1">
                    {holdingOrg?.description || "Central Strategic Governance & Capital Allocation"}
                  </span>
                  <div className="mt-3 flex items-center justify-center gap-2 text-[10px]">
                    <span className="bg-white/10 px-2 py-0.5 rounded-xs font-mono">KvK: Netherlands</span>
                    <span className="bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-xs font-semibold">100% Voting Rights</span>
                  </div>
                </button>

                {/* Trunk Downwards */}
                <div className="w-0.5 h-10 bg-virex-stone/80" />

                {/* LEVEL 1: Sub-Holdings & Strategic Arms */}
                <div className="w-full max-w-5xl border-t-2 border-virex-stone/80 relative flex justify-between items-start pt-8 gap-4">
                  {/* BRANCH 1: Northgrid Holding B.V. */}
                  <div className="flex flex-col items-center flex-1 min-w-[260px] px-2">
                    <div className="w-0.5 h-8 bg-virex-stone/80 -mt-8" />
                    <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-3 shadow-2xs">
                      51% Direct Holding
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (northgridOrg) setSelectedOrg(northgridOrg);
                      }}
                      className="group bg-white border border-virex-stone/40 hover:border-virex-forest p-5 rounded-sm text-left shadow-xs hover:shadow-md transition-all w-full relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-virex-forest uppercase font-bold tracking-wider">
                          Strategic Subsidiary
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-virex-stone group-hover:text-virex-forest transition-colors" />
                      </div>
                      <span className="font-serif text-base font-bold text-virex-deepink block">
                        {northgridOrg?.name || "Northgrid Holding B.V."}
                      </span>
                      <span className="text-[11px] text-virex-muted block mt-1 leading-snug">
                        {northgridOrg?.description || "Digital infrastructure, dark fiber & high-density edge compute."}
                      </span>

                      <div className="mt-4 pt-3 border-t border-virex-stone/20 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-virex-muted">Virex Holding:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs">51% Controlling</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-virex-muted">Qorve Holding:</span>
                          <span className="font-bold text-virex-forest bg-virex-forest/10 px-1.5 py-0.5 rounded-xs">49% Strategic JV</span>
                        </div>
                        {northgridChildren.length > 0 && (
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-virex-muted">Operating Assets:</span>
                            <span className="font-bold text-virex-deepink bg-virex-warmwhite px-1.5 py-0.5 rounded-xs border border-virex-stone/20">
                              {northgridChildren.length} {northgridChildren.length === 1 ? "Asset" : "Assets"}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Trunk to Northgrid Assets */}
                    <div className="w-0.5 h-8 bg-virex-stone/80" />

                    {/* Northgrid Assets Container */}
                    <div className="w-full bg-white border border-virex-stone/30 p-3 rounded-sm space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-virex-muted">
                          Infrastructure & Assets
                        </span>
                        <span className="text-[9px] font-mono text-virex-stone">
                          {northgridChildren.length} {northgridChildren.length === 1 ? "Company" : "Companies"}
                        </span>
                      </div>

                      {northgridChildren.length === 0 ? (
                        <div className="p-3 text-center bg-virex-warmwhite/50 rounded-xs border border-dashed border-virex-stone/30 text-[10px] text-virex-muted">
                          No direct operating assets registered yet.
                        </div>
                      ) : (
                        northgridChildren.map(({ org, pct }) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => setSelectedOrg(org)}
                            className="w-full text-left flex justify-between items-center text-xs p-2.5 bg-virex-warmwhite/70 hover:bg-virex-forest/5 border border-transparent hover:border-virex-stone/30 rounded-xs transition-colors group"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-medium text-virex-deepink truncate group-hover:text-virex-forest transition-colors">
                                {org.name}
                              </span>
                              <span className="text-[10px] text-virex-muted truncate">
                                {org.description || org.legal_name}
                              </span>
                            </div>
                            <span
                              className={`font-bold text-[11px] shrink-0 px-2 py-0.5 rounded-xs ${
                                pct >= 50
                                  ? "text-emerald-800 bg-emerald-100"
                                  : pct >= 20
                                  ? "text-amber-800 bg-amber-100"
                                  : "text-blue-800 bg-blue-100"
                              }`}
                            >
                              {pct.toFixed(0)}%
                            </span>
                          </button>
                        ))
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setAcquireOwnerSlug("northgrid");
                          setAcquireOpen(true);
                        }}
                        className="w-full py-1.5 text-[10px] font-semibold text-virex-muted hover:text-virex-forest border border-dashed border-virex-stone/30 hover:border-virex-forest/50 rounded-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Acquire under Northgrid
                      </button>
                    </div>
                  </div>

                  {/* BRANCH 2: Qorve Holding B.V. */}
                  <div className="flex flex-col items-center flex-1 min-w-[260px] px-2">
                    <div className="w-0.5 h-8 bg-virex-stone/80 -mt-8" />
                    <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-3 shadow-2xs">
                      51% Direct Holding
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (qorveOrg) setSelectedOrg(qorveOrg);
                      }}
                      className="group bg-white border border-virex-stone/40 hover:border-virex-forest p-5 rounded-sm text-left shadow-xs hover:shadow-md transition-all w-full relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-virex-forest uppercase font-bold tracking-wider">
                          Fintech Platform
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-virex-stone group-hover:text-virex-forest transition-colors" />
                      </div>
                      <span className="font-serif text-base font-bold text-virex-deepink block">
                        {qorveOrg?.name || "Qorve Holding B.V."}
                      </span>
                      <span className="text-[11px] text-virex-muted block mt-1 leading-snug">
                        {qorveOrg?.description || "Unified financial infrastructure, checkout & corporate identity."}
                      </span>

                      <div className="mt-4 pt-3 border-t border-virex-stone/20 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-virex-muted">Parent Equity:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs">51% Direct</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-virex-muted">Cross-holding:</span>
                          <span className="font-bold text-virex-forest bg-virex-forest/10 px-1.5 py-0.5 rounded-xs">Owns 49% Northgrid</span>
                        </div>
                        {qorveChildren.length > 0 && (
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-virex-muted">Operating Assets:</span>
                            <span className="font-bold text-virex-deepink bg-virex-warmwhite px-1.5 py-0.5 rounded-xs border border-virex-stone/20">
                              {qorveChildren.length} {qorveChildren.length === 1 ? "Asset" : "Assets"}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Trunk to Qorve Assets */}
                    <div className="w-0.5 h-8 bg-virex-stone/80" />

                    {/* Qorve Assets Container */}
                    <div className="w-full bg-white border border-virex-stone/30 p-3 rounded-sm space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-virex-muted">
                          Fintech & Venture Assets
                        </span>
                        <span className="text-[9px] font-mono text-virex-stone">
                          {qorveChildren.length} {qorveChildren.length === 1 ? "Company" : "Companies"}
                        </span>
                      </div>

                      {qorveChildren.length === 0 ? (
                        <div className="p-3 text-center bg-virex-warmwhite/50 rounded-xs border border-dashed border-virex-stone/30 text-[10px] text-virex-muted">
                          No direct operating assets registered yet.
                        </div>
                      ) : (
                        qorveChildren.map(({ org, pct }) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => setSelectedOrg(org)}
                            className="w-full text-left flex justify-between items-center text-xs p-2.5 bg-virex-warmwhite/70 hover:bg-virex-forest/5 border border-transparent hover:border-virex-stone/30 rounded-xs transition-colors group"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-medium text-virex-deepink truncate group-hover:text-virex-forest transition-colors">
                                {org.name}
                              </span>
                              <span className="text-[10px] text-virex-muted truncate">
                                {org.description || org.legal_name}
                              </span>
                            </div>
                            <span
                              className={`font-bold text-[11px] shrink-0 px-2 py-0.5 rounded-xs ${
                                pct >= 50
                                  ? "text-emerald-800 bg-emerald-100"
                                  : pct >= 20
                                  ? "text-amber-800 bg-amber-100"
                                  : "text-blue-800 bg-blue-100"
                              }`}
                            >
                              {pct.toFixed(0)}%
                            </span>
                          </button>
                        ))
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setAcquireOwnerSlug("qorve");
                          setAcquireOpen(true);
                        }}
                        className="w-full py-1.5 text-[10px] font-semibold text-virex-muted hover:text-virex-forest border border-dashed border-virex-stone/30 hover:border-virex-forest/50 rounded-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Acquire under Qorve
                      </button>
                    </div>
                  </div>

                  {/* BRANCH 3: Virex Capital B.V. */}
                  <div className="flex flex-col items-center flex-1 min-w-[260px] px-2">
                    <div className="w-0.5 h-8 bg-virex-stone/80 -mt-8" />
                    <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-3 shadow-2xs">
                      100% Wholly Owned
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (virexCapitalOrg) setSelectedOrg(virexCapitalOrg);
                      }}
                      className="group bg-white border border-virex-stone/40 hover:border-virex-forest p-5 rounded-sm text-left shadow-xs hover:shadow-md transition-all w-full relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-virex-forest uppercase font-bold tracking-wider">
                          Permanent Capital Arm
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-virex-stone group-hover:text-virex-forest transition-colors" />
                      </div>
                      <span className="font-serif text-base font-bold text-virex-deepink block">
                        {virexCapitalOrg?.name || "Virex Capital B.V."}
                      </span>
                      <span className="text-[11px] text-virex-muted block mt-1 leading-snug">
                        {virexCapitalOrg?.description || "Direct private equity investments, operational transformation & portcos."}
                      </span>

                      <div className="mt-4 pt-3 border-t border-virex-stone/20 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-virex-muted">Parent Equity:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs">100% Direct</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-virex-muted">Direct Portcos:</span>
                          <span className="font-bold text-virex-forest bg-virex-forest/10 px-1.5 py-0.5 rounded-xs">
                            {capitalChildren.length} Active {capitalChildren.length === 1 ? "Asset" : "Assets"}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Trunk to Portfolio Companies */}
                    <div className="w-0.5 h-8 bg-virex-stone/80" />

                    {/* LEVEL 2: Portcos Container */}
                    <div className="w-full bg-white border border-virex-stone/30 p-3 rounded-sm space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-virex-muted">
                          Operating Portfolio Assets
                        </span>
                        <span className="text-[9px] font-mono text-virex-stone">
                          {capitalChildren.length} {capitalChildren.length === 1 ? "Company" : "Companies"}
                        </span>
                      </div>

                      {capitalChildren.length === 0 ? (
                        <div className="p-3 text-center bg-virex-warmwhite/50 rounded-xs border border-dashed border-virex-stone/30 text-[10px] text-virex-muted">
                          No portfolio companies registered yet.
                        </div>
                      ) : (
                        capitalChildren.map(({ org, pct }) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => setSelectedOrg(org)}
                            className="w-full text-left flex justify-between items-center text-xs p-2.5 bg-virex-warmwhite/70 hover:bg-virex-forest/5 border border-transparent hover:border-virex-stone/30 rounded-xs transition-colors group"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-medium text-virex-deepink truncate group-hover:text-virex-forest transition-colors">
                                {org.name}
                              </span>
                              <span className="text-[10px] text-virex-muted truncate">
                                {org.description || org.legal_name}
                              </span>
                            </div>
                            <span
                              className={`font-bold text-[11px] shrink-0 px-2 py-0.5 rounded-xs ${
                                pct >= 50
                                  ? "text-emerald-800 bg-emerald-100"
                                  : pct >= 20
                                  ? "text-amber-800 bg-amber-100"
                                  : "text-blue-800 bg-blue-100"
                              }`}
                            >
                              {pct.toFixed(0)}%
                            </span>
                          </button>
                        ))
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setAcquireOwnerSlug("virex-capital");
                          setAcquireOpen(true);
                        }}
                        className="w-full py-1.5 text-[10px] font-semibold text-virex-muted hover:text-virex-forest border border-dashed border-virex-stone/30 hover:border-virex-forest/50 rounded-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Acquire under Virex Capital
                      </button>
                    </div>
                  </div>

                  {/* ANY OTHER DIRECT BRANCH OF VIREX HOLDING */}
                  {otherRootChildren.map(({ org, pct }) => {
                    const subChildren = getChildrenOfOrg(org.id);
                    return (
                      <div key={org.id} className="flex flex-col items-center flex-1 min-w-[260px] px-2">
                        <div className="w-0.5 h-8 bg-virex-stone/80 -mt-8" />
                        <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-3 shadow-2xs">
                          {pct.toFixed(0)}% Direct Holding
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedOrg(org)}
                          className="group bg-white border border-virex-stone/40 hover:border-virex-forest p-5 rounded-sm text-left shadow-xs hover:shadow-md transition-all w-full relative"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-virex-forest uppercase font-bold tracking-wider">
                              {org.type.replace("_", " ")}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-virex-stone group-hover:text-virex-forest transition-colors" />
                          </div>
                          <span className="font-serif text-base font-bold text-virex-deepink block">
                            {org.name}
                          </span>
                          <span className="text-[11px] text-virex-muted block mt-1 leading-snug">
                            {org.description || org.legal_name}
                          </span>

                          <div className="mt-4 pt-3 border-t border-virex-stone/20 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-virex-muted">Parent Equity:</span>
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs">
                                {pct.toFixed(0)}% Direct
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Children if any */}
                        {subChildren.length > 0 && (
                          <>
                            <div className="w-0.5 h-8 bg-virex-stone/80" />
                            <div className="w-full bg-white border border-virex-stone/30 p-3 rounded-sm space-y-2.5 shadow-xs">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-virex-muted">
                                  Subsidiaries & Portcos
                                </span>
                                <span className="text-[9px] font-mono text-virex-stone">
                                  {subChildren.length}
                                </span>
                              </div>
                              {subChildren.map((child) => (
                                <button
                                  key={child.org.id}
                                  type="button"
                                  onClick={() => setSelectedOrg(child.org)}
                                  className="w-full text-left flex justify-between items-center text-xs p-2.5 bg-virex-warmwhite/70 hover:bg-virex-forest/5 border border-transparent hover:border-virex-stone/30 rounded-xs transition-colors"
                                >
                                  <span className="font-medium text-virex-deepink truncate">
                                    {child.org.name}
                                  </span>
                                  <span className="font-bold text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-xs">
                                    {child.pct.toFixed(0)}%
                                  </span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* UNASSIGNED / STANDALONE ENTITIES (IF ANY) */}
                {unassignedOrgs.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-virex-stone/30 w-full max-w-5xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-virex-deepink">
                          Standalone & Unassigned Registrations ({unassignedOrgs.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-virex-muted">
                        Entities registered in corporate register awaiting parent ownership linkage
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {unassignedOrgs.map((org) => (
                        <div
                          key={org.id}
                          className="p-4 bg-white border border-amber-200/80 hover:border-virex-forest rounded-sm shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[9px] font-mono uppercase bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded-xs font-semibold">
                                {org.type.replace("_", " ")}
                              </span>
                              <span className="text-[10px] text-amber-700 font-medium">Pending Link</span>
                            </div>
                            <span className="font-serif text-sm font-bold text-virex-deepink block truncate">
                              {org.name}
                            </span>
                            <span className="text-[11px] text-virex-muted block mt-0.5 line-clamp-2">
                              {org.description || org.legal_name}
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-virex-stone/20 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setSelectedOrg(org)}
                              className="text-xs text-virex-forest font-semibold hover:underline"
                            >
                              Inspect Details →
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAcquireOwnerSlug(holdingOrg?.slug);
                                setAcquireOpen(true);
                              }}
                              className="text-[10px] font-semibold text-virex-deepink bg-virex-warmwhite border border-virex-stone/30 px-2 py-1 rounded-xs hover:border-virex-deepink transition-colors"
                            >
                              Link Owner
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CAP TABLE & EQUITY MATRIX */}
        {viewMode === "matrix" && (
          <div className="bg-white p-6 md:p-8 border border-virex-stone/30 rounded-sm shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-virex-stone/20">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-forest block mb-1">
                  Equity Allocations
                </span>
                <h2 className="font-serif text-xl md:text-2xl text-virex-deepink">
                  Consolidated Ownership Matrix
                </h2>
                <p className="text-xs text-virex-muted mt-1">
                  Accounting consolidation criteria, shareholder tiers, and effective equity percentages.
                </p>
              </div>

              <span className="text-xs text-virex-muted font-mono bg-virex-warmwhite px-3 py-1.5 border border-virex-stone/30 rounded-xs self-start sm:self-center">
                {hierarchy.length} Legal Relationships Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-virex-stone/30 text-[10px] font-bold tracking-wider uppercase text-virex-muted bg-virex-warmwhite/60">
                    <th className="py-3 px-4">Direct Shareholder / Owner</th>
                    <th className="py-3 px-4">Held Organization</th>
                    <th className="py-3 px-4">Entity Classification</th>
                    <th className="py-3 px-4">Equity Stake</th>
                    <th className="py-3 px-4">Consolidation Method</th>
                    <th className="py-3 px-4">Effective Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-virex-stone/20 text-xs">
                  {hierarchy.map((rel) => {
                    const pct = Number(rel.ownership_percentage);
                    let consolidation = "Cost Method / Fair Value";
                    if (pct >= 50) consolidation = "Full Consolidation (100% P&L)";
                    else if (pct >= 20) consolidation = "Equity Accounting (Associate)";

                    const heldOrg = organizations.find((o) => o.id === rel.owned_organization_id);

                    return (
                      <tr key={rel.id} className="hover:bg-virex-warmwhite/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-virex-deepink">
                          {rel.owner_name}
                        </td>
                        <td className="py-4 px-4 font-medium text-virex-deepink">
                          {rel.owned_name}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-mono uppercase bg-virex-warmwhite px-2 py-0.5 rounded-xs border border-virex-stone/30">
                            {rel.owned_type?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold text-xs ${
                                pct >= 50 ? "text-emerald-800" : "text-amber-800"
                              }`}
                            >
                              {pct.toFixed(1)}%
                            </span>
                            <div className="w-16 h-1.5 bg-virex-stone/20 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  pct >= 50 ? "bg-emerald-600" : "bg-amber-600"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-virex-muted text-[11px]">
                          {consolidation}
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-virex-muted">
                          {rel.effective_from
                            ? new Date(rel.effective_from).toLocaleDateString("en-GB")
                            : "Perpetual"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (heldOrg) setSelectedOrg(heldOrg);
                            }}
                            className="text-virex-forest hover:text-virex-deepink font-semibold text-xs transition-colors"
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: ENTITY REGISTER */}
        {viewMode === "registry" && (
          <div className="bg-white p-6 md:p-8 border border-virex-stone/30 rounded-sm shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-virex-stone/20">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-forest block mb-1">
                  Legal Corporate Register
                </span>
                <h2 className="font-serif text-xl md:text-2xl text-virex-deepink">
                  Statutory Entities & SPVs
                </h2>
                <p className="text-xs text-virex-muted mt-1">
                  Official statutory registrations, Chamber of Commerce identifiers, and direct operational controllers.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-virex-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search entities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-virex-warmwhite border border-virex-stone/30 rounded-xs focus:outline-hidden focus:border-virex-forest"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs bg-virex-warmwhite border border-virex-stone/30 rounded-xs focus:outline-hidden focus:border-virex-forest"
                >
                  <option value="ALL">All Entity Types</option>
                  <option value="HOLDING">Holding</option>
                  <option value="SUBSIDIARY">Subsidiary</option>
                  <option value="PORTFOLIO_COMPANY">Portfolio Company</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-virex-stone/30 text-[10px] font-bold tracking-wider uppercase text-virex-muted bg-virex-warmwhite/60">
                    <th className="py-3 px-4">Entity Name</th>
                    <th className="py-3 px-4">Legal Registration</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Public Registry</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-virex-stone/20 text-xs">
                  {filteredOrgs.map((org) => {
                    const isCurrent = currentOrganization?.id === org.id;

                    return (
                      <tr key={org.id} className="hover:bg-virex-warmwhite/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-xs bg-virex-forest/10 text-virex-forest flex items-center justify-center font-bold text-xs shrink-0">
                              {org.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-virex-deepink block">
                                {org.name}
                              </span>
                              <span className="text-[10px] text-virex-muted font-mono">
                                /{org.slug}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-virex-deepink">
                          {org.legal_name}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-semibold uppercase bg-virex-warmwhite px-2 py-0.5 rounded-xs border border-virex-stone/30">
                            {org.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {org.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[11px] text-virex-muted">
                          {org.is_public ? "Public Transparency" : "Restricted Confidential"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrg(org)}
                              className="text-xs text-virex-muted hover:text-virex-deepink transition-colors px-2 py-1"
                            >
                              Details
                            </button>
                            {isCurrent ? (
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xs">
                                Active Context
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectAndGoToDashboard(org)}
                                className="text-xs font-semibold text-virex-forest hover:bg-virex-forest/10 px-2.5 py-1 rounded-xs transition-colors"
                              >
                                Select & Open →
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* INSPECTION DRAWER */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedOrg(null)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-virex-stone/30 flex items-center justify-between bg-virex-warmwhite/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-virex-forest text-virex-warmwhite flex items-center justify-center font-serif text-lg font-bold">
                  {selectedOrg.name.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-virex-forest">
                    {selectedOrg.type.replace("_", " ")}
                  </span>
                  <h3 className="font-serif text-xl text-virex-deepink font-bold leading-tight">
                    {selectedOrg.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="w-8 h-8 rounded-full hover:bg-virex-stone/20 flex items-center justify-center text-virex-muted hover:text-virex-deepink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* Statutory Info */}
              <div className="space-y-3 pb-6 border-b border-virex-stone/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-virex-muted block">
                  Statutory Registration
                </span>
                <div className="grid grid-cols-2 gap-3 bg-virex-warmwhite/60 p-3 rounded-xs border border-virex-stone/20">
                  <div>
                    <span className="text-[10px] text-virex-muted block">Legal Name</span>
                    <span className="font-medium text-virex-deepink text-[11px] block mt-0.5">
                      {selectedOrg.legal_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-virex-muted block">System Slug</span>
                    <span className="font-mono text-virex-deepink text-[11px] block mt-0.5">
                      {selectedOrg.slug}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-virex-muted block">Registration Status</span>
                    <span className="text-emerald-800 font-semibold text-[11px] block mt-0.5">
                      ● Active Good Standing
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-virex-muted block">Transparency</span>
                    <span className="text-virex-deepink text-[11px] block mt-0.5">
                      {selectedOrg.is_public ? "Public Registry" : "Internal Restricted"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pb-6 border-b border-virex-stone/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-virex-muted block">
                  Business Scope & Mandate
                </span>
                <p className="text-virex-deepink text-xs leading-relaxed bg-white border border-virex-stone/20 p-3 rounded-xs">
                  {selectedOrg.description || "No public operational mandate specified."}
                </p>
              </div>

              {/* Shareholders & Parents */}
              <div className="space-y-2 pb-6 border-b border-virex-stone/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-virex-muted block">
                  Direct Upstream Shareholders
                </span>
                {selectedOrgParents.length === 0 ? (
                  <p className="text-virex-muted text-[11px] italic p-3 bg-virex-warmwhite/50 rounded-xs">
                    Ultimate Parent Entity (Virex Holding Group) governed directly by Stichting Administratiekantoor (STAK).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedOrgParents.map((parent) => (
                      <div
                        key={parent.id}
                        className="flex items-center justify-between p-3 bg-virex-warmwhite/60 border border-virex-stone/20 rounded-xs"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-virex-deepink">{parent.owner_name}</span>
                          <span className="text-[10px] text-virex-muted">
                            Classification: {parent.relationship_type}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-xs">
                          {Number(parent.ownership_percentage).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Owned Assets & Subsidiaries */}
              <div className="space-y-2 pb-6 border-b border-virex-stone/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-virex-muted block">
                  Downstream Holdings & Subsidiaries
                </span>
                {selectedOrgChildren.length === 0 ? (
                  <p className="text-virex-muted text-[11px] italic p-3 bg-virex-warmwhite/50 rounded-xs">
                    Operating asset with no subordinate subsidiaries or held legal entities.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedOrgChildren.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-3 bg-virex-warmwhite/60 border border-virex-stone/20 rounded-xs"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-virex-deepink">{child.owned_name}</span>
                          <span className="text-[10px] text-virex-muted">
                            {child.owned_type?.replace("_", " ")}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-virex-forest bg-virex-forest/10 px-2 py-0.5 rounded-xs">
                          {Number(child.ownership_percentage).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-virex-stone/30 bg-virex-warmwhite/50 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSelectAndGoToDashboard(selectedOrg)}
                className="w-full flex items-center justify-center gap-2 bg-virex-forest text-virex-warmwhite py-3 text-xs font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors shadow-xs rounded-xs"
              >
                <Building2 className="w-4 h-4" />
                Set as Active Entity & Open Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentOrganization(selectedOrg);
                  setSelectedOrg(null);
                }}
                className="w-full py-2.5 text-xs text-virex-deepink hover:bg-virex-stone/20 border border-virex-stone/40 rounded-xs transition-colors font-medium text-center"
              >
                Switch Active Entity in Background
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acquire Company Modal */}
      <AcquireCompanyModal
        open={acquireOpen}
        onClose={() => {
          setAcquireOpen(false);
          setAcquireOwnerSlug(undefined);
        }}
        organizations={organizations}
        actorId={user?.id}
        initialOwnerSlug={acquireOwnerSlug}
        onSuccess={handleAcquireSuccess}
      />
    </div>
  );
}
