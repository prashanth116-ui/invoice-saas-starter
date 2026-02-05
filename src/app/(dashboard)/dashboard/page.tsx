import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { InvoiceService } from "@/lib/services/invoice.service";
import { getOrCreateUser } from "@/lib/auth";
import { DashboardStatsCards } from "@/components/invoices/dashboard-stats";
import { InvoiceCard } from "@/components/invoices/invoice-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Ensure user exists in database
  await getOrCreateUser();

  // Get dashboard stats
  const stats = await InvoiceService.getDashboardStats(userId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of your invoicing activity
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards stats={stats} />

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/invoices">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No invoices yet</p>
              <Button asChild>
                <Link href="/invoices/new">Create your first invoice</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentInvoices.map((invoice: any) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onView={(id) => `/invoices/${id}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Create Invoice"
          description="Send a new invoice to a client"
          href="/invoices/new"
        />
        <QuickActionCard
          title="Add Client"
          description="Add a new client to your list"
          href="/clients/new"
        />
        <QuickActionCard
          title="View Reports"
          description="See your revenue analytics"
          href="/reports"
        />
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
