import { useState } from 'react';
import { ExternalLink, Github, ChevronRight } from 'lucide-react';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks/useScrollAnimation';
import AnimatedTitle from '../AnimatedTitle';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

const demoProjects: Project[] = [
  {
    id: '1',
    title: 'Neural Interface Dashboard',
    description: 'A futuristic analytics dashboard with real-time data visualization and AI-powered insights.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
    technologies: ['React', 'Three.js', 'TensorFlow', 'WebGL'],
    liveUrl: '#',
    githubUrl: '#',
    featured: true,
  },
  {
    id: '2',
    title: 'Quantum E-Commerce Platform',
    description: 'Next-gen shopping experience with AR product previews and blockchain payments.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
    technologies: ['Next.js', 'Stripe', 'WebXR', 'Solidity'],
    liveUrl: '#',
    featured: true,
  },
  {
    id: '3',
    title: 'Cyberpunk Social Network',
    description: 'Decentralized social platform with end-to-end encryption and self-sovereign identity.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop',
    technologies: ['GraphQL', 'IPFS', 'Web3', 'Socket.io'],
    githubUrl: '#',
    featured: true,
  },
  {
    id: '4',
    title: 'AI Music Synthesizer',
    description: 'Generate unique music tracks using machine learning and interactive sound design.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop',
    technologies: ['Python', 'TensorFlow', 'Web Audio API', 'React'],
    liveUrl: '#',
    githubUrl: '#',
  },
  {
    id: '5',
    title: 'Smart Home Automation Hub',
    description: 'IoT control center with voice commands and predictive scheduling algorithms.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    technologies: ['Node.js', 'MQTT', 'React Native', 'TensorFlow Lite'],
    liveUrl: '#',
    githubUrl: '#',
  },
  {
    id: '6',
    title: 'Blockchain Voting System',
    description: 'Transparent and secure voting platform using distributed ledger technology.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop',
    technologies: ['Ethereum', 'Solidity', 'React', 'Web3.js'],
    githubUrl: '#',
  },
  {
    id: '7',
    title: 'AR Navigation App',
    description: 'Augmented reality navigation with real-time POI overlays and indoor mapping.',
    image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&auto=format&fit=crop',
    technologies: ['ARKit', 'Swift', 'CoreML', 'MapKit'],
    liveUrl: '#',
  },
  {
    id: '8',
    title: 'Real-time Collaboration Tool',
    description: 'Multiplayer whiteboard with video chat and intelligent document editing.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop',
    technologies: ['WebRTC', 'Yjs', 'React', 'Socket.io'],
    liveUrl: '#',
    githubUrl: '#',
  },
];

const INITIAL_DISPLAY_COUNT = 4;

const ProjectsSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const [showAll, setShowAll] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  
  const displayedProjects = showAll ? demoProjects : demoProjects.slice(0, INITIAL_DISPLAY_COUNT);
  
  const { ref: gridRef, isVisible: gridVisible, getItemAnimationStyle } = useStaggerAnimation(displayedProjects.length, { 
    threshold: 0.05,
    staggerDelay: 150 
  });
  const { ref: buttonRef, isVisible: buttonVisible } = useScrollAnimation({ threshold: 0.5 });
  
  const hasMoreProjects = demoProjects.length > INITIAL_DISPLAY_COUNT;

  return (
    <section
      id="projects"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with 3D animated title */}
        <div 
          ref={headerRef}
          className={`text-center mb-16 ${headerVisible ? 'scroll-glitch-in' : 'scroll-hidden'}`}
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
            // Portfolio
          </span>
          <div className="mb-6">
            <AnimatedTitle 
              text="FEATURED PROJECTS" 
              as="h2"
              className="text-4xl md:text-5xl lg:text-6xl"
            />
          </div>
          <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
            A selection of my most impactful work, showcasing innovation and technical excellence.
          </p>
        </div>

        {/* Projects grid with zoom-in animations */}
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {displayedProjects.map((project, index) => (
            <div
              key={project.id}
              className={`group relative glass-card overflow-hidden ${
                project.featured ? 'lg:col-span-1' : ''
              } ${gridVisible ? 'scroll-zoom-in' : 'scroll-hidden'}`}
              style={getItemAnimationStyle(index)}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              {/* Image with enhanced parallax effect */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                
                {/* Overlay on hover */}
                <div
                  className={`absolute inset-0 bg-primary/10 backdrop-blur-sm transition-all duration-500 ${
                    hoveredProject === project.id ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                
                {/* Shimmer effect */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full transition-transform duration-700 ${
                    hoveredProject === project.id ? 'translate-x-full' : ''
                  }`}
                />
              </div>

              {/* Content */}
              <div className="relative p-6">
                {/* Featured badge */}
                {project.featured && (
                  <span className="absolute top-4 right-4 px-2 py-1 text-xs font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 rounded animate-pulse">
                    Featured
                  </span>
                )}

                <h3 className="font-display text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                
                <p className="font-mono text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Technologies with stagger animation on hover */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs font-mono bg-muted/50 text-muted-foreground border border-border/50 rounded transition-all duration-300 group-hover:border-primary/30 group-hover:text-foreground"
                      style={{ transitionDelay: `${techIndex * 50}ms` }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-4">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      className="flex items-center gap-2 text-sm font-mono text-primary hover:text-primary/80 transition-all duration-300 hover:translate-x-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1"
                    >
                      <Github className="w-4 h-4" />
                      Source
                    </a>
                  )}
                </div>
              </div>

              {/* Hover border glow */}
              <div
                className={`absolute inset-0 rounded-xl border-2 transition-all duration-500 pointer-events-none ${
                  hoveredProject === project.id 
                    ? 'border-primary/50 shadow-glow-md' 
                    : 'border-transparent'
                }`}
              />
            </div>
          ))}
        </div>

        {/* View all button with bounce animation */}
        {hasMoreProjects && (
          <div 
            ref={buttonRef}
            className={`text-center mt-12 ${buttonVisible ? 'scroll-bounce-in' : 'scroll-hidden'}`}
          >
            <button 
              onClick={() => setShowAll(!showAll)}
              className="cyber-button inline-flex items-center gap-2 group"
            >
              {showAll ? 'Show Less' : `View All Projects (${demoProjects.length - INITIAL_DISPLAY_COUNT} more)`}
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
