import { useState, useEffect } from 'react';
import { useTheme, AVAILABLE_THEMES, ThemeName } from '@/contexts/ThemeContext';
import { Check, Palette, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ThemesPanelProps {
  portfolioId?: string;
}

const ThemesPanel = ({ portfolioId }: ThemesPanelProps) => {
  const { theme, setTheme, themes } = useTheme();
  const { user } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(theme);
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with context theme
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handlePreview = (themeName: ThemeName) => {
    setPreviewTheme(themeName);
    setTheme(themeName);
  };

  const handleSelect = (themeName: ThemeName) => {
    setSelectedTheme(themeName);
    setTheme(themeName);
    setPreviewTheme(null);
  };

  const handleSaveToPortfolio = async () => {
    if (!portfolioId || !user) {
      toast.error('No portfolio selected');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({ theme: selectedTheme })
        .eq('id', portfolioId);

      if (error) throw error;

      toast.success(`Theme "${themes.find(t => t.name === selectedTheme)?.label}" saved to portfolio!`);
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setIsSaving(false);
    }
  };

  const currentTheme = previewTheme || selectedTheme;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            Theme Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Customize your portfolio's appearance with our curated themes
          </p>
        </div>
        {portfolioId && (
          <Button 
            onClick={handleSaveToPortfolio} 
            disabled={isSaving}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Theme'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((themeInfo) => {
          const isSelected = selectedTheme === themeInfo.name;
          const isPreviewing = previewTheme === themeInfo.name;

          return (
            <div
              key={themeInfo.name}
              className={`
                relative group rounded-xl border-2 overflow-hidden cursor-pointer
                transition-all duration-300 hover:scale-[1.02]
                ${isSelected 
                  ? 'border-primary shadow-glow-sm' 
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => handleSelect(themeInfo.name)}
            >
              {/* Theme Preview */}
              <div 
                className="h-32 relative overflow-hidden"
                style={{ backgroundColor: themeInfo.preview.background }}
              >
                {/* Decorative elements */}
                <div 
                  className="absolute top-4 left-4 w-16 h-3 rounded-full opacity-90"
                  style={{ backgroundColor: themeInfo.preview.primary }}
                />
                <div 
                  className="absolute top-10 left-4 w-24 h-2 rounded-full opacity-60"
                  style={{ backgroundColor: themeInfo.preview.accent }}
                />
                <div 
                  className="absolute top-14 left-4 w-20 h-2 rounded-full opacity-40"
                  style={{ backgroundColor: themeInfo.preview.accent }}
                />
                
                {/* Color dots */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: themeInfo.preview.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: themeInfo.preview.accent }}
                  />
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                {/* Preview overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(themeInfo.name);
                    }}
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </Button>
                </div>
              </div>

              {/* Theme Info */}
              <div className="p-4 bg-card">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  {themeInfo.label}
                  {isPreviewing && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      Previewing
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {themeInfo.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Theme Info */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Active theme:</span>{' '}
          {themes.find(t => t.name === currentTheme)?.label || currentTheme}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Theme changes are applied instantly without page reload.
        </p>
      </div>
    </div>
  );
};

export default ThemesPanel;
