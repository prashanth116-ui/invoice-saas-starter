"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SendInvoiceButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  clientEmail: string;
}

export function SendInvoiceButton({
  invoiceId,
  invoiceNumber,
  clientEmail,
}: SendInvoiceButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!confirm(`Send invoice ${invoiceNumber} to ${clientEmail}?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(result.error || "Failed to send invoice");
      }
    } catch (err) {
      setError("Failed to send invoice");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Mail className="mr-2 h-4 w-4" />
        Sent
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSend}
        disabled={isLoading}
      >
        <Mail className="mr-2 h-4 w-4" />
        {isLoading ? "Sending..." : "Send"}
      </Button>
      {error && (
        <div className="absolute top-full mt-1 right-0 bg-red-50 border border-red-200 rounded p-2 text-red-600 text-xs whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
