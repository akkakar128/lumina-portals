import { useState, useCallback } from 'react';
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
  Zap,
  Command,
  Home,
  Link2,
  Wrench,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CommandPalette from '@/components/admin/CommandPalette';
import UserManagementPanel from '@/components/admin/UserManagementPanel';
import FeatureFlagsPanel from '@/components/admin/FeatureFlagsPanel';
import AdminThemesPanel from '@/components/admin/ThemesPanel';
import ProjectsPanel from '@/components/admin/ProjectsPanel';
import SkillsPanel from '@/components/admin/SkillsPanel';
import SocialLinksPanel from '@/components/admin/SocialLinksPanel';

type AdminTab = 'overview' | 'portfolio' | 'skills' | 'social' | 'profile' | 'users' | 'themes' | 'settings' | 'backup' | 'features';

const AdminDashboard = () => {
  const { user, isMasterAdmin, isPortfolioAdmin, signOut, roles } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out' });
    navigate('/');
  };

  const handleNavigate = useCallback((tab: string) => {
    setActiveTab(tab as AdminTab);
  }, []);

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'action:add-project':
        setActiveTab('portfolio');
        toast({ title: 'Add a new project', description: 'Portfolio panel opened' });
        break;
      case 'action:preview':
        window.open('/', '_blank');
        break;
      case 'action:emergency-lock':
        setActiveTab('features');
        break;
    }
  }, [toast]);

  // Minimal nav items
  const navItems = [
    { id: 'overview' as AdminTab, icon: LayoutDashboard, roles: ['master_admin', 'portfolio_admin', 'viewer'] },
    { id: 'portfolio' as AdminTab, icon: FolderOpen, roles: ['master_admin', 'portfolio_admin'] },
    { id: 'skills' as AdminTab, icon: Wrench, roles: ['master_admin', 'portfolio_admin'] },
    { id: 'social' as AdminTab, icon: Link2, roles: ['master_admin', 'portfolio_admin'] },
    { id: 'profile' as AdminTab, icon: User, roles: ['master_admin', 'portfolio_admin'] },
    { id: 'users' as AdminTab, icon: Users, roles: ['master_admin'] },
    { id: 'features' as AdminTab, icon: Zap, roles: ['master_admin'] },
    { id: 'themes' as AdminTab, icon: Palette, roles: ['master_admin'] },
    { id: 'settings' as AdminTab, icon: Settings, roles: ['master_admin', 'portfolio_admin'] },
    { id: 'backup' as AdminTab, icon: Download, roles: ['master_admin'] },
  ].filter(item => item.roles.some(r => roles.includes(r as any)));

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel isMasterAdmin={isMasterAdmin} />;
      case 'portfolio':
        return <ProjectsPanel />;
      case 'skills':
        return <SkillsPanel />;
      case 'social':
        return <SocialLinksPanel />;
      case 'profile':
        return <ProfilePanel />;
      case 'users':
        return <UserManagementPanel />;
      case 'features':
        return <FeatureFlagsPanel />;
      case 'themes':
        return <AdminThemesPanel />;
      case 'settings':
        return <SettingsPanel isMasterAdmin={isMasterAdmin} />;
      case 'backup':
        return <BackupPanel />;
      default:
        return <OverviewPanel isMasterAdmin={isMasterAdmin} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Command Palette */}
      <CommandPalette onNavigate={handleNavigate} onAction={handleAction} />

      {/* Minimal sidebar */}
      <aside className="w-14 border-r border-border/50 flex flex-col items-center py-4 bg-card/50">
        {/* Logo */}
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center mb-6">
          <Shield className="w-4 h-4 text-primary" />
        </div>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-all
                ${activeTab === item.id 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
              title={item.id.charAt(0).toUpperCase() + item.id.slice(1)}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-1 mt-auto">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            title="Go to site"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="h-12 border-b border-border/50 flex items-center justify-between px-6 bg-card/30">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-sm font-semibold capitalize">{activeTab}</h1>
            <span className={`
              px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded
              ${isMasterAdmin ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
            `}>
              {isMasterAdmin ? 'Master' : isPortfolioAdmin ? 'Admin' : 'Viewer'}
            </span>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            <Command className="w-3 h-3" />
            <span className="font-mono text-xs">K</span>
          </button>
        </header>

        {/* Content */}
        <div className="p-6 max-w-4xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Panel Components
const OverviewPanel = ({ isMasterAdmin }: { isMasterAdmin: boolean }) => (
  <div className="space-y-8">
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground font-mono text-xs mt-1">
        {isMasterAdmin ? 'Full system control' : 'Portfolio management'}
      </p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard title="Projects" value="0" />
      <StatCard title="Skills" value="0" />
      <StatCard title="Views" value="--" />
      {isMasterAdmin && <StatCard title="Users" value="--" />}
    </div>

    <div className="space-y-3">
      <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Keyboard shortcuts</p>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="flex justify-between p-2 rounded bg-muted/30">
          <span className="text-muted-foreground">Command palette</span>
          <span>⌘K</span>
        </div>
        <div className="flex justify-between p-2 rounded bg-muted/30">
          <span className="text-muted-foreground">Overview</span>
          <span>⌥1</span>
        </div>
        <div className="flex justify-between p-2 rounded bg-muted/30">
          <span className="text-muted-foreground">Portfolio</span>
          <span>⌥2</span>
        </div>
        <div className="flex justify-between p-2 rounded bg-muted/30">
          <span className="text-muted-foreground">Profile</span>
          <span>⌥3</span>
        </div>
      </div>
    </div>
  </div>
);

const PortfolioPanel = () => (
  <div className="space-y-6">
    <h1 className="font-display text-2xl font-bold">Portfolio</h1>
    <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
      <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground font-mono text-sm">
        Portfolio management coming soon
      </p>
      <p className="text-muted-foreground font-mono text-xs mt-2">
        Add projects • Manage skills • Configure links
      </p>
    </div>
  </div>
);

const ProfilePanel = () => (
  <div className="space-y-6">
    <h1 className="font-display text-2xl font-bold">Profile</h1>
    <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
      <User className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground font-mono text-sm">
        Profile settings coming soon
      </p>
    </div>
  </div>
);

const SettingsPanel = ({ isMasterAdmin }: { isMasterAdmin: boolean }) => (
  <div className="space-y-6">
    <h1 className="font-display text-2xl font-bold">Settings</h1>
    <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
      <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground font-mono text-sm">
        {isMasterAdmin ? 'System settings' : 'Personal settings'} coming soon
      </p>
    </div>
  </div>
);

const BackupPanel = () => (
  <div className="space-y-6">
    <h1 className="font-display text-2xl font-bold">Backup</h1>
    <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
      <Download className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground font-mono text-sm">
        Export & backup tools coming soon
      </p>
    </div>
  </div>
);

// Utility components
const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="p-3 rounded-lg border border-border/50 bg-card/30">
    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{title}</p>
    <p className="font-display text-2xl font-bold text-foreground mt-1">{value}</p>
  </div>
);

export default AdminDashboard;
