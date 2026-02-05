import { NextRequest, NextResponse } from "next/server";
import { InvoiceService } from "@/lib/services/invoice.service";
import { EmailService } from "@/lib/services/email.service";
import { db } from "@/lib/db";

// TODO: Replace with actual auth
const getUserId = () => "user_demo";

/**
 * POST /api/invoices/[id]/send - Send invoice to client
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

    // Get user for sender name
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, companyName: true },
    });

    const senderName = user?.companyName || user?.name || "Your Business";

    // Send email
    await EmailService.sendInvoice(invoice, senderName);

    // Update status to SENT
    const updatedInvoice = await InvoiceService.updateStatus(
      params.id,
      userId,
      "SENT"
    );

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send invoice" },
      { status: 500 }
    );
  }
}
