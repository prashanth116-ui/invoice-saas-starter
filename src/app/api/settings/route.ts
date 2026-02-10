import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import type { UserSettings } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings - Get user settings
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

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        companyName: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        phone: true,
        taxId: true,
        currency: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings - Update user settings
 */
export async function PUT(request: NextRequest) {
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

    const body = (await request.json()) as UserSettings;

    // Validate currency if provided
    const validCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD"];
    if (body.currency && !validCurrencies.includes(body.currency)) {
      return NextResponse.json(
        { success: false, error: "Invalid currency" },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        companyName: body.companyName,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country,
        phone: body.phone,
        taxId: body.taxId,
        currency: body.currency,
      },
      select: {
        companyName: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        phone: true,
        taxId: true,
        currency: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
