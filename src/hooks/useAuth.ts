import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer admin check with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
        return;
      }

      if (data) {
        console.log("Admin role found for user:", userId);
        setIsAdmin(true);
      } else {
        console.log("No admin role found for user:", userId);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Exception checking admin role:", err);
      setIsAdmin(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const grantAdminRole = async (email?: string) => {
    try {
      if (email) {
        const { data, error } = await supabase.rpc('grant_admin_role', { user_email: email });
        if (error) throw error;
        // Refresh admin status
        if (user) {
          await checkAdminRole(user.id);
        }
        return { success: true, error: null };
      } else if (user) {
        const { data, error } = await supabase.rpc('grant_admin_role_by_id', { user_uuid: user.id });
        if (error) throw error;
        // Refresh admin status
        await checkAdminRole(user.id);
        return { success: true, error: null };
      }
      return { success: false, error: new Error('No user or email provided') };
    } catch (err) {
      console.error('Error granting admin role:', err);
      return { success: false, error: err };
    }
  };

  return {
    user,
    session,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    grantAdminRole,
    checkAdminRole
  };
}
