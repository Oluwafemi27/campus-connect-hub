-- Campus Connect Database Schema
-- Comprehensive Supabase database setup for Campus Connect
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- SECTION 1: USERS TABLE
-- =============================================================================

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
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
CREATE POLICY "Service role can manage users"
  ON public.users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- SECTION 2: WALLETS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  virtual_account TEXT,
  last_topup TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON public.wallets(balance);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Wallets
DROP POLICY IF EXISTS "Users can read own wallet" ON public.wallets;
CREATE POLICY "Users can read own wallet"
  ON public.wallets
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;
CREATE POLICY "Users can update own wallet"
  ON public.wallets
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can manage wallets" ON public.wallets;
CREATE POLICY "Service role can manage wallets"
  ON public.wallets
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- SECTION 3: TRANSACTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('airtime', 'data', 'tv', 'topup', 'router')),
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
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_glad_tidings_ref ON public.transactions(glad_tidings_ref);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Transactions
DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;
CREATE POLICY "Users can read own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Admins and service can update transactions" ON public.transactions;
CREATE POLICY "Admins and service can update transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- SECTION 4: ROUTERS TABLE (Campus WiFi routers)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.routers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
  last_seen TIMESTAMP WITH TIME ZONE,
  connected_users INTEGER DEFAULT 0,
  bandwidth_mbps INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_routers_status ON public.routers(status);
CREATE INDEX IF NOT EXISTS idx_routers_location ON public.routers(location);

ALTER TABLE public.routers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read routers" ON public.routers;
CREATE POLICY "Anyone can read routers"
  ON public.routers
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage routers" ON public.routers;
CREATE POLICY "Admins can manage routers"
  ON public.routers
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- SECTION 5: BROADCASTS TABLE
-- =============================================================================

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
CREATE INDEX IF NOT EXISTS idx_broadcasts_scheduled ON public.broadcasts(scheduled_at);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Broadcasts
DROP POLICY IF EXISTS "Admins can read broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can read broadcasts"
  ON public.broadcasts
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can create broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can create broadcasts"
  ON public.broadcasts
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can update broadcasts"
  ON public.broadcasts
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can delete broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can delete broadcasts"
  ON public.broadcasts
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- SECTION 6: FEATURES TABLE
-- =============================================================================

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

DROP POLICY IF EXISTS "Anyone can read active features" ON public.features;
CREATE POLICY "Anyone can read active features"
  ON public.features
  FOR SELECT
  USING (is_active = true OR auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can manage features" ON public.features;
CREATE POLICY "Admins can manage features"
  ON public.features
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- SECTION 7: SUPPORT MESSAGES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
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
CREATE INDEX IF NOT EXISTS idx_support_messages_priority ON public.support_messages(priority);
CREATE INDEX IF NOT EXISTS idx_support_replies_message ON public.support_replies(message_id);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Support Messages
DROP POLICY IF EXISTS "Users can read own messages and admins read all" ON public.support_messages;
CREATE POLICY "Users can read own messages and admins read all"
  ON public.support_messages
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Users can create messages" ON public.support_messages;
CREATE POLICY "Users can create messages"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update message status" ON public.support_messages;
CREATE POLICY "Admins can update message status"
  ON public.support_messages
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can read all replies" ON public.support_replies;
CREATE POLICY "Admins can read all replies"
  ON public.support_replies
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.uid() IN (
    SELECT user_id FROM public.support_messages WHERE id = message_id
  ));

DROP POLICY IF EXISTS "Users and admins can create replies" ON public.support_replies;
CREATE POLICY "Users and admins can create replies"
  ON public.support_replies
  FOR INSERT
  WITH CHECK (auth.uid() = reply_by OR auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- SECTION 8: ADMIN SETTINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(setting_key);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read settings" ON public.admin_settings;
CREATE POLICY "Admins can read settings"
  ON public.admin_settings
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;
CREATE POLICY "Admins can manage settings"
  ON public.admin_settings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value, description, updated_by)
SELECT 'maintenance_mode', 'false', 'Enable/disable maintenance mode', 
       (SELECT id FROM public.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'maintenance_mode');

INSERT INTO public.admin_settings (setting_key, setting_value, description, updated_by)
SELECT 'allow_signups', 'true', 'Enable/disable user registrations', 
       (SELECT id FROM public.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'allow_signups');

