import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceService } from "@/lib/services/invoice.service";
import { getCurrentUser } from "@/lib/auth";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";

export const dynamic = "force-dynamic";

/**
 * GET /api/invoices/[id]/pdf - Generate PDF for invoice
 */
export async function GET(
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

    const [invoice, user] = await Promise.all([
      InvoiceService.getById(params.id, userId),
      getCurrentUser(),
    ]);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Build company address string
    const addressParts = [
      user?.address,
      [user?.city, user?.state, user?.zipCode].filter(Boolean).join(", "),
    ].filter(Boolean);

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      InvoicePDF({
        invoice,
        companyName: user?.companyName || undefined,
        companyAddress: addressParts.join("\n") || undefined,
      }) as any
    );

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
