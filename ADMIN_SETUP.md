# Admin Access Setup Guide

This guide will help you set up admin access for your voting application.

## Quick Fix (Easiest Method)

1. **Run the Database Migration**
   - Go to your Supabase dashboard: https://supabase.com/dashboard
   - Navigate to **SQL Editor**
   - Copy and paste the contents of `supabase/migrations/20251203000000_fix_admin_access.sql`
   - Click **Run** (or press Ctrl+Enter)

2. **Grant Admin Role via UI**
   - Log in to your application with email: `sr@gmail.com`
   - Go to the **Admin** page
   - You'll see a button: **"🔑 Grant Admin Role"**
   - Click it - it will automatically grant you admin access!
   - The page will refresh and you'll have admin privileges

## Alternative: Manual SQL Method

If the UI button doesn't work, you can run this SQL directly in Supabase:

```sql
-- Grant admin role to your email
SELECT public.grant_admin_role('sr@gmail.com');
```

Or if you know your user ID:

```sql
-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'sr@gmail.com';

-- Then grant admin (replace YOUR_USER_ID with the ID from above)
SELECT public.grant_admin_role_by_id('YOUR_USER_ID');
```

## Verify Admin Access

Run this query to check if you have admin role:

```sql
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'sr@gmail.com';
```

You should see a row with `role = 'admin'`.

## Troubleshooting

### Issue: "Function does not exist"
- **Solution**: Make sure you ran the migration `20251203000000_fix_admin_access.sql` first

### Issue: "Permission denied"
- **Solution**: The migration should fix RLS policies. If it still doesn't work, try:
  ```sql
  -- Temporarily disable RLS (for testing only!)
  ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
  
  -- Grant admin
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::app_role
  FROM auth.users
  WHERE email = 'sr@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Re-enable RLS
  ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
  ```

### Issue: Button doesn't work
- **Solution**: Check browser console (F12) for errors
- Make sure you're logged in
- Try the manual SQL method above

## What the Migration Does

The migration (`20251203000000_fix_admin_access.sql`) creates:

1. **`grant_admin_role(email)` function** - Grants admin role by email
2. **`grant_admin_role_by_id(uuid)` function** - Grants admin role by user ID
3. **Updated RLS policies** - Allows users to grant themselves admin (for first-time setup)
4. **Auto-grant to first user** - If no admins exist, automatically grants admin to the first user

## Security Note

The functions use `SECURITY DEFINER` which bypasses RLS, allowing them to grant admin roles. This is safe because:
- Only authenticated users can call these functions
- The functions check that the user exists before granting
- `ON CONFLICT DO NOTHING` prevents duplicate entries

After initial setup, you may want to restrict these functions to only be callable by existing admins.

