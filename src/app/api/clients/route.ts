import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { ClientService } from "@/lib/services/client.service";
import { getOrCreateUser } from "@/lib/auth";
import type { ClientFormData } from "@/types";

/**
 * GET /api/clients - List clients
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
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    const result = await ClientService.getAll(userId, {
      search,
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients - Create client
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

    const body = (await request.json()) as ClientFormData;

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const client = await ClientService.create(userId, body);

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating client:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A client with this email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create client" },
      { status: 500 }
    );
  }
}
