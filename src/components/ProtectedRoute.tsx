import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
  requireAny?: boolean; // If true, user needs any of the roles. If false, needs all.
}

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requireAny = true 
}: ProtectedRouteProps) => {
  const { user, loading, roles, hasRole, hasAnyRole } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-mono text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to home (not auth page - keep it secret)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    const hasAccess = requireAny 
      ? hasAnyRole(requiredRoles) 
      : requiredRoles.every(r => hasRole(r));

    if (!hasAccess) {
      // User is authenticated but doesn't have required role
      return (
        <div className="min-h-screen flex items-center justify-center bg-background cyber-grid">
          <div className="glass-card p-8 max-w-md text-center">
            <h1 className="font-display text-2xl font-bold text-destructive mb-4">
              Access Denied
            </h1>
            <p className="font-mono text-sm text-muted-foreground mb-6">
              You don't have permission to access this area.
              <br />Current role: {roles.join(', ') || 'none'}
            </p>
            <a href="/" className="cyber-button inline-block">
              Return Home
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
