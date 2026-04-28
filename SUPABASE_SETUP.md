# Supabase Database Setup

Follow these steps to set up your Supabase database tables for the Campus Connect app.

## 1. Create Users Table

Go to your Supabase Dashboard → SQL Editor and run this query:

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

-- Create index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);
```

## 2. Create Transactions Table

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## 3. Create Routers Table (Optional)

```sql
CREATE TABLE IF NOT EXISTS public.routers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
  last_seen TIMESTAMP WITH TIME ZONE,
  connected_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_routers_status ON public.routers(status);

ALTER TABLE public.routers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read routers"
  ON public.routers
  FOR SELECT
  USING (true);
```

## 4. Create Wallet/Accounts Table (Optional)

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

## 5. Automatically Create User Profile on Signup

Go to Supabase Dashboard → Database → Functions and create this function:

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

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 6. Test the Setup

After running all queries:

1. Go to Authentication → Users in Supabase Dashboard
2. Create a test user or sign up through the app
3. You should see data appear in your `public.users` table
4. The admin dashboard should now show real data

## Troubleshooting

- **"Permission denied" errors**: Make sure RLS policies are set correctly
- **No data showing in tables**: Verify the trigger is created and active
- **Users table empty**: Check that new user registrations go through the auth flow

## Notes

- Row Level Security (RLS) is enabled to protect user data
- Admin users have full access to all tables (check `auth.jwt() ->> 'role'`)
- Transactions are automatically linked to users and cascade delete when user is deleted
- Consider adding more analytics tables for detailed reporting later
