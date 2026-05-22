"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/adminStore";
import { getUsers, getUserById, getSellerPayouts, formatPrice, formatDate, formatDateTime, getPendingPayouts, getTransactions, getPlatformRevenue, getSuccessfulTransactions } from "@/lib/data";
import type { PendingBlueprint, SellerPayout, User, Transaction } from "@/lib/types";

interface PendingItem extends PendingBlueprint {
  id: string;
  authorName?: string;
  categoryName?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, isAdmin, adminLogout } = useAdmin();
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [payouts] = useState<SellerPayout[]>(getSellerPayouts);
  const [pendingPayoutCount] = useState(getPendingPayouts().length);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [usersCount] = useState(getUsers().length);
  const [allTransactions] = useState<Transaction[]>(getTransactions);
  const [successfulTxns] = useState(getSuccessfulTransactions().length);
  const [platformRevenue] = useState(getPlatformRevenue());
  const [tab, setTab] = useState<"queue" | "payouts" | "transactions" | "overview">("overview");

  const fetchPending = useCallback(async () => {
    if (!admin) return;
    try {
      const res = await fetch(`/api/v1/pending-blueprints?adminId=${admin.id}`);
      const data = await res.json();
      const items: PendingItem[] = (data.blueprints || []).map((bp: any) => {
        const author = getUserById(bp.authorId);
        return {
          ...bp,
          authorName: author?.name || "Unknown",
        };
      });
      setPending(items);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    fetchPending();
  }, [isAdmin, router, fetchPending]);

  const handleApprove = async (blueprintId: string) => {
    if (!admin) return;
    setActionMsg(null);
    try {
      const res = await fetch("/api/v1/review-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprintId,
          action: "approve",
          adminId: admin.id,
          reviewNotes: reviewNotes || "Approved by admin.",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ type: "success", text: "Blueprint approved and published to marketplace." });
        setSelected(null);
        setReviewNotes("");
        fetchPending();
      } else {
        setActionMsg({ type: "error", text: data.error || "Failed to approve." });
      }
    } catch {
      setActionMsg({ type: "error", text: "Network error." });
    }
  };

  const handleReject = async (blueprintId: string) => {
    if (!admin || !reviewNotes.trim()) return;
    setActionMsg(null);
    try {
      const res = await fetch("/api/v1/review-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprintId,
          action: "reject",
          adminId: admin.id,
          reviewNotes: reviewNotes.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ type: "success", text: "Blueprint rejected." });
        setSelected(null);
        setReviewNotes("");
        fetchPending();
      } else {
        setActionMsg({ type: "error", text: data.error || "Failed to reject." });
      }
    } catch {
      setActionMsg({ type: "error", text: "Network error." });
    }
  };

  if (!isAdmin) return null;

  const totalPendingEarnings = payouts
    .filter((p) => p.status === "pending_payout")
    .reduce((sum, p) => sum + p.netAmount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
                PB
              </div>
              <span className="font-bold text-white text-sm">PromptForge Admin</span>
            </Link>
            <span className="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-400 text-[10px] font-medium uppercase tracking-wider">
              Internal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/analytics"
              className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
            >
              Analytics
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                {admin?.name?.charAt(0) || "A"}
              </div>
              {admin?.name}
            </div>
            <button
              onClick={() => { adminLogout(); router.push("/admin/login"); }}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Action message banner */}
        {actionMsg && (
          <div className={`mb-6 p-4 rounded-xl border text-sm ${
            actionMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {actionMsg.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
          {(["overview", "queue", "transactions", "payouts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t === "queue" ? `Review Queue (${pending.length})` :
               t === "transactions" ? `Transactions (${allTransactions.length})` : t}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Total Users</div>
                <div className="text-2xl font-bold text-white">{usersCount}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Pending Reviews</div>
                <div className="text-2xl font-bold text-amber-400">{pending.length}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Pending Payouts</div>
                <div className="text-2xl font-bold text-amber-400">{pendingPayoutCount}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Total Pending Earnings</div>
                <div className="text-2xl font-bold text-emerald-400">{formatPrice(totalPendingEarnings)}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Platform Revenue (All Time)</div>
                <div className="text-2xl font-bold text-indigo-400">{formatPrice(platformRevenue)}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Successful Transactions</div>
                <div className="text-2xl font-bold text-white">{successfulTxns}</div>
              </div>
            </div>
          </div>
        )}

        {/* QUEUE TAB */}
        {tab === "queue" && (
          <div className="animate-fade-in">
            {loading ? (
              <div className="text-center py-20 text-slate-500">Loading pending blueprints...</div>
            ) : pending.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-white mb-2">All Clear</h3>
                <p className="text-sm text-slate-400">No blueprints pending review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {pending.map((bp) => (
                  <div
                    key={bp.id}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      selected?.id === bp.id
                        ? "border-indigo-500/50 bg-indigo-500/5"
                        : "border-slate-800 bg-slate-900 hover:border-slate-700"
                    }`}
                    onClick={() => { setSelected(bp); setReviewNotes(""); }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white">{bp.title}</h3>
                        <p className="text-sm text-slate-400 mt-0.5">
                          by {bp.authorName || "Unknown"}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        bp.submissionStatus === "pending_review"
                          ? "bg-amber-500/15 text-amber-400"
                          : bp.submissionStatus === "rejected"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {bp.submissionStatus === "pending_review" ? "Pending" : bp.submissionStatus}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{bp.description}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatPrice(bp.price)}</span>
                      <span>•</span>
                      <span className="capitalize">{bp.difficulty}</span>
                      <span>•</span>
                      <span>{bp.steps} steps</span>
                      <span>•</span>
                      <span>{formatDate(bp.createdAt)}</span>
                    </div>

                    {bp.submissionStatus === "rejected" && bp.reviewNotes && (
                      <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-xs text-red-300">
                        <span className="font-medium">Rejection notes:</span> {bp.reviewNotes}
                      </div>
                    )}

                    {selected?.id === bp.id && bp.submissionStatus === "pending_review" && (
                      <div className="mt-4 pt-4 border-t border-slate-800 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Review Notes {bp.submissionStatus === "pending_review" && "(required for rejection)"}
                          </label>
                          <textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={2}
                            placeholder="Add notes about this submission..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600 resize-none"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleApprove(bp.id)}
                            className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all active:scale-[0.98]"
                          >
                            Approve & Publish
                          </button>
                          <button
                            onClick={() => handleReject(bp.id)}
                            disabled={!reviewNotes.trim()}
                            className="flex-1 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                          >
                            Reject
                          </button>
                        </div>
                        {!reviewNotes.trim() && (
                          <p className="text-[11px] text-amber-500">Add review notes before rejecting</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAYOUTS TAB */}
        {tab === "payouts" && (
          <div className="animate-fade-in">
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Payout ID</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Seller</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Platform Fee (20%)</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Net</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-500">No payouts recorded.</td></tr>
                  ) : (
                    payouts.map((p) => {
                      const seller = getUserById(p.sellerId);
                      return (
                        <tr key={p.payoutId} className="border-b border-slate-800 hover:bg-slate-900/50">
                          <td className="px-4 py-3 text-slate-300 font-mono text-xs">{p.payoutId}</td>
                          <td className="px-4 py-3 text-slate-300">{seller?.name || "Unknown"}</td>
                          <td className="px-4 py-3 text-white">{formatPrice(p.amountEarned)}</td>
                          <td className="px-4 py-3 text-slate-400">{formatPrice(p.platformFee)}</td>
                          <td className="px-4 py-3 text-emerald-400 font-medium">{formatPrice(p.netAmount)}</td>
                          <td className="px-4 py-3 text-slate-400">{formatDate(p.dateRecorded)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              p.status === "paid_out"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-amber-500/15 text-amber-400"
                            }`}>
                              {p.status === "paid_out" ? "Paid" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {tab === "transactions" && (
          <div className="animate-fade-in">
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Transaction ID</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Order</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Buyer</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Blueprint</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Platform Fee</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Seller Net</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-12 text-slate-500">No transactions recorded.</td></tr>
                  ) : (
                    allTransactions.map((txn) => {
                      const buyer = getUserById(txn.buyerId);
                      return (
                        <tr key={txn.transactionId} className="border-b border-slate-800 hover:bg-slate-900/50">
                          <td className="px-4 py-3 text-slate-300 font-mono text-xs">{txn.transactionId}</td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-xs">{txn.purchaseId}</td>
                          <td className="px-4 py-3 text-slate-300">{buyer?.name || "Unknown"}</td>
                          <td className="px-4 py-3 text-slate-300 font-mono text-xs">{txn.blueprintId}</td>
                          <td className="px-4 py-3 text-white">{formatPrice(txn.amountPaid)}</td>
                          <td className="px-4 py-3 text-amber-400">{formatPrice(txn.platformFeeAmount)}</td>
                          <td className="px-4 py-3 text-emerald-400">{formatPrice(txn.sellerNetRevenue)}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{formatDateTime(txn.timestamp)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              txn.status === "success"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : txn.status === "refunded"
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-red-500/15 text-red-400"
                            }`}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
