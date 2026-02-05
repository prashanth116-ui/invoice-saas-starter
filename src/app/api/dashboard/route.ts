import { NextRequest, NextResponse } from "next/server";
import { InvoiceService } from "@/lib/services/invoice.service";

// TODO: Replace with actual auth
const getUserId = () => "user_demo";

/**
 * GET /api/dashboard - Get dashboard stats
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId();
    const stats = await InvoiceService.getDashboardStats(userId);

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
