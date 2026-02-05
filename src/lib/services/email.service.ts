import { Resend } from "resend";
import type { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "InvoiceFlow";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.EMAIL_FROM || "invoices@example.com";

export class EmailService {
  /**
   * Send invoice to client
   */
  static async sendInvoice(invoice: Invoice, senderName: string): Promise<void> {
    const invoiceUrl = `${APP_URL}/invoice/${invoice.id}`;
    const payUrl = `${APP_URL}/invoice/${invoice.id}/pay`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-box { background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
            .amount { font-size: 32px; font-weight: bold; color: #111; }
            .details { margin: 16px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .btn:hover { background: #1d4ed8; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice from ${senderName}</h1>
            </div>

            <div class="invoice-box">
              <p style="margin: 0 0 8px 0; color: #6b7280;">Amount Due</p>
              <div class="amount">${formatCurrency(invoice.total, invoice.currency)}</div>

              <div class="details">
                <div class="details-row">
                  <span>Invoice #</span>
                  <strong>${invoice.invoiceNumber}</strong>
                </div>
                <div class="details-row">
                  <span>Issue Date</span>
                  <span>${formatDate(invoice.issueDate)}</span>
                </div>
                ${invoice.dueDate ? `
                <div class="details-row">
                  <span>Due Date</span>
                  <span>${formatDate(invoice.dueDate)}</span>
                </div>
                ` : ""}
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${payUrl}" class="btn">Pay Now</a>
              <p style="margin-top: 16px;">
                <a href="${invoiceUrl}" style="color: #2563eb;">View Invoice Details</a>
              </p>
            </div>

            <div class="footer">
              <p>This invoice was sent via ${APP_NAME}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await getResendClient().emails.send({
      from: `${senderName} <${FROM_EMAIL}>`,
      to: invoice.client.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${senderName}`,
      html,
    });
  }

  /**
   * Send payment reminder
   */
  static async sendReminder(
    invoice: Invoice,
    senderName: string,
    template: "friendly" | "firm" | "final" = "friendly"
  ): Promise<void> {
    const invoiceUrl = `${APP_URL}/invoice/${invoice.id}`;
    const payUrl = `${APP_URL}/invoice/${invoice.id}/pay`;

    const templates = {
      friendly: {
        subject: `Friendly reminder: Invoice ${invoice.invoiceNumber} is due soon`,
        heading: "Friendly Reminder",
        message: `Just a quick reminder that invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total, invoice.currency)} is due ${invoice.dueDate ? `on ${formatDate(invoice.dueDate)}` : "soon"}.`,
      },
      firm: {
        subject: `Payment overdue: Invoice ${invoice.invoiceNumber}`,
        heading: "Payment Overdue",
        message: `Invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total, invoice.currency)} is now overdue. Please arrange payment at your earliest convenience.`,
      },
      final: {
        subject: `Final notice: Invoice ${invoice.invoiceNumber}`,
        heading: "Final Notice",
        message: `This is a final reminder that invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.total, invoice.currency)} remains unpaid. Please arrange payment immediately to avoid any disruption.`,
      },
    };

    const t = templates[template];

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { margin-bottom: 24px; }
            .amount { font-size: 24px; font-weight: bold; color: #111; margin: 16px 0; }
            .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .footer { margin-top: 40px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${t.heading}</h2>
            </div>

            <p>Hi ${invoice.client.name},</p>

            <p>${t.message}</p>

            <div class="amount">
              Amount due: ${formatCurrency(invoice.total - invoice.amountPaid, invoice.currency)}
            </div>

            <p>
              <a href="${payUrl}" class="btn">Pay Now</a>
            </p>

            <p style="margin-top: 24px;">
              <a href="${invoiceUrl}">View invoice details</a>
            </p>

            <div class="footer">
              <p>If you've already paid, please disregard this reminder.</p>
              <p>Best regards,<br>${senderName}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await getResendClient().emails.send({
      from: `${senderName} <${FROM_EMAIL}>`,
      to: invoice.client.email,
      subject: t.subject,
      html,
    });
  }

  /**
   * Send payment confirmation
   */
  static async sendPaymentConfirmation(
    invoice: Invoice,
    senderName: string,
    amount: number
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success-box { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 24px; text-align: center; }
            .checkmark { font-size: 48px; margin-bottom: 16px; }
            .amount { font-size: 24px; font-weight: bold; color: #111; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-box">
              <div class="checkmark">✓</div>
              <h2>Payment Received</h2>
              <div class="amount">${formatCurrency(amount, invoice.currency)}</div>
              <p>Thank you for your payment!</p>
            </div>

            <div style="margin-top: 24px;">
              <p><strong>Invoice:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${formatDate(new Date())}</p>
            </div>

            <p style="margin-top: 24px; color: #6b7280;">
              This receipt was sent by ${senderName} via ${APP_NAME}.
            </p>
          </div>
        </body>
      </html>
    `;

    await getResendClient().emails.send({
      from: `${senderName} <${FROM_EMAIL}>`,
      to: invoice.client.email,
      subject: `Payment received for invoice ${invoice.invoiceNumber}`,
      html,
    });
  }
}
