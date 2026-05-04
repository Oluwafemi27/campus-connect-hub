# Gsubz Migration Setup Guide

This guide walks you through completing the migration from Glad Tidings to Gsubz.

## Step 1: Set Environment Variables

### Frontend Variables (.env or .env.local)

Add or update these in your local `.env` file:

```
VITE_GSUBZ_API_KEY=ap_7ab0974f4c043d26f87026ed15a66699
VITE_GSUBZ_WIDGET_KEY=wd_885d63d0d1815c9a6bb035ce9d019945
```

### Supabase Secrets

Set these secrets in your Supabase project for the edge function:

```bash
# Set service role key (copy from Supabase dashboard → Settings → API)
supabase secrets set SUPABASE_URL="https://jhtuvygyzvuyfybuyflu.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Set widget key for webhook validation
supabase secrets set GSUBZ_WIDGET_KEY="wd_885d63d0d1815c9a6bb035ce9d019945"
```

## Step 2: Database Migration

### Add New Gsubz Reference Column

If you haven't already renamed the transaction field, run this migration:

```sql
-- Add new gsubz_ref column if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS gsubz_ref VARCHAR(255);

-- Optionally keep glad_tidings_ref for backwards compatibility
-- or drop it if no longer needed
-- ALTER TABLE transactions DROP COLUMN IF EXISTS glad_tidings_ref;
```

## Step 3: Deploy Edge Function

Deploy the new Gsubz webhook edge function:

```bash
supabase functions deploy gsubz-webhook
```

## Step 4: Configure Webhook in Gsubz Dashboard

1. Log in to https://app.gsubz.com/
2. Go to **Dashboard → Settings → Webhooks**
3. Add a new webhook:
   - **URL**: `https://jhtuvygyzvuyfybuyflu.supabase.co/functions/v1/gsubz-webhook`
   - **Events**: Select `payment.received` and `payment.failed` (or similar events)
4. Save the webhook configuration

## Step 5: Test the Integration

### Test Frontend
1. Go to the Data, Airtime, or TV page
2. Try making a test purchase
3. Check browser console for any errors

### Test Webhook
Use curl to test the webhook:

```bash
curl -X POST https://jhtuvygyzvuyfybuyflu.supabase.co/functions/v1/gsubz-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "code": 200,
    "status": "TRANSACTION_SUCCESSFUL",
    "description": "TRANSACTION_SUCCESSFUL",
    "content": {
      "transactionID": "test123456",
      "requestID": "req123456",
      "amount": 1000,
      "phone": "08012345678",
      "email": "test@example.com",
      "serviceID": "mtn",
      "serviceName": "MTN Airtime",
      "status": "TRANSACTION_SUCCESSFUL",
      "date": "2024-01-15T10:30:00+01:00"
    }
  }'
```

Check Supabase logs:
```bash
supabase functions logs gsubz-webhook
```

## Step 6: Verify Deployments

### Check Environment Variables
```bash
echo "VITE_GSUBZ_API_KEY=$VITE_GSUBZ_API_KEY"
echo "VITE_GSUBZ_WIDGET_KEY=$VITE_GSUBZ_WIDGET_KEY"
```

### Verify Edge Function
The function should be accessible at:
```
https://jhtuvygyzvuyfybuyflu.supabase.co/functions/v1/gsubz-webhook
```

### Test Payment Flow
1. Navigate to `/data`, `/airtime`, or `/tv` route
2. Select an operator and plan
3. Enter a valid phone number
4. Attempt a purchase
5. Check transaction status in admin dashboard

## Step 7: Remove Old Glad Tidings Files (Optional)

Once confirmed everything works, you can remove the old files:

```bash
# Remove old Glad Tidings configuration
rm src/lib/glad-tidings-config.ts
rm src/lib/glad-tidings.ts
rm src/server/glad-tidings.ts

# Remove old Glad Tidings webhook edge function
rm -rf supabase/functions/glad-tidings-webhook/

# Remove old documentation
rm GLAD_TIDINGS_INTEGRATION.md
rm SUPABASE_SETUP_GUIDE.md
```

## Files Modified/Created

### New Files Created:
- ✅ `src/lib/gsubz-config.ts` - Configuration
- ✅ `src/lib/gsubz.ts` - API client
- ✅ `src/server/gsubz.ts` - Server helper
- ✅ `supabase/functions/gsubz-webhook/index.ts` - Webhook handler
- ✅ `supabase/functions/gsubz-webhook/deps.ts` - Dependencies
- ✅ `supabase/functions/gsubz-webhook/README.md` - Webhook docs
- ✅ `GSUBZ_INTEGRATION.md` - Integration guide

### Files Updated:
- ✅ `.env.example` - Gsubz variables
- ✅ `src/routes/topup.tsx` - Removed Glad Tidings branding
- ✅ `src/routes/airtime.tsx` - Import from gsubz
- ✅ `src/routes/data.tsx` - Import from gsubz
- ✅ `src/routes/tv.tsx` - Import from gsubz
- ✅ `src/routes/admin.transactions.tsx` - Field renamed to gsubz_ref
- ✅ `src/lib/admin-service.ts` - Type updated

### Old Files (Still Present, No Longer Used):
- ⚠️ `src/lib/glad-tidings-config.ts` - Can be deleted
- ⚠️ `src/lib/glad-tidings.ts` - Can be deleted
- ⚠️ `src/server/glad-tidings.ts` - Can be deleted
- ⚠️ `supabase/functions/glad-tidings-webhook/` - Can be deleted
- ⚠️ `GLAD_TIDINGS_INTEGRATION.md` - Can be deleted
- ⚠️ `SUPABASE_SETUP_GUIDE.md` - Can be deleted

## Troubleshooting

### Edge Function Not Found
```
Error: Edge function URL not found
```
**Solution**: Make sure you've deployed the function:
```bash
supabase functions deploy gsubz-webhook
```

### Missing Environment Variables
```
Error: Gsubz API key not configured
```
**Solution**: Set the environment variables as described in Step 1.

### Webhook Not Triggering
**Solution**: 
1. Verify webhook URL is correct in Gsubz dashboard
2. Check function logs: `supabase functions logs gsubz-webhook`
3. Test manually with curl (see Step 5)

### Transaction Not Being Credited
**Possible causes**:
1. User not found by email/phone - Creates pending transaction for manual review
2. Wallet table missing - Ensure wallets table exists
3. Missing SUPABASE_SERVICE_ROLE_KEY secret - Set in Supabase

### Dev Server Not Starting
If you get "dev server command seems to be crashing", check that the correct setup command was run.

## Rollback Plan

If you need to rollback to Glad Tidings:

1. Restore old imports in routes:
   ```
   import { ... } from "@/server/glad-tidings"
   ```

2. Restore old edge function:
   ```bash
   supabase functions deploy glad-tidings-webhook
   ```

3. Update Gsubz webhook to point to old function URL

## Support

For issues with:
- **Gsubz API**: Check [Gsubz API Documentation](https://app.gsubz.com/api_doc/)
- **Supabase Edge Functions**: Check Supabase logs and documentation
- **Database Issues**: Check your Supabase dashboard

## Next Steps

1. Set environment variables (Step 1)
2. Deploy edge function (Step 3)
3. Configure webhook (Step 4)
4. Test integration (Step 5)
5. Monitor in production
