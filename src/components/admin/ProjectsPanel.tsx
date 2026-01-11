import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Eye, EyeOff, Star, ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePortfolio } from '@/hooks/usePortfolio';

interface ProjectForm {
  title: string;
  description: string;
  short_pitch: string;
  technologies: string;
  image_url: string;
  live_url: string;
  github_url: string;
  featured: boolean;
  is_visible: boolean;
}

const initialFormState: ProjectForm = {
  title: '',
  description: '',
  short_pitch: '',
  technologies: '',
  image_url: '',
  live_url: '',
  github_url: '',
  featured: false,
  is_visible: true,
};

const ProjectsPanel = () => {
  const { projects, createProject, updateProject, deleteProject, loading } = usePortfolio();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<ProjectForm>(initialFormState);

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

  const handleEdit = (project: typeof projects[0]) => {
    setEditingId(project.id);
    setIsAdding(false);
    setFormData({
      title: project.title,
      description: project.description || '',
      short_pitch: project.short_pitch || '',
      technologies: (project.technologies || []).join(', '),
      image_url: project.image_url || '',
      live_url: project.live_url || '',
      github_url: project.github_url || '',
      featured: project.featured ?? false,
      is_visible: project.is_visible ?? true,
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    const projectData = {
      title: formData.title,
      description: formData.description || null,
      short_pitch: formData.short_pitch || null,
      technologies: formData.technologies ? formData.technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
      image_url: formData.image_url || null,
      live_url: formData.live_url || null,
      github_url: formData.github_url || null,
      featured: formData.featured,
      is_visible: formData.is_visible,
      sort_order: isAdding ? projects.length : undefined,
    };

    try {
      if (isAdding) {
        const result = await createProject(projectData);
        if (result) {
          toast({ title: 'Project added!' });
          resetForm();
        } else {
          toast({ title: 'Failed to add project', variant: 'destructive' });
        }
      } else if (editingId) {
        const success = await updateProject(editingId, projectData);
        if (success) {
          toast({ title: 'Project updated!' });
          resetForm();
        } else {
          toast({ title: 'Failed to update project', variant: 'destructive' });
        }
      }
    } catch (err) {
      toast({ title: 'An error occurred', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProject(id);
    if (success) {
      toast({ title: 'Project deleted' });
    } else {
      toast({ title: 'Failed to delete project', variant: 'destructive' });
    }
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await updateProject(id, { is_visible: !current });
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await updateProject(id, { featured: !current });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Projects</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted/30 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} in portfolio
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{isAdding ? 'Add New Project' : 'Edit Project'}</h3>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Project name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Short Pitch</Label>
              <Input
                value={formData.short_pitch}
                onChange={(e) => setFormData(prev => ({ ...prev, short_pitch: e.target.value }))}
                placeholder="One-line description"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed project description..."
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Technologies (comma-separated)</Label>
              <Input
                value={formData.technologies}
                onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                placeholder="React, TypeScript, Tailwind CSS"
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Live URL</Label>
              <Input
                value={formData.live_url}
                onChange={(e) => setFormData(prev => ({ ...prev, live_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>GitHub URL</Label>
              <Input
                value={formData.github_url}
                onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                />
                <Label>Visible</Label>
              </div>
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

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-lg">
            <p className="font-mono text-sm">No projects yet</p>
            <p className="text-xs mt-1">Click "Add Project" to showcase your work</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`
                p-4 rounded-lg border border-border/50 bg-card/30
                ${!project.is_visible ? 'opacity-50' : ''}
                ${editingId === project.id ? 'ring-2 ring-primary' : ''}
              `}
            >
              <div className="flex items-start gap-4">
                {project.image_url && (
                  <div className="w-20 h-14 rounded bg-muted/50 overflow-hidden flex-shrink-0">
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{project.title}</h3>
                    {project.featured && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  {project.short_pitch && (
                    <p className="text-sm text-muted-foreground mt-1">{project.short_pitch}</p>
                  )}
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.slice(0, 5).map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {project.live_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(project.live_url!, '_blank')}
                      title="View live"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {project.github_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(project.github_url!, '_blank')}
                      title="View on GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFeatured(project.id, project.featured ?? false)}
                    title={project.featured ? 'Unfeature' : 'Feature'}
                  >
                    <Star className={`w-4 h-4 ${project.featured ? 'fill-current text-yellow-500' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility(project.id, project.is_visible ?? true)}
                    title={project.is_visible ? 'Hide' : 'Show'}
                  >
                    {project.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(project)}
                    disabled={editingId === project.id}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(project.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsPanel;
