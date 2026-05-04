# Gsubz Integration Guide

This document describes how Gsubz is integrated into the Campus Connect Hub application for payment processing (airtime, data bundles, and TV subscriptions).

## Overview

Gsubz is a VTU (Virtual Top-up) service provider that handles:
- **Airtime purchases** - MTN, Airtel, Glo, 9Mobile
- **Data bundles** - All major networks
- **TV subscriptions** - DStv, GOtv, StarTimes

## Architecture

### Frontend Flow

1. User selects a service (airtime, data, or TV)
2. App calls Supabase edge function (server-side)
3. Edge function communicates with Gsubz API
4. Gsubz returns transaction ID
5. App shows success/failure to user

### Backend Flow (Webhook)

1. Gsubz sends webhook to `gsubz-webhook` edge function
2. Edge function validates webhook payload
3. Finds user by email or phone
4. Creates/updates transaction in database
5. Credits user's wallet
6. Broadcasts real-time notification

## Configuration

### Environment Variables

Frontend (`.env` or `.env.local`):
```
VITE_GSUBZ_API_KEY=ap_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_GSUBZ_WIDGET_KEY=wd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Supabase Secrets

For the edge function to work properly, set these secrets:

```bash
supabase secrets set SUPABASE_URL="https://your-project.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set GSUBZ_WIDGET_KEY="your-gsubz-widget-key"
```

## API Integration

### Service IDs

Gsubz uses service IDs to identify different providers:

#### Airtime
- `mtn` - MTN Airtime
- `airtel` - Airtel Airtime
- `glo-data` - Glo Airtime (uses data service ID)
- `9mobile` - 9Mobile Airtime

#### Data Bundles
- `mtn-data` - MTN Data
- `airtel` - Airtel Data
- `glo-data` - Glo Data
- `9mobile-data` - 9Mobile Data

#### TV Subscriptions
- `dstv` - DStv Subscriptions
- `gotv` - GOtv Subscriptions
- `startimes` - StarTimes Subscriptions

### API Endpoints

All requests use: `https://app.gsubz.com/api`

#### GET /category
Lists available service categories.

#### GET /plans?service=SERVICE_ID
Gets available plans for a service.

#### GET /variation?service=SERVICE_ID&value=PLAN_VALUE
Gets variation details for a plan.

#### POST /pay
Makes a payment/purchase request.

**Request body:**
```json
{
  "serviceID": "mtn",
  "phone": "08012345678",
  "amount": 1000,
  "requestID": 1234567890,
  "productType": "flexible",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "code": 200,
  "status": "TRANSACTION_SUCCESSFUL",
  "description": "TRANSACTION_SUCCESSFUL",
  "content": {
    "transactionID": "123456789",
    "requestID": "1234567890",
    "amount": 1000,
    "phone": "08012345678",
    "serviceID": "mtn",
    "serviceName": "MTN Airtime VTU",
    "status": "TRANSACTION_SUCCESSFUL",
    "date": "2024-01-15T10:30:00+01:00"
  }
}
```

#### POST /verify
Verify transaction status.

**Request body:**
```json
{
  "requestID": "1234567890"
}
```

## Webhook Integration

### Webhook URL
```
https://[PROJECT_ID].supabase.co/functions/v1/gsubz-webhook
```

### Webhook Payload Example

```json
{
  "code": 200,
  "status": "TRANSACTION_SUCCESSFUL",
  "description": "TRANSACTION_SUCCESSFUL",
  "content": {
    "transactionID": "123456789",
    "requestID": "1234567890",
    "amount": 5000,
    "phone": "08012345678",
    "email": "user@example.com",
    "serviceID": "mtn",
    "productType": "flexible",
    "serviceName": "MTN Airtime",
    "status": "TRANSACTION_SUCCESSFUL",
    "date": "2024-01-15T10:30:00+01:00"
  }
}
```

### Setting Up Webhooks in Gsubz Dashboard

1. Log in to [https://app.gsubz.com/](https://app.gsubz.com/)
2. Go to **Dashboard → Settings → Webhooks**
3. Click **Add Webhook**
4. Enter webhook URL: `https://[PROJECT_ID].supabase.co/functions/v1/gsubz-webhook`
5. Select events:
   - `payment.received` or `payment.successful`
   - `payment.failed`
6. Save

## Database Schema

### Transactions Table

The `transactions` table stores all payment transactions:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20), -- airtime, data, tv, topup, router
  amount NUMERIC,
  status VARCHAR(20), -- pending, completed, failed
  phone_number VARCHAR(20),
  operator VARCHAR(50),
  description TEXT,
  gsubz_ref VARCHAR(255), -- Gsubz transaction ID
  verified BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Key fields for Gsubz:**
- `gsubz_ref` - Stores the Gsubz `transactionID` for idempotency and reference
- `verified` - Set to true when webhook confirms payment
- `status` - Updated by webhook handler

## Error Handling

### API Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | TRANSACTION_SUCCESSFUL | Payment successful |
| 204 | REQUIRED_CONTENT_NOT_SENT | Missing required fields |
| 206 | INVALID_CONTENT | Invalid field values |
| 401 | AUTHORIZATION_FAILED | API key invalid |
| 402 | ERROR_IN_PAYMENT | Payment processing error |
| 404 | CONTENT_NOT_FOUND | Service not found |
| 405 | REQUEST_METHOD_NOT_POST | Wrong HTTP method |
| 406 | NOT_ALLOWED | Operation not allowed |
| 502 | GATEWAY_ERROR | Gsubz gateway error |

### User Not Identified

If a webhook is received but the user cannot be identified by email or phone:
1. Transaction is created with status "pending"
2. Manual review flag is set
3. Assign to admin user for verification
4. Admin should match payment to correct user manually

## Testing

### Test API

Gsubz provides a test endpoint for integration testing:
```
POST https://app.gsubz.com/api/testpay
```

### Test Credentials

Use test amounts and phone numbers. Gsubz will mock the transaction flow without charging.

## Troubleshooting

### Webhook Not Triggering

1. Verify webhook URL is correct in Gsubz dashboard
2. Check Supabase edge function logs: `supabase functions logs gsubz-webhook`
3. Ensure environment secrets are set in Supabase
4. Test webhook manually with curl:
   ```bash
   curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/gsubz-webhook \
     -H "Content-Type: application/json" \
     -d '{"code":200,"status":"TRANSACTION_SUCCESSFUL",...}'
   ```

### User Not Found After Payment

1. Check that user's email or phone in webhook matches database
2. Look for pending transactions in admin dashboard
3. Manually verify and assign to correct user

### Transaction Already Processed Error

This is expected and safe. The webhook handler has idempotency checks using `gsubz_ref` to prevent duplicate processing.

## Security Considerations

1. **API Key**: Keep `VITE_GSUBZ_API_KEY` secret and rotate periodically
2. **Widget Key**: Use `GSUBZ_WIDGET_KEY` for webhook signature validation
3. **Service Role Key**: Restrict access to Supabase service role key
4. **Idempotency**: Webhook handler checks `gsubz_ref` to prevent duplicates
5. **User Verification**: Always verify user identity before crediting wallet

## Additional Resources

- [Gsubz API Documentation](https://app.gsubz.com/api_doc/)
- [Gsubz Dashboard](https://app.gsubz.com/)
