import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Invoice } from "@/types";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  headerRight: {
    textAlign: "right",
  },
  label: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#111827",
  },
  section: {
    marginBottom: 24,
  },
  billTo: {
    marginBottom: 24,
  },
  clientName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  clientInfo: {
    fontSize: 10,
    color: "#4B5563",
    marginBottom: 2,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 10,
    color: "#111827",
  },
  descriptionCol: {
    flex: 3,
  },
  qtyCol: {
    flex: 1,
    textAlign: "right",
  },
  priceCol: {
    flex: 1,
    textAlign: "right",
  },
  amountCol: {
    flex: 1,
    textAlign: "right",
  },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  totalValue: {
    fontSize: 10,
    color: "#111827",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  paidRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  paidLabel: {
    fontSize: 10,
    color: "#059669",
  },
  paidValue: {
    fontSize: 10,
    color: "#059669",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 4,
  },
  notesSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6B7280",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 10,
    color: "#4B5563",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#9CA3AF",
  },
  statusBadge: {
    position: "absolute",
    top: 40,
    right: 40,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: "#D1FAE5",
  },
  paidBadgeText: {
    color: "#059669",
    fontSize: 10,
    fontWeight: "bold",
  },
});

// Format currency for PDF
function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Format date for PDF
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface InvoicePDFProps {
  invoice: Invoice;
  companyName?: string;
  companyAddress?: string;
}

export function InvoicePDF({ invoice, companyName, companyAddress }: InvoicePDFProps) {
  const isPaid = invoice.status === "PAID";
  const balanceDue = Number(invoice.total) - Number(invoice.amountPaid);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Paid Badge */}
        {isPaid && (
          <View style={[styles.statusBadge, styles.paidBadge]}>
            <Text style={styles.paidBadgeText}>PAID</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.label}>Issue Date</Text>
            <Text style={styles.value}>{formatDate(invoice.issueDate)}</Text>
            {invoice.dueDate && (
              <>
                <Text style={[styles.label, { marginTop: 8 }]}>Due Date</Text>
                <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
              </>
            )}
          </View>
        </View>

        {/* From / To */}
        <View style={{ flexDirection: "row", marginBottom: 32 }}>
          {/* From */}
          {companyName && (
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>From</Text>
              <Text style={styles.clientName}>{companyName}</Text>
              {companyAddress && (
                <Text style={styles.clientInfo}>{companyAddress}</Text>
              )}
            </View>
          )}

          {/* Bill To */}
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.clientName}>{invoice.client.name}</Text>
            {invoice.client.company && (
              <Text style={styles.clientInfo}>{invoice.client.company}</Text>
            )}
            <Text style={styles.clientInfo}>{invoice.client.email}</Text>
            {invoice.client.address && (
              <Text style={styles.clientInfo}>{invoice.client.address}</Text>
            )}
            {(invoice.client.city || invoice.client.state || invoice.client.zipCode) && (
              <Text style={styles.clientInfo}>
                {[invoice.client.city, invoice.client.state, invoice.client.zipCode]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCol]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.qtyCol]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.priceCol]}>Price</Text>
            <Text style={[styles.tableHeaderCell, styles.amountCol]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {invoice.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionCol]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.qtyCol]}>
                {Number(item.quantity)}
              </Text>
              <Text style={[styles.tableCell, styles.priceCol]}>
                {formatCurrency(Number(item.unitPrice), invoice.currency)}
              </Text>
              <Text style={[styles.tableCell, styles.amountCol]}>
                {formatCurrency(Number(item.amount), invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(Number(invoice.subtotal), invoice.currency)}
              </Text>
            </View>

            {Number(invoice.taxAmount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(Number(invoice.taxAmount), invoice.currency)}
                </Text>
              </View>
            )}

            {Number(invoice.discountAmount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValue}>
                  -{formatCurrency(Number(invoice.discountAmount), invoice.currency)}
                </Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(Number(invoice.total), invoice.currency)}
              </Text>
            </View>

            {Number(invoice.amountPaid) > 0 && (
              <>
                <View style={styles.paidRow}>
                  <Text style={styles.paidLabel}>Amount Paid</Text>
                  <Text style={styles.paidValue}>
                    -{formatCurrency(Number(invoice.amountPaid), invoice.currency)}
                  </Text>
                </View>
                <View style={styles.balanceRow}>
                  <Text style={styles.grandTotalLabel}>Balance Due</Text>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(balanceDue, invoice.currency)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <View style={styles.notesSection}>
            {invoice.notes && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </View>
            )}
            {invoice.terms && (
              <View>
                <Text style={styles.notesTitle}>Terms & Conditions</Text>
                <Text style={styles.notesText}>{invoice.terms}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
}
