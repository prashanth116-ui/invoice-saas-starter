import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Send, CreditCard, Clock, Zap, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">InvoiceFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Button asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            Invoice in 30 seconds.
            <br />
            <span className="text-blue-600">Get paid 2x faster.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Simple invoice automation for freelancers and small businesses.
            Create professional invoices, send them instantly, and collect
            payments online.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">See Demo</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required • 3 free invoices/month forever
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to get paid
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-blue-600" />}
              title="Create in Seconds"
              description="Simple form, beautiful invoices. Add line items, set due dates, and send."
            />
            <FeatureCard
              icon={<Send className="h-6 w-6 text-blue-600" />}
              title="Send & Track"
              description="Email invoices directly. Know when clients view them."
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6 text-blue-600" />}
              title="Get Paid Online"
              description="Accept credit cards and PayPal. Clients pay in one click."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6 text-blue-600" />}
              title="Smart Reminders"
              description="Automated payment reminders. Never chase clients manually."
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-blue-600" />}
              title="Professional Templates"
              description="Clean, modern designs. Add your logo and brand colors."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-blue-600" />}
              title="QuickBooks Sync"
              description="Connect to QuickBooks or Xero. No double entry."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Start free, upgrade when you need more
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              description="Perfect for getting started"
              features={[
                "3 invoices/month",
                "Basic templates",
                "Email delivery",
                "Stripe payments",
              ]}
            />
            <PricingCard
              name="Starter"
              price="$12"
              description="For growing businesses"
              features={[
                "50 invoices/month",
                "All templates",
                "Payment reminders",
                "Recurring invoices",
                "Priority support",
              ]}
              highlighted
            />
            <PricingCard
              name="Pro"
              price="$29"
              description="For teams and power users"
              features={[
                "Unlimited invoices",
                "QuickBooks/Xero sync",
                "Team access (3 users)",
                "Client portal",
                "SMS reminders",
                "API access",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get paid faster?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of freelancers and small businesses using InvoiceFlow
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">Create Your First Invoice</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-white" />
              <span className="text-white font-semibold">InvoiceFlow</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} InvoiceFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-full bg-blue-50 w-12 h-12 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card className={highlighted ? "border-blue-600 border-2 relative" : ""}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <div className="mt-2">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "$0" && <span className="text-gray-500">/month</span>}
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full mt-6"
          variant={highlighted ? "default" : "outline"}
          asChild
        >
          <Link href="/signup">Get Started</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
