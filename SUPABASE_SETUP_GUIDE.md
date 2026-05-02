# Campus Connect - Supabase Setup Guide

This guide will help you set up your Supabase database and deploy the necessary Edge Functions for the Campus Connect application.

## Prerequisites

1. Supabase CLI installed
2. Access to your Supabase project
3. Glad Tidings API credentials

## Setup Steps

### 1. Login to Supabase

```bash
supabase login
```

### 2. Link to Your Project

```bash
cd /home/engine/project
supabase link --project-ref <your-project-ref>
```

You'll need your project reference from the Supabase Dashboard (Settings > General).

### 3. Set Environment Variables

Store your sensitive credentials as Supabase secrets:

```bash
supabase secrets set SUPABASE_URL="https://your-project.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set GLAD_TIDINGS_API_KEY="62aee3783c9d04881ee9ef69d7d88ec8d260503e"
```

### 4. Initialize Database Schema

Run the schema.sql file in your Supabase SQL Editor (Dashboard → SQL Editor):

1. Open the Supabase Dashboard
2. Navigate to SQL Editor → New Query
3. Copy and paste the contents of `schema.sql`
4. Click Run to execute

Alternatively, use the Supabase CLI:

```bash
supabase db push
```

### 5. Deploy Edge Function

Deploy the Glad Tidings webhook Edge Function:

```bash
supabase functions deploy glad-tidings-webhook
```

Or via the Supabase Dashboard:

1. Go to Edge Functions
2. Create a new function named `glad-tidings-webhook`
3. Copy the code from `supabase/functions/glad-tidings-webhook/index.ts`
4. Deploy

### 6. Configure Glad Tidings Webhook

In your Glad Tidings developer dashboard:

1. Navigate to Webhooks settings
2. Add a new webhook with the URL:
   ```
   https://your-project.supabase.co/functions/v1/glad-tidings-webhook
   ```
3. Select events: `payment.received`, `payment.failed`
4. Save

### 7. Frontend Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GLAD_TIDINGS_API_KEY=62aee3783c9d04881ee9ef69d7d88ec8d260503e
```

## Database Tables Overview

### Users Table

- Stores user profile information
- Automatically created via trigger when a user signs up

### Wallets Table

- Tracks user wallet balances
- Created automatically for new users

### Transactions Table

- Records all financial transactions (topups, airtime, data, TV, router)
- Includes Glad Tidings reference for tracking payments

### Notifications Table

- Stores user notifications
- Auto-populated when wallet is credited

## Payment Flow

1. User opens the Top Up page
2. User is shown the Glad Tidings static account (GLADTIDINGS - Belshazzar via Palmpay)
3. User transfers money to the Glad Tidings account
4. Glad Tidings sends a webhook to our Edge Function
5. Edge Function:
   - Identifies the user (via metadata or customer email)
   - Creates a completed topup transaction
   - Credits the user's wallet
   - Creates a notification for the user
   - Broadcasts real-time update to admin dashboard

## Testing

### Test Webhook Locally

```bash
curl -X POST http://localhost:54321/functions/v1/glad-tidings-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.received",
    "reference": "TEST-123",
    "amount": 1000,
    "currency": "NGN",
    "status": "success",
    "customer_email": "test@example.com",
    "narration": "Test payment"
  }'
```

### Verify in Database

Check the transactions table for the new entry:

```sql
SELECT * FROM public.transactions ORDER BY created_at DESC LIMIT 10;
```

Check the wallets table for updated balance:

```sql
SELECT * FROM public.wallets;
```

## Troubleshooting

### Edge Function Not Triggered

- Verify webhook URL is correct
- Check Glad Tidings dashboard for webhook delivery logs
- Verify secrets are set correctly in Supabase

### User Not Identified

- Check that customer_email in webhook matches user email in database
- Check narration format if using custom format
- Review Edge Function logs in Supabase Dashboard

### Wallet Not Credited

- Check that wallets table exists and has data
- Verify the Edge Function has correct table permissions
- Check Supabase Service Role key permissions

## Security Notes

- Never commit `.env` files to version control
- The Edge Function uses Service Role key for admin operations
- Row Level Security (RLS) is enabled on all tables
- Webhook signature verification is implemented

## Glad Tidings Configuration

Glad Tidings should be configured to send webhooks with the following payload structure:

```json
{
  "event": "payment.received",
  "reference": "GT-1234567890",
  "amount": 5000,
  "currency": "NGN",
  "status": "success",
  "customer_email": "user@example.com",
  "customer_name": "John Doe",
  "narration": "Wallet top-up",
  "metadata": {
    "user_id": "uuid-of-user"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Support

For issues with:

- Supabase: https://supabase.com/docs
- Glad Tidings: Contact your Glad Tidings account manager
- Campus Connect: Check the project documentation
