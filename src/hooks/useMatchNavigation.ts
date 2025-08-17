
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from './use-mobile';
import { useCallback, useRef, useEffect } from 'react';

export const useMatchNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const lastNavigateTime = useRef(0);
  const previousPath = useRef<string>('');

  // Track the previous path for better back navigation
  useEffect(() => {
    // Store current path as previous when component mounts
    if (location.pathname !== previousPath.current) {
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);

  const handleGoBack = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Debounce to prevent rapid-fire navigation
    const now = Date.now();
    if (now - lastNavigateTime.current < 300) {
      console.log('Navigation debounced - too rapid');
      return;
    }
    lastNavigateTime.current = now;
    
    console.log('Back button clicked, navigating...');
    
    try {
      // Check if there's browser history to go back to
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // If no history, go to home
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Navigation failed, falling back to home:', error);
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return { handleGoBack, isMobile };
};
