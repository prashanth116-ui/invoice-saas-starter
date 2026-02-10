import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { InvoiceService } from "@/lib/services/invoice.service";
import { getOrCreateUser } from "@/lib/auth";
import type { InvoiceFormData } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/invoices - List invoices
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as any;
    const clientId = searchParams.get("clientId") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const result = await InvoiceService.getAll(userId, {
      status,
      clientId,
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices - Create invoice
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

    // Ensure user exists in database
    await getOrCreateUser();

    const body = (await request.json()) as InvoiceFormData;

    // Validate required fields
    if (!body.clientId || !body.lineItems?.length) {
      return NextResponse.json(
        { success: false, error: "Client and line items are required" },
        { status: 400 }
      );
    }

    const invoice = await InvoiceService.create(userId, body);

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
