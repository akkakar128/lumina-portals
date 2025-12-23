import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Lock, 
  Unlock,
  Shield,
  AlertTriangle,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  experimental?: boolean;
}

const FeatureFlagsPanel = () => {
  const { isMasterAdmin } = useAuth();
  const { toast } = useToast();
  const [emergencyLockOpen, setEmergencyLockOpen] = useState(false);
  const [systemLocked, setSystemLocked] = useState(false);

  // Feature flags (would be stored in database in production)
  const [features, setFeatures] = useState<FeatureFlag[]>([
    { id: '3d-hero', name: '3D Hero Scene', description: 'WebGL-powered hero background', enabled: true },
    { id: 'dark-mode', name: 'Dark Mode', description: 'Force dark theme globally', enabled: true },
    { id: 'animations', name: 'Motion Effects', description: 'GSAP and Framer Motion animations', enabled: true },
    { id: 'contact-form', name: 'Contact Form', description: 'Public contact submission form', enabled: true },
    { id: 'analytics', name: 'Analytics', description: 'Track portfolio views', enabled: false, experimental: true },
    { id: 'ai-chat', name: 'AI Assistant', description: 'Portfolio chatbot (beta)', enabled: false, experimental: true },
  ]);

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    ));
    toast({
      title: 'Feature updated',
      description: 'Changes will take effect on next page load.',
    });
  };

  const handleEmergencyLock = () => {
    setSystemLocked(true);
    setEmergencyLockOpen(false);
    toast({
      title: 'System Locked',
      description: 'All public access has been disabled.',
      variant: 'destructive',
    });
  };

  const handleUnlock = () => {
    setSystemLocked(false);
    toast({
      title: 'System Unlocked',
      description: 'Public access has been restored.',
    });
  };

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground font-mono text-xs mt-1">
          Toggle features and experimental options
        </p>
      </div>

      {/* System Status */}
      <div className={`
        p-4 rounded-lg border-2 flex items-center justify-between
        ${systemLocked 
          ? 'border-destructive bg-destructive/10' 
          : 'border-primary/30 bg-primary/5'
        }
      `}>
        <div className="flex items-center gap-3">
          {systemLocked ? (
            <Lock className="w-6 h-6 text-destructive" />
          ) : (
            <CheckCircle className="w-6 h-6 text-primary" />
          )}
          <div>
            <p className="font-mono text-sm font-semibold">
              {systemLocked ? 'System Locked' : 'System Active'}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {systemLocked ? 'All public access disabled' : 'Portfolio is publicly accessible'}
            </p>
          </div>
        </div>
        {systemLocked ? (
          <Button variant="outline" size="sm" onClick={handleUnlock}>
            <Unlock className="w-4 h-4 mr-2" />
            Unlock
          </Button>
        ) : (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setEmergencyLockOpen(true)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Emergency Lock
          </Button>
        )}
      </div>

      {/* Feature Toggles */}
      <div className="space-y-4">
        <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          Active Features
        </h2>
        <div className="space-y-2">
          {features.filter(f => !f.experimental).map(feature => (
            <FeatureToggle
              key={feature.id}
              feature={feature}
              onToggle={() => toggleFeature(feature.id)}
            />
          ))}
        </div>
      </div>

      {/* Experimental Features */}
      <div className="space-y-4">
        <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3 h-3" />
          Experimental
        </h2>
        <div className="space-y-2">
          {features.filter(f => f.experimental).map(feature => (
            <FeatureToggle
              key={feature.id}
              feature={feature}
              onToggle={() => toggleFeature(feature.id)}
            />
          ))}
        </div>
      </div>

      {/* Emergency Lock Dialog */}
      <AlertDialog open={emergencyLockOpen} onOpenChange={setEmergencyLockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Emergency Lock
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately disable all public access to the portfolio.
              Only admins will be able to access the system.
              <br /><br />
              Use this in case of security incidents or maintenance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmergencyLock}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Lock System
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const FeatureToggle = ({ 
  feature, 
  onToggle 
}: { 
  feature: FeatureFlag; 
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors text-left"
  >
    <div className="flex items-center gap-3">
      {feature.experimental && (
        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
      )}
      <div>
        <p className="font-mono text-sm">{feature.name}</p>
        <p className="font-mono text-xs text-muted-foreground">{feature.description}</p>
      </div>
    </div>
    {feature.enabled ? (
      <ToggleRight className="w-6 h-6 text-primary flex-shrink-0" />
    ) : (
      <ToggleLeft className="w-6 h-6 text-muted-foreground flex-shrink-0" />
    )}
  </button>
);

export default FeatureFlagsPanel;
