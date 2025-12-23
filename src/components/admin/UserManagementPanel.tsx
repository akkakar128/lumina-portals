import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Mail, 
  Shield, 
  ShieldOff, 
  Trash2, 
  MoreVertical,
  UserPlus,
  Search,
  Loader2,
  Ban,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles {
  user_id: string;
  email: string;
  display_name: string | null;
  roles: AppRole[];
  created_at: string;
}

const UserManagementPanel = () => {
  const { isMasterAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('portfolio_admin');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (isMasterAdmin) {
      fetchUsers();
    }
  }, [isMasterAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, created_at');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
        user_id: profile.user_id,
        email: '', // We'll need to fetch this separately or store in profiles
        display_name: profile.display_name,
        roles: (roles || [])
          .filter(r => r.user_id === profile.user_id)
          .map(r => r.role),
        created_at: profile.created_at,
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: 'Error fetching users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole, action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', newRole);
        if (error) throw error;
      }

      toast({
        title: 'Role updated',
        description: `Successfully ${action === 'add' ? 'assigned' : 'removed'} ${newRole} role.`,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      // Send magic link invite
      const { error } = await supabase.auth.signInWithOtp({
        email: inviteEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        }
      });

      if (error) throw error;

      toast({
        title: 'Invite sent!',
        description: `Magic link sent to ${inviteEmail}`,
      });
      setInviteDialogOpen(false);
      setInviteEmail('');
    } catch (error: any) {
      toast({
        title: 'Error sending invite',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setInviting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.display_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    user.user_id.includes(searchQuery)
  );

  if (!isMasterAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-mono text-sm">Master Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/50 border-border/50"
        />
      </div>

      {/* User List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-mono text-sm">
          No users found
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.user_id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm truncate">
                    {user.display_name || 'Unnamed User'}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {user.user_id.substring(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Role badges */}
                <div className="hidden sm:flex gap-1">
                  {user.roles.map(role => (
                    <span
                      key={role}
                      className={`
                        px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded
                        ${role === 'master_admin' ? 'bg-primary/20 text-primary' : ''}
                        ${role === 'portfolio_admin' ? 'bg-accent/20 text-accent-foreground' : ''}
                        ${role === 'viewer' ? 'bg-muted text-muted-foreground' : ''}
                      `}
                    >
                      {role.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!user.roles.includes('portfolio_admin') && (
                      <DropdownMenuItem onClick={() => handleRoleChange(user.user_id, 'portfolio_admin', 'add')}>
                        <Shield className="w-4 h-4 mr-2" />
                        Grant Portfolio Admin
                      </DropdownMenuItem>
                    )}
                    {user.roles.includes('portfolio_admin') && (
                      <DropdownMenuItem onClick={() => handleRoleChange(user.user_id, 'portfolio_admin', 'remove')}>
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Revoke Portfolio Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Ban className="w-4 h-4 mr-2" />
                      Disable Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send a magic link invite to a new user's email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                Initial Role
              </label>
              <div className="flex gap-2">
                <Button
                  variant={inviteRole === 'portfolio_admin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInviteRole('portfolio_admin')}
                >
                  Portfolio Admin
                </Button>
                <Button
                  variant={inviteRole === 'viewer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInviteRole('viewer')}
                >
                  Viewer
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser} disabled={inviting || !inviteEmail}>
              {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPanel;
