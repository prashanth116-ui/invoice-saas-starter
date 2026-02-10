import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { InvoiceService } from "@/lib/services/invoice.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/invoices/recurring - Get all recurring invoices
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

    const invoices = await InvoiceService.getRecurringInvoices(userId);

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching recurring invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recurring invoices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices/recurring - Generate due recurring invoices
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { invoiceId } = body;

    // If specific invoice ID provided, generate from that one
    if (invoiceId) {
      const newInvoice = await InvoiceService.generateFromRecurring(
        invoiceId,
        userId
      );
      return NextResponse.json({
        success: true,
        data: { generated: [newInvoice] },
      });
    }

    // Otherwise, generate all due recurring invoices
    const dueInvoices = await InvoiceService.getDueRecurringInvoices(userId);
    const generated = [];

    for (const invoice of dueInvoices as any[]) {
      try {
        const newInvoice = await InvoiceService.generateFromRecurring(
          invoice.id,
          userId
        );
        generated.push(newInvoice);
      } catch (error) {
        console.error(`Failed to generate from invoice ${invoice.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        generated,
        count: generated.length,
      },
    });
  } catch (error) {
    console.error("Error generating recurring invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate recurring invoices" },
      { status: 500 }
    );
  }
}
