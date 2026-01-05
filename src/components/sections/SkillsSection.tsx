import { useState } from 'react';

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
        {/* Section header */}
        <div className="text-center mb-16 scroll-section-header">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
            // Expertise
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Technical <span className="text-neon">Skills</span>
          </h2>
          <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
            Continuously learning and mastering new technologies to stay at the cutting edge.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 scroll-fade-up">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border rounded-lg transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary/20 text-primary border-primary/50 shadow-glow-sm'
                  : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill, index) => (
            <div
              key={skill.name}
              className={`glass-card p-5 group cursor-default scroll-card scroll-delay-${Math.min((index % 4) + 1, 4)}`}
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {skill.name}
                </h3>
                <span className="font-mono text-sm text-primary">
                  {skill.proficiency}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${skill.proficiency}%`,
                    boxShadow: hoveredSkill === skill.name ? '0 0 20px hsl(var(--primary) / 0.5)' : 'none',
                  }}
                />
              </div>

              {/* Category tag */}
              <div className="mt-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {skill.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center scroll-fade-up">
          <p className="font-mono text-sm text-muted-foreground">
            And many more technologies explored and mastered over the years...
          </p>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
