"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  X,
  RefreshCw,
  GitBranch,
} from "lucide-react";
import { useOrganization } from "./OrganizationContext";
import { useQorveAuth } from "@qorve/react";
import { api, CompanyReport, Membership } from "@/lib/api";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { ReportDetailModal } from "./ReportDetailModal";

export function AccountDashboard({
  name,
  email,
  onSignOut,
}: {
  name: string;
  email: string;
  onSignOut: () => void;
}) {
  const { user } = useQorveAuth();
  const {
    currentOrganization,
    organizations,
    currentMembership,
    isHoldingExecutive,
    setCurrentOrganization,
  } = useOrganization();

  const [activeTab, setActiveTab] = useState<
    "overview" | "reports" | "structure" | "people"
  >("overview");

  const [reports, setReports] = useState<CompanyReport[]>([]);
  const [members, setMembers] = useState<Membership[]>([]);

  // New report modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPeriod, setNewPeriod] = useState("");
  const [newRevenue, setNewRevenue] = useState("");
  const [newExpenses, setNewExpenses] = useState("");
  const [newCash, setNewCash] = useState("");
  const [newHeadcount, setNewHeadcount] = useState("");
  const [newProjects, setNewProjects] = useState("");
  const [newRisks, setNewRisks] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Action review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Report detail view state — stored by id so it stays in sync with
  // `reports` after a refresh (e.g. right after approving/rejecting it).
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const selectedReport = useMemo(
    () => reports.find((r) => r.id === selectedReportId) || null,
    [reports, selectedReportId]
  );

  const refreshOrgData = async () => {
    if (!currentOrganization) return;
    try {
      const data = await api.organizations.getBySlug(currentOrganization.slug);
      if (data) {
        setReports(data.reports || []);
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error("Error refreshing organization data:", err);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!currentOrganization) return;
      try {
        const data = await api.organizations.getBySlug(currentOrganization.slug);
        if (ignore) return;
        if (data) {
          setReports(data.reports || []);
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error("Error loading organization data:", err);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [currentOrganization]);

  // Derived KPIs from latest approved or submitted report
  const latestReport = useMemo(() => {
    return reports[0] || null;
  }, [reports]);

  // Handle Submit Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !newTitle || !newPeriod) return;

    setSubmittingReport(true);
    try {
      const rev = Number(newRevenue) || 0;
      const exp = Number(newExpenses) || 0;
      const calculatedEbitda = rev - exp;

      const qorveId =
        (user as unknown as { id?: string; qorveUserId?: string })?.id ||
        (user as unknown as { id?: string; qorveUserId?: string })?.qorveUserId ||
        user?.email ||
        "";

      const res = await api.reports.submit(currentOrganization.slug, {
        title: newTitle,
        period: newPeriod,
        status: "SUBMITTED",
        revenue: rev,
        expenses: exp,
        ebitda: calculatedEbitda,
        cash: Number(newCash) || 0,
        headcount: Number(newHeadcount) || 0,
        majorProjects: Number(newProjects) || 0,
        risksCount: Number(newRisks) || 0,
        notes: newNotes,
        submittedById: qorveId,
      });

      if (res && res.success) {
        setShowSubmitModal(false);
        setNewTitle("");
        setNewPeriod("");
        setNewRevenue("");
        setNewExpenses("");
        setNewCash("");
        setNewHeadcount("");
        setNewProjects("");
        setNewRisks("");
        setNewNotes("");
        await refreshOrgData();
      } else {
        alert("Failed to submit report");
      }
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Error submitting report";
      alert(message);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Handle Review (Approve / Reject)
  const handleReview = async (
    reportId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    if (!currentOrganization) return;
    setReviewingId(reportId);
    try {
      const qorveId =
        (user as unknown as { id?: string; qorveUserId?: string })?.id ||
        (user as unknown as { id?: string; qorveUserId?: string })?.qorveUserId ||
        user?.email ||
        "";

      const res = await api.reports.review(
        currentOrganization.slug,
        reportId,
        status,
        qorveId
      );

      if (res && res.success) {
        await refreshOrgData();
      } else {
        alert("Failed to review report");
      }
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Error reviewing report";
      alert(message);
    } finally {
      setReviewingId(null);
    }
  };

  const isHolding = currentOrganization?.slug === "virex-holding";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Organization Banner */}
      <div className="bg-white border border-virex-stone/30 shadow-xs rounded-sm p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-virex-stone/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-sm bg-virex-forest/10 text-virex-forest flex items-center justify-center font-serif text-xl font-bold shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.25em] text-virex-forest uppercase">
                  {currentOrganization?.type.replace("_", " ")}
                </span>
                <span className="text-virex-stone">·</span>
                <span className="text-[10px] text-virex-muted font-mono">
                  {currentOrganization?.slug}
                </span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl text-virex-deepink mt-0.5">
                {currentOrganization?.legal_name || currentOrganization?.name}
              </h1>
              <p className="font-sans text-xs text-virex-muted mt-1 max-w-2xl leading-relaxed">
                {currentOrganization?.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Role: {currentMembership?.role || "Director"}
            </span>
            <span className="text-[11px] text-virex-muted">
              {currentMembership?.title || "Board Member"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 pt-4 text-xs font-medium tracking-wide">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-2 transition-colors border-b-2 ${
              activeTab === "overview"
                ? "border-virex-forest text-virex-deepink font-semibold"
                : "border-transparent text-virex-muted hover:text-virex-deepink"
            }`}
          >
            Overview & Telemetry
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`pb-2 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "reports"
                ? "border-virex-forest text-virex-deepink font-semibold"
                : "border-transparent text-virex-muted hover:text-virex-deepink"
            }`}
          >
            Reports & Approvals
            <span className="px-1.5 py-0.2 bg-virex-stone/20 rounded-full text-[10px]">
              {reports.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("structure")}
            className={`pb-2 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "structure"
                ? "border-virex-forest text-virex-deepink font-semibold"
                : "border-transparent text-virex-muted hover:text-virex-deepink"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Group Structure
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("people")}
            className={`pb-2 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "people"
                ? "border-virex-forest text-virex-deepink font-semibold"
                : "border-transparent text-virex-muted hover:text-virex-deepink"
            }`}
          >
            Members ({members.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 border border-virex-stone/30 rounded-sm">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
                Latest Revenue
              </span>
              <p className="font-serif text-2xl text-virex-deepink">
                {latestReport
                  ? `€${Number(latestReport.revenue).toLocaleString()}`
                  : "€125,000"}
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">
                Period: {latestReport?.period || "September 2026"}
              </span>
            </div>

            <div className="bg-white p-5 border border-virex-stone/30 rounded-sm">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
                EBITDA
              </span>
              <p className="font-serif text-2xl text-emerald-800">
                {latestReport
                  ? `€${Number(latestReport.ebitda).toLocaleString()}`
                  : "€47,000"}
              </p>
              <span className="text-[10px] text-virex-muted font-medium">
                Operating Profit
              </span>
            </div>

            <div className="bg-white p-5 border border-virex-stone/30 rounded-sm">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
                Cash Reserves
              </span>
              <p className="font-serif text-2xl text-virex-deepink">
                {latestReport
                  ? `€${Number(latestReport.cash).toLocaleString()}`
                  : "€340,000"}
              </p>
              <span className="text-[10px] text-virex-muted font-medium">
                Liquid Bank Balances
              </span>
            </div>

            <div className="bg-white p-5 border border-virex-stone/30 rounded-sm">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
                Team Headcount
              </span>
              <p className="font-serif text-2xl text-virex-deepink">
                {latestReport ? `${latestReport.headcount} FTE` : "12 FTE"}
              </p>
              <span className="text-[10px] text-virex-muted font-medium">
                Active Staff
              </span>
            </div>
          </div>

          {/* Holding View: Consolidated Group Portfolio Pulse */}
          {isHolding && (
            <div className="bg-white p-6 border border-virex-stone/30 rounded-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl text-virex-deepink">
                    Group Operating Entities & Performance
                  </h3>
                  <p className="text-xs text-virex-muted mt-0.5">
                    Direct oversight across Virex Holding Group subsidiaries and investment vehicles.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Northgrid Card */}
                <div
                  onClick={() => {
                    const ng = organizations.find((o) => o.slug === "northgrid");
                    if (ng) setCurrentOrganization(ng);
                  }}
                  className="cursor-pointer p-5 border border-virex-stone/30 hover:border-virex-forest transition-colors rounded-sm bg-virex-warmwhite/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-lg text-virex-deepink font-medium">
                      Northgrid
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      51% Owned
                    </span>
                  </div>
                  <p className="text-xs text-virex-muted mb-4 line-clamp-2">
                    Critical edge compute & cloud network infrastructure across the Nordics.
                  </p>
                  <div className="border-t border-virex-stone/20 pt-3 flex justify-between text-xs">
                    <span className="text-virex-muted">Sep 2026 Rev:</span>
                    <span className="font-semibold text-virex-deepink">€125,000</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-virex-muted">Status:</span>
                    <span className="font-semibold text-emerald-700">● Healthy</span>
                  </div>
                </div>

                {/* Qorve Card */}
                <div
                  onClick={() => {
                    const q = organizations.find((o) => o.slug === "qorve");
                    if (q) setCurrentOrganization(q);
                  }}
                  className="cursor-pointer p-5 border border-virex-stone/30 hover:border-virex-forest transition-colors rounded-sm bg-virex-warmwhite/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-lg text-virex-deepink font-medium">
                      Qorve
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      51% Owned
                    </span>
                  </div>
                  <p className="text-xs text-virex-muted mb-4 line-clamp-2">
                    Financial infrastructure and SSO platform for European institutions.
                  </p>
                  <div className="border-t border-virex-stone/20 pt-3 flex justify-between text-xs">
                    <span className="text-virex-muted">Q3 Rev:</span>
                    <span className="font-semibold text-virex-deepink">€450,000</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-virex-muted">Status:</span>
                    <span className="font-semibold text-amber-700">● Report Under Review</span>
                  </div>
                </div>

                {/* Virex Capital Card */}
                <div
                  onClick={() => {
                    const cap = organizations.find((o) => o.slug === "virex-capital");
                    if (cap) setCurrentOrganization(cap);
                  }}
                  className="cursor-pointer p-5 border border-virex-stone/30 hover:border-virex-forest transition-colors rounded-sm bg-virex-warmwhite/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-lg text-virex-deepink font-medium">
                      Virex Capital
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      100% Owned
                    </span>
                  </div>
                  <p className="text-xs text-virex-muted mb-4 line-clamp-2">
                    Permanent capital vehicle holding 4 operating businesses.
                  </p>
                  <div className="border-t border-virex-stone/20 pt-3 flex justify-between text-xs">
                    <span className="text-virex-muted">Active Portcos:</span>
                    <span className="font-semibold text-virex-deepink">4 Companies</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-virex-muted">Horizon Logistics:</span>
                    <span className="font-semibold text-emerald-700">€2.7M Q3 Rev</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions & Governance Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 border border-virex-stone/30 rounded-sm">
              <h3 className="font-serif text-lg text-virex-deepink mb-1">
                Recent Flash Notes
              </h3>
              <p className="text-xs text-virex-muted mb-4">
                Operational updates and telemetry for {currentOrganization?.name}.
              </p>
              <div className="p-4 bg-virex-warmwhite border border-virex-stone/20 rounded-sm text-xs leading-relaxed text-virex-deepink">
                {latestReport?.notes ||
                  "No operational alerts recorded for this period. Systems performing within SLA parameters."}
              </div>
            </div>

            <div className="bg-white p-6 border border-virex-stone/30 rounded-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg text-virex-deepink mb-1">
                  Actions & Reporting
                </h3>
                <p className="text-xs text-virex-muted mb-4">
                  Governed workflows for {currentOrganization?.name}.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-virex-warmwhite rounded-sm">
                    <span className="text-virex-muted">Reports Registered:</span>
                    <span className="font-semibold text-virex-deepink">{reports.length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-virex-warmwhite rounded-sm">
                    <span className="text-virex-muted">Approval Status:</span>
                    <span className="font-semibold text-emerald-700">
                      {reports[0]?.status === "APPROVED" ? "All Approved" : "Pending Review"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-virex-forest text-white py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Submit Monthly / Quarterly Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS & APPROVAL WORKFLOW */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white p-6 border border-virex-stone/30 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-serif text-xl text-virex-deepink">
                Reporting & Approval Ledger
              </h3>
              <p className="text-xs text-virex-muted mt-0.5">
                Audited financial telemetry, submissions, and director approvals for {currentOrganization?.name}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 bg-virex-forest text-white px-4 py-2 text-xs font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + Submit Report
            </button>
          </div>

          {/* Reports Table */}
          <div className="bg-white border border-virex-stone/30 rounded-sm overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-virex-warmwhite/60 border-b border-virex-stone/30 uppercase text-[10px] tracking-wider text-virex-muted">
                <tr>
                  <th className="py-3 px-6 font-semibold">Report Period</th>
                  <th className="py-3 px-6 font-semibold">Revenue / EBITDA</th>
                  <th className="py-3 px-6 font-semibold">Cash / FTE</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold">Submitted By</th>
                  <th className="py-3 px-6 font-semibold text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-virex-stone/20">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-virex-muted">
                      No reports filed yet for this entity.
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedReportId(r.id)}
                      className="hover:bg-virex-warmwhite/30 cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <span className="font-semibold text-virex-deepink block hover:underline">
                          {r.title}
                        </span>
                        <span className="text-[10px] text-virex-muted font-mono">
                          Period: {r.period}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-virex-deepink block">
                          €{Number(r.revenue).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          EBITDA: €{Number(r.ebitda).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-virex-deepink block font-medium">
                          €{Number(r.cash).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-virex-muted">
                          {r.headcount} Staff
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <ReportStatusBadge status={r.status} />
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-virex-deepink block">
                          {r.submitted_by_name || "Authorized Officer"}
                        </span>
                        <span className="text-[10px] text-virex-muted">
                          {r.submitted_at
                            ? new Date(r.submitted_at).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>

                      <td
                        className="py-4 px-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.status !== "APPROVED" && isHoldingExecutive ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={reviewingId === r.id}
                              onClick={() => handleReview(r.id, "APPROVED")}
                              className="px-2.5 py-1 bg-emerald-700 text-white rounded-xs text-[10px] font-semibold uppercase hover:bg-emerald-800 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={reviewingId === r.id}
                              onClick={() => handleReview(r.id, "REJECTED")}
                              className="px-2.5 py-1 border border-red-300 text-red-700 rounded-xs text-[10px] font-semibold uppercase hover:bg-red-50 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-virex-muted">
                            {r.status === "APPROVED"
                              ? `Approved by ${r.reviewed_by_name || "Director"}`
                              : "Pending review"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GROUP STRUCTURE & HIERARCHY */}
      {activeTab === "structure" && (
        <div className="bg-white p-8 border border-virex-stone/30 rounded-sm">
          <div className="mb-8">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-forest block mb-1">
              Virex Group Registry
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-virex-deepink">
              Legal Hierarchy & Ownership Topology
            </h2>
            <p className="text-xs text-virex-muted mt-1 max-w-xl">
              Dynamic representation of legal entities and ownership percentages. When new portfolio companies or SPVs are added, the structure renders automatically.
            </p>
          </div>

          {/* Interactive Topology Graph */}
          <div className="p-8 bg-virex-warmwhite/50 border border-virex-stone/30 rounded-sm overflow-x-auto">
            <div className="min-w-[650px] flex flex-col items-center">
              {/* Root: Virex Holding Group */}
              <div className="border-2 border-virex-forest bg-virex-forest text-virex-warmwhite px-6 py-4 rounded-sm text-center shadow-md">
                <span className="text-[9px] uppercase tracking-widest text-virex-sage block font-bold">
                  Ultimate Parent
                </span>
                <span className="font-serif text-lg font-bold">
                  VIREX HOLDING GROUP B.V.
                </span>
              </div>

              {/* Trunk Line */}
              <div className="w-0.5 h-10 bg-virex-stone" />

              {/* Level 1 Horizontal Branch */}
              <div className="w-full max-w-2xl border-t-2 border-virex-stone relative flex justify-between items-start pt-6">
                {/* Branch 1: Northgrid (51% via Holding) */}
                <div className="flex flex-col items-center w-1/3 px-2">
                  <div className="w-0.5 h-6 bg-virex-stone -mt-6" />
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                    51% Direct
                  </span>
                  <div className="bg-white border border-virex-stone/40 p-4 rounded-sm text-center shadow-xs w-full">
                    <span className="text-[9px] text-virex-muted uppercase font-bold block">
                      Subsidiary
                    </span>
                    <span className="font-serif text-sm font-bold text-virex-deepink block">
                      Northgrid Holding B.V.
                    </span>
                    <span className="text-[10px] text-virex-muted block mt-1">
                      Digital Infrastructure
                    </span>
                    <span className="text-[9px] text-emerald-800 bg-emerald-50 font-semibold px-2 py-0.5 rounded-xs mt-2 inline-block">
                      + 49% Owned by Qorve
                    </span>
                  </div>
                </div>

                {/* Branch 2: Qorve (51% via Holding) */}
                <div className="flex flex-col items-center w-1/3 px-2">
                  <div className="w-0.5 h-6 bg-virex-stone -mt-6" />
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                    51% Direct
                  </span>
                  <div className="bg-white border border-virex-stone/40 p-4 rounded-sm text-center shadow-xs w-full">
                    <span className="text-[9px] text-virex-muted uppercase font-bold block">
                      Subsidiary
                    </span>
                    <span className="font-serif text-sm font-bold text-virex-deepink block">
                      Qorve Holding B.V.
                    </span>
                    <span className="text-[10px] text-virex-muted block mt-1">
                      Financial Infrastructure
                    </span>
                    <span className="text-[9px] text-virex-forest bg-virex-forest/10 font-semibold px-2 py-0.5 rounded-xs mt-2 inline-block">
                      Owns 49% Northgrid
                    </span>
                  </div>
                </div>

                {/* Branch 3: Virex Capital (100% via Holding) */}
                <div className="flex flex-col items-center w-1/3 px-2">
                  <div className="w-0.5 h-6 bg-virex-stone -mt-6" />
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                    100% Direct
                  </span>
                  <div className="bg-white border border-virex-stone/40 p-4 rounded-sm text-center shadow-xs w-full">
                    <span className="text-[9px] text-virex-muted uppercase font-bold block">
                      Subsidiary
                    </span>
                    <span className="font-serif text-sm font-bold text-virex-deepink block">
                      Virex Capital B.V.
                    </span>
                    <span className="text-[10px] text-virex-muted block mt-1">
                      Permanent Capital Arm
                    </span>
                  </div>

                  {/* Trunk line to Portcos */}
                  <div className="w-0.5 h-8 bg-virex-stone" />

                  {/* Portcos Container */}
                  <div className="w-full bg-white border border-virex-stone/30 p-3 rounded-sm space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-virex-muted block text-center">
                      Portfolio Companies
                    </span>

                    <div className="flex justify-between items-center text-[11px] p-2 bg-virex-warmwhite rounded-xs">
                      <span className="font-medium text-virex-deepink">Horizon Logistics</span>
                      <span className="font-semibold text-emerald-700">100%</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] p-2 bg-virex-warmwhite rounded-xs">
                      <span className="font-medium text-virex-deepink">Aero Systems</span>
                      <span className="font-semibold text-emerald-700">65%</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] p-2 bg-virex-warmwhite rounded-xs">
                      <span className="font-medium text-virex-deepink">Vertex Analytics</span>
                      <span className="font-semibold text-amber-700">25%</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] p-2 bg-virex-warmwhite rounded-xs">
                      <span className="font-medium text-virex-deepink">Lumina Energy</span>
                      <span className="font-semibold text-amber-700">15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PEOPLE & MEMBERSHIPS */}
      {activeTab === "people" && (
        <div className="bg-white p-6 border border-virex-stone/30 rounded-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-virex-stone/20">
            <div>
              <h3 className="font-serif text-xl text-virex-deepink">
                Authorized Members for {currentOrganization?.name}
              </h3>
              <p className="text-xs text-virex-muted mt-0.5">
                Personnel assigned to governance, management, or operational roles within this entity.
              </p>
            </div>

            <Link
              href="/portal/admin/users"
              className="text-xs text-virex-forest font-semibold uppercase tracking-wider hover:underline"
            >
              Manage Global Users →
            </Link>
          </div>

          <div className="divide-y divide-virex-stone/20">
            {members.length === 0 ? (
              <p className="py-8 text-center text-xs text-virex-muted">
                No individual members assigned directly to this organization.
              </p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-virex-forest/10 text-virex-forest flex items-center justify-center font-serif text-xs font-bold uppercase">
                      {(m.user_name || "U").charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-virex-deepink">
                        {m.user_name}
                      </p>
                      <p className="text-[10px] text-virex-muted font-mono">
                        {m.user_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-xs font-medium text-virex-deepink block">
                        {m.title || m.role}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700">
                        {m.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Submit Report Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-lg w-full p-8 border border-virex-stone/30 shadow-2xl rounded-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-virex-stone/20">
              <h3 className="font-serif text-2xl text-virex-deepink">
                Submit Financial Report
              </h3>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-virex-muted hover:text-virex-deepink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-virex-muted mb-6">
              Submitting operational & financial telemetry for{" "}
              <strong>{currentOrganization?.name}</strong> into the Virex Holding Group audit ledger.
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-virex-deepink block mb-1">
                    Report Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2026 Flash Report"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-virex-stone/40 py-2 px-3 text-xs focus:outline-none focus:border-virex-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-virex-deepink block mb-1">
                    Period
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2026 or Q4 2026"
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full border border-virex-stone/40 py-2 px-3 text-xs focus:outline-none focus:border-virex-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-virex-deepink block mb-1">
                    Revenue (€)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="125000"
                    value={newRevenue}
                    onChange={(e) => setNewRevenue(e.target.value)}
                    className="w-full border border-virex-stone/40 py-2 px-3 text-xs focus:outline-none focus:border-virex-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-virex-deepink block mb-1">
                    Operating Expenses (€)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="78000"
                    value={newExpenses}
                    onChange={(e) => setNewExpenses(e.target.value)}
                    className="w-full border border-virex-stone/40 py-2 px-3 text-xs focus:outline-none focus:border-virex-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-virex-deepink block mb-1">
                    Cash Balance (€)
                  </label>
                  <input
                    type="number"
                    placeholder="340000"
                    value={newCash}
                    onChange={(e) => setNewCash(e.target.value)}
                    className="w-full border border-virex-stone/40 py-2 px-3 text-xs focus:outline-none focus:border-virex-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-virex-deepink block mb-1">
                    Headcount (FTE)
                  </label>
                  <input
                    type="number"
                    placeholder="12"
                    value={newHeadcount}
                    onChange={(e) => setNewHeadcount(e.target.value)}
                    className="w-full border border-virex-stone/40 py-2 px-3 text-xs focus:outline-none focus:border-virex-forest"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-virex-deepink block mb-1">
                  Operational Commentary / Highlights
                </label>
                <textarea
                  rows={3}
                  placeholder="Key milestones, uptime, commercial contracts..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full border border-virex-stone/40 py-2 px-3 text-xs focus:outline-none focus:border-virex-forest"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-virex-stone/20">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-virex-stone text-xs font-medium text-virex-deepink hover:bg-virex-stone/10 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 bg-virex-forest text-white text-xs font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors flex items-center gap-2"
                >
                  {submittingReport && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Submit to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Detail View */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReportId(null)}
          canReview={isHoldingExecutive}
          isReviewing={reviewingId === selectedReport.id}
          onReview={handleReview}
        />
      )}

      {/* Session & Identity Telemetry Footer */}
      <div className="mt-12 pt-6 border-t border-virex-stone/20 flex flex-col sm:flex-row justify-between items-center text-xs text-virex-muted gap-4">
        <div className="flex items-center gap-2">
          <span>
            Signed in as <strong className="text-virex-deepink">{name}</strong> ({email})
          </span>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="text-red-600 hover:text-red-800 transition-colors text-xs font-medium"
        >
          Sign Out of Virex Portal
        </button>
      </div>
    </div>
  );
}
