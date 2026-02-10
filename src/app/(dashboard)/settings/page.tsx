import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { SettingsForm } from "@/components/settings/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getCurrentUser();
  const clerkUser = await currentUser();
  const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings Form */}
      <SettingsForm
        initialSettings={user ? {
          companyName: user.companyName || undefined,
          address: user.address || undefined,
          city: user.city || undefined,
          state: user.state || undefined,
          zipCode: user.zipCode || undefined,
          country: user.country || undefined,
          phone: user.phone || undefined,
          taxId: user.taxId || undefined,
          currency: user.currency || undefined,
        } : null}
        userEmail={userEmail}
      />

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-4 border-b">
            <div>
              <h4 className="font-medium">Stripe</h4>
              <p className="text-sm text-gray-500">Accept credit card payments</p>
            </div>
            <span className="text-sm text-gray-500">Not connected</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <h4 className="font-medium">PayPal</h4>
              <p className="text-sm text-gray-500">Accept PayPal payments</p>
            </div>
            <span className="text-sm text-gray-500">Coming soon</span>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
