import { useEffect, useRef, useState } from 'react';
import { Code, Palette, Zap, Globe } from 'lucide-react';

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Code,
      title: 'Full-Stack Development',
      description: 'Building scalable applications with modern frameworks and cutting-edge technologies.',
    },
    {
      icon: Palette,
      title: '3D & Visual Design',
      description: 'Creating immersive experiences with WebGL, Three.js, and motion graphics.',
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Delivering lightning-fast experiences with optimized code and smart architecture.',
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'Working with clients worldwide to bring ideas to life across cultures and markets.',
    },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 cyber-grid opacity-50" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
            // About
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-neon">Who</span> I Am
          </h2>
          <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
            A passionate developer and creative technologist dedicated to pushing the boundaries
            of what's possible on the web.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`glass-card p-6 md:p-8 group hover:border-primary/50 transition-all duration-500 ${
                isVisible ? 'animate-slideUp' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 ${isVisible ? 'animate-fadeIn animation-delay-600' : 'opacity-0'}`}>
          {[
            { value: '5+', label: 'Years Experience' },
            { value: '50+', label: 'Projects Completed' },
            { value: '30+', label: 'Happy Clients' },
            { value: '∞', label: 'Lines of Code' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-neon mb-2">
                {stat.value}
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
