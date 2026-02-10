import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { InvoiceService } from "@/lib/services/invoice.service";

/**
 * POST /api/invoices/[id]/payment - Record a payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!body.method) {
      return NextResponse.json(
        { success: false, error: "Payment method is required" },
        { status: 400 }
      );
    }

    const invoice = await InvoiceService.recordPayment(params.id, userId, {
      amount: body.amount,
      method: body.method,
      transactionId: body.transactionId,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error("Error recording payment:", error);

    if (error.message === "Invoice not found") {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
