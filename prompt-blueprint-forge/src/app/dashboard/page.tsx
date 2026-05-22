"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import {
  getBlueprintsByAuthor,
  getBlueprintCategory,
  getBlueprintById,
  formatPrice,
  formatDate,
  formatDateTime,
  formatSalesCount,
  getPurchasesByUser,
  getUserById,
  getTransactions,
  getSellerPayouts,
} from "@/lib/data";
import type { Purchase, Subscription, SubscriptionPlan } from "@/lib/types";
import { SUBSCRIPTION_PLANS } from "@/lib/types";

export default function DashboardPage() {
  const { user, isAuthenticated } = useApp();
  const [tab, setTab] = useState<"overview" | "listings" | "purchases" | "subscription">("overview");
  const [purchases, setPurchases] = useState<(Purchase & { blueprintTitle?: string; blueprintImage?: string })[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedBp, setSelectedBp] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subMsg, setSubMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setPurchases(getPurchasesByUser(user.id).map((p) => {
        const bp = getBlueprintById(p.blueprintId);
        return { ...p, blueprintTitle: bp?.title, blueprintImage: bp?.image };
      }));
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/v1/subscribe?userId=${user.id}`);
      const data = await res.json();
      setSubscription(data.subscription);
    } catch {
      // silent
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) return;
    setSubLoading(true);
    setSubMsg(null);
    try {
      const res = await fetch("/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubMsg({ type: "success", text: data.message });
        fetchSubscription();
      } else {
        setSubMsg({ type: "error", text: data.error || "Subscription failed." });
      }
    } catch {
      setSubMsg({ type: "error", text: "Network error." });
    } finally {
      setSubLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    setSubLoading(true);
    setSubMsg(null);
    try {
      const res = await fetch(`/api/v1/subscribe?userId=${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setSubMsg({ type: "success", text: data.message });
        fetchSubscription();
      } else {
        setSubMsg({ type: "error", text: data.error || "Cancel failed." });
      }
    } catch {
      setSubMsg({ type: "error", text: "Network error." });
    } finally {
      setSubLoading(false);
    }
  };

  const fetchAnalytics = async (blueprintId: string) => {
    setSelectedBp(blueprintId);
    setAnalytics(null);
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/v1/creator-analytics/${blueprintId}`);
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch {
      // silent
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
        <p className="text-(--muted) mb-6">Sign in to view your dashboard.</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const myBlueprints = getBlueprintsByAuthor(user.id);
  const totalSales = myBlueprints.reduce((sum, bp) => sum + bp.sales, 0);
  const totalRevenue = myBlueprints.reduce((sum, bp) => sum + bp.price * bp.sales, 0);
  const avgRating =
    myBlueprints.length > 0
      ? myBlueprints.reduce((sum, bp) => sum + bp.rating, 0) / myBlueprints.length
      : 0;
  const isCreator = user.role === "creator";
  const isBuyer = user.role === "buyer";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
          <p className="text-sm text-(--muted)">
            Member since {formatDate(user.joinedDate)} ·{" "}
            <span className="capitalize">{user.role}</span>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl border border-(--border) bg-(--card)">
          <div className="text-sm text-(--muted) mb-1">
            {isCreator ? "Total Listings" : "Blueprints Purchased"}
          </div>
          <div className="text-2xl font-bold">
            {isCreator ? myBlueprints.length : purchases.length}
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-(--border) bg-(--card)">
          <div className="text-sm text-(--muted) mb-1">
            {isCreator ? "Units Sold" : "Total Spent"}
          </div>
          <div className="text-2xl font-bold">
            {isCreator
              ? formatSalesCount(totalSales)
              : formatPrice(purchases.reduce((s, p) => s + p.amount, 0))}
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-(--border) bg-(--card)">
          <div className="text-sm text-(--muted) mb-1">
            {isCreator ? "Total Revenue" : "Platform Fees Paid"}
          </div>
          <div className="text-2xl font-bold gradient-text">
            {isCreator
              ? formatPrice(totalRevenue)
              : formatPrice(purchases.reduce((s, p) => s + p.platformFee, 0))}
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-(--border) bg-(--card)">
          <div className="text-sm text-(--muted) mb-1">
            {isCreator ? "Avg Rating" : "Last Purchase"}
          </div>
          <div className="text-2xl font-bold">
            {isCreator
              ? avgRating > 0
                ? avgRating.toFixed(1)
                : "—"
              : purchases.length > 0
              ? formatDate(purchases[0].purchaseDate.split("T")[0])
              : "—"}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-(--card-hover) border border-(--border) w-fit">
        <button
          onClick={() => setTab("overview")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "overview"
              ? "bg-(--background) text-(--foreground) shadow-sm"
              : "text-(--muted) hover:text-(--foreground)"
          }`}
        >
          Overview
        </button>
        {isCreator && (
          <button
            onClick={() => setTab("listings")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "listings"
                ? "bg-(--background) text-(--foreground) shadow-sm"
                : "text-(--muted) hover:text-(--foreground)"
            }`}
          >
            My Listings ({myBlueprints.length})
          </button>
        )}
        <button
          onClick={() => setTab("purchases")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "purchases"
              ? "bg-(--background) text-(--foreground) shadow-sm"
              : "text-(--muted) hover:text-(--foreground)"
          }`}
        >
          Purchase History ({purchases.length})
        </button>
        {isBuyer && (
          <button
            onClick={() => setTab("subscription")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "subscription"
                ? "bg-(--background) text-(--foreground) shadow-sm"
                : "text-(--muted) hover:text-(--foreground)"
            }`}
          >
            Subscription{subscription ? ` (${subscription.plan})` : ""}
          </button>
        )}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
            <h2 className="font-semibold mb-4">
              {isCreator ? "Your Creator Stats" : "Your Buyer Activity"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold gradient-text">
                  {isCreator ? myBlueprints.length : purchases.length}
                </div>
                <div className="text-xs text-(--muted) mt-1">
                  {isCreator ? "Active Blueprints" : "Purchases Made"}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isCreator ? formatSalesCount(totalSales) : purchases.length}
                </div>
                <div className="text-xs text-(--muted) mt-1">
                  {isCreator ? "Total Sales" : "Items Bought"}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">
                  {isCreator
                    ? formatPrice(totalRevenue)
                    : formatPrice(purchases.reduce((s, p) => s + p.amount, 0))}
                </div>
                <div className="text-xs text-(--muted) mt-1">
                  {isCreator ? "Revenue Generated" : "Total Spent"}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isCreator
                    ? avgRating > 0
                      ? avgRating.toFixed(1)
                      : "—"
                    : purchases.length > 0
                    ? formatDate(purchases[0].purchaseDate.split("T")[0])
                    : "—"}
                </div>
                <div className="text-xs text-(--muted) mt-1">
                  {isCreator ? "Average Rating" : "Most Recent"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isCreator && (
              <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
                <h2 className="font-semibold mb-3">Quick Actions</h2>
                <div className="space-y-2">
                  <Link
                    href="/create"
                    className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">New Blueprint</div>
                      <div className="text-xs text-(--muted)">Create and submit a new listing</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
            <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
              <h2 className="font-semibold mb-3">Account</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-(--muted)">Role</span>
                  <span className="capitalize font-medium">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--muted)">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--muted)">Joined</span>
                  <span>{formatDate(user.joinedDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LISTINGS TAB (Creator only) */}
      {tab === "listings" && (
        <div>
          {myBlueprints.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">No blueprints yet</h3>
              <p className="text-sm text-(--muted) mb-6">Create your first listing to start selling.</p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
              >
                Create Blueprint
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myBlueprints.map((bp) => {
                const category = getBlueprintCategory(bp);
                return (
                  <div key={bp.id}>
                    <button
                      onClick={() => fetchAnalytics(selectedBp === bp.id ? "" : bp.id)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-(--border) bg-(--card) hover:bg-(--card-hover) transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={bp.image} alt={bp.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{bp.title}</div>
                          <div className="flex items-center gap-2 text-xs text-(--muted)">
                            {category && (
                              <span>{category.icon} {category.name}</span>
                            )}
                            <span>•</span>
                            <span>{formatSalesCount(bp.sales)} sold</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold gradient-text">{formatPrice(bp.price)}</div>
                        <div className="text-xs text-(--muted)">★ {bp.rating}</div>
                      </div>
                    </button>
                    {selectedBp === bp.id && (
                      <div className="mt-2 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                        {analyticsLoading ? (
                          <div className="text-sm text-(--muted) text-center py-4">Loading analytics...</div>
                        ) : analytics ? (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm">Analytics: {analytics.blueprintTitle}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="p-3 rounded-lg bg-(--card)">
                                <div className="text-xs text-(--muted)">Total Sales</div>
                                <div className="text-lg font-bold">{analytics.totalSales}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-(--card)">
                                <div className="text-xs text-(--muted)">Revenue</div>
                                <div className="text-lg font-bold gradient-text">{formatPrice(analytics.totalRevenue)}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-(--card)">
                                <div className="text-xs text-(--muted)">Avg Price</div>
                                <div className="text-lg font-bold">{formatPrice(analytics.averagePrice)}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-(--card)">
                                <div className="text-xs text-(--muted)">Unique Buyers</div>
                                <div className="text-lg font-bold">{analytics.uniqueBuyers}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-(--card)">
                                <div className="text-xs text-(--muted)">Seller Revenue</div>
                                <div className="text-lg font-bold text-emerald-500">{formatPrice(analytics.totalSellerRevenue)}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-(--card)">
                                <div className="text-xs text-(--muted)">Platform Fees</div>
                                <div className="text-lg font-bold text-amber-500">{formatPrice(analytics.totalPlatformFees)}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-(--card)">
                                <div className="text-xs text-(--muted)">Repeat Buyers</div>
                                <div className="text-lg font-bold">{analytics.repeatBuyers}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-(--card)">
                                <div className="text-xs text-(--muted)">Last Sale</div>
                                <div className="text-sm font-bold">{analytics.lastSale ? formatDate(analytics.lastSale.split("T")[0]) : "—"}</div>
                              </div>
                            </div>
                            {analytics.salesOverTime && analytics.salesOverTime.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-(--muted) mb-2">Sales Over Time</h5>
                                <div className="flex items-end gap-1.5 h-20">
                                  {analytics.salesOverTime.map((point: any, i: number) => {
                                    const maxSales = Math.max(...analytics.salesOverTime.map((p: any) => p.sales));
                                    const height = maxSales > 0 ? (point.sales / maxSales) * 100 : 0;
                                    return (
                                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                          className="w-full rounded-t bg-indigo-500/60 hover:bg-indigo-500 transition-all"
                                          style={{ height: `${Math.max(height, 4)}%` }}
                                          title={`${point.month}: ${point.sales} sales, ${formatPrice(point.revenue)}`}
                                        />
                                        <span className="text-[9px] text-(--muted) rotate-45 origin-left whitespace-nowrap">
                                          {point.month.slice(5)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PURCHASES TAB */}
      {tab === "purchases" && (
        <div>
          {purchases.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
              <p className="text-sm text-(--muted) mb-6">
                Browse the marketplace to find blueprints you need.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((p) => {
                const bp = getBlueprintById(p.blueprintId);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-(--border) bg-(--card)"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={bp?.image || ""}
                          alt={p.blueprintTitle || "Blueprint"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/blueprint/${p.blueprintId}`}
                          className="font-medium text-sm hover:text-indigo-400 transition-colors"
                        >
                          {p.blueprintTitle || "Unknown Blueprint"}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-(--muted) mt-0.5">
                          <span>Purchased {formatDateTime(p.purchaseDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatPrice(p.amount)}</div>
                      <div className="text-xs text-(--muted)">
                        Fee: {formatPrice(p.platformFee)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBSCRIPTION TAB (Buyer only) */}
      {tab === "subscription" && (
        <div className="space-y-6">
          {subMsg && (
            <div className={`p-4 rounded-xl border text-sm ${
              subMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {subMsg.text}
            </div>
          )}

          {subscription && subscription.status === "active" ? (
            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold capitalize">{subscription.plan} Plan</h2>
                  <p className="text-sm text-(--muted)">
                    Active since {formatDate(subscription.startDate.split("T")[0])}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-(--muted)">Next billing</span>
                  <span>{formatDate(subscription.nextBillingDate.split("T")[0])}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--muted)">Auto-renew</span>
                  <span>{subscription.autoRenew ? "Enabled" : "Disabled"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--muted)">Plan price</span>
                  <span className="font-bold">{formatPrice(SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan)?.price || 0)}/mo</span>
                </div>
              </div>
              <button
                onClick={handleCancel}
                disabled={subLoading}
                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all disabled:opacity-50"
              >
                {subLoading ? "Processing..." : "Cancel Subscription"}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold">Choose a Plan</h2>
              <p className="text-sm text-(--muted)">Unlock premium features with a subscription.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-6 rounded-2xl border border-(--border) bg-(--card) hover:border-indigo-500/30 transition-colors"
                  >
                    <h3 className="text-lg font-bold capitalize">{plan.name}</h3>
                    <div className="text-3xl font-bold my-3">
                      {formatPrice(plan.price)}
                      <span className="text-sm font-normal text-(--muted)">/mo</span>
                    </div>
                    <p className="text-sm text-(--muted) mb-4">{plan.description}</p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subLoading}
                      className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-medium text-sm transition-all"
                    >
                      {subLoading ? "Processing..." : subscription?.plan === plan.id ? "Current Plan" : `Subscribe - ${formatPrice(plan.price)}/mo`}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
