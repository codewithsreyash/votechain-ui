-- Migration to fix admin access issues
-- This creates a function that can grant admin role to users

-- Function to grant admin role (bypasses RLS using SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.grant_admin_role(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- If user not found, return false
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role (ON CONFLICT will ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Function to grant admin role by user ID
CREATE OR REPLACE FUNCTION public.grant_admin_role_by_id(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert admin role (ON CONFLICT will ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_uuid, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.grant_admin_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_role_by_id(UUID) TO authenticated;

-- Update RLS policy to allow users to view all roles (for debugging)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (true);

-- Allow users to insert their own admin role (for first-time setup)
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Users can insert own admin role" ON public.user_roles FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-grant admin to first user (if no admins exist)
DO $$
DECLARE
  first_user_id UUID;
  admin_count INTEGER;
BEGIN
  -- Check if any admins exist
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  -- If no admins, grant admin to first user
  IF admin_count = 0 THEN
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (first_user_id, 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE NOTICE 'Admin role granted to first user: %', first_user_id;
    END IF;
  END IF;
END $$;

