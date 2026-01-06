import { useEffect, useRef, useState, useCallback } from 'react';

type AnimationVariant = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'zoom-in' 
  | 'zoom-out'
  | 'flip-up'
  | 'flip-left'
  | 'slide-up'
  | 'slide-down'
  | 'rotate-in'
  | 'blur-in'
  | 'scale-up'
  | 'bounce-in'
  | 'swing-in'
  | 'glitch-in';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

export const useScrollAnimation = <T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) => {
  const { 
    threshold = 0.1, 
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0 
  } = options;
  
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          } else {
            setIsVisible(true);
            setHasAnimated(true);
          }
          
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, delay]);

  const getAnimationClass = useCallback((variant: AnimationVariant, customDelay?: number) => {
    const delayClass = customDelay ? `animation-delay-${customDelay}` : '';
    const baseClass = isVisible ? `scroll-${variant}` : 'scroll-hidden';
    return `${baseClass} ${delayClass}`.trim();
  }, [isVisible]);

  return { ref, isVisible, hasAnimated, getAnimationClass };
};

// Hook for staggered children animations
export const useStaggerAnimation = <T extends HTMLElement = HTMLDivElement>(
  itemCount: number,
  options: UseScrollAnimationOptions & { staggerDelay?: number } = {}
) => {
  const { staggerDelay = 100, ...scrollOptions } = options;
  const { ref, isVisible, hasAnimated, getAnimationClass } = useScrollAnimation<T>(scrollOptions);

  const getItemAnimationStyle = useCallback((index: number) => ({
    animationDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
    opacity: isVisible ? undefined : 0,
  }), [isVisible, staggerDelay]);

  const getItemClass = useCallback((variant: AnimationVariant, index: number) => {
    return isVisible ? `scroll-${variant}` : 'scroll-hidden';
  }, [isVisible]);

  return { ref, isVisible, hasAnimated, getAnimationClass, getItemAnimationStyle, getItemClass };
};

export default useScrollAnimation;
