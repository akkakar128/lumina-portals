import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './layout/Navigation';
import { useScrollPageNavigation } from '@/hooks/useScrollPageNavigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

      {showPageIndicator && (
        <>
          {/* Left arrow - previous page */}
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

          {/* Right arrow - next page */}
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

          {/* Bottom dots - page indicators */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-full border border-border/20 backdrop-blur-md bg-background/20">
            {pageOrder.map((_, index) => (
              <button
                key={index}
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
                title={PAGE_NAMES[index]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PageWrapper;
