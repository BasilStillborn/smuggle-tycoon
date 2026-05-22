"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/adminStore";
import { formatPrice } from "@/lib/data";

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  icon: string;
  blueprintCount: number;
  totalSales: number;
  totalRevenue: number;
  avgPrice: number;
  avgRating: number;
}

interface MonthlyRevenue {
  month: string;
  sales: number;
  revenue: number;
  fees: number;
}

interface AnalyticsData {
  overview: {
    totalBlueprints: number;
    totalTransactions: number;
    totalPlatformRevenue: number;
    totalSellerPayoutsDue: number;
    totalBuyers: number;
    totalCreators: number;
    averageSalePrice: number;
    totalUsers: number;
    abandonmentRate: number;
  };
  categoryGrowth: CategoryStat[];
  revenueOverTime: MonthlyRevenue[];
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { admin, isAdmin } = useAdmin();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!admin) return;
    try {
      const res = await fetch(`/api/v1/admin/analytics?adminId=${admin.id}`);
      const json = await res.json();
      if (res.ok) setData(json);
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
    fetchAnalytics();
  }, [isAdmin, router, fetchAnalytics]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Platform Analytics</h1>
            <p className="text-sm text-slate-400">Data-driven insights about your marketplace</p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            &larr; Back to Admin
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading analytics...</div>
        ) : !data ? (
          <div className="text-center py-20 text-slate-500">Failed to load analytics.</div>
        ) : (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Platform Revenue (All Time)</div>
                <div className="text-2xl font-bold text-indigo-400">{formatPrice(data.overview.totalPlatformRevenue)}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Pending Seller Payouts</div>
                <div className="text-2xl font-bold text-amber-400">{formatPrice(data.overview.totalSellerPayoutsDue)}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Avg Sale Price</div>
                <div className="text-2xl font-bold text-emerald-400">{formatPrice(data.overview.averageSalePrice)}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Cart Abandonment</div>
                <div className="text-2xl font-bold text-red-400">{data.overview.abandonmentRate}%</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Total Users</div>
                <div className="text-2xl font-bold">{data.overview.totalUsers}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Blueprints Listed</div>
                <div className="text-2xl font-bold">{data.overview.totalBlueprints}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Unique Buyers</div>
                <div className="text-2xl font-bold">{data.overview.totalBuyers}</div>
              </div>
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900">
                <div className="text-sm text-slate-400 mb-1">Active Creators</div>
                <div className="text-2xl font-bold">{data.overview.totalCreators}</div>
              </div>
            </div>

            {/* Revenue Over Time Chart */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900">
              <h2 className="font-semibold mb-4">Revenue Over Time</h2>
              {data.revenueOverTime.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No revenue data yet.</p>
              ) : (
                <div>
                  <div className="flex items-end gap-2 h-48 mb-2">
                    {data.revenueOverTime.map((point, i) => {
                      const maxRevenue = Math.max(...data.revenueOverTime.map((p) => p.revenue));
                      const height = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                      const maxSales = Math.max(...data.revenueOverTime.map((p) => p.sales));
                      const salesHeight = maxSales > 0 ? (point.sales / maxSales) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 relative group">
                          <div className="flex gap-0.5 w-full items-end justify-center" style={{ height: "100%" }}>
                            <div
                              className="w-2 rounded-t bg-indigo-500/60 transition-all group-hover:bg-indigo-500"
                              style={{ height: `${Math.max(height, 2)}%` }}
                              title={`${point.month}: ${formatPrice(point.revenue)} revenue`}
                            />
                            <div
                              className="w-2 rounded-t bg-emerald-500/60 transition-all group-hover:bg-emerald-500"
                              style={{ height: `${Math.max(salesHeight, 2)}%` }}
                              title={`${point.month}: ${point.sales} sales`}
                            />
                          </div>
                          <span className="text-[9px] text-slate-500 rotate-45 origin-left whitespace-nowrap">
                            {point.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-indigo-500/60" />
                      <span>Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-emerald-500/60" />
                      <span>Sales</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Growth Table */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900">
              <h2 className="font-semibold mb-4">Category Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-3 py-2 font-medium text-slate-400">Category</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-400">Blueprints</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-400">Sales</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-400">Revenue</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-400">Avg Price</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-400">Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.categoryGrowth.map((cat) => (
                      <tr key={cat.categoryId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="px-3 py-2.5 text-white">
                          {cat.icon} {cat.categoryName}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-300">{cat.blueprintCount}</td>
                        <td className="px-3 py-2.5 text-right text-slate-300">{cat.totalSales}</td>
                        <td className="px-3 py-2.5 text-right text-emerald-400">{formatPrice(cat.totalRevenue)}</td>
                        <td className="px-3 py-2.5 text-right text-slate-300">{formatPrice(cat.avgPrice)}</td>
                        <td className="px-3 py-2.5 text-right text-amber-400">{cat.avgRating.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actionable Insights */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900">
              <h2 className="font-semibold mb-4">Insights & Recommendations</h2>
              <div className="space-y-3">
                {data.categoryGrowth.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <p className="text-sm text-indigo-300">
                      <strong>Top Category:</strong> {data.categoryGrowth[0].categoryName} leads with{" "}
                      {formatPrice(data.categoryGrowth[0].totalRevenue)} in revenue. Consider
                      investing marketing dollars here.
                    </p>
                  </div>
                )}
                {data.revenueOverTime.length >= 2 && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-sm text-emerald-300">
                      <strong>Revenue Trend:</strong>{" "}
                      {data.revenueOverTime[data.revenueOverTime.length - 1].revenue >
                      data.revenueOverTime[data.revenueOverTime.length - 2].revenue
                        ? "Revenue is growing month-over-month. Keep up the momentum!"
                        : "Revenue dipped compared to last month. Consider a promotion or featured listings push."}
                    </p>
                  </div>
                )}
                {data.overview.abandonmentRate > 20 && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-sm text-amber-300">
                      <strong>Cart Abandonment ({data.overview.abandonmentRate}%):</strong>{" "}
                      Above 20% — consider adding an exit-intent discount or simplifying the
                      checkout flow to reduce drop-offs.
                    </p>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400">
                    <strong>Creator Growth:</strong> {data.overview.totalCreators} active creators.
                    Each creator adds an average of{" "}
                    {data.overview.totalCreators > 0
                      ? (data.overview.totalBlueprints / data.overview.totalCreators).toFixed(1)
                      : 0}{" "}
                    blueprints. Recruiting more creators will directly increase catalog depth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
