"use client";

import { X } from "lucide-react";
import { CompanyReport } from "@/lib/api";
import { ReportStatusBadge } from "./ReportStatusBadge";

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-virex-warmwhite border border-virex-stone/20 rounded-sm p-4">
      <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
        {label}
      </span>
      <p
        className={`font-serif text-xl ${accent ? "text-emerald-800" : "text-virex-deepink"}`}
      >
        {value}
      </p>
    </div>
  );
}

export function ReportDetailModal({
  report,
  onClose,
  canReview,
  isReviewing,
  onReview,
}: {
  report: CompanyReport;
  onClose: () => void;
  canReview: boolean;
  isReviewing: boolean;
  onReview: (reportId: string, status: "APPROVED" | "REJECTED") => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-2xl w-full p-8 border border-virex-stone/30 shadow-2xl rounded-sm max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2 pb-4 border-b border-virex-stone/20">
          <div>
            <span className="text-[10px] font-mono text-virex-muted block mb-1">
              Period: {report.period}
            </span>
            <h3 className="font-serif text-2xl text-virex-deepink leading-tight">
              {report.title}
            </h3>
            <div className="mt-2">
              <ReportStatusBadge status={report.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-virex-muted hover:text-virex-deepink shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Metrics */}
        <div className="mt-6">
          <span className="text-[10px] font-bold tracking-widest uppercase text-virex-muted">
            Financial Telemetry
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            <Stat label="Revenue" value={`€${Number(report.revenue).toLocaleString()}`} />
            <Stat label="Operating Expenses" value={`€${Number(report.expenses).toLocaleString()}`} />
            <Stat label="EBITDA" value={`€${Number(report.ebitda).toLocaleString()}`} accent />
            <Stat label="Cash Balance" value={`€${Number(report.cash).toLocaleString()}`} />
            <Stat label="Headcount" value={`${report.headcount} FTE`} />
            <Stat label="Major Projects" value={`${report.major_projects}`} />
          </div>
        </div>

        {/* Risks */}
        <div className="mt-4">
          <Stat label="Open Risks Flagged" value={`${report.risks_count}`} />
        </div>

        {/* Commentary */}
        <div className="mt-6">
          <span className="text-[10px] font-bold tracking-widest uppercase text-virex-muted">
            Operational Commentary
          </span>
          <div className="mt-2 p-4 bg-virex-warmwhite border border-virex-stone/20 rounded-sm text-xs leading-relaxed text-virex-deepink whitespace-pre-wrap">
            {report.notes || "No commentary provided for this period."}
          </div>
        </div>

        {/* Submission / Review trail */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-virex-warmwhite border border-virex-stone/20 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
              Submitted By
            </span>
            <p className="text-virex-deepink font-medium">
              {report.submitted_by_name || "Authorized Officer"}
            </p>
            <p className="text-virex-muted text-[10px] mt-0.5">
              {report.submitted_at ? new Date(report.submitted_at).toLocaleString() : "—"}
            </p>
          </div>
          <div className="p-3 bg-virex-warmwhite border border-virex-stone/20 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
              Reviewed By
            </span>
            <p className="text-virex-deepink font-medium">
              {report.reviewed_by_name || "Pending review"}
            </p>
            <p className="text-virex-muted text-[10px] mt-0.5">
              {report.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : "—"}
            </p>
          </div>
        </div>

        {/* Review actions */}
        {canReview && report.status !== "APPROVED" && (
          <div className="mt-6 pt-4 border-t border-virex-stone/20 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isReviewing}
              onClick={() => onReview(report.id, "REJECTED")}
              className="px-4 py-2 border border-red-300 text-red-700 text-xs font-semibold uppercase tracking-wider hover:bg-red-50 transition-colors"
            >
              Reject
            </button>
            <button
              type="button"
              disabled={isReviewing}
              onClick={() => onReview(report.id, "APPROVED")}
              className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-800 transition-colors"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