INSERT INTO public.admin_settings (setting_key, setting_value, description, updated_by)
SELECT 'glad_tidings_account', 'your-static-account-here', 'Glad Tidings static account ID', 
       (SELECT id FROM public.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'glad_tidings_account');

INSERT INTO public.admin_settings (setting_key, setting_value, description, updated_by)
SELECT 'operator_mtn', 'true', 'Enable MTN operator', 
       (SELECT id FROM public.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'operator_mtn');

INSERT INTO public.admin_settings (setting_key, setting_value, description, updated_by)
SELECT 'operator_airtel', 'true', 'Enable Airtel operator', 
       (SELECT id FROM public.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'operator_airtel');

INSERT INTO public.admin_settings (setting_key, setting_value, description, updated_by)
SELECT 'operator_glo', 'true', 'Enable GLO operator', 
       (SELECT id FROM public.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'operator_glo');

INSERT INTO public.admin_settings (setting_key, setting_value, description, updated_by)
SELECT 'operator_9mobile', 'true', 'Enable 9mobile operator', 
       (SELECT id FROM public.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'operator_9mobile');

-- =============================================================================
-- SECTION 9: NOTIFICATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'topup', 'airtime', 'data', 'tv', 'router', 'broadcast')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Service can create notifications" ON public.notifications;
CREATE POLICY "Service can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================================================
-- SECTION 10: USER TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.users (id, email, name, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  );

  -- Create wallet for user
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0.00);

  -- Create welcome notification
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    new.id,
    'Welcome to Campus Connect!',
    'Your account has been created successfully. Top up your wallet to start purchasing data, airtime, and more.',
    'general'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- SECTION 11: UPDATED_AT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_routers_updated_at ON public.routers;
CREATE TRIGGER update_routers_updated_at
  BEFORE UPDATE ON public.routers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_broadcasts_updated_at ON public.broadcasts;
CREATE TRIGGER update_broadcasts_updated_at
  BEFORE UPDATE ON public.broadcasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_features_updated_at ON public.features;
CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON public.features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_messages_updated_at ON public.support_messages;
CREATE TRIGGER update_support_messages_updated_at
  BEFORE UPDATE ON public.support_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON public.admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- SECTION 12: ENABLE REALTIME
-- =============================================================================

-- Enable realtime for key tables (run via Supabase Dashboard or API)
-- Note: This requires Supabase Pro plan or equivalent

ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.features;

-- =============================================================================
-- SECTION 13: SAMPLE DATA (Optional - for development)
-- =============================================================================

-- Sample routers for testing
INSERT INTO public.routers (name, location, status, connected_users, bandwidth_mbps)
SELECT * FROM (VALUES
  ('Router-A1', 'Library Block A', 'online', 45, 100),
  ('Router-A2', 'Library Block B', 'online', 32, 100),
  ('Router-C1', 'Computer Lab', 'online', 28, 50),
  ('Router-M1', 'Main Hall', 'online', 67, 200),
  ('Router-M2', 'Main Hall Annex', 'offline', 0, 100),
  ('Router-C2', 'Science Block', 'online', 19, 50),
  ('Router-S1', 'Student Center', 'maintenance', 0, 100),
  ('Router-H1', 'Hostel Block A', 'online', 54, 150)
) AS t(name, location, status, connected_users, bandwidth_mbps)
WHERE NOT EXISTS (SELECT 1 FROM public.routers LIMIT 1);

-- Sample features for testing
INSERT INTO public.features (title, description, icon, is_active, display_order)
SELECT * FROM (VALUES
  ('Airtime Top-up', 'Buy airtime for all networks instantly', 'Smartphone', true, 1),
  ('Data Bundles', 'Purchase affordable data bundles', 'Wifi', true, 2),
  ('TV Subscription', 'Renew your DStv, GOtv, or Startimes', 'Tv', true, 3),
  ('Campus WiFi', 'Connect to campus routers', 'Radio', true, 4)
) AS t(title, description, icon, is_active, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.features LIMIT 1);

-- =============================================================================
-- NOTES:
-- 
-- 1. Run this script in the Supabase SQL Editor
-- 2. After running, enable Realtime for the specified tables in Supabase Dashboard
--    (Database → Replication → Tables)
-- 3. Set the GLAD_TIDINGS_API_KEY secret in Supabase Edge Functions
-- 4. Deploy the glad-tidings-webhook Edge Function
-- 5. Configure Glad Tidings webhook URL in their dashboard
-- =============================================================================
