import { auth } from "@clerk/nextjs";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, MoreHorizontal } from "lucide-react";
import { InvoiceService } from "@/lib/services/invoice.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { RecordPaymentButton } from "@/components/invoices/record-payment-button";
import { SendInvoiceButton } from "@/components/invoices/send-invoice-button";

interface InvoiceDetailPageProps {
  params: { id: string };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const invoice = await InvoiceService.getById(params.id, userId);

  if (!invoice) {
    notFound();
  }

  const statusColors = getStatusColor(invoice.status);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
            <p className="text-gray-500 mt-1">
              Created {formatDate(invoice.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors}`}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
            <SendInvoiceButton
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoiceNumber}
              clientEmail={invoice.client.email}
            />
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Invoice Preview Card */}
          <Card>
            <CardContent className="pt-6">
              {/* Header */}
              <div className="flex justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Issue Date</p>
                  <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                  {invoice.dueDate && (
                    <>
                      <p className="text-sm text-gray-600 mt-2">Due Date</p>
                      <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Client Info */}
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-1">Bill To</p>
                <p className="font-semibold">{invoice.client.name}</p>
                {invoice.client.company && (
                  <p className="text-gray-600">{invoice.client.company}</p>
                )}
                <p className="text-gray-600">{invoice.client.email}</p>
                {invoice.client.address && (
                  <p className="text-gray-600">{invoice.client.address}</p>
                )}
              </div>

              {/* Line Items */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Qty</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Price</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {(invoice.taxAmount ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
                      <span>{formatCurrency(Number(invoice.taxAmount))}</span>
                    </div>
                  )}
                  {(invoice.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span>-{formatCurrency(Number(invoice.discountAmount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">{formatCurrency(invoice.total)}</span>
                  </div>
                  {Number(invoice.amountPaid) > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Amount Paid</span>
                        <span>-{formatCurrency(Number(invoice.amountPaid))}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Amount Due</span>
                        <span className="font-semibold">
                          {formatCurrency(Number(invoice.total) - Number(invoice.amountPaid))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes & Terms */}
              {(invoice.notes || invoice.terms) && (
                <div className="mt-8 pt-8 border-t">
                  {invoice.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">Notes</p>
                      <p className="text-gray-800">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Terms & Conditions</p>
                      <p className="text-gray-800 text-sm">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid</span>
                  <span className="text-green-600">{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Balance Due</span>
                  <span className="font-bold">
                    {formatCurrency(invoice.total - invoice.amountPaid)}
                  </span>
                </div>
              </div>
              {invoice.status !== "PAID" && (
                <RecordPaymentButton
                  invoiceId={invoice.id}
                  balanceDue={Number(invoice.total) - Number(invoice.amountPaid)}
                  currency={invoice.currency}
                />
              )}
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{invoice.client.name}</p>
              {invoice.client.company && (
                <p className="text-gray-600 text-sm">{invoice.client.company}</p>
              )}
              <p className="text-gray-600 text-sm mt-2">{invoice.client.email}</p>
              {invoice.client.phone && (
                <p className="text-gray-600 text-sm">{invoice.client.phone}</p>
              )}
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href={`/clients/${invoice.client.id}`}>View Client</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.activities && invoice.activities.length > 0 ? (
                  invoice.activities.map((activity) => (
                    <div key={activity.id} className="text-sm">
                      <p className="text-gray-800">{activity.description}</p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
