import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, GripVertical, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePortfolio } from '@/hooks/usePortfolio';
import { SOCIAL_ICONS } from '@/components/SocialLinks';

const PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' },
  { value: 'custom', label: 'Custom' },
];

interface EditingLink {
  id?: string;
  platform: string;
  url: string;
  icon: string;
  is_visible: boolean;
}

const SocialLinksPanel = () => {
  const { socialLinks, createSocialLink, updateSocialLink, deleteSocialLink, loading } = usePortfolio();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<EditingLink>({
    platform: 'linkedin',
    url: '',
    icon: '',
    is_visible: true,
  });

  const resetForm = () => {
    setFormData({
      platform: 'linkedin',
      url: '',
      icon: '',
      is_visible: true,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      platform: 'linkedin',
      url: '',
      icon: '',
      is_visible: true,
    });
  };

  const handleEdit = (link: typeof socialLinks[0]) => {
    setEditingId(link.id);
    setIsAdding(false);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon: link.icon || '',
      is_visible: link.is_visible ?? true,
    });
  };

  const handleSave = async () => {
    if (!formData.url.trim()) {
      toast({ title: 'URL is required', variant: 'destructive' });
      return;
    }

    try {
      if (isAdding) {
        const result = await createSocialLink({
          platform: formData.platform,
          url: formData.url,
          icon: formData.icon || null,
          is_visible: formData.is_visible,
          sort_order: socialLinks.length,
        });
        
        if (result) {
          toast({ title: 'Social link added!' });
          resetForm();
        } else {
          toast({ title: 'Failed to add link', variant: 'destructive' });
        }
      } else if (editingId) {
        const success = await updateSocialLink(editingId, {
          platform: formData.platform,
          url: formData.url,
          icon: formData.icon || null,
          is_visible: formData.is_visible,
        });
        
        if (success) {
          toast({ title: 'Social link updated!' });
          resetForm();
        } else {
          toast({ title: 'Failed to update link', variant: 'destructive' });
        }
      }
    } catch (err) {
      toast({ title: 'An error occurred', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteSocialLink(id);
    if (success) {
      toast({ title: 'Social link deleted' });
    } else {
      toast({ title: 'Failed to delete link', variant: 'destructive' });
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    await updateSocialLink(id, { is_visible: !currentVisibility });
  };

  const getIconComponent = (platform: string) => {
    const IconComponent = SOCIAL_ICONS[platform.toLowerCase()];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Social Links</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted/30 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Social Links</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Manage your social media presence
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Link
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{isAdding ? 'Add New Link' : 'Edit Link'}</h3>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {getIconComponent(option.value)}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder={formData.platform === 'email' ? 'mailto:you@example.com' : 'https://...'}
              />
            </div>

            {formData.platform === 'custom' && (
              <div className="space-y-2">
                <Label>Custom Icon Name (optional)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="e.g., dribbble, behance"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
              />
              <Label>Visible on portfolio</Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-2">
        {socialLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-mono text-sm">No social links yet</p>
            <p className="text-xs mt-1">Click "Add Link" to get started</p>
          </div>
        ) : (
          socialLinks.map((link) => (
            <div
              key={link.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/30
                ${!link.is_visible ? 'opacity-50' : ''}
                ${editingId === link.id ? 'ring-2 ring-primary' : ''}
              `}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              
              <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                {getIconComponent(link.platform)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium capitalize">{link.platform}</p>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
              </div>

              <div className="flex items-center gap-1">
                <Switch
                  checked={link.is_visible ?? true}
                  onCheckedChange={() => handleToggleVisibility(link.id, link.is_visible ?? true)}
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(link.url, '_blank')}
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(link)}
                  disabled={editingId === link.id}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(link.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialLinksPanel;
