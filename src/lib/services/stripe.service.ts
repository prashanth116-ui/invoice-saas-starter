import Stripe from "stripe";
import type { Invoice } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export class StripeService {
  /**
   * Create a checkout session for invoice payment
   */
  static async createCheckoutSession(invoice: Invoice): Promise<string> {
    // Calculate amount in cents
    const amountDue = Math.round((invoice.total - invoice.amountPaid) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      client_reference_id: invoice.id,
      customer_email: invoice.client.email,
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: `Payment for invoice ${invoice.invoiceNumber}`,
            },
            unit_amount: amountDue,
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
      success_url: `${APP_URL}/invoice/${invoice.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/invoice/${invoice.id}`,
    });

    return session.url!;
  }

  /**
   * Create a payment intent for embedded checkout
   */
  static async createPaymentIntent(invoice: Invoice): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    const amountDue = Math.round((invoice.total - invoice.amountPaid) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountDue,
      currency: invoice.currency.toLowerCase(),
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
      receipt_email: invoice.client.email,
      description: `Payment for invoice ${invoice.invoiceNumber}`,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Retrieve checkout session
   */
  static async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.retrieve(sessionId);
  }

  /**
   * Handle webhook event
   */
  static async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<{
    type: string;
    invoiceId?: string;
    amount?: number;
    transactionId?: string;
  }> {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: "payment_completed",
          invoiceId: session.metadata?.invoiceId,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          transactionId: session.payment_intent as string,
        };
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          type: "payment_completed",
          invoiceId: paymentIntent.metadata?.invoiceId,
          amount: paymentIntent.amount / 100,
          transactionId: paymentIntent.id,
        };
      }

      default:
        return { type: event.type };
    }
  }

  /**
   * Create connected account for receiving payments
   */
  static async createConnectedAccount(email: string): Promise<string> {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account.id;
  }

  /**
   * Create account link for onboarding
   */
  static async createAccountLink(accountId: string): Promise<string> {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}/settings/payments`,
      return_url: `${APP_URL}/settings/payments?success=true`,
      type: "account_onboarding",
    });

    return accountLink.url;
  }
}
