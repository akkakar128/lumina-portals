import { useEffect, useRef, useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  highlightClassName?: string;
  as?: 'h1' | 'h2' | 'h3';
}

const AnimatedTitle = ({
  text,
  className = '',
  highlightClassName = 'text-neon',
  as: Component = 'h1'
}: AnimatedTitleProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isVisible, hasAnimated]);

  // Reset animation when element leaves viewport
  useEffect(() => {
    if (!isVisible && hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hasAnimated]);

  const letters = text.split('');

  return (
    <div ref={ref} className="perspective-1000">
      <Component
        ref={containerRef}
        className={`animated-title-3d font-display font-black tracking-tighter ${className}`}
      >
        <span className={`animated-title-wrapper ${isVisible ? 'animate-3d-entrance' : 'pre-animation'}`}>
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`animated-letter ${highlightClassName} ${isVisible ? 'letter-animate' : ''}`}
              style={{
                animationDelay: `${index * 50}ms`,
                '--letter-index': index,
              } as React.CSSProperties}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </span>
        
        {/* 3D Shadow layers */}
        <span className={`animated-title-shadow shadow-layer-1 ${isVisible ? 'shadow-animate' : ''}`} aria-hidden="true">
          {letters.map((letter, index) => (
            <span
              key={index}
              style={{ animationDelay: `${index * 50 + 100}ms` }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </span>
        <span className={`animated-title-shadow shadow-layer-2 ${isVisible ? 'shadow-animate' : ''}`} aria-hidden="true">
          {letters.map((letter, index) => (
            <span
              key={index}
              style={{ animationDelay: `${index * 50 + 150}ms` }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </span>
        
        {/* Glow effect */}
        <span className={`animated-title-glow ${isVisible ? 'glow-animate' : ''}`} aria-hidden="true">
          {text}
        </span>
        
        {/* Reflection effect */}
        <span className={`animated-title-reflection ${isVisible ? 'reflection-animate' : ''}`} aria-hidden="true">
          {text}
        </span>
      </Component>
    </div>
  );
};

export default AnimatedTitle;
