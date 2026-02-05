import { NextRequest, NextResponse } from "next/server";
import { InvoiceService } from "@/lib/services/invoice.service";
import { StripeService } from "@/lib/services/stripe.service";

// TODO: Replace with actual auth
const getUserId = () => "user_demo";

/**
 * POST /api/invoices/[id]/pay - Create payment session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();

    // Get invoice
    const invoice = await InvoiceService.getById(params.id, userId);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Check if already paid
    if (invoice.status === "PAID") {
      return NextResponse.json(
        { success: false, error: "Invoice is already paid" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutUrl = await StripeService.createCheckoutSession(invoice);

    return NextResponse.json({ success: true, data: { url: checkoutUrl } });
  } catch (error) {
    console.error("Error creating payment session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/invoices/[id]/pay - Record manual payment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserId();
    const body = await request.json();

    const { amount, method, transactionId, notes } = body;

    if (!amount || !method) {
      return NextResponse.json(
        { success: false, error: "Amount and method are required" },
        { status: 400 }
      );
    }

    const invoice = await InvoiceService.recordPayment(params.id, userId, {
      amount,
      method,
      transactionId,
      notes,
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
