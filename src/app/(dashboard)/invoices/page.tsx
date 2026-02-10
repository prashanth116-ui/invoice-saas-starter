import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { InvoiceService } from "@/lib/services/invoice.service";
import { InvoiceCard } from "@/components/invoices/invoice-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  page?: string;
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const status = searchParams.status as any;
  const page = parseInt(searchParams.page || "1");

  const result = await InvoiceService.getAll(userId, {
    status,
    page,
    pageSize: 20,
  });

  const statuses = [
    { value: undefined, label: "All" },
    { value: "DRAFT", label: "Draft" },
    { value: "SENT", label: "Sent" },
    { value: "VIEWED", label: "Viewed" },
    { value: "PAID", label: "Paid" },
    { value: "OVERDUE", label: "Overdue" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all your invoices
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {statuses.map((s) => (
            <Link
              key={s.label}
              href={s.value ? `/invoices?status=${s.value}` : "/invoices"}
            >
              <Button
                variant={status === s.value || (!status && !s.value) ? "default" : "outline"}
                size="sm"
              >
                {s.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      {result.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              {status
                ? `No ${status.toLowerCase()} invoices found`
                : "No invoices yet"}
            </p>
            <Button asChild>
              <Link href="/invoices/new">Create your first invoice</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {result.items.map((invoice: any) => (
            <InvoiceCard
              key={invoice.id}
              invoice={{
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                status: invoice.status,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,
                total: Number(invoice.total),
                amountPaid: Number(invoice.amountPaid),
                currency: invoice.currency,
                client: { name: invoice.client.name },
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/invoices?page=${page - 1}${status ? `&status=${status}` : ""}`}
            >
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Page {page} of {result.totalPages}
          </span>
          {page < result.totalPages && (
            <Link
              href={`/invoices?page=${page + 1}${status ? `&status=${status}` : ""}`}
            >
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
