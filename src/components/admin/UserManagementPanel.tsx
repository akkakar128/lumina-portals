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
  Plus,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles {
  user_id: string;
  email: string;
  display_name: string | null;
  roles: AppRole[];
  created_at: string;
}

interface AllowedEmail {
  email: string;
  is_admin: boolean;
  created_at: string;
}

const UserManagementPanel = () => {
  const { isMasterAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('portfolio_admin');
  const [inviting, setInviting] = useState(false);
  const [newAllowedEmail, setNewAllowedEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (isMasterAdmin) {
      fetchUsers();
      fetchAllowedEmails();
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

  const fetchAllowedEmails = async () => {
    setLoadingEmails(true);
    try {
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('email, is_admin, created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAllowedEmails(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching allowed emails',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleAddAllowedEmail = async () => {
    if (!newAllowedEmail.trim()) return;

    const emailToAdd = newAllowedEmail.toLowerCase().trim();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToAdd)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setAddingEmail(true);
    try {
      const { error } = await supabase
        .from('allowed_emails')
        .insert({ email: emailToAdd, is_admin: false });

      if (error) {
        if (error.code === '23505') {
          throw new Error('This email is already in the allowed list.');
        }
        throw error;
      }

      toast({
        title: 'Email added',
        description: `${emailToAdd} can now request login access.`,
      });
      setNewAllowedEmail('');
      fetchAllowedEmails();
    } catch (error: any) {
      toast({
        title: 'Error adding email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveAllowedEmail = async (email: string) => {
    try {
      const { error } = await supabase
        .from('allowed_emails')
        .delete()
        .eq('email', email);

      if (error) throw error;

      toast({
        title: 'Email removed',
        description: `${email} can no longer request login access.`,
      });
      fetchAllowedEmails();
    } catch (error: any) {
      toast({
        title: 'Error removing email',
        description: error.message,
        variant: 'destructive',
      });
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

    const emailToInvite = inviteEmail.toLowerCase().trim();
    setInviting(true);
    
    try {
      // First, add the email to allowed_emails if not already there
      const { error: insertError } = await supabase
        .from('allowed_emails')
        .insert({ email: emailToInvite, is_admin: false });

      // Ignore duplicate key error
      if (insertError && insertError.code !== '23505') {
        throw insertError;
      }

      // Then send magic link via edge function
      const response = await supabase.functions.invoke('request-otp', {
        body: {
          email: emailToInvite,
          redirectTo: `${window.location.origin}/admin`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send invite');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: 'Invite sent!',
        description: `Magic link sent to ${emailToInvite}`,
      });
      setInviteDialogOpen(false);
      setInviteEmail('');
      fetchAllowedEmails();
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

  const filteredEmails = allowedEmails.filter(item =>
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="font-display text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Manage users and email whitelist
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Registered Users ({users.length})</TabsTrigger>
          <TabsTrigger value="whitelist">Email Whitelist ({allowedEmails.length})</TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === 'users' ? 'Search users...' : 'Search emails...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>

        <TabsContent value="users" className="mt-4">
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
        </TabsContent>

        <TabsContent value="whitelist" className="mt-4">
          {/* Add Email Form */}
          <div className="flex gap-2 mb-4">
            <Input
              type="email"
              placeholder="Enter email to whitelist..."
              value={newAllowedEmail}
              onChange={(e) => setNewAllowedEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAllowedEmail()}
              className="bg-muted/50 border-border/50"
            />
            <Button onClick={handleAddAllowedEmail} disabled={addingEmail || !newAllowedEmail.trim()}>
              {addingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>

          {/* Email List */}
          {loadingEmails ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm">
              No whitelisted emails found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmails.map((item) => (
                <div
                  key={item.email}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.is_admin ? 'bg-primary/20' : 'bg-muted'}`}>
                      <Mail className={`w-4 h-4 ${item.is_admin ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm truncate">{item.email}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.is_admin && (
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-primary/20 text-primary">
                        Admin
                      </span>
                    )}
                    {!item.is_admin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveAllowedEmail(item.email)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground font-mono mt-4">
            Only emails in this list can request OTP login. Admin emails cannot be removed.
          </p>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Add email to whitelist and send a magic link invite.
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
