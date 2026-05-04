# Gsubz Webhook Handler

This edge function handles webhook events from Gsubz for payment processing.

## Setup

### 1. Deploy the Edge Function

```bash
supabase functions deploy gsubz-webhook
```

### 2. Set Environment Secrets

```bash
# Required
supabase secrets set SUPABASE_URL="https://your-project.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Optional (for webhook signature validation)
supabase secrets set GSUBZ_WIDGET_KEY="your-gsubz-widget-key"
```

## Webhook Events Handled

### Payment Received (Successful)
When a payment is successfully processed:
- Creates or updates a transaction in the `transactions` table
- Credits the user's wallet
- Creates a notification for the user
- Broadcasts real-time notification to admin dashboard

### Payment Failed
When a payment fails:
- Updates the transaction status to "failed"

## Webhook URL

Once deployed, your webhook URL will be:

```
https://[PROJECT_ID].supabase.co/functions/v1/gsubz-webhook
```

## Adding to Gsubz Dashboard

1. Go to Gsubz Dashboard → Settings → Webhooks
2. Add webhook URL: `https://[PROJECT_ID].supabase.co/functions/v1/gsubz-webhook`
3. Select events:
   - Payment Successful
   - Payment Failed
4. Save

## Response Format

The function expects Gsubz webhook payloads with the following structure:

```json
{
  "code": 200,
  "status": "TRANSACTION_SUCCESSFUL",
  "description": "TRANSACTION_SUCCESSFUL",
  "content": {
    "transactionID": "123456789",
    "requestID": "987654321",
    "amount": 5000,
    "phone": "08012345678",
    "serviceID": "mtn",
    "email": "user@example.com",
    "customerID": "",
    "plan": "",
    "productType": "flexible",
    "serviceName": "MTN Airtime",
    "status": "TRANSACTION_SUCCESSFUL",
    "date": "2024-01-15T10:30:00+01:00"
  },
  "gateway": {
    "referrer": "app.gsubz.com",
    "host": "recharge.example.com",
    "ip": "192.168.1.1"
  }
}
```

## User Identification

The function attempts to identify users in this order:
1. By email address (from `content.email`)
2. By phone number (from `content.phone`)
3. If user not found, creates a pending transaction for manual review

## Database Tables Updated

- `transactions` - Transaction records
- `wallets` - User wallet balances
- `notifications` - User notifications

## Debugging

Check Supabase logs for the edge function:

```bash
supabase functions logs gsubz-webhook
```

Or view logs in the Supabase dashboard under Functions.
