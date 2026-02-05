"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { Button } from "@/components/ui/button";
import type { Client, InvoiceFormData } from "@/types";

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch("/api/clients");
        const data = await response.json();

        if (data.success) {
          setClients(data.data.items);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to load clients");
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/invoices/${result.data.id}`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to create invoice");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details below to create a new invoice
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      {/* No Clients Warning */}
      {clients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 mb-4">
            You need to add a client before creating an invoice
          </p>
          <Button asChild>
            <Link href="/clients/new">Add Your First Client</Link>
          </Button>
        </div>
      ) : (
        <InvoiceForm
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/invoices")}
        />
      )}
    </div>
  );
}
