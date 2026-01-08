import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './layout/Navigation';
import { useScrollPageNavigation } from '@/hooks/useScrollPageNavigation';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { currentIndex, totalPages, pageOrder, navigateToPage } = useScrollPageNavigation();

  // Handle page transition animations
  useEffect(() => {
    setIsTransitioning(true);
    setIsVisible(false);
    
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      setIsTransitioning(false);
    }, 100);

    return () => clearTimeout(showTimer);
  }, [location.pathname]);

  const canGoUp = currentIndex > 0;
  const canGoDown = currentIndex < totalPages - 1;

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-x-hidden ${className}`}>
      {showNavigation && <Navigation />}
      
      {/* Page content with transition */}
      <main 
        className={`transition-all duration-500 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        {children}
      </main>

      {/* Page indicator - right side */}
      {showPageIndicator && (
        <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3">
          {/* Up arrow */}
          <button
            onClick={() => canGoUp && navigateToPage('up')}
            disabled={!canGoUp}
            className={`p-2 rounded-full border border-border/30 backdrop-blur-sm transition-all duration-300 ${
              canGoUp 
                ? 'text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 cursor-pointer' 
                : 'text-muted-foreground/30 cursor-not-allowed'
            }`}
            aria-label="Previous page"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Page dots */}
          <div className="flex flex-col gap-2 py-2">
            {pageOrder.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index < currentIndex) navigateToPage('up');
                  else if (index > currentIndex) navigateToPage('down');
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-primary scale-125 shadow-glow-sm'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                }`}
                aria-label={`Go to ${PAGE_NAMES[index]}`}
                title={PAGE_NAMES[index]}
              />
            ))}
          </div>

          {/* Down arrow */}
          <button
            onClick={() => canGoDown && navigateToPage('down')}
            disabled={!canGoDown}
            className={`p-2 rounded-full border border-border/30 backdrop-blur-sm transition-all duration-300 ${
              canGoDown 
                ? 'text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 cursor-pointer' 
                : 'text-muted-foreground/30 cursor-not-allowed'
            }`}
            aria-label="Next page"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default PageWrapper;
