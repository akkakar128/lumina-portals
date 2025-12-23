import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FolderOpen, 
  Settings, 
  LogOut, 
  Shield,
  Users,
  Palette,
  Download,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AdminTab = 'overview' | 'portfolio' | 'profile' | 'users' | 'themes' | 'settings' | 'backup';

const AdminDashboard = () => {
  const { user, isMasterAdmin, isPortfolioAdmin, signOut, roles } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out', description: 'You have been signed out successfully.' });
    navigate('/');
  };

  // Menu items based on role
  const menuItems = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard, roles: ['master_admin', 'portfolio_admin', 'viewer'] },
    { id: 'portfolio' as AdminTab, label: 'Portfolio', icon: FolderOpen, roles: ['master_admin', 'portfolio_admin'] },
    { id: 'profile' as AdminTab, label: 'Profile', icon: User, roles: ['master_admin', 'portfolio_admin'] },
    { id: 'users' as AdminTab, label: 'User Management', icon: Users, roles: ['master_admin'] },
    { id: 'themes' as AdminTab, label: 'Theme Control', icon: Palette, roles: ['master_admin'] },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings, roles: ['master_admin', 'portfolio_admin'] },
    { id: 'backup' as AdminTab, label: 'Backup & Export', icon: Download, roles: ['master_admin'] },
  ].filter(item => item.roles.some(r => roles.includes(r as any)));

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel isMasterAdmin={isMasterAdmin} />;
      case 'portfolio':
        return <PortfolioPanel />;
      case 'profile':
        return <ProfilePanel />;
      case 'users':
        return isMasterAdmin ? <UsersPanel /> : <AccessDenied />;
      case 'themes':
        return isMasterAdmin ? <ThemesPanel /> : <AccessDenied />;
      case 'settings':
        return <SettingsPanel isMasterAdmin={isMasterAdmin} />;
      case 'backup':
        return isMasterAdmin ? <BackupPanel /> : <AccessDenied />;
      default:
        return <OverviewPanel isMasterAdmin={isMasterAdmin} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative z-40 h-screen bg-card border-r border-border
          transition-all duration-300 flex flex-col
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-lg">Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:block p-1 hover:bg-muted rounded transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role badge */}
        <div className={`px-4 py-2 border-b border-border ${sidebarCollapsed ? 'hidden' : ''}`}>
          <span className={`
            inline-block px-2 py-1 text-xs font-mono uppercase tracking-wider rounded
            ${isMasterAdmin ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent-foreground'}
          `}>
            {isMasterAdmin ? 'Master Admin' : isPortfolioAdmin ? 'Portfolio Admin' : 'Viewer'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                ${activeTab === item.id 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-mono text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User & Sign out */}
        <div className="p-4 border-t border-border space-y-2">
          {!sidebarCollapsed && (
            <div className="text-xs font-mono text-muted-foreground truncate">
              {user?.email}
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg
              text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-mono text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Panel Components
const OverviewPanel = ({ isMasterAdmin }: { isMasterAdmin: boolean }) => (
  <div className="space-y-6">
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard Overview</h1>
      <p className="text-muted-foreground font-mono text-sm mt-1">
        {isMasterAdmin ? 'Full system control enabled' : 'Manage your portfolio'}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Projects" value="0" subtitle="In portfolio" />
      <StatCard title="Skills" value="0" subtitle="Listed" />
      <StatCard title="Views" value="--" subtitle="This month" />
      {isMasterAdmin && <StatCard title="Users" value="--" subtitle="Total" />}
    </div>

    <div className="glass-card p-6">
      <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickAction label="Add Project" icon={FolderOpen} />
        <QuickAction label="Edit Profile" icon={User} />
        <QuickAction label="View Portfolio" icon={LayoutDashboard} />
      </div>
    </div>
  </div>
);

const PortfolioPanel = () => (
  <div className="space-y-6">
    <h1 className="font-display text-3xl font-bold">Portfolio Management</h1>
    <div className="glass-card p-6">
      <p className="text-muted-foreground font-mono text-sm">
        Portfolio management coming soon. You'll be able to:
      </p>
      <ul className="mt-4 space-y-2 text-sm font-mono text-muted-foreground">
        <li>• Add, edit, and remove projects</li>
        <li>• Manage skills and proficiency levels</li>
        <li>• Configure social links</li>
        <li>• Set portfolio visibility</li>
      </ul>
    </div>
  </div>
);

const ProfilePanel = () => (
  <div className="space-y-6">
    <h1 className="font-display text-3xl font-bold">Profile Settings</h1>
    <div className="glass-card p-6">
      <p className="text-muted-foreground font-mono text-sm">
        Profile management coming soon.
      </p>
    </div>
  </div>
);

const UsersPanel = () => (
  <div className="space-y-6">
    <h1 className="font-display text-3xl font-bold">User Management</h1>
    <p className="text-muted-foreground font-mono text-sm">
      Master Admin only • Manage all users and roles
    </p>
    <div className="glass-card p-6">
      <p className="text-muted-foreground font-mono text-sm">
        User management features:
      </p>
      <ul className="mt-4 space-y-2 text-sm font-mono text-muted-foreground">
        <li>• View all registered users</li>
        <li>• Assign or revoke roles</li>
        <li>• Instantly disable accounts</li>
        <li>• Monitor user activity</li>
      </ul>
    </div>
  </div>
);

const ThemesPanel = () => (
  <div className="space-y-6">
    <h1 className="font-display text-3xl font-bold">Theme Control</h1>
    <p className="text-muted-foreground font-mono text-sm">
      Master Admin only • Global theme settings
    </p>
    <div className="glass-card p-6">
      <p className="text-muted-foreground font-mono text-sm">
        Theme control coming soon.
      </p>
    </div>
  </div>
);

const SettingsPanel = ({ isMasterAdmin }: { isMasterAdmin: boolean }) => (
  <div className="space-y-6">
    <h1 className="font-display text-3xl font-bold">Settings</h1>
    <div className="glass-card p-6">
      <p className="text-muted-foreground font-mono text-sm">
        {isMasterAdmin 
          ? 'Full system settings access' 
          : 'Personal settings only'}
      </p>
    </div>
  </div>
);

const BackupPanel = () => (
  <div className="space-y-6">
    <h1 className="font-display text-3xl font-bold">Backup & Export</h1>
    <p className="text-muted-foreground font-mono text-sm">
      Master Admin only • System backup tools
    </p>
    <div className="glass-card p-6">
      <p className="text-muted-foreground font-mono text-sm">
        Backup features:
      </p>
      <ul className="mt-4 space-y-2 text-sm font-mono text-muted-foreground">
        <li>• Export entire database</li>
        <li>• Download all media assets</li>
        <li>• Generate portfolio JSON</li>
        <li>• Schedule automatic backups</li>
      </ul>
    </div>
  </div>
);

const AccessDenied = () => (
  <div className="glass-card p-8 text-center">
    <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
    <h2 className="font-display text-xl font-bold text-destructive">Access Denied</h2>
    <p className="text-muted-foreground font-mono text-sm mt-2">
      This section requires Master Admin privileges.
    </p>
  </div>
);

// Utility components
const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
  <div className="glass-card p-4">
    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
    <p className="font-display text-3xl font-bold text-neon mt-1">{value}</p>
    <p className="font-mono text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

const QuickAction = ({ label, icon: Icon }: { label: string; icon: React.ElementType }) => (
  <button className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
    <Icon className="w-5 h-5 text-primary" />
    <span className="font-mono text-sm">{label}</span>
  </button>
);

export default AdminDashboard;
