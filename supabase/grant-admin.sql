-- Script to grant admin role to a user
-- IMPORTANT: First run the migration: 20251203000000_fix_admin_access.sql
-- This creates the grant_admin_role function

-- Option 1: Use the function (RECOMMENDED - after migration is run)
SELECT public.grant_admin_role('sr@gmail.com');

-- Option 2: Direct insert (if function doesn't work)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'sr@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Option 3: Grant admin role by user ID
-- First, get your user ID:
-- SELECT id, email FROM auth.users WHERE email = 'sr@gmail.com';
-- Then use:
-- SELECT public.grant_admin_role_by_id('YOUR_USER_ID_HERE');

-- To verify the admin role was granted:
SELECT u.email, ur.role, ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'sr@gmail.com' AND ur.role = 'admin';

