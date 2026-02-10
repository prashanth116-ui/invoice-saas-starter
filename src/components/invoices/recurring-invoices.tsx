"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Play, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types";

const intervalLabels: Record<string, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Every 2 weeks",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

export function RecurringInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices/recurring");
      const data = await response.json();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (error) {
      console.error("Error fetching recurring invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleGenerate = async (invoiceId: string) => {
    setGenerating(invoiceId);
    try {
      const response = await fetch("/api/invoices/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await response.json();
      if (data.success) {
        // Refresh the list
        await fetchInvoices();
        alert(`New invoice created: ${data.data.generated[0]?.invoiceNumber}`);
      } else {
        alert(data.error || "Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice");
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recurring Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recurring Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No recurring invoices</p>
            <p className="text-sm mt-1">
              Create an invoice and enable recurring to automate billing.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Recurring Invoices ({invoices.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="py-4 flex items-center justify-between first:pt-0 last:pb-0"
            >
              <div className="flex-1">
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  #{invoice.invoiceNumber}
                </Link>
                <p className="text-sm text-gray-600">{invoice.client.name}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    {intervalLabels[invoice.recurringInterval || ""] || "Unknown"}
                  </span>
                  {invoice.nextRecurringDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Next: {formatDate(invoice.nextRecurringDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right mr-4">
                <p className="font-medium">{formatCurrency(invoice.total)}</p>
                <p className="text-sm text-gray-500">{invoice.status}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate(invoice.id)}
                disabled={generating === invoice.id}
              >
                {generating === invoice.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Generate Now
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
