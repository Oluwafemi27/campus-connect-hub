# Glad Tidings Webhook Edge Function

This Supabase Edge Function handles automated payment verification from Glad Tidings.

## How It Works

1. **Payment Received**: When Glad Tidings receives a payment, they send a webhook to this endpoint
2. **Idempotency Check**: The function checks if the transaction reference was already processed
3. **User Identification**: The function identifies the user via metadata (transaction_id or virtual_account)
4. **Transaction Update**: Updates the transaction status to 'completed'
5. **Wallet Credit**: Credits the user's wallet balance
6. **Real-time Broadcast**: Sends a real-time notification to the admin dashboard

## Deployment

### Option 1: Supabase CLI

```bash
cd supabase/functions/glad-tidings-webhook
supabase functions deploy glad-tidings-webhook
```

### Option 2: Manual Deployment via Supabase Dashboard

1. Go to Supabase Dashboard → Edge Functions
2. Create a new function named `glad-tidings-webhook`
3. Copy the contents of `index.ts` into the editor
4. Deploy

## Environment Variables

Set these secrets in Supabase:

```bash
supabase secrets set SUPABASE_URL="your-supabase-url"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set GLAD_TIDINGS_API_KEY="your-glad-tidings-api-key"
```

## Glad Tidings Configuration

1. Log in to your Glad Tidings developer dashboard
2. Navigate to Webhooks settings
3. Add a new webhook URL:
   ```
   https://your-project.supabase.co/functions/v1/glad-tidings-webhook
   ```
4. Select the events you want to receive:
   - `payment.received`
   - `payment.failed`
   - `payment.refunded`

## Webhook Payload Format

Glad Tidings sends JSON payloads like:

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
    "user_id": "uuid-of-user",
    "transaction_id": "uuid-of-pending-transaction"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Security

- The function verifies the webhook signature using HMAC-SHA256
- Uses Supabase Service Role key for admin database operations
- Implements idempotency to handle duplicate webhooks

## Testing

Use curl to test locally:

```bash
curl -X POST http://localhost:54321/functions/v1/glad-tidings-webhook \
  -H "Content-Type: application/json" \
  -H "x-glad-tidings-signature: test-signature" \
  -d '{
    "event": "payment.received",
    "reference": "TEST-123",
    "amount": 1000,
    "status": "success"
  }'
```
