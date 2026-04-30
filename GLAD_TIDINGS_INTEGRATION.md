# Glad Tidings Integration Setup

This guide walks you through integrating Glad Tidings payment processing into the Campus Connect app.

## Overview

- **Glad Tidings**: Payment processor for airtime, data, and TV subscriptions
- **Integration Method**: Users deposit to your static Glad Tidings account, which automatically processes their airtime/data/TV purchases
- **Admin Features**: Track deposits, verify transactions, manage users, send broadcasts, and manage features

---

## Step 1: Set Up Database Tables

Run all these SQL commands in your Supabase SQL Editor (go to SQL Editor → New Query):

### 1.1 Create Users Table

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);
```

### 1.2 Create Wallets Table

```sql
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  last_topup TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet"
  ON public.wallets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON public.wallets
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### 1.3 Create Transactions Table

```sql
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('airtime', 'data', 'tv', 'topup')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  phone_number TEXT,
  operator TEXT,
  description TEXT,
  glad_tidings_ref TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_glad_tidings_ref ON public.transactions(glad_tidings_ref);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 1.4 Create Broadcasts Table

```sql
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('all', 'active', 'suspended')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON public.broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_broadcasts_created_at ON public.broadcasts(created_at DESC);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read broadcasts"
  ON public.broadcasts
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can create broadcasts"
  ON public.broadcasts
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update broadcasts"
  ON public.broadcasts
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete broadcasts"
  ON public.broadcasts
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 1.5 Create Features Table

```sql
CREATE TABLE IF NOT EXISTS public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_features_active ON public.features(is_active);
CREATE INDEX IF NOT EXISTS idx_features_order ON public.features(display_order);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active features"
  ON public.features
  FOR SELECT
  USING (is_active = true OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage features"
  ON public.features
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 1.6 Create Support Messages Table

```sql
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.support_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.support_messages(id) ON DELETE CASCADE,
  reply_by UUID NOT NULL REFERENCES public.users(id),
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_messages_user ON public.support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_status ON public.support_messages(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON public.support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_replies_message ON public.support_replies(message_id);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages and admins read all"
  ON public.support_messages
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can create messages"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update message status"
  ON public.support_messages
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can read all replies"
  ON public.support_replies
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.uid() IN (
    SELECT user_id FROM public.support_messages WHERE id = message_id
  ));

CREATE POLICY "Admins can create replies"
  ON public.support_replies
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

### 1.7 Create Admin Settings Table

```sql
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_by UUID NOT NULL REFERENCES public.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(setting_key);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read settings"
  ON public.admin_settings
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage settings"
  ON public.admin_settings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

INSERT INTO public.admin_settings (setting_key, setting_value, updated_by)
SELECT 'maintenance_mode', 'false', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'maintenance_mode')
LIMIT 1;

INSERT INTO public.admin_settings (setting_key, setting_value, updated_by)
SELECT 'allow_signups', 'true', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'allow_signups')
LIMIT 1;

INSERT INTO public.admin_settings (setting_key, setting_value, updated_by)
SELECT 'glad_tidings_account', 'your-static-account-here', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'glad_tidings_account')
LIMIT 1;
```

### 1.8 Create User Profile Function (Trigger)

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name'
  );
  
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 2: Store Glad Tidings Credentials

Store the API key as an environment variable:

```
VITE_GLAD_TIDINGS_API_KEY=62aee3783c9d04881ee9ef69d7d88ec8d260503e
VITE_GLAD_TIDINGS_ACCOUNT=your-static-account-id
```

---

## Step 3: Create Admin User

To access the admin panel, you need an admin user. Run this in Supabase Auth:

1. Go to **Authentication → Users** in Supabase Dashboard
2. Click **Add user**
3. Create a user with email and password
4. After creation, click the user and go to **User metadata**
5. Add this JSON metadata:
```json
{
  "admin": true
}
```
6. Save and refresh

---

## Step 4: Verify Admin Access

1. Login with your admin account
2. Navigate to `/admin` (should see admin dashboard)
3. Check all these admin features work:
   - **/admin** - Dashboard with stats
   - **/admin/users** - View and manage users
   - **/admin/transactions** - View and verify transactions
   - **/admin/broadcasts** - Send messages to users
   - **/admin/features** - Create/manage app features
   - **/admin/messages** - Handle support requests
   - **/admin/settings** - Manage app settings

---

## Step 5: Glad Tidings Transaction Flow

### How it works:

1. **User deposits funds** → Transaction created with `status: 'pending'`
2. **Admin verifies deposit** → Change status to `'completed'`, mark `verified: true`
3. **Funds added to wallet** → User can now use funds for airtime/data/TV
4. **Services purchased** → New transaction created, deducted from wallet

### Verifying Transactions:

In the **Transactions** admin panel:
- View all user deposits
- Check Glad Tidings reference ID
- Mark as verified once money received
- Automatically updates user's wallet balance

---

## SQL Commands Summary

Copy and paste each section in order into your Supabase SQL Editor:

**Order to run:**
1. Create users table (1.1)
2. Create wallets table (1.2)
3. Create transactions table (1.3)
4. Create broadcasts table (1.4)
5. Create features table (1.5)
6. Create support tables (1.6)
7. Create admin settings table (1.7)
8. Create user trigger function (1.8)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Permission denied" errors | Check RLS policies are enabled correctly |
| Admin panel not accessible | Verify user has `admin: true` in metadata |
| No data showing in transactions | Create test transactions via the app |
| Wallets not created for new users | Check trigger is active on auth.users |

---

## Next Steps

1. ✅ Run all SQL commands above
2. ✅ Create admin user in Supabase Auth
3. ✅ Set environment variables for Glad Tidings
4. ✅ Test login with admin account
5. ✅ Access `/admin` dashboard
6. ✅ Test each admin feature
