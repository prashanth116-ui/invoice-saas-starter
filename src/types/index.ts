// Core Types for Invoice SaaS

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentMethod =
  | "STRIPE"
  | "PAYPAL"
  | "BANK_TRANSFER"
  | "CASH"
  | "CHECK"
  | "OTHER";

export type RecurringInterval =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

// Client
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country: string;
  notes?: string | null;
  createdAt: Date;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
}

// Line Item
export interface LineItem {
  id?: string;
  description: string;
  quantity: number | any; // Prisma Decimal
  unitPrice: number | any; // Prisma Decimal
  amount: number | any; // Prisma Decimal
}

// Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  client: Client;
  clientId: string;
  issueDate: Date;
  dueDate?: Date | null;
  lineItems: LineItem[];
  subtotal: number;
  taxRate?: number | null;
  taxAmount?: number | null;
  discountAmount?: number | null;
  total: number;
  amountPaid: number;
  currency: string;
  notes?: string | null;
  terms?: string | null;
  sentAt?: Date | null;
  viewedAt?: Date | null;
  paidAt?: Date | null;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval | null;
  createdAt: Date;
  activities?: InvoiceActivity[];
}

export interface InvoiceFormData {
  clientId: string;
  issueDate: Date;
  dueDate?: Date;
  lineItems: Omit<LineItem, "id">[];
  taxRate?: number;
  discountAmount?: number;
  notes?: string;
  terms?: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
}

// Payment
export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  notes?: string;
  paidAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  paidThisMonth: number;
  invoiceCount: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };
  recentInvoices: any[]; // Prisma returns with Decimal types
}

// Invoice Activity
export interface InvoiceActivity {
  id: string;
  action: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
