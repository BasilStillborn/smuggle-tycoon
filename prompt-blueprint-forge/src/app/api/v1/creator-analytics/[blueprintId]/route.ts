import { NextRequest, NextResponse } from "next/server";
import { getBlueprintById, getTransactions } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blueprintId: string }> }
) {
  try {
    const { blueprintId } = await params;

    const blueprint = getBlueprintById(blueprintId);
    if (!blueprint) {
      return NextResponse.json(
        { error: "Blueprint not found." },
        { status: 404 }
      );
    }

    const allTransactions = getTransactions();
    const bpTransactions = allTransactions.filter(
      (t) => t.blueprintId === blueprintId && t.status === "success"
    );

    const totalSales = bpTransactions.length;
    const totalRevenue = bpTransactions.reduce((sum, t) => sum + t.amountPaid, 0);
    const totalPlatformFees = bpTransactions.reduce((sum, t) => sum + t.platformFeeAmount, 0);
    const totalSellerRevenue = bpTransactions.reduce((sum, t) => sum + t.sellerNetRevenue, 0);

    const byMonth: Record<string, { sales: number; revenue: number }> = {};
    for (const t of bpTransactions) {
      const month = t.timestamp.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { sales: 0, revenue: 0 };
      byMonth[month].sales += 1;
      byMonth[month].revenue += t.amountPaid;
    }

    const salesOverTime = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));

    const buyers = [...new Set(bpTransactions.map((t) => t.buyerId))];
    const repeatBuyers = buyers.filter((b) => bpTransactions.filter((t) => t.buyerId === b).length > 1);

    return NextResponse.json({
      blueprintId,
      blueprintTitle: blueprint.title,
      totalSales,
      totalRevenue,
      totalPlatformFees,
      totalSellerRevenue,
      averagePrice: totalSales > 0 ? totalRevenue / totalSales : 0,
      uniqueBuyers: buyers.length,
      repeatBuyers: repeatBuyers.length,
      salesOverTime,
      lastSale: bpTransactions.length > 0
        ? bpTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp
        : null,
    });
  } catch (error) {
    console.error("Creator analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
