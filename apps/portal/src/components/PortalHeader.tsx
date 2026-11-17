"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOnClickOutside } from "../lib/useOnClickOutside";
import {
  Users,
  LogOut,
  LayoutDashboard,
  Shield,
  Building2,
  ChevronDown,
  Check,
  GitBranch,
} from "lucide-react";
import { useOrganization } from "./OrganizationContext";

export function PortalHeader({
  name,
  onSignOut,
}: {
  name: string;
  onSignOut: () => void;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isStructure = pathname.startsWith("/portal/structure");
  const isMemberships = pathname.startsWith("/portal/admin");

  const userMenuRef = useRef<HTMLDivElement>(null);
  const orgMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useOnClickOutside(orgMenuRef, () => setOrgMenuOpen(false));

  const {
    currentOrganization,
    setCurrentOrganization,
    organizations,
    currentMembership,
    isHoldingExecutive,
  } = useOrganization();

  return (
    <header className="border-b border-virex-stone/30 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex flex-col">
            <span className="font-sans text-sm font-semibold tracking-[0.2em] text-virex-deepink leading-tight">
              VIREX
            </span>
            <span className="font-sans text-[10px] tracking-[0.2em] text-virex-muted leading-tight">
              GROUP PORTAL
            </span>
          </Link>

          {/* Active Organization Switcher */}
          <div className="relative pl-4 border-l border-virex-stone/30" ref={orgMenuRef}>
            <button
              type="button"
              onClick={() => setOrgMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-sm hover:bg-virex-warmwhite border border-virex-stone/20 transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-xs bg-virex-forest/10 text-virex-forest flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-virex-muted font-semibold leading-tight">
                  Active Entity
                </span>
                <span className="text-xs font-semibold text-virex-deepink leading-tight flex items-center gap-1">
                  {currentOrganization?.name || "Loading..."}
                  <ChevronDown className="w-3 h-3 text-virex-muted" />
                </span>
              </div>
            </button>

            {orgMenuOpen && (
              <div className="absolute left-4 mt-2 w-72 bg-white border border-virex-stone/30 shadow-2xl rounded-sm py-2 z-50 animate-in fade-in-50 duration-150">
                <div className="px-3 pb-2 mb-1 border-b border-virex-stone/20">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-virex-muted block">
                    Switch Organization
                  </span>
                  <p className="text-[11px] text-virex-muted mt-0.5">
                    {isHoldingExecutive
                      ? "Global access (Virex Holding Board)"
                      : "Filtered by your memberships"}
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto py-1">
                  {organizations.map((org) => {
                    const isSelected = currentOrganization?.id === org.id;
                    return (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setCurrentOrganization(org);
                          setOrgMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-virex-forest/10 font-semibold text-virex-forest"
                            : "hover:bg-virex-warmwhite text-virex-deepink"
                        }`}
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="truncate">{org.name}</span>
                          <span className="text-[10px] text-virex-muted font-normal">
                            {org.type.replace("_", " ")}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-virex-forest shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium tracking-wide">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 transition-colors ${
                isDashboard
                  ? "text-virex-forest font-semibold"
                  : "text-virex-muted hover:text-virex-deepink"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Overview
            </Link>

            <Link
              href="/portal/structure"
              className={`flex items-center gap-1.5 transition-colors ${
                isStructure
                  ? "text-virex-forest font-semibold"
                  : "text-virex-muted hover:text-virex-deepink"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Group Structure
            </Link>

            <Link
              href="/portal/admin/users"
              className={`flex items-center gap-1.5 transition-colors ${
                isMemberships
                  ? "text-virex-forest font-semibold"
                  : "text-virex-muted hover:text-virex-deepink"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Memberships
            </Link>
          </nav>
        </div>

        {/* User Identity Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="font-sans text-sm text-virex-deepink flex items-center gap-2 px-3 py-1.5 rounded-sm hover:bg-virex-warmwhite transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-virex-forest text-virex-warmwhite flex items-center justify-center text-xs font-serif font-bold">
              {name.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-medium text-xs text-virex-deepink leading-tight">
                {name}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold leading-tight">
                {currentMembership?.role || "Authorized"}
              </span>
            </div>
            <span className="text-virex-muted text-[10px]">▾</span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-virex-stone/30 shadow-xl rounded-sm py-1 z-50">
              <div className="px-4 py-2 border-b border-virex-stone/20">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {currentMembership?.title || "Virex Member"}
                </p>
                <p className="text-xs font-medium text-virex-deepink truncate mt-0.5">
                  {name}
                </p>
                <p className="text-[10px] text-virex-muted mt-0.5">
                  Entity: {currentOrganization?.name}
                </p>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setUserMenuOpen(false)}
                className="w-full text-left px-4 py-2 text-xs text-virex-deepink hover:bg-virex-warmwhite flex items-center gap-2 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-virex-muted" />
                Dashboard
              </Link>

              <Link
                href="/portal/structure"
                onClick={() => setUserMenuOpen(false)}
                className="w-full text-left px-4 py-2 text-xs text-virex-deepink hover:bg-virex-warmwhite flex items-center gap-2 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5 text-virex-muted" />
                Group Structure
              </Link>

              <Link
                href="/portal/admin/users"
                onClick={() => setUserMenuOpen(false)}
                className="w-full text-left px-4 py-2 text-xs text-virex-deepink hover:bg-virex-warmwhite flex items-center gap-2 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-virex-muted" />
                Users & Memberships
              </Link>

              <div className="border-t border-virex-stone/20 my-1" />

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onSignOut();
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
