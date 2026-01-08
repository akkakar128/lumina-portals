import { Github, Linkedin, Mail, Instagram, Twitter, Globe, Youtube, Facebook } from 'lucide-react';

// Social media platform configurations with icons
const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  facebook: Facebook,
  website: Globe,
};

// Dummy social links - will be replaced with data from dashboard/database
const DEMO_SOCIAL_LINKS = [
  { platform: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
  { platform: 'github', url: 'https://github.com', label: 'GitHub' },
  { platform: 'email', url: 'mailto:hello@example.com', label: 'Email' },
  { platform: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
  { platform: 'twitter', url: 'https://twitter.com', label: 'Twitter' },
];

interface SocialLink {
  platform: string;
  url: string;
  label: string;
  customIcon?: string;
}

interface SocialLinksProps {
  links?: SocialLink[];
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glow' | 'minimal';
}

const SocialLinks = ({ 
  links = DEMO_SOCIAL_LINKS, 
  className = '',
  iconSize = 'md',
  variant = 'glow'
}: SocialLinksProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glow':
        return 'border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/10 hover:shadow-glow-sm hover:scale-110 hover:-translate-y-1';
      case 'minimal':
        return 'hover:text-primary hover:scale-110';
      default:
        return 'border border-border/30 hover:border-primary/50 hover:bg-primary/5 hover:scale-105';
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {links.map((link, index) => {
        const IconComponent = SOCIAL_ICONS[link.platform.toLowerCase()] || Globe;
        
        return (
          <a
            key={link.platform}
            href={link.url}
            target={link.platform === 'email' ? undefined : '_blank'}
            rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}
            className={`
              ${containerSizeClasses[iconSize]} 
              rounded-xl text-muted-foreground 
              transition-all duration-300
              ${getVariantClasses()}
            `}
            style={{ 
              animationDelay: `${index * 100}ms`,
            }}
            aria-label={link.label}
            title={link.label}
          >
            <IconComponent className={`${sizeClasses[iconSize]} transition-colors duration-300`} />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
export { SOCIAL_ICONS, DEMO_SOCIAL_LINKS };
export type { SocialLink };
