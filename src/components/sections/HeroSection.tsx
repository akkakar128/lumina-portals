import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Scene3D from '../3d/Scene3D';
import { ChevronDown } from 'lucide-react';
import AnimatedTitle from '../AnimatedTitle';
import SocialLinks from '../SocialLinks';

interface HeroSectionProps {
  name?: string;
  title?: string;
  subtitle?: string;
}

const HeroSection = ({
  name = "DIGITAL CREATOR",
  title = "Building the Future",
  subtitle = "Full-Stack Developer • 3D Artist • Creative Technologist"
}: HeroSectionProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        transform: 'translate(var(--mouse-x, 0), var(--mouse-y, 0))',
        transition: 'transform 0.3s ease-out',
      }}
    >
      {/* 3D Background */}
      <Scene3D />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent z-10 pointer-events-none" />

      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        {/* Glowing orb behind text */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-glow pointer-events-none transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
        
        <div className="relative">
          {/* Status indicator */}
          <div className={`flex items-center justify-center gap-2 mb-6 transition-all duration-700 ${isLoaded ? 'scroll-fade-down' : 'scroll-hidden'}`} style={{ animationDelay: '0ms' }}>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Available for projects
            </span>
          </div>

          {/* Main heading with 3D animation */}
          <div className={`mb-6 ${isLoaded ? 'scroll-fade-up' : 'scroll-hidden'}`} style={{ animationDelay: '200ms' }}>
            <AnimatedTitle 
              text={name} 
              as="h1"
              className="text-5xl md:text-7xl lg:text-8xl"
            />
          </div>

          {/* Subtitle with blur-in */}
          <p className={`font-display text-xl md:text-3xl lg:text-4xl font-light text-foreground/80 mb-4 ${isLoaded ? 'scroll-blur-in' : 'scroll-hidden'}`} style={{ animationDelay: '400ms' }}>
            {title}
          </p>

          {/* Role with fade-up */}
          <p className={`font-mono text-sm md:text-base text-muted-foreground uppercase tracking-[0.2em] mb-12 ${isLoaded ? 'scroll-fade-up' : 'scroll-hidden'}`} style={{ animationDelay: '600ms' }}>
            {subtitle}
          </p>

          {/* CTA Buttons with bounce-in */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${isLoaded ? 'scroll-bounce-in' : 'scroll-hidden'}`} style={{ animationDelay: '800ms' }}>
            <Link to="/projects" className="cyber-button group">
              <span className="relative z-10">View Projects</span>
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 font-display font-semibold uppercase tracking-widest border border-muted-foreground/30 text-foreground hover:border-primary hover:text-primary hover:shadow-glow-sm transition-all duration-300"
            >
              Contact Me
            </Link>
          </div>

          {/* Social Links */}
          <div className={`mt-10 ${isLoaded ? 'scroll-fade-up' : 'scroll-hidden'}`} style={{ animationDelay: '1000ms' }}>
            <SocialLinks iconSize="md" variant="glow" />
          </div>
        </div>
      </div>

      {/* Scroll indicator with float animation */}
      <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-20 ${isLoaded ? 'scroll-fade-up' : 'scroll-hidden'}`} style={{ animationDelay: '1000ms' }}>
        <Link
          to="/about"
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <span className="font-mono text-xs uppercase tracking-widest">Explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-primary" />
        </Link>
      </div>

      {/* Corner decorations with staggered animations */}
      <div className={`absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-primary/30 z-20 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 -translate-x-4 -translate-y-4'}`} style={{ transitionDelay: '300ms' }} />
      <div className={`absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-primary/30 z-20 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-x-4 -translate-y-4'}`} style={{ transitionDelay: '400ms' }} />
      <div className={`absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-primary/30 z-20 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 -translate-x-4 translate-y-4'}`} style={{ transitionDelay: '500ms' }} />
      <div className={`absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-primary/30 z-20 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-x-4 translate-y-4'}`} style={{ transitionDelay: '600ms' }} />
    </section>
  );
};

export default HeroSection;
