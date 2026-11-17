"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  UserPlus,
  Search,
  CheckCircle,
  Clock,
  Ban,
  Shield,
  X,
  Copy,
  Check,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { api, VirexUser, VirexInvitation } from "@/lib/api";
import { useQorveAuth } from "@qorve/react";

export function UserManagementClient() {
  const { signOut } = useQorveAuth();
  const [users, setUsers] = useState<VirexUser[]>([]);
  const [invitations, setInvitations] = useState<VirexInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected user for detail drawer
  const [selectedUser, setSelectedUser] = useState<VirexUser | null>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    inviteUrl: string;
    email: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Action loading state
  const [actionLoading, setActionLoading] = useState(false);

  // Refresh users & invitations
  const refreshData = async () => {
    try {
      const data = await api.users.list();
      setUsers(data.users || []);
      setInvitations(data.invitations || []);
      if (selectedUser) {
        const updated = (data.users || []).find(
          (u: VirexUser) => u.id === selectedUser.id
        );
        if (updated) setSelectedUser(updated);
      }
    } catch (err) {
      console.error("Error refreshing users:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await api.users.list();
        if (!ignore) {
          setUsers(data.users || []);
          setInvitations(data.invitations || []);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === "ALL") return matchesSearch;
      return matchesSearch && u.status === statusFilter;
    });
  }, [users, searchQuery, statusFilter]);

  // Find latest invitation for selected user
  const userInvitation = useMemo(() => {
    if (!selectedUser) return null;
    return (
      invitations.find(
        (inv) => inv.email.toLowerCase() === selectedUser.email.toLowerCase()
      ) || null
    );
  }, [selectedUser, invitations]);

  // Handle Send Invitation
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    setInviting(true);
    try {
      const data = await api.users.invite({
        email: inviteEmail,
        name: inviteName,
        invitedBy: "Virex Administrator",
      });

      if (data && data.success) {
        setInviteResult({
          inviteUrl: data.inviteUrl,
          email: data.user.email,
        });
        await refreshData();
      } else {
        alert("Failed to invite user");
      }
    } catch (err: unknown) {
      console.error("Invite error:", err);
      const message = err instanceof Error ? err.message : "Network error inviting user";
      alert(message);
    } finally {
      setInviting(false);
    }
  };

  // Handle Resend Invitation
  const handleResendInvitation = async (invitationId: string) => {
    setActionLoading(true);
    try {
      const data = await api.users.resendInvite(invitationId);
      if (data && data.success) {
        alert(`New invitation link generated:\n${data.inviteUrl}`);
        await refreshData();
      } else {
        alert("Failed to resend invitation");
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error resending invitation";
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Revoke Invitation
  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;
    setActionLoading(true);
    try {
      const data = await api.users.revokeInvite(invitationId);
      if (data && data.success) {
        await refreshData();
      } else {
        alert("Failed to revoke invitation");
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error revoking invitation";
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Suspend User
  const handleSuspendUser = async (userId: string) => {
    if (!confirm("Are you sure you want to suspend this user's Virex access?"))
      return;
    setActionLoading(true);
    try {
      const data = await api.users.suspend(userId);
      if (data && data.success) {
        await refreshData();
      } else {
        alert("Failed to suspend user");
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error suspending user";
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reactivate User
  const handleReactivateUser = async (userId: string) => {
    setActionLoading(true);
    try {
      const data = await api.users.reactivate(userId);
      if (data && data.success) {
        await refreshData();
      } else {
        alert("Failed to reactivate user");
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error reactivating user";
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Copy invitation link helper
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-virex-warmwhite flex flex-col">
      {/* Top Header */}
      <header className="border-b border-virex-stone/30 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex flex-col">
              <span className="font-sans text-sm font-semibold tracking-[0.25em] text-virex-deepink leading-tight">
                VIREX
              </span>
              <span className="font-sans text-[10px] tracking-[0.25em] text-virex-muted leading-tight">
                HOLDINGS GROUP
              </span>
            </Link>

            <div className="h-5 w-px bg-virex-stone/40 hidden sm:block" />

            <nav className="flex items-center gap-4 text-xs font-medium tracking-wide">
              <Link
                href="/dashboard"
                className="text-virex-muted hover:text-virex-deepink transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-virex-forest font-semibold border-b-2 border-virex-forest pb-0.5">
                Users & Access
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-virex-forest/10 text-virex-forest text-[11px] font-semibold tracking-wider uppercase rounded-sm">
              <Shield className="w-3.5 h-3.5" />
              Phase 2 Access Layer
            </span>

            <button
              type="button"
              onClick={signOut}
              className="text-xs text-virex-muted hover:text-virex-deepink tracking-wide"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-virex-deepink">
              Users & Access
            </h1>
            <p className="font-sans text-sm text-virex-muted mt-1">
              Manage authorized Virex Portal members, send cryptographic invitations, and govern entity access.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setInviteName("");
              setInviteEmail("");
              setInviteResult(null);
              setShowInviteModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-virex-forest text-virex-warmwhite px-5 py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-virex-deepink transition-colors self-start sm:self-auto shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            + Invite User
          </button>
        </div>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 border border-virex-stone/30 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted">
              Total Members
            </span>
            <p className="font-serif text-2xl text-virex-deepink mt-1">
              {users.length}
            </p>
          </div>
          <div className="bg-white p-4 border border-virex-stone/30 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-700">
              Active Access
            </span>
            <p className="font-serif text-2xl text-emerald-800 mt-1">
              {users.filter((u) => u.status === "ACTIVE").length}
            </p>
          </div>
          <div className="bg-white p-4 border border-virex-stone/30 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-amber-700">
              Pending Invites
            </span>
            <p className="font-serif text-2xl text-amber-800 mt-1">
              {users.filter((u) => u.status === "INVITED").length}
            </p>
          </div>
          <div className="bg-white p-4 border border-virex-stone/30 rounded-sm">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-red-700">
              Suspended
            </span>
            <p className="font-serif text-2xl text-red-800 mt-1">
              {users.filter((u) => u.status === "SUSPENDED").length}
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 border border-virex-stone/30 rounded-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-virex-muted" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-virex-stone/40 text-xs font-sans focus:outline-none focus:border-virex-forest"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
            <span className="text-xs text-virex-muted">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-virex-stone/40 text-xs py-1.5 px-3 bg-white font-sans focus:outline-none focus:border-virex-forest"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INVITED">Invited</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <button
              type="button"
              onClick={refreshData}
              title="Refresh"
              className="p-2 border border-virex-stone/40 hover:bg-virex-stone/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-virex-deepink ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-virex-stone/30 rounded-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-virex-warmwhite/60 border-b border-virex-stone/30 uppercase text-[10px] tracking-wider text-virex-muted">
                <tr>
                  <th className="py-3 px-6 font-semibold">Name</th>
                  <th className="py-3 px-6 font-semibold">Email</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold">Qorve Link</th>
                  <th className="py-3 px-6 font-semibold">Last Login</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-virex-stone/20">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-virex-muted">
                      {loading ? "Loading users..." : "No users match your criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-virex-stone/20"
                            : "hover:bg-virex-warmwhite/40"
                        }`}
                      >
                        <td className="py-4 px-6 font-medium text-virex-deepink flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-virex-forest/10 text-virex-forest flex items-center justify-center font-serif text-xs uppercase font-bold shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <span className="truncate">{u.name}</span>
                        </td>
                        <td className="py-4 px-6 text-virex-deepink font-mono text-[11px]">
                          {u.email}
                        </td>
                        <td className="py-4 px-6">
                          {u.status === "ACTIVE" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                          {u.status === "INVITED" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Invited
                            </span>
                          )}
                          {u.status === "SUSPENDED" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {u.qorve_user_id ? (
                            <span className="text-[11px] text-virex-forest font-medium flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Connected
                            </span>
                          ) : (
                            <span className="text-[11px] text-virex-muted flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Not linked
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-virex-muted text-[11px]">
                          {formatDate(u.last_login_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(u);
                            }}
                            className="text-xs text-virex-forest hover:text-virex-deepink font-medium underline"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* User Detail Slide-over Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-virex-stone/30">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-virex-muted">
                User Details & Access
              </span>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 hover:bg-virex-warmwhite rounded-sm text-virex-muted hover:text-virex-deepink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-virex-forest text-virex-warmwhite flex items-center justify-center font-serif text-lg font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-virex-deepink">
                    {selectedUser.name}
                  </h3>
                  <p className="text-xs text-virex-muted font-mono mt-0.5">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-virex-warmwhite p-4 border border-virex-stone/30 rounded-sm mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
                    Virex Status
                  </span>
                  <p className="text-sm font-semibold capitalize text-virex-deepink">
                    ● {selectedUser.status.toLowerCase()}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
                    Qorve Account
                  </span>
                  <p className="text-sm font-medium text-virex-deepink">
                    {selectedUser.qorve_user_id ? "Connected" : "Not linked"}
                  </p>
                </div>
              </div>

              {/* Last login info */}
              <div className="border-t border-virex-stone/20 pt-4 pb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-virex-muted">Last login:</span>
                  <span className="font-medium text-virex-deepink">
                    {selectedUser.last_login_at
                      ? new Date(selectedUser.last_login_at).toLocaleString()
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-virex-muted">Account created:</span>
                  <span className="font-medium text-virex-deepink">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Invitation Information if exists */}
              {userInvitation && (
                <div className="border-t border-virex-stone/20 pt-4 pb-4">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-3">
                    Invitation Status
                  </span>
                  <div className="bg-virex-stone/10 p-3 rounded-sm space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-virex-muted">Issued by:</span>
                      <span className="font-medium text-virex-deepink">
                        {userInvitation.invited_by}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-virex-muted">Sent:</span>
                      <span>
                        {new Date(userInvitation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-virex-muted">Expires:</span>
                      <span>
                        {new Date(userInvitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-virex-muted">Token Status:</span>
                      <span className="font-semibold uppercase tracking-wider text-[10px]">
                        {userInvitation.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Access & Companies Section (Phase 3 Foundation) */}
              <div className="border-t border-virex-stone/20 pt-4 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted">
                    Entity Access (Phase 3 Scope)
                  </span>
                  <span className="text-[10px] text-virex-forest bg-virex-forest/10 px-2 py-0.5 rounded-xs font-semibold">
                    Standard
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 border border-virex-stone/30 rounded-sm flex items-center justify-between">
                    <div>
                      <p className="font-medium text-virex-deepink">
                        Virex Holdings Group B.V.
                      </p>
                      <p className="text-[10px] text-virex-muted">Default Tenant</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-virex-forest">
                      Member
                    </span>
                  </div>

                  <div className="p-3 border border-virex-stone/30 rounded-sm flex items-center justify-between opacity-75">
                    <div>
                      <p className="font-medium text-virex-deepink">
                        Virex Capital B.V.
                      </p>
                      <p className="text-[10px] text-virex-muted">Investment Arm</p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-virex-muted">
                      Viewer
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-virex-stone/30 pt-6 space-y-3 mt-auto">
                {selectedUser.status === "INVITED" && userInvitation && (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleResendInvitation(userInvitation.id)}
                      className="w-full inline-flex items-center justify-center gap-2 border border-virex-forest text-virex-forest px-4 py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-virex-forest hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Resend Invitation
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleRevokeInvitation(userInvitation.id)}
                      className="w-full inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 px-4 py-2 text-xs font-semibold tracking-wider uppercase hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Revoke Invitation
                    </button>
                  </>
                )}

                {selectedUser.status === "ACTIVE" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSuspendUser(selectedUser.id)}
                    className="w-full inline-flex items-center justify-center gap-2 border border-red-300 text-red-700 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-red-50 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Suspend User Access
                  </button>
                )}

                {selectedUser.status === "SUSPENDED" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleReactivateUser(selectedUser.id)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 text-white px-4 py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-emerald-800 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Reactivate User Access
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full p-8 border border-virex-stone/30 shadow-2xl rounded-sm">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-virex-stone/20">
              <h3 className="font-serif text-2xl text-virex-deepink">
                Invite User
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-virex-muted hover:text-virex-deepink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteResult ? (
              <div>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm mb-6 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-emerald-900 text-sm">
                    Invitation Created Successfully
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    An invitation was issued for <strong>{inviteResult.email}</strong>.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-virex-muted block mb-1">
                    Single-Use Invitation URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteResult.inviteUrl}
                      className="w-full bg-virex-warmwhite border border-virex-stone/30 py-2 px-3 text-xs font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(inviteResult.inviteUrl)}
                      className="px-3 py-2 bg-virex-forest text-white text-xs font-medium shrink-0 flex items-center gap-1 hover:bg-virex-deepink transition-colors"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-virex-muted mt-2">
                    Valid for 7 days. Only authenticating with {inviteResult.email} will be allowed to accept it.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="w-full bg-virex-forest text-white py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-virex-deepink block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full border border-virex-stone/40 py-2 px-3 text-xs focus:outline-none focus:border-virex-forest"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-virex-deepink block mb-1">
                    Corporate Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="person@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full border border-virex-stone/40 py-2 px-3 text-xs focus:outline-none focus:border-virex-forest"
                  />
                  <p className="text-[10px] text-virex-muted mt-1">
                    The recipient must authenticate through Qorve using this exact email.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-virex-deepink block mb-1">
                    Initial Access Scope
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Virex Portal (Standard Membership)"
                    className="w-full bg-virex-stone/10 border border-virex-stone/20 py-2 px-3 text-xs text-virex-muted"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-virex-stone text-xs font-medium text-virex-deepink hover:bg-virex-stone/10 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-5 py-2 bg-virex-forest text-white text-xs font-semibold tracking-wider uppercase hover:bg-virex-deepink transition-colors flex items-center gap-2"
                  >
                    {inviting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
