import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Page order for scroll-based navigation
const PAGE_ORDER = ['/', '/about', '/projects', '/skills', '/contact'];

interface UseScrollPageNavigationOptions {
  scrollThreshold?: number;
  debounceTime?: number;
  enabled?: boolean;
}

export const useScrollPageNavigation = (options: UseScrollPageNavigationOptions = {}) => {
  const { 
    scrollThreshold = 100, 
    debounceTime = 800,
    enabled = true 
  } = options;
  
  const navigate = useNavigate();
  const location = useLocation();
  const lastScrollTime = useRef(Date.now());
  const isNavigating = useRef(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);

  const getCurrentPageIndex = useCallback(() => {
    return PAGE_ORDER.indexOf(location.pathname);
  }, [location.pathname]);

  const navigateToPage = useCallback((direction: 'up' | 'down') => {
    if (isNavigating.current) return;
    
    const currentIndex = getCurrentPageIndex();
    let targetIndex: number;

    if (direction === 'down') {
      targetIndex = Math.min(currentIndex + 1, PAGE_ORDER.length - 1);
    } else {
      targetIndex = Math.max(currentIndex - 1, 0);
    }

    if (targetIndex !== currentIndex) {
      isNavigating.current = true;
      setScrollDirection(direction);
      
      navigate(PAGE_ORDER[targetIndex]);
      
      // Reset navigation lock after animation
      setTimeout(() => {
        isNavigating.current = false;
        setScrollDirection(null);
      }, debounceTime);
    }
  }, [getCurrentPageIndex, navigate, debounceTime]);

  useEffect(() => {
    if (!enabled) return;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < debounceTime) return;
      
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const atTop = scrollTop <= 10;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;

      // Only trigger page navigation at page boundaries
      if (e.deltaY > scrollThreshold && atBottom) {
        lastScrollTime.current = now;
        navigateToPage('down');
      } else if (e.deltaY < -scrollThreshold && atTop) {
        lastScrollTime.current = now;
        navigateToPage('up');
      }
    };

    // Touch handling for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      const now = Date.now();
      
      if (now - lastScrollTime.current < debounceTime) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const atTop = scrollTop <= 10;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;

      if (Math.abs(diff) > 50) {
        if (diff > 0 && atBottom) {
          // Swiped up (scroll down)
          lastScrollTime.current = now;
          navigateToPage('down');
        } else if (diff < 0 && atTop) {
          // Swiped down (scroll up)
          lastScrollTime.current = now;
          navigateToPage('up');
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, scrollThreshold, debounceTime, navigateToPage]);

  // Scroll to appropriate position when navigating
  useEffect(() => {
    if (scrollDirection === 'up') {
      // Coming from below - scroll to bottom of page
      setTimeout(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
      }, 50);
    } else if (scrollDirection === 'down') {
      // Coming from above - scroll to top of page
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, scrollDirection]);

  return {
    currentPage: location.pathname,
    currentIndex: getCurrentPageIndex(),
    totalPages: PAGE_ORDER.length,
    navigateToPage,
    scrollDirection,
    pageOrder: PAGE_ORDER,
  };
};

export default useScrollPageNavigation;
