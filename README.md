# InvoiceFlow - Invoice SaaS Starter Template

A complete starter template for building an invoice automation SaaS using Next.js 14, Prisma, Stripe, and Resend.

## Features

- **Invoice Management**: Create, send, and track invoices
- **Payment Processing**: Stripe integration for online payments
- **Email Notifications**: Automated emails via Resend
- **Smart Reminders**: Configurable payment reminders
- **Dashboard**: Real-time stats and overview
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | PostgreSQL (Supabase/Neon) |
| ORM | Prisma |
| Auth | Clerk (or NextAuth) |
| Payments | Stripe |
| Email | Resend |
| Hosting | Vercel |

## Quick Start

### 1. Clone and Install

```bash
cd invoice-saas-starter
npm install
```

### 2. Set Up Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your credentials:

```env
# Database (get from Supabase or Neon)
DATABASE_URL="postgresql://..."

# Stripe (get from stripe.com/dashboard)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend (get from resend.com)
RESEND_API_KEY="re_..."
EMAIL_FROM="invoices@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
invoice-saas-starter/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── invoices/   # Invoice CRUD
│   │   │   └── dashboard/  # Stats
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── ui/             # Base UI components
│   │   └── invoices/       # Invoice components
│   ├── lib/
│   │   ├── db.ts           # Prisma client
│   │   ├── utils.ts        # Utility functions
│   │   └── services/       # Business logic
│   │       ├── invoice.service.ts
│   │       ├── email.service.ts
│   │       └── stripe.service.ts
│   └── types/
│       └── index.ts        # TypeScript types
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices/[id]` | Get invoice |
| DELETE | `/api/invoices/[id]` | Delete invoice |
| POST | `/api/invoices/[id]/send` | Send invoice email |
| POST | `/api/invoices/[id]/pay` | Create payment session |
| PUT | `/api/invoices/[id]/pay` | Record manual payment |
| GET | `/api/dashboard` | Get dashboard stats |

## Database Schema

The schema includes:

- **User**: Business owner profile
- **Client**: Client/customer records
- **Invoice**: Invoice header with status tracking
- **LineItem**: Invoice line items
- **Payment**: Payment records
- **Reminder**: Scheduled reminders
- **InvoiceActivity**: Audit log

## Next Steps

### Add Authentication

Install and configure Clerk:

```bash
npm install @clerk/nextjs
```

Or use NextAuth:

```bash
npm install next-auth @auth/prisma-adapter
```

### Set Up Stripe Webhooks

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Use the webhook secret in your `.env`

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## Customization

### Add New Invoice Status

1. Update `prisma/schema.prisma`:
```prisma
enum InvoiceStatus {
  DRAFT
  SENT
  // Add your status
  PENDING_APPROVAL
  ...
}
```

2. Run `npm run db:push`
3. Update `src/types/index.ts`
4. Update `src/lib/utils.ts` (status colors)

### Add New Email Template

Edit `src/lib/services/email.service.ts` and add your template following the existing patterns.

### Change Pricing

Update the pricing section in `src/app/page.tsx`.

## Support

- Documentation: [Coming soon]
- Issues: [GitHub Issues]

## License

MIT
