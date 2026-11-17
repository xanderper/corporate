import { Check, Clock, X } from "lucide-react";
import { ReportStatus } from "@/lib/api";

const STATUS_STYLES: Record<
  ReportStatus,
  { label: string; icon: typeof Check; className: string; iconClassName: string }
> = {
  APPROVED: {
    label: "Approved",
    icon: Check,
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    iconClassName: "text-emerald-600",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: Clock,
    className: "bg-amber-50 text-amber-800 border-amber-200",
    iconClassName: "text-amber-600",
  },
  SUBMITTED: {
    label: "Submitted",
    icon: Clock,
    className: "bg-blue-50 text-blue-800 border-blue-200",
    iconClassName: "text-blue-600",
  },
  REJECTED: {
    label: "Rejected",
    icon: X,
    className: "bg-red-50 text-red-800 border-red-200",
    iconClassName: "text-red-600",
  },
  DRAFT: {
    label: "Draft",
    icon: Clock,
    className: "bg-virex-stone/20 text-virex-muted border-virex-stone/40",
    iconClassName: "text-virex-muted",
  },
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const s = STATUS_STYLES[status];
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${s.className}`}
    >
      <Icon className={`w-3 h-3 ${s.iconClassName}`} />
      {s.label}
    </span>
  );
}
