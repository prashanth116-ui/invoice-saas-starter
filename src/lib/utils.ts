import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

// Format date
export function formatDate(date: Date | string, format: "short" | "long" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "long") {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Generate invoice number
export function generateInvoiceNumber(prefix: string = "INV", sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(4, "0");
  return `${prefix}-${year}-${paddedSequence}`;
}

// Calculate invoice totals
export function calculateInvoiceTotals(
  lineItems: { quantity: number; unitPrice: number }[],
  taxRate?: number,
  discountAmount?: number
) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const taxAmount = taxRate ? subtotal * (taxRate / 100) : 0;
  const discount = discountAmount || 0;
  const total = subtotal + taxAmount - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SENT: "bg-blue-100 text-blue-800",
    VIEWED: "bg-purple-100 text-purple-800",
    PAID: "bg-green-100 text-green-800",
    PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
    OVERDUE: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  return colors[status] || colors.DRAFT;
}

// Calculate days until due / overdue
export function getDueDateStatus(dueDate: Date | string | null | undefined): {
  label: string;
  isOverdue: boolean;
  daysUntilDue: number;
} {
  if (!dueDate) {
    return { label: "No due date", isOverdue: false, daysUntilDue: 0 };
  }

  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `${Math.abs(diffDays)} days overdue`,
      isOverdue: true,
      daysUntilDue: diffDays,
    };
  } else if (diffDays === 0) {
    return { label: "Due today", isOverdue: false, daysUntilDue: 0 };
  } else if (diffDays === 1) {
    return { label: "Due tomorrow", isOverdue: false, daysUntilDue: 1 };
  } else {
    return {
      label: `Due in ${diffDays} days`,
      isOverdue: false,
      daysUntilDue: diffDays,
    };
  }
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Serialize Prisma data to plain objects (converts Decimal to number)
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_, value) => {
    // Convert Decimal objects to numbers
    if (value !== null && typeof value === 'object' && 'toNumber' in value) {
      return Number(value);
    }
    return value;
  }));
}
