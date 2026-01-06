import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Github, ChevronRight } from 'lucide-react';

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
];

const ProjectsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
            // Portfolio
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Featured <span className="text-neon">Projects</span>
          </h2>
          <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
            A selection of my most impactful work, showcasing innovation and technical excellence.
          </p>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {demoProjects.map((project, index) => (
            <div
              key={project.id}
              className={`group relative glass-card overflow-hidden ${
                project.featured ? 'lg:col-span-1' : ''
              } ${isVisible ? 'animate-slideUp' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 0.15}s` }}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                
                {/* Overlay on hover */}
                <div
                  className={`absolute inset-0 bg-primary/10 backdrop-blur-sm transition-opacity duration-300 ${
                    hoveredProject === project.id ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>

              {/* Content */}
              <div className="relative p-6">
                {/* Featured badge */}
                {project.featured && (
                  <span className="absolute top-4 right-4 px-2 py-1 text-xs font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 rounded">
                    Featured
                  </span>
                )}

                <h3 className="font-display text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                
                <p className="font-mono text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs font-mono bg-muted/50 text-muted-foreground border border-border/50 rounded"
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
                      className="flex items-center gap-2 text-sm font-mono text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      Source
                    </a>
                  )}
                </div>
              </div>

              {/* Hover border glow */}
              <div
                className={`absolute inset-0 rounded-xl border-2 border-primary/0 transition-all duration-300 pointer-events-none ${
                  hoveredProject === project.id ? 'border-primary/50 shadow-glow-sm' : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className={`text-center mt-12 ${isVisible ? 'animate-fadeIn animation-delay-600' : 'opacity-0'}`}>
          <button className="cyber-button inline-flex items-center gap-2">
            View All Projects
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
