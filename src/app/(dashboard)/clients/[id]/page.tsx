import { auth } from "@clerk/nextjs";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building, MapPin, FileText, Edit } from "lucide-react";
import { ClientService } from "@/lib/services/client.service";
import { InvoiceService } from "@/lib/services/invoice.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ClientDetailPageProps {
  params: { id: string };
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const client = await ClientService.getById(params.id, userId);

  if (!client) {
    notFound();
  }

  // Get invoices for this client
  const invoices = await InvoiceService.getAll(userId, { clientId: params.id });

  // Calculate client stats
  const totalInvoiced = invoices.items.reduce((sum, inv) => sum + Number(inv.total), 0);
  const totalPaid = invoices.items
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + Number(inv.total), 0);
  const outstanding = invoices.items
    .filter((inv) => ["SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"].includes(inv.status))
    .reduce((sum, inv) => sum + Number(inv.total) - Number(inv.amountPaid), 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            {client.company && (
              <p className="text-gray-500 mt-1">{client.company}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button size="sm" asChild>
              <Link href={`/invoices/new?clientId=${client.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Total Invoiced</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(outstanding)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No invoices yet</p>
                  <Button asChild size="sm">
                    <Link href={`/invoices/new?clientId=${client.id}`}>
                      Create First Invoice
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.items.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">#{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(invoice.issueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">
                          {formatCurrency(Number(invoice.total))}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.company && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span>{client.company}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          {(client.address || client.city || client.state) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    {client.address && <p>{client.address}</p>}
                    {(client.city || client.state || client.zipCode) && (
                      <p>
                        {[client.city, client.state, client.zipCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {client.country && <p>{client.country}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{client.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Client Since */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Client since</p>
              <p className="font-medium">{formatDate(client.createdAt, "long")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
