import { auth, currentUser } from "@clerk/nextjs";
import { db } from "./db";

/**
 * Get the current user's ID from Clerk
 * Throws if not authenticated
 */
export function getAuthUserId(): string {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

/**
 * Get or create a user in our database
 * Syncs Clerk user data to our User table
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  // Try to find existing user
  let user = await db.user.findUnique({
    where: { id: clerkUser.id },
  });

  // Create if doesn't exist
  if (!user) {
    user = await db.user.create({
      data: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
      },
    });
  }

  return user;
}

/**
 * Get current user from database
 * Returns null if not found
 */
export async function getCurrentUser() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  return db.user.findUnique({
    where: { id: userId },
  });
}

/**
 * Require authentication for API routes
 * Returns userId or throws error
 */
export function requireAuth(): string {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}
