# Gsubz Implementation Checklist

Use this checklist to verify all migration steps are complete.

## ✅ Code Changes (Complete)

### New Files Created
- [x] `src/lib/gsubz-config.ts` - Configuration
- [x] `src/lib/gsubz.ts` - API client
- [x] `src/server/gsubz.ts` - Server helper
- [x] `supabase/functions/gsubz-webhook/index.ts` - Webhook handler
- [x] `supabase/functions/gsubz-webhook/deps.ts` - Dependencies
- [x] `supabase/functions/gsubz-webhook/README.md` - Documentation

### Files Updated
- [x] `.env.example` - Added Gsubz variables
- [x] `src/routes/topup.tsx` - Removed Glad Tidings branding
- [x] `src/routes/airtime.tsx` - Updated import
- [x] `src/routes/data.tsx` - Updated import
- [x] `src/routes/tv.tsx` - Updated import
- [x] `src/routes/admin.transactions.tsx` - Updated field reference
- [x] `src/lib/admin-service.ts` - Updated types

### Old Files (Optional Cleanup)
- [ ] Delete `src/lib/glad-tidings-config.ts`
- [ ] Delete `src/lib/glad-tidings.ts`
- [ ] Delete `src/server/glad-tidings.ts`
- [ ] Delete `supabase/functions/glad-tidings-webhook/`
- [ ] Delete `GLAD_TIDINGS_INTEGRATION.md`
- [ ] Delete `SUPABASE_SETUP_GUIDE.md`

## ⏳ Configuration Tasks

### Environment Variables (.env or .env.local)
- [ ] Add `VITE_GSUBZ_API_KEY=ap_7ab0974f4c043d26f87026ed15a66699`
- [ ] Add `VITE_GSUBZ_WIDGET_KEY=wd_885d63d0d1815c9a6bb035ce9d019945`

### Supabase Secrets
- [ ] Set `SUPABASE_URL`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `GSUBZ_WIDGET_KEY`

Command to use:
```bash
supabase secrets set GSUBZ_WIDGET_KEY="wd_885d63d0d1815c9a6bb035ce9d019945"
supabase secrets set SUPABASE_URL="https://jhtuvygyzvuyfybuyflu.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<your-key-here>"
```

### Database Migration
- [ ] Add `gsubz_ref` column to `transactions` table
- [ ] Optional: Drop `glad_tidings_ref` column if no longer needed

```sql
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS gsubz_ref VARCHAR(255);
```

## 🚀 Deployment Tasks

### Edge Function Deployment
- [ ] Run `supabase functions deploy gsubz-webhook`
- [ ] Verify function is accessible at edge function URL
- [ ] Check function logs for errors

### Webhook Configuration in Gsubz
- [ ] Log in to https://app.gsubz.com/
- [ ] Navigate to Dashboard → Settings → Webhooks
- [ ] Add webhook URL: `https://[PROJECT_ID].supabase.co/functions/v1/gsubz-webhook`
- [ ] Subscribe to events:
  - [ ] `payment.received` or `payment.successful`
  - [ ] `payment.failed`
- [ ] Save webhook configuration
- [ ] Note webhook secret/key if provided

## 🧪 Testing Tasks

### Local Testing
- [ ] Environment variables loaded correctly (check browser console)
- [ ] `/data` page loads and displays bundles
- [ ] `/airtime` page loads and displays options
- [ ] `/tv` page loads and displays subscriptions
- [ ] Can select operators and amounts without errors

### Purchase Flow Testing
- [ ] Click "Buy" on a data bundle
- [ ] Enter valid phone number
- [ ] Observe API call in browser DevTools
- [ ] Check for success/error message

### Admin Dashboard Testing
- [ ] Navigate to admin → transactions
- [ ] Verify `gsubz_ref` column is displayed
- [ ] Check transaction list renders correctly
- [ ] Verify export to CSV works

### Webhook Testing
- [ ] Send test webhook with curl:
  ```bash
  curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/gsubz-webhook \
    -H "Content-Type: application/json" \
    -d '{"code":200,"status":"TRANSACTION_SUCCESSFUL","content":{"transactionID":"test123","amount":1000,"email":"test@example.com"}}'
  ```
- [ ] Check Supabase function logs: `supabase functions logs gsubz-webhook`
- [ ] Verify transaction was created in database
- [ ] Verify wallet was credited (if test user exists)

## 📋 Verification Checklist

### Code Verification
- [ ] No imports from `glad-tidings` in active code
- [ ] All routes import from `gsubz` server
- [ ] Type definitions updated to use `gsubz_ref`
- [ ] No build errors or TypeScript warnings

### Configuration Verification
- [ ] `VITE_GSUBZ_API_KEY` is set and valid
- [ ] `VITE_GSUBZ_WIDGET_KEY` is set and valid
- [ ] Supabase secrets are set correctly
- [ ] Edge function has access to secrets

### Deployment Verification
- [ ] Edge function URL is accessible
- [ ] Webhook URL is configured in Gsubz dashboard
- [ ] Database schema has `gsubz_ref` column
- [ ] No error messages in logs

### Functionality Verification
- [ ] Data page shows data bundles (with mock data if API not available)
- [ ] Airtime page shows airtime options (with mock data if API not available)
- [ ] TV page shows TV subscriptions (with mock data if API not available)
- [ ] Top-up page displays Gsubz branding instead of Glad Tidings
- [ ] Admin dashboard shows transactions with `gsubz_ref` field
- [ ] Webhook can be called without errors

## 🔄 Post-Deployment

### Monitoring
- [ ] Set up error monitoring/alerting
- [ ] Monitor Supabase function logs for issues
- [ ] Check Gsubz webhook delivery logs

### Documentation
- [ ] Update team documentation
- [ ] Share GSUBZ_INTEGRATION.md with team
- [ ] Document any custom configurations

### Cleanup (Optional)
- [ ] Delete old Glad Tidings files
- [ ] Delete old documentation
- [ ] Archive old setup guides

## 📞 Support Resources

- **Gsubz API Docs**: https://app.gsubz.com/api_doc/
- **Integration Guide**: GSUBZ_INTEGRATION.md
- **Setup Guide**: GSUBZ_SETUP.md
- **Migration Summary**: MIGRATION_COMPLETE.md

## Notes

Use this space to track any issues or special configurations:

```
Issue 1:
Resolution:

Issue 2:
Resolution:
```

---

**Progress**: Complete the tasks in order (Code → Config → Deploy → Test → Verify)

Current Status: ✅ Code changes complete | ⏳ Configuration pending
