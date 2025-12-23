-- Create role enum for the portfolio system
CREATE TYPE public.app_role AS ENUM ('master_admin', 'portfolio_admin', 'viewer');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  title TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create portfolios table (each user can have their own portfolio)
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  theme_primary TEXT DEFAULT '180 100% 50%',
  theme_accent TEXT DEFAULT '280 100% 60%',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table for portfolio items
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  external_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  proficiency INTEGER DEFAULT 80 CHECK (proficiency >= 0 AND proficiency <= 100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_links table
CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is master admin
CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'master_admin')
$$;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles (only master admin can manage)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_master_admin(auth.uid()));

CREATE POLICY "Master admin can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_master_admin(auth.uid()));

-- RLS Policies for portfolios
CREATE POLICY "Published portfolios are viewable by everyone"
  ON public.portfolios FOR SELECT
  USING (is_published = true OR auth.uid() = user_id OR public.is_master_admin(auth.uid()));

CREATE POLICY "Users can manage their own portfolios"
  ON public.portfolios FOR ALL
  USING (auth.uid() = user_id OR public.is_master_admin(auth.uid()));

-- RLS Policies for projects
CREATE POLICY "Projects from published portfolios are viewable"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p 
      WHERE p.id = portfolio_id 
      AND (p.is_published = true OR p.user_id = auth.uid() OR public.is_master_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can manage projects in their portfolios"
  ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p 
      WHERE p.id = portfolio_id 
      AND (p.user_id = auth.uid() OR public.is_master_admin(auth.uid()))
    )
  );

-- RLS Policies for skills
CREATE POLICY "Skills from published portfolios are viewable"
  ON public.skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p 
      WHERE p.id = portfolio_id 
      AND (p.is_published = true OR p.user_id = auth.uid() OR public.is_master_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can manage skills in their portfolios"
  ON public.skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p 
      WHERE p.id = portfolio_id 
      AND (p.user_id = auth.uid() OR public.is_master_admin(auth.uid()))
    )
  );

-- RLS Policies for social_links
CREATE POLICY "Social links from published portfolios are viewable"
  ON public.social_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p 
      WHERE p.id = portfolio_id 
      AND (p.is_published = true OR p.user_id = auth.uid() OR public.is_master_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can manage social links in their portfolios"
  ON public.social_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p 
      WHERE p.id = portfolio_id 
      AND (p.user_id = auth.uid() OR public.is_master_admin(auth.uid()))
    )
  );

-- Trigger to create profile and default role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();