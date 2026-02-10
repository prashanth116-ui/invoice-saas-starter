import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { InvoiceService } from "@/lib/services/invoice.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const stats = await InvoiceService.getDashboardStats(userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-500 mt-1">Overview of your revenue and invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paid This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.paidThisMonth)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.invoiceCount.paid} invoices paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.outstandingAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.invoiceCount.sent} invoices pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.overdueAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.invoiceCount.overdue} invoices overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span>Draft</span>
              </div>
              <span className="font-medium">{stats.invoiceCount.draft}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Sent</span>
              </div>
              <span className="font-medium">{stats.invoiceCount.sent}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Paid</span>
              </div>
              <span className="font-medium">{stats.invoiceCount.paid}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Overdue</span>
              </div>
              <span className="font-medium">{stats.invoiceCount.overdue}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">
            More detailed reports and charts coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
