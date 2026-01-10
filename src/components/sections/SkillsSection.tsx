import { useState } from 'react';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks/useScrollAnimation';
import AnimatedTitle from '../AnimatedTitle';

interface Skill {
  name: string;
  category: string;
  proficiency: number;
}

const demoSkills: Skill[] = [
  { name: 'React', category: 'Frontend', proficiency: 95 },
  { name: 'TypeScript', category: 'Languages', proficiency: 90 },
  { name: 'Three.js', category: 'Graphics', proficiency: 85 },
  { name: 'Node.js', category: 'Backend', proficiency: 88 },
  { name: 'WebGL', category: 'Graphics', proficiency: 80 },
  { name: 'PostgreSQL', category: 'Database', proficiency: 85 },
  { name: 'Python', category: 'Languages', proficiency: 82 },
  { name: 'Docker', category: 'DevOps', proficiency: 78 },
  { name: 'GraphQL', category: 'API', proficiency: 88 },
  { name: 'TensorFlow', category: 'AI/ML', proficiency: 70 },
  { name: 'Figma', category: 'Design', proficiency: 75 },
  { name: 'AWS', category: 'Cloud', proficiency: 80 },
];

const categories = ['All', ...Array.from(new Set(demoSkills.map(s => s.category)))];

const SkillsSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: filtersRef, isVisible: filtersVisible } = useScrollAnimation({ threshold: 0.3 });
  const { ref: gridRef, isVisible: gridVisible, getItemAnimationStyle } = useStaggerAnimation(12, { 
    threshold: 0.1,
    staggerDelay: 80 
  });
  const { ref: footerRef, isVisible: footerVisible } = useScrollAnimation({ threshold: 0.5 });
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const filteredSkills = activeCategory === 'All'
    ? demoSkills
    : demoSkills.filter(s => s.category === activeCategory);

  return (
    <section
      id="skills"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with 3D animated title */}
        <div 
          ref={headerRef}
          className={`text-center mb-16 ${headerVisible ? 'scroll-fade-down' : 'scroll-hidden'}`}
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
            // Expertise
          </span>
          <div className="mb-6">
            <AnimatedTitle 
              text="TECHNICAL SKILLS" 
              as="h2"
              className="text-4xl md:text-5xl lg:text-6xl"
            />
          </div>
          <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
            Continuously learning and mastering new technologies to stay at the cutting edge.
          </p>
        </div>

        {/* Category filters with swing animation */}
        <div 
          ref={filtersRef}
          className={`flex flex-wrap justify-center gap-3 mb-12 ${filtersVisible ? 'scroll-swing-in' : 'scroll-hidden'}`}
        >
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border rounded-lg transition-all duration-300 hover:scale-105 ${
                activeCategory === category
                  ? 'bg-primary/20 text-primary border-primary/50 shadow-glow-sm'
                  : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Skills grid with morph animations */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill, index) => (
            <div
              key={skill.name}
              className={`glass-card p-5 group cursor-default ${gridVisible ? 'scroll-morph-in' : 'scroll-hidden'}`}
              style={getItemAnimationStyle(index)}
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {skill.name}
                </h3>
                <span className={`font-mono text-sm transition-all duration-300 ${
                  hoveredSkill === skill.name ? 'text-primary scale-110' : 'text-primary/70'
                }`}>
                  {skill.proficiency}%
                </span>
              </div>

              {/* Progress bar with glow effect */}
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: gridVisible ? `${skill.proficiency}%` : '0%',
                    transitionDelay: `${index * 80 + 300}ms`,
                    boxShadow: hoveredSkill === skill.name 
                      ? '0 0 20px hsl(var(--primary) / 0.6), 0 0 40px hsl(var(--primary) / 0.3)' 
                      : 'none',
                  }}
                />
              </div>

              {/* Category tag */}
              <div className="mt-3">
                <span className="font-mono text-xs text-muted-foreground group-hover:text-primary/60 transition-colors">
                  {skill.category}
                </span>
              </div>

              {/* Hover ripple effect */}
              <div 
                className={`absolute inset-0 rounded-xl bg-primary/5 transition-opacity duration-300 ${
                  hoveredSkill === skill.name ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Additional info with glow trail animation */}
        <div 
          ref={footerRef}
          className={`mt-16 text-center ${footerVisible ? 'scroll-glow-trail' : 'scroll-hidden'}`}
        >
          <p className="font-mono text-sm text-muted-foreground">
            And many more technologies explored and mastered over the years...
          </p>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
