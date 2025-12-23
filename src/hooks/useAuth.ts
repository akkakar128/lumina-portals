import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  isMasterAdmin: boolean;
  isPortfolioAdmin: boolean;
  isViewer: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    roles: [],
    loading: true,
    isMasterAdmin: false,
    isPortfolioAdmin: false,
    isViewer: false,
  });

  const fetchUserRoles = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data?.map(r => r.role) || [];
  }, []);

  const updateAuthState = useCallback((session: Session | null, roles: AppRole[] = []) => {
    setAuthState({
      user: session?.user ?? null,
      session,
      roles,
      loading: false,
      isMasterAdmin: roles.includes('master_admin'),
      isPortfolioAdmin: roles.includes('portfolio_admin'),
      isViewer: roles.includes('viewer'),
    });
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Synchronous state update only
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: true,
        }));

        // Defer role fetching to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const roles = await fetchUserRoles(session.user.id);
            updateAuthState(session, roles);
          }, 0);
        } else {
          updateAuthState(null, []);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const roles = await fetchUserRoles(session.user.id);
        updateAuthState(session, roles);
      } else {
        updateAuthState(null, []);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRoles, updateAuthState]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: AppRole) => authState.roles.includes(role);

  const hasAnyRole = (roles: AppRole[]) => roles.some(r => authState.roles.includes(r));

  return {
    ...authState,
    signOut,
    hasRole,
    hasAnyRole,
  };
};

export default useAuth;
