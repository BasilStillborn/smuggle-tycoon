import { NextRequest, NextResponse } from "next/server";
import { getUserById, getApprovedBlueprints, getTransactions, getCategories, getSellerPayouts, getUsers } from "@/lib/data";

const ADMIN_EMAIL = "admin@promptforge.com";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json(
        { error: "adminId is required" },
        { status: 400 }
      );
    }

    const admin = getUserById(adminId);
    if (!admin || admin.role !== "admin" || admin.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized. Only platform admins can access analytics." },
        { status: 403 }
      );
    }

    const blueprints = getApprovedBlueprints();
    const categories = getCategories();
    const allTransactions = getTransactions();
    const successfulTxns = allTransactions.filter((t) => t.status === "success");
    const payouts = getSellerPayouts();
    const allUsers = getUsers();

    // Category growth trends
    const categoryStats = categories.map((cat) => {
      const catBps = blueprints.filter((bp) => bp.categoryId === cat.id);
      const catSales = catBps.reduce((sum, bp) => sum + bp.sales, 0);
      const catRevenue = catBps.reduce((sum, bp) => sum + bp.price * bp.sales, 0);
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        icon: cat.icon,
        blueprintCount: catBps.length,
        totalSales: catSales,
        totalRevenue: catRevenue,
        avgPrice: catBps.length > 0 ? catBps.reduce((s, b) => s + b.price, 0) / catBps.length : 0,
        avgRating: catBps.length > 0 ? catBps.reduce((s, b) => s + b.rating, 0) / catBps.length : 0,
      };
    });

    // Transaction trends (monthly)
    const monthlyRevenue: Record<string, { sales: number; revenue: number; fees: number }> = {};
    for (const txn of successfulTxns) {
      const month = txn.timestamp.slice(0, 7);
      if (!monthlyRevenue[month]) {
        monthlyRevenue[month] = { sales: 0, revenue: 0, fees: 0 };
      }
      monthlyRevenue[month].sales += 1;
      monthlyRevenue[month].revenue += txn.amountPaid;
      monthlyRevenue[month].fees += txn.platformFeeAmount;
    }

    const revenueOverTime = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));

    // Platform overview
    const totalPlatformRevenue = successfulTxns.reduce((sum, t) => sum + t.platformFeeAmount, 0);
    const totalSellerPayoutsDue = payouts
      .filter((p) => p.status === "pending_payout")
      .reduce((sum, p) => sum + p.netAmount, 0);
    const totalBuyers = new Set(successfulTxns.map((t) => t.buyerId)).size;
    const totalCreators = allUsers.filter((u) => u.role === "creator").length;
    const averageSalePrice = successfulTxns.length > 0
      ? successfulTxns.reduce((s, t) => s + t.amountPaid, 0) / successfulTxns.length
      : 0;

    // Cart abandonment rough estimate (transactions started vs completed)
    const failedTxns = allTransactions.filter((t) => t.status === "failed").length;
    const abandonmentRate = allTransactions.length > 0
      ? Math.round((failedTxns / allTransactions.length) * 100)
      : 0;

    return NextResponse.json({
      overview: {
        totalBlueprints: blueprints.length,
        totalTransactions: successfulTxns.length,
        totalPlatformRevenue,
        totalSellerPayoutsDue,
        totalBuyers,
        totalCreators,
        averageSalePrice,
        totalUsers: allUsers.length,
        abandonmentRate,
      },
      categoryGrowth: categoryStats.sort((a, b) => b.totalRevenue - a.totalRevenue),
      revenueOverTime,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
