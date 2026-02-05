"use client";

import { MoreVertical, Send, Eye, DollarSign, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, getStatusColor, getDueDateStatus } from "@/lib/utils";
import type { Invoice } from "@/types";

interface InvoiceCardProps {
  invoice: Invoice;
  onSend?: (id: string) => void;
  onView?: (id: string) => void;
  onRecordPayment?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function InvoiceCard({
  invoice,
  onSend,
  onView,
  onRecordPayment,
  onDelete,
}: InvoiceCardProps) {
  const dueDateStatus = getDueDateStatus(invoice.dueDate);
  const amountDue = invoice.total - invoice.amountPaid;

  return (
    <Card className="hover:shadow-md transition-shadow">
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

          {/* Right side - Amount & Actions */}
          <div className="text-right">
            <p className="text-lg font-bold">
              {formatCurrency(invoice.total, invoice.currency)}
            </p>
            {invoice.amountPaid > 0 && invoice.status !== "PAID" && (
              <p className="text-sm text-gray-500">
                Due: {formatCurrency(amountDue, invoice.currency)}
              </p>
            )}

            {/* Quick Actions */}
            <div className="mt-2 flex items-center justify-end gap-1">
              {invoice.status === "DRAFT" && onSend && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSend(invoice.id)}
                  title="Send invoice"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(invoice.id)}
                  title="View invoice"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {invoice.status !== "PAID" && onRecordPayment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRecordPayment(invoice.id)}
                  title="Record payment"
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              )}
              {invoice.status === "DRAFT" && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(invoice.id)}
                  title="Delete invoice"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
