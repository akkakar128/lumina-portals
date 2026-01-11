import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePortfolio } from '@/hooks/usePortfolio';

const CATEGORY_OPTIONS = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Tools',
  'Languages',
  'Frameworks',
  'Other',
];

interface SkillForm {
  name: string;
  category: string;
  proficiency: number;
  years_experience: number;
}

const initialFormState: SkillForm = {
  name: '',
  category: 'Frontend',
  proficiency: 80,
  years_experience: 1,
};

const SkillsPanel = () => {
  const { skills, createSkill, updateSkill, deleteSkill, loading } = usePortfolio();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<SkillForm>(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleEdit = (skill: typeof skills[0]) => {
    setEditingId(skill.id);
    setIsAdding(false);
    setFormData({
      name: skill.name,
      category: skill.category || 'Other',
      proficiency: skill.proficiency ?? 80,
      years_experience: skill.years_experience ?? 1,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Skill name is required', variant: 'destructive' });
      return;
    }

    const skillData = {
      name: formData.name,
      category: formData.category,
      proficiency: formData.proficiency,
      years_experience: formData.years_experience,
      sort_order: isAdding ? skills.length : undefined,
    };

    try {
      if (isAdding) {
        const result = await createSkill(skillData);
        if (result) {
          toast({ title: 'Skill added!' });
          resetForm();
        } else {
          toast({ title: 'Failed to add skill', variant: 'destructive' });
        }
      } else if (editingId) {
        const success = await updateSkill(editingId, skillData);
        if (success) {
          toast({ title: 'Skill updated!' });
          resetForm();
        } else {
          toast({ title: 'Failed to update skill', variant: 'destructive' });
        }
      }
    } catch (err) {
      toast({ title: 'An error occurred', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteSkill(id);
    if (success) {
      toast({ title: 'Skill deleted' });
    } else {
      toast({ title: 'Failed to delete skill', variant: 'destructive' });
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Skills</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted/30 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Skills</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            {skills.length} skill{skills.length !== 1 ? 's' : ''} across {Object.keys(groupedSkills).length} categories
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Skill
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{isAdding ? 'Add New Skill' : 'Edit Skill'}</h3>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Skill Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., React, Python, Figma"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proficiency: {formData.proficiency}%</Label>
              <Slider
                value={[formData.proficiency]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, proficiency: value }))}
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={formData.years_experience}
                onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
              />
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

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.keys(groupedSkills).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-lg">
            <p className="font-mono text-sm">No skills yet</p>
            <p className="text-xs mt-1">Click "Add Skill" to showcase your expertise</p>
          </div>
        ) : (
          Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="space-y-2">
              <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{category}</h3>
              <div className="space-y-2">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/30
                      ${editingId === skill.id ? 'ring-2 ring-primary' : ''}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {skill.proficiency}%
                        </Badge>
                        {skill.years_experience && skill.years_experience > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {skill.years_experience}yr{skill.years_experience !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(skill)}
                        disabled={editingId === skill.id}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(skill.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SkillsPanel;
