import { useEffect, useRef } from 'react';
import Scene3D from '../3d/Scene3D';
import { ChevronDown } from 'lucide-react';

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid"
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-glow pointer-events-none" />
        
        <div className="relative">
          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Available for projects
            </span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 opacity-0 animate-slideUp">
            <span className="text-neon">{name}</span>
          </h1>

          {/* Subtitle */}
          <p className="font-display text-xl md:text-3xl lg:text-4xl font-light text-foreground/80 mb-4 opacity-0 animate-slideUp animation-delay-200">
            {title}
          </p>

          {/* Role */}
          <p className="font-mono text-sm md:text-base text-muted-foreground uppercase tracking-[0.2em] mb-12 opacity-0 animate-slideUp animation-delay-400">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-slideUp animation-delay-600">
            <a href="#projects" className="cyber-button">
              View Projects
            </a>
            <a
              href="#contact"
              className="px-8 py-3 font-display font-semibold uppercase tracking-widest border border-muted-foreground/30 text-foreground hover:border-primary hover:text-primary transition-all duration-300"
            >
              Contact Me
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 opacity-0 animate-fadeIn animation-delay-800">
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="font-mono text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-primary/30 z-20" />
      <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-primary/30 z-20" />
      <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-primary/30 z-20" />
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-primary/30 z-20" />
    </section>
  );
};

export default HeroSection;
