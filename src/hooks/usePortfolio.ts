import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Project = Tables<'projects'>;
type Skill = Tables<'skills'>;
type SocialLink = Tables<'social_links'>;
type Portfolio = Tables<'portfolios'>;
type Profile = Tables<'profiles'>;

interface UsePortfolioReturn {
  // Data
  portfolio: Portfolio | null;
  projects: Project[];
  skills: Skill[];
  socialLinks: SocialLink[];
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  
  // Project CRUD
  createProject: (project: Omit<TablesInsert<'projects'>, 'portfolio_id'>) => Promise<Project | null>;
  updateProject: (id: string, updates: TablesUpdate<'projects'>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  
  // Skill CRUD
  createSkill: (skill: Omit<TablesInsert<'skills'>, 'portfolio_id'>) => Promise<Skill | null>;
  updateSkill: (id: string, updates: TablesUpdate<'skills'>) => Promise<boolean>;
  deleteSkill: (id: string) => Promise<boolean>;
  
  // Social Link CRUD
  createSocialLink: (link: Omit<TablesInsert<'social_links'>, 'portfolio_id'>) => Promise<SocialLink | null>;
  updateSocialLink: (id: string, updates: TablesUpdate<'social_links'>) => Promise<boolean>;
  deleteSocialLink: (id: string) => Promise<boolean>;
  
  // Profile
  updateProfile: (updates: TablesUpdate<'profiles'>) => Promise<boolean>;
  
  // Refresh
  refreshData: () => Promise<void>;
}

export const usePortfolio = (): UsePortfolioReturn => {
  const { user, isMasterAdmin } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch or create portfolio
  const fetchPortfolio = useCallback(async () => {
    if (!user) return null;

    const { data: existingPortfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching portfolio:', fetchError);
      return null;
    }

    if (existingPortfolio) {
      return existingPortfolio;
    }

    // Create new portfolio if doesn't exist
    const { data: newPortfolio, error: createError } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        slug: `portfolio-${user.id.slice(0, 8)}`,
        title: 'My Portfolio',
        is_published: false
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating portfolio:', createError);
      return null;
    }

    return newPortfolio;
  }, [user]);

  // Fetch all data
  const refreshData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const portfolioData = await fetchPortfolio();
      setPortfolio(portfolioData);

      if (portfolioData) {
        // Fetch projects
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('portfolio_id', portfolioData.id)
          .order('sort_order', { ascending: true });
        setProjects(projectsData || []);

        // Fetch skills
        const { data: skillsData } = await supabase
          .from('skills')
          .select('*')
          .eq('portfolio_id', portfolioData.id)
          .order('sort_order', { ascending: true });
        setSkills(skillsData || []);

        // Fetch social links
        const { data: linksData } = await supabase
          .from('social_links')
          .select('*')
          .eq('portfolio_id', portfolioData.id)
          .order('sort_order', { ascending: true });
        setSocialLinks(linksData || []);
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setProfile(profileData);

    } catch (err) {
      setError('Failed to load portfolio data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, fetchPortfolio]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Project CRUD
  const createProject = async (project: Omit<TablesInsert<'projects'>, 'portfolio_id'>) => {
    if (!portfolio) return null;
    
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, portfolio_id: portfolio.id })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    
    setProjects(prev => [...prev, data]);
    return data;
  };

  const updateProject = async (id: string, updates: TablesUpdate<'projects'>) => {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating project:', error);
      return false;
    }
    
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    return true;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    
    setProjects(prev => prev.filter(p => p.id !== id));
    return true;
  };

  // Skill CRUD
  const createSkill = async (skill: Omit<TablesInsert<'skills'>, 'portfolio_id'>) => {
    if (!portfolio) return null;
    
    const { data, error } = await supabase
      .from('skills')
      .insert({ ...skill, portfolio_id: portfolio.id })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating skill:', error);
      return null;
    }
    
    setSkills(prev => [...prev, data]);
    return data;
  };

  const updateSkill = async (id: string, updates: TablesUpdate<'skills'>) => {
    const { error } = await supabase
      .from('skills')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating skill:', error);
      return false;
    }
    
    setSkills(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    return true;
  };

  const deleteSkill = async (id: string) => {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting skill:', error);
      return false;
    }
    
    setSkills(prev => prev.filter(s => s.id !== id));
    return true;
  };

  // Social Link CRUD
  const createSocialLink = async (link: Omit<TablesInsert<'social_links'>, 'portfolio_id'>) => {
    if (!portfolio) return null;
    
    const { data, error } = await supabase
      .from('social_links')
      .insert({ ...link, portfolio_id: portfolio.id })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating social link:', error);
      return null;
    }
    
    setSocialLinks(prev => [...prev, data]);
    return data;
  };

  const updateSocialLink = async (id: string, updates: TablesUpdate<'social_links'>) => {
    const { error } = await supabase
      .from('social_links')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating social link:', error);
      return false;
    }
    
    setSocialLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    return true;
  };

  const deleteSocialLink = async (id: string) => {
    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting social link:', error);
      return false;
    }
    
    setSocialLinks(prev => prev.filter(l => l.id !== id));
    return true;
  };

  // Profile update
  const updateProfile = async (updates: TablesUpdate<'profiles'>) => {
    if (!user) return false;
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    return true;
  };

  return {
    portfolio,
    projects,
    skills,
    socialLinks,
    profile,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    createSkill,
    updateSkill,
    deleteSkill,
    createSocialLink,
    updateSocialLink,
    deleteSocialLink,
    updateProfile,
    refreshData,
  };
};

export default usePortfolio;
