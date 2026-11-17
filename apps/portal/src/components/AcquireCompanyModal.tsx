"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Building2,
  GitBranch,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Organization, OwnershipRelationship } from "@/lib/api";

type Step = "company" | "ownership" | "done";
type OrgType = "HOLDING" | "SUBSIDIARY" | "PORTFOLIO" | "JOINT_VENTURE" | "FUND";

interface Props {
  open: boolean;
  onClose: () => void;
  organizations: Organization[]; // existing orgs for the owner picker
  actorId?: string;
  initialOwnerSlug?: string;
  onSuccess: (newOrg: Organization, relationship?: OwnershipRelationship) => Promise<void> | void;
}

const ORG_TYPES: { value: OrgType; label: string; desc: string }[] = [
  { value: "SUBSIDIARY", label: "Subsidiary", desc: "Wholly or majority controlled entity" },
  { value: "PORTFOLIO", label: "Portfolio Company", desc: "Investment or venture holding" },
  { value: "JOINT_VENTURE", label: "Joint Venture", desc: "Shared ownership with external partner" },
  { value: "FUND", label: "Fund", desc: "Investment fund or special purpose vehicle" },
  { value: "HOLDING", label: "Holding Company", desc: "Pure holding / parent entity" },
];

export function AcquireCompanyModal({
  open,
  onClose,
  organizations,
  actorId,
  initialOwnerSlug,
  onSuccess,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Step 1 — company details
  const [step, setStep] = useState<Step>("company");
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [orgType, setOrgType] = useState<OrgType>("SUBSIDIARY");
  const [description, setDescription] = useState("");

  // Step 2 — ownership
  const [ownerSlug, setOwnerSlug] = useState<string>(() => {
    if (initialOwnerSlug && organizations.some((o) => o.slug === initialOwnerSlug)) {
      return initialOwnerSlug;
    }
    const holding = organizations.find((o) => o.type === "HOLDING");
    return holding?.slug ?? organizations[0]?.slug ?? "";
  });
  const [ownershipPct, setOwnershipPct] = useState<string>("100");
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    () => new Date().toISOString().slice(0, 10)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrg, setCreatedOrg] = useState<Organization | null>(null);

  // Auto-slug from name
  useEffect(() => {
    if (!slugManual && name) {
      setSlug(
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }, [name, slugManual]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("company");
      setName("");
      setLegalName("");
      setSlug("");
      setSlugManual(false);
      setOrgType("SUBSIDIARY");
      setDescription("");
      setOwnershipPct("100");
      setEffectiveFrom(new Date().toISOString().slice(0, 10));
      setError(null);
      setCreatedOrg(null);
      if (initialOwnerSlug && organizations.some((o) => o.slug === initialOwnerSlug)) {
        setOwnerSlug(initialOwnerSlug);
      } else {
        const holding = organizations.find((o) => o.type === "HOLDING");
        setOwnerSlug(holding?.slug ?? organizations[0]?.slug ?? "");
      }
    }
  }, [open, organizations, initialOwnerSlug]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Step 1 submit — create the company
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !legalName.trim()) {
      setError("Company name and legal name are required.");
      return;
    }
    setLoading(true);
    try {
      const { organization } = await api.organizations.createOrganization(
        { name: name.trim(), legalName: legalName.trim(), slug: slug || undefined, type: orgType, description: description || undefined },
        actorId
      );
      setCreatedOrg(organization);
      setSlug(organization.slug); // use the server-returned slug
      setStep("ownership");
    } catch (err: any) {
      setError(err?.message ?? "Failed to register company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 submit — record ownership
  const handleAddOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrg) return;
    setError(null);
    const pct = parseFloat(ownershipPct);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      setError("Ownership percentage must be between 0.01 and 100.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.organizations.addOwnership(
        {
          ownerSlug,
          ownedSlug: createdOrg.slug,
          ownershipPercentage: pct,
          effectiveFrom: effectiveFrom || undefined,
        },
        actorId
      );
      setStep("done");
      await onSuccess(createdOrg, res?.relationship);
    } catch (err: any) {
      setError(err?.message ?? "Failed to record ownership. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="relative bg-white border border-virex-stone/30 rounded-sm shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-virex-stone/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-virex-forest" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-virex-forest uppercase">
                Acquisition Workflow
              </span>
            </div>
            <h2 className="font-serif text-xl text-virex-deepink">
              {step === "company" && "Register New Company"}
              {step === "ownership" && "Record Ownership Stake"}
              {step === "done" && "Company Added Successfully"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-virex-muted hover:text-virex-deepink transition-colors rounded-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress steps */}
        <div className="flex items-center px-6 py-3 bg-virex-warmwhite border-b border-virex-stone/20 gap-3">
          {(["company", "ownership", "done"] as Step[]).map((s, idx) => {
            const labels = ["1. Company Details", "2. Ownership", "3. Done"];
            const isActive = step === s;
            const isDone =
              (s === "company" && (step === "ownership" || step === "done")) ||
              (s === "ownership" && step === "done");
            return (
              <div key={s} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="w-3 h-3 text-virex-stone/50" />}
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "text-virex-deepink"
                      : isDone
                      ? "text-virex-forest"
                      : "text-virex-muted/50"
                  }`}
                >
                  {labels[idx]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ── Step 1: Company Details ── */}
          {step === "company" && (
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-virex-muted mb-1.5">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Logistics BV"
                    className="w-full px-3 py-2 text-sm border border-virex-stone/40 rounded-xs bg-virex-warmwhite focus:outline-none focus:border-virex-deepink text-virex-deepink placeholder-virex-muted/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-virex-muted mb-1.5">
                    Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Acme Logistics B.V."
                    className="w-full px-3 py-2 text-sm border border-virex-stone/40 rounded-xs bg-virex-warmwhite focus:outline-none focus:border-virex-deepink text-virex-deepink placeholder-virex-muted/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-virex-muted mb-1.5">
                    URL Slug
                    <span className="ml-1 text-virex-muted/60 normal-case font-normal tracking-normal">
                      (auto-generated from name)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManual(true);
                    }}
                    placeholder="acme-logistics-bv"
                    className="w-full px-3 py-2 text-sm border border-virex-stone/40 rounded-xs bg-virex-warmwhite focus:outline-none focus:border-virex-deepink text-virex-deepink font-mono placeholder-virex-muted/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-virex-muted mb-1.5">
                    Entity Type
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {ORG_TYPES.map((t) => (
                      <label
                        key={t.value}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xs border cursor-pointer transition-all ${
                          orgType === t.value
                            ? "border-virex-deepink bg-virex-deepink/5 text-virex-deepink"
                            : "border-virex-stone/30 bg-virex-warmwhite text-virex-muted hover:border-virex-stone/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="orgType"
                          value={t.value}
                          checked={orgType === t.value}
                          onChange={() => setOrgType(t.value)}
                          className="accent-virex-deepink"
                        />
                        <div>
                          <div className="text-xs font-semibold">{t.label}</div>
                          <div className="text-[10px] opacity-70">{t.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-virex-muted mb-1.5">
                    Description
                    <span className="ml-1 text-virex-muted/60 normal-case font-normal tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this entity's business activities..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-virex-stone/40 rounded-xs bg-virex-warmwhite focus:outline-none focus:border-virex-deepink text-virex-deepink placeholder-virex-muted/50 transition-colors resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-virex-deepink text-white text-xs font-semibold rounded-xs hover:bg-virex-deepink/90 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Company
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: Ownership ── */}
          {step === "ownership" && createdOrg && (
            <form onSubmit={handleAddOwnership} className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800">
                    {createdOrg.name} registered
                  </p>
                  <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                    slug: {createdOrg.slug}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-virex-warmwhite border border-virex-stone/20 rounded-xs">
                <Info className="w-3.5 h-3.5 text-virex-muted shrink-0 mt-0.5" />
                <p className="text-[10px] text-virex-muted">
                  Select which entity within the Virex group is acquiring or owning this company,
                  and the ownership stake percentage.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-virex-muted mb-1.5">
                    Acquiring Entity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ownerSlug}
                    onChange={(e) => setOwnerSlug(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-virex-stone/40 rounded-xs bg-virex-warmwhite focus:outline-none focus:border-virex-deepink text-virex-deepink transition-colors"
                  >
                    {organizations.map((o) => (
                      <option key={o.slug} value={o.slug}>
                        {o.name} ({o.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-virex-muted mb-1.5">
                    Ownership Stake (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.01"
                      max="100"
                      step="0.01"
                      value={ownershipPct}
                      onChange={(e) => setOwnershipPct(e.target.value)}
                      className="w-full px-3 py-2 pr-8 text-sm border border-virex-stone/40 rounded-xs bg-virex-warmwhite focus:outline-none focus:border-virex-deepink text-virex-deepink transition-colors"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-virex-muted font-semibold">
                      %
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {["25", "51", "75", "100"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setOwnershipPct(v)}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-xs border transition-all ${
                          ownershipPct === v
                            ? "bg-virex-deepink text-white border-virex-deepink"
                            : "bg-virex-warmwhite text-virex-muted border-virex-stone/30 hover:border-virex-muted"
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-virex-muted mb-1.5">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-virex-stone/40 rounded-xs bg-virex-warmwhite focus:outline-none focus:border-virex-deepink text-virex-deepink transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep("company")}
                  className="px-4 py-2 text-xs font-semibold text-virex-muted hover:text-virex-deepink border border-virex-stone/30 rounded-xs transition-colors"
                >
                  ← Back
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (createdOrg) {
                        setStep("done");
                        await onSuccess(createdOrg);
                      }
                    }}
                    className="px-4 py-2 text-xs font-semibold text-virex-muted hover:text-virex-deepink border border-virex-stone/30 rounded-xs transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 bg-virex-deepink text-white text-xs font-semibold rounded-xs hover:bg-virex-deepink/90 transition-colors disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <GitBranch className="w-3.5 h-3.5" />
                    Record Ownership
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ── Step 3: Done ── */}
          {step === "done" && createdOrg && (
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-virex-deepink mb-1">
                  {createdOrg.name}
                </h3>
                <p className="text-xs text-virex-muted">
                  Successfully added to the Virex Group Registry.
                  <br />
                  It will appear in the structure topology and cap table.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 bg-virex-deepink text-white text-xs font-semibold rounded-xs hover:bg-virex-deepink/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
