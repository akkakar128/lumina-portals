import { ReactNode, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './layout/Navigation';
import { useScrollPageNavigation } from '@/hooks/useScrollPageNavigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PageWrapperProps {
  children: ReactNode;
  showNavigation?: boolean;
  showPageIndicator?: boolean;
  className?: string;
}

const PAGE_NAMES = ['Home', 'About', 'Projects', 'Skills', 'Contact'];

const PageWrapper = ({ 
  children, 
  showNavigation = true,
  showPageIndicator = true,
  className = ''
}: PageWrapperProps) => {
  const location = useLocation();
  const [transitionState, setTransitionState] = useState<'entering' | 'visible' | 'exiting'>('visible');
  const [transitionDirection, setTransitionDirection] = useState<'up' | 'down' | null>(null);
  const [showShimmer, setShowShimmer] = useState(false);
  const { currentIndex, totalPages, pageOrder, navigateToPage, scrollDirection } = useScrollPageNavigation();
  const prevPathname = useRef(location.pathname);

  // Handle page transition animations
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      setTransitionDirection(scrollDirection);
      setTransitionState('entering');
      setShowShimmer(true);
      
      // Animate in after a brief delay
      const enterTimer = setTimeout(() => {
        setTransitionState('visible');
      }, 50);

      // Hide shimmer after transition
      const shimmerTimer = setTimeout(() => {
        setShowShimmer(false);
      }, 600);

      prevPathname.current = location.pathname;
      return () => {
        clearTimeout(enterTimer);
        clearTimeout(shimmerTimer);
      };
    }
  }, [location.pathname, scrollDirection]);

  const canGoUp = currentIndex > 0;
  const canGoDown = currentIndex < totalPages - 1;

  // Compute transform based on transition state and direction
  const getTransitionClasses = () => {
    if (transitionState === 'entering') {
      if (transitionDirection === 'down') {
        return 'opacity-0 translate-y-12 scale-[0.98]';
      } else if (transitionDirection === 'up') {
        return 'opacity-0 -translate-y-12 scale-[0.98]';
      }
      return 'opacity-0 translate-y-8 scale-[0.98]';
    }
    return 'opacity-100 translate-y-0 scale-100';
  };

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-x-hidden ${className}`}>
      {showNavigation && <Navigation />}
      
      {/* Loading shimmer overlay */}
      <div 
        className={`fixed inset-0 z-30 pointer-events-none transition-opacity duration-500 ${
          showShimmer ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent shimmer-slide" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      </div>

      {/* Page content with smooth transition */}
      <main 
        className={`transition-all duration-700 ease-out ${getTransitionClasses()}`}
        style={{ 
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' 
        }}
      >
        {children}
      </main>

      {showPageIndicator && (
        <TooltipProvider delayDuration={100}>
          {/* Left arrow - previous page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => canGoUp && navigateToPage('up')}
                disabled={!canGoUp}
                className={`fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full border border-border/30 backdrop-blur-sm transition-all duration-300 ${
                  canGoUp 
                    ? 'text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 cursor-pointer hover:scale-110' 
                    : 'text-muted-foreground/20 cursor-not-allowed opacity-0 pointer-events-none'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            {canGoUp && (
              <TooltipContent side="right" className="bg-background/90 backdrop-blur-sm border-border/50">
                <p className="font-mono text-xs">{PAGE_NAMES[currentIndex - 1]}</p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* Right arrow - next page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => canGoDown && navigateToPage('down')}
                disabled={!canGoDown}
                className={`fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full border border-border/30 backdrop-blur-sm transition-all duration-300 ${
                  canGoDown 
                    ? 'text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 cursor-pointer hover:scale-110' 
                    : 'text-muted-foreground/20 cursor-not-allowed opacity-0 pointer-events-none'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            {canGoDown && (
              <TooltipContent side="left" className="bg-background/90 backdrop-blur-sm border-border/50">
                <p className="font-mono text-xs">{PAGE_NAMES[currentIndex + 1]}</p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* Bottom dots - page indicators with tooltips */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-full border border-border/20 backdrop-blur-md bg-background/20">
            {pageOrder.map((_, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (index < currentIndex) navigateToPage('up');
                      else if (index > currentIndex) navigateToPage('down');
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? 'w-8 h-2 bg-primary shadow-glow-sm'
                        : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:scale-125'
                    }`}
                    aria-label={`Go to ${PAGE_NAMES[index]}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-background/90 backdrop-blur-sm border-border/50">
                  <p className="font-mono text-xs">{PAGE_NAMES[index]}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      )}

      <style>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-slide {
          animation: shimmer-slide 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PageWrapper;
