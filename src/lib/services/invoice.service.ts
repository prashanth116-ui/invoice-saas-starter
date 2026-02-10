import { db } from "@/lib/db";
import { generateInvoiceNumber, calculateInvoiceTotals, serialize } from "@/lib/utils";
import type { InvoiceFormData, Invoice, InvoiceStatus, RecurringInterval } from "@/types";

/**
 * Calculate next recurring date based on interval
 */
function calculateNextRecurringDate(
  fromDate: Date,
  interval: RecurringInterval
): Date {
  const next = new Date(fromDate);

  switch (interval) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "BIWEEKLY":
      next.setDate(next.getDate() + 14);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

export class InvoiceService {
  /**
   * Create a new invoice
   */
  static async create(userId: string, data: InvoiceFormData): Promise<Invoice> {
    // Get next invoice number
    const lastInvoice = await db.invoice.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });

    const sequence = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0") + 1
      : 1;

    const invoiceNumber = generateInvoiceNumber("INV", sequence);

    // Calculate totals
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(
      data.lineItems,
      data.taxRate,
      data.discountAmount
    );

    // Calculate next recurring date if recurring
    const nextRecurringDate =
      data.isRecurring && data.recurringInterval
        ? calculateNextRecurringDate(data.issueDate, data.recurringInterval)
        : null;

    // Create invoice with line items
    const invoice = await db.invoice.create({
      data: {
        userId,
        clientId: data.clientId,
        invoiceNumber,
        status: "DRAFT",
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        subtotal,
        taxRate: data.taxRate,
        taxAmount,
        discountAmount: data.discountAmount,
        total,
        notes: data.notes,
        terms: data.terms,
        isRecurring: data.isRecurring || false,
        recurringInterval: data.recurringInterval,
        nextRecurringDate,
        lineItems: {
          create: data.lineItems.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            sortOrder: index,
          })),
        },
        activities: {
          create: {
            action: "CREATED",
          },
        },
      },
      include: {
        client: true,
        lineItems: true,
      },
    });

    return serialize(invoice) as unknown as Invoice;
  }

  /**
   * Get invoice by ID
   */
  static async getById(invoiceId: string, userId: string): Promise<Invoice | null> {
    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        client: true,
        lineItems: {
          orderBy: { sortOrder: "asc" },
        },
        payments: true,
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return serialize(invoice) as unknown as Invoice;
  }

  /**
   * Get all invoices for a user
   */
  static async getAll(
    userId: string,
    options?: {
      status?: InvoiceStatus;
      clientId?: string;
      page?: number;
      pageSize?: number;
    }
  ) {
    const { status, clientId, page = 1, pageSize = 20 } = options || {};

    const where = {
      userId,
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          client: true,
          lineItems: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.invoice.count({ where }),
    ]);

    return serialize({
      items: invoices,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }

  /**
   * Update invoice status
   */
  static async updateStatus(
    invoiceId: string,
    userId: string,
    status: InvoiceStatus
  ): Promise<Invoice> {
    const updateData: any = { status };

    if (status === "SENT") {
      updateData.sentAt = new Date();
    } else if (status === "VIEWED") {
      updateData.viewedAt = new Date();
    } else if (status === "PAID") {
      updateData.paidAt = new Date();
    }

    const invoice = await db.invoice.update({
      where: {
        id: invoiceId,
        userId,
      },
      data: {
        ...updateData,
        activities: {
          create: {
            action: status === "SENT" ? "SENT" : status === "PAID" ? "MARKED_PAID" : "UPDATED",
          },
        },
      },
      include: {
        client: true,
        lineItems: true,
      },
    });

    return serialize(invoice) as unknown as Invoice;
  }

  /**
   * Record a payment
   */
  static async recordPayment(
    invoiceId: string,
    userId: string,
    payment: {
      amount: number;
      method: string;
      transactionId?: string;
      notes?: string;
    }
  ): Promise<Invoice> {
    // Get current invoice
    const invoice = await db.invoice.findFirst({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const newAmountPaid = Number(invoice.amountPaid) + payment.amount;
    const isPaid = newAmountPaid >= Number(invoice.total);

    // Create payment and update invoice
    await db.payment.create({
      data: {
        invoiceId,
        amount: payment.amount,
        method: payment.method as any,
        transactionId: payment.transactionId,
        notes: payment.notes,
      },
    });

    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        status: isPaid ? "PAID" : "PARTIALLY_PAID",
        paidAt: isPaid ? new Date() : undefined,
        activities: {
          create: {
            action: "PAYMENT_RECEIVED",
            metadata: { amount: payment.amount, method: payment.method },
          },
        },
      },
      include: {
        client: true,
        lineItems: true,
        payments: true,
      },
    });

    return serialize(updatedInvoice) as unknown as Invoice;
  }

  /**
   * Get dashboard stats
   */
  static async getDashboardStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRevenue,
      outstandingInvoices,
      overdueInvoices,
      paidThisMonth,
      statusCounts,
      recentInvoices,
    ] = await Promise.all([
      // Total revenue (all paid invoices)
      db.invoice.aggregate({
        where: { userId, status: "PAID" },
        _sum: { total: true },
      }),

      // Outstanding (sent, viewed, partially paid)
      db.invoice.aggregate({
        where: {
          userId,
          status: { in: ["SENT", "VIEWED", "PARTIALLY_PAID"] },
        },
        _sum: { total: true },
      }),

      // Overdue
      db.invoice.aggregate({
        where: {
          userId,
          status: "OVERDUE",
        },
        _sum: { total: true },
      }),

      // Paid this month
      db.invoice.aggregate({
        where: {
          userId,
          status: "PAID",
          paidAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),

      // Status counts
      db.invoice.groupBy({
        by: ["status"],
        where: { userId },
        _count: { status: true },
      }),

      // Recent invoices
      db.invoice.findMany({
        where: { userId },
        include: { client: true, lineItems: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const countsByStatus = statusCounts.reduce(
      (acc, curr) => {
        const key = curr.status.toLowerCase() as keyof typeof acc;
        if (key in acc) {
          acc[key] = curr._count.status;
        }
        return acc;
      },
      { draft: 0, sent: 0, paid: 0, overdue: 0 }
    );

    return {
      totalRevenue: Number(totalRevenue._sum.total) || 0,
      outstandingAmount: Number(outstandingInvoices._sum.total) || 0,
      overdueAmount: Number(overdueInvoices._sum.total) || 0,
      paidThisMonth: Number(paidThisMonth._sum.total) || 0,
      invoiceCount: countsByStatus,
      recentInvoices: serialize(recentInvoices),
    };
  }

  /**
   * Delete invoice
   */
  static async delete(invoiceId: string, userId: string): Promise<void> {
    await db.invoice.delete({
      where: {
        id: invoiceId,
        userId,
      },
    });
  }

  /**
   * Get monthly revenue data for charts (last 6 months)
   */
  static async getMonthlyRevenue(userId: string) {
    const months: { month: string; revenue: number; invoices: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [revenue, count] = await Promise.all([
        db.invoice.aggregate({
          where: {
            userId,
            status: "PAID",
            paidAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: { total: true },
        }),
        db.invoice.count({
          where: {
            userId,
            status: "PAID",
            paidAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        }),
      ]);

      const monthName = startOfMonth.toLocaleDateString("en-US", { month: "short" });

      months.push({
        month: monthName,
        revenue: Number(revenue._sum.total) || 0,
        invoices: count,
      });
    }

    return months;
  }

  /**
   * Get revenue by client for charts
   */
  static async getRevenueByClient(userId: string) {
    const clientRevenue = await db.invoice.groupBy({
      by: ["clientId"],
      where: {
        userId,
        status: "PAID",
      },
      _sum: { total: true },
      _count: { id: true },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 5,
    });

    // Get client names
    const clientIds = clientRevenue.map((c) => c.clientId);
    const clients = await db.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true },
    });

    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    return clientRevenue.map((cr) => ({
      name: clientMap.get(cr.clientId) || "Unknown",
      revenue: Number(cr._sum.total) || 0,
      invoices: cr._count.id,
    }));
  }

  /**
   * Get all recurring invoices for a user
   */
  static async getRecurringInvoices(userId: string) {
    const invoices = await db.invoice.findMany({
      where: {
        userId,
        isRecurring: true,
      },
      include: {
        client: true,
        lineItems: true,
      },
      orderBy: { nextRecurringDate: "asc" },
    });

    return serialize(invoices);
  }

  /**
   * Get recurring invoices that are due to be generated
   */
  static async getDueRecurringInvoices(userId?: string) {
    const now = new Date();

    const where: any = {
      isRecurring: true,
      nextRecurringDate: { lte: now },
      status: { in: ["PAID", "SENT"] }, // Only generate from sent or paid invoices
    };

    if (userId) {
      where.userId = userId;
    }

    const invoices = await db.invoice.findMany({
      where,
      include: {
        client: true,
        lineItems: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return serialize(invoices);
  }

  /**
   * Generate next invoice from a recurring invoice
   */
  static async generateFromRecurring(
    sourceInvoiceId: string,
    userId: string
  ): Promise<Invoice> {
    // Get the source invoice
    const source = await db.invoice.findFirst({
      where: {
        id: sourceInvoiceId,
        userId,
        isRecurring: true,
      },
      include: {
        lineItems: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!source) {
      throw new Error("Recurring invoice not found");
    }

    if (!source.recurringInterval) {
      throw new Error("Invoice has no recurring interval set");
    }

    // Get next invoice number
    const lastInvoice = await db.invoice.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });

    const sequence = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0") + 1
      : 1;

    const invoiceNumber = generateInvoiceNumber("INV", sequence);

    // Calculate new dates
    const issueDate = new Date();
    const dueDate = source.dueDate
      ? new Date(
          issueDate.getTime() +
            (new Date(source.dueDate).getTime() -
              new Date(source.issueDate).getTime())
        )
      : null;

    const nextRecurringDate = calculateNextRecurringDate(
      issueDate,
      source.recurringInterval as RecurringInterval
    );

    // Create new invoice
    const newInvoice = await db.invoice.create({
      data: {
        userId,
        clientId: source.clientId,
        invoiceNumber,
        status: "DRAFT",
        issueDate,
        dueDate,
        subtotal: source.subtotal,
        taxRate: source.taxRate,
        taxAmount: source.taxAmount,
        discountAmount: source.discountAmount,
        total: source.total,
        notes: source.notes,
        terms: source.terms,
        isRecurring: true,
        recurringInterval: source.recurringInterval,
        nextRecurringDate,
        lineItems: {
          create: source.lineItems.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            sortOrder: index,
          })),
        },
        activities: {
          create: {
            action: "CREATED",
            metadata: { generatedFrom: sourceInvoiceId },
          },
        },
      },
      include: {
        client: true,
        lineItems: true,
      },
    });

    // Update source invoice to remove next recurring date
    // (it's been "used" to generate the new one)
    await db.invoice.update({
      where: { id: sourceInvoiceId },
      data: { nextRecurringDate: null },
    });

    return serialize(newInvoice) as unknown as Invoice;
  }

  /**
   * Toggle recurring status for an invoice
   */
  static async toggleRecurring(
    invoiceId: string,
    userId: string,
    isRecurring: boolean,
    recurringInterval?: RecurringInterval
  ): Promise<Invoice> {
    const invoice = await db.invoice.findFirst({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const nextRecurringDate =
      isRecurring && recurringInterval
        ? calculateNextRecurringDate(new Date(invoice.issueDate), recurringInterval)
        : null;

    const updated = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        isRecurring,
        recurringInterval: isRecurring ? recurringInterval : null,
        nextRecurringDate,
      },
      include: {
        client: true,
        lineItems: true,
      },
    });

    return serialize(updated) as unknown as Invoice;
  }
}
