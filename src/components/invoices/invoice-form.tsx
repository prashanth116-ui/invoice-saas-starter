"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, calculateInvoiceTotals } from "@/lib/utils";
import type { Client, InvoiceFormData } from "@/types";

// Validation schema
const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Price must be 0 or greater"),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.date(),
  dueDate: z.date().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  taxRate: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
});

type FormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  clients: Client[];
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<InvoiceFormData>;
}

export function InvoiceForm({
  clients,
  onSubmit,
  onCancel,
  defaultValues,
}: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: defaultValues?.clientId || "",
      issueDate: defaultValues?.issueDate || new Date(),
      dueDate: defaultValues?.dueDate,
      lineItems: defaultValues?.lineItems || [
        { description: "", quantity: 1, unitPrice: 0 },
      ],
      taxRate: defaultValues?.taxRate || 0,
      discountAmount: defaultValues?.discountAmount || 0,
      notes: defaultValues?.notes || "",
      terms: defaultValues?.terms || "Payment is due within 30 days.",
      isRecurring: defaultValues?.isRecurring || false,
      recurringInterval: defaultValues?.recurringInterval,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const watchLineItems = watch("lineItems");
  const watchTaxRate = watch("taxRate");
  const watchDiscount = watch("discountAmount");
  const watchIsRecurring = watch("isRecurring");

  // Calculate totals
  const totals = calculateInvoiceTotals(
    watchLineItems || [],
    watchTaxRate,
    watchDiscount
  );

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        lineItems: data.lineItems.map((item) => ({
          ...item,
          amount: item.quantity * item.unitPrice,
        })),
        isRecurring: data.isRecurring,
        recurringInterval: data.isRecurring ? data.recurringInterval : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            {...register("clientId")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a client...</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Issue Date
            </label>
            <input
              type="date"
              {...register("issueDate", { valueAsDate: true })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              {...register("dueDate", { valueAsDate: true })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Line Items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  {...register(`lineItems.${index}.description`)}
                  placeholder="Description"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.lineItems?.[index]?.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lineItems[index]?.description?.message}
                  </p>
                )}
              </div>
              <div className="w-24">
                <input
                  type="number"
                  step="0.01"
                  {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                  placeholder="Qty"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  step="0.01"
                  {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                  placeholder="Price"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="w-32 py-2 text-right font-medium">
                {formatCurrency(
                  (watchLineItems?.[index]?.quantity || 0) *
                    (watchLineItems?.[index]?.unitPrice || 0)
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          ))}
          {errors.lineItems && (
            <p className="text-sm text-red-600">{errors.lineItems.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Tax Rate (%)</span>
              <input
                type="number"
                step="0.01"
                {...register("taxRate", { valueAsNumber: true })}
                className="w-24 rounded-md border border-gray-300 px-3 py-1 text-right focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {totals.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Discount</span>
              <input
                type="number"
                step="0.01"
                {...register("discountAmount", { valueAsNumber: true })}
                className="w-24 rounded-md border border-gray-300 px-3 py-1 text-right focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recurring Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isRecurring"
              {...register("isRecurring")}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
              Make this a recurring invoice
            </label>
          </div>

          {watchIsRecurring && (
            <div className="ml-7 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repeat Every
                </label>
                <select
                  {...register("recurringInterval")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select interval...</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Every 2 Weeks</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly (3 months)</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <p className="text-sm text-gray-500">
                A new invoice will be automatically created based on this schedule.
                The next invoice will be generated after this one is paid or sent.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes & Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (visible to client)
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Thank you for your business!"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Terms & Conditions
            </label>
            <textarea
              {...register("terms")}
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
