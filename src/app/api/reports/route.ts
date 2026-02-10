import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { InvoiceService } from "@/lib/services/invoice.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/reports - Get chart data for reports
 */
export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [monthlyRevenue, revenueByClient, stats] = await Promise.all([
      InvoiceService.getMonthlyRevenue(userId),
      InvoiceService.getRevenueByClient(userId),
      InvoiceService.getDashboardStats(userId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        monthlyRevenue,
        revenueByClient,
        statusBreakdown: [
          { name: "Draft", value: stats.invoiceCount.draft, color: "#9CA3AF" },
          { name: "Sent", value: stats.invoiceCount.sent, color: "#3B82F6" },
          { name: "Paid", value: stats.invoiceCount.paid, color: "#22C55E" },
          { name: "Overdue", value: stats.invoiceCount.overdue, color: "#EF4444" },
        ],
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
