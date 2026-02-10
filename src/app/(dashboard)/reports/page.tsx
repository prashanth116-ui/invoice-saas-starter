import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { InvoiceService } from "@/lib/services/invoice.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ReportsCharts } from "@/components/reports/reports-charts";

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

      {/* Charts */}
      <ReportsCharts />

      {/* Invoice Breakdown (Text) */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.invoiceCount.draft}</p>
              <p className="text-sm text-gray-500">Draft</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.invoiceCount.sent}</p>
              <p className="text-sm text-gray-500">Sent</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.invoiceCount.paid}</p>
              <p className="text-sm text-gray-500">Paid</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.invoiceCount.overdue}</p>
              <p className="text-sm text-gray-500">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
