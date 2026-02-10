import Link from "next/link";
import { Send, Eye, DollarSign, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, getStatusColor, getDueDateStatus } from "@/lib/utils";

interface InvoiceCardProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    issueDate: Date | string;
    dueDate?: Date | string | null;
    total: number;
    amountPaid: number;
    currency: string;
    client: {
      name: string;
    };
  };
  showActions?: boolean;
}

export function InvoiceCard({
  invoice,
  showActions = true,
}: InvoiceCardProps) {
  const dueDateStatus = getDueDateStatus(invoice.dueDate);
  const amountDue = Number(invoice.total) - Number(invoice.amountPaid);

  return (
    <Link href={`/invoices/${invoice.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            {/* Left side - Invoice info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{invoice.invoiceNumber}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {invoice.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-gray-600">{invoice.client.name}</p>
              <p className="text-xs text-gray-500">
                {formatDate(invoice.issueDate)}
                {invoice.dueDate && (
                  <span
                    className={`ml-2 ${dueDateStatus.isOverdue ? "text-red-600 font-medium" : ""}`}
                  >
                    • {dueDateStatus.label}
                  </span>
                )}
              </p>
            </div>

            {/* Right side - Amount */}
            <div className="text-right">
              <p className="text-lg font-bold">
                {formatCurrency(Number(invoice.total), invoice.currency)}
              </p>
              {Number(invoice.amountPaid) > 0 && invoice.status !== "PAID" && (
                <p className="text-sm text-gray-500">
                  Due: {formatCurrency(amountDue, invoice.currency)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
