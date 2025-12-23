import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  User,
  FolderOpen,
  Users,
  Palette,
  Settings,
  Download,
  LogOut,
  Home,
  Shield,
  Lock,
  Zap,
  Search,
  Plus,
  Eye,
} from 'lucide-react';

interface CommandPaletteProps {
  onNavigate?: (tab: string) => void;
  onAction?: (action: string) => void;
}

const CommandPalette = ({ onNavigate, onAction }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isMasterAdmin, signOut } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Quick navigation shortcuts
      if (e.altKey) {
        switch (e.key) {
          case '1': onNavigate?.('overview'); break;
          case '2': onNavigate?.('portfolio'); break;
          case '3': onNavigate?.('profile'); break;
          case '4': if (isMasterAdmin) onNavigate?.('users'); break;
          case '5': onNavigate?.('settings'); break;
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onNavigate, isMasterAdmin]);

  const handleSelect = (action: string) => {
    setOpen(false);
    
    if (action.startsWith('nav:')) {
      onNavigate?.(action.replace('nav:', ''));
    } else if (action === 'signout') {
      signOut();
      navigate('/');
    } else if (action === 'home') {
      navigate('/');
    } else {
      onAction?.(action);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect('nav:overview')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
            <CommandShortcut>⌥1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('nav:portfolio')}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Portfolio
            <CommandShortcut>⌥2</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('nav:profile')}>
            <User className="mr-2 h-4 w-4" />
            Profile
            <CommandShortcut>⌥3</CommandShortcut>
          </CommandItem>
          {isMasterAdmin && (
            <CommandItem onSelect={() => handleSelect('nav:users')}>
              <Users className="mr-2 h-4 w-4" />
              User Management
              <CommandShortcut>⌥4</CommandShortcut>
            </CommandItem>
          )}
          <CommandItem onSelect={() => handleSelect('nav:settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
            <CommandShortcut>⌥5</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleSelect('action:add-project')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('action:preview')}>
            <Eye className="mr-2 h-4 w-4" />
            Preview Portfolio
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('home')}>
            <Home className="mr-2 h-4 w-4" />
            Go to Site
          </CommandItem>
        </CommandGroup>

        {isMasterAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Master Admin">
              <CommandItem onSelect={() => handleSelect('nav:users')}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </CommandItem>
              <CommandItem onSelect={() => handleSelect('nav:themes')}>
                <Palette className="mr-2 h-4 w-4" />
                Theme Control
              </CommandItem>
              <CommandItem onSelect={() => handleSelect('nav:features')}>
                <Zap className="mr-2 h-4 w-4" />
                Feature Flags
              </CommandItem>
              <CommandItem onSelect={() => handleSelect('nav:backup')}>
                <Download className="mr-2 h-4 w-4" />
                Backup & Export
              </CommandItem>
              <CommandItem onSelect={() => handleSelect('action:emergency-lock')}>
                <Lock className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive">Emergency Lock</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => handleSelect('signout')}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
