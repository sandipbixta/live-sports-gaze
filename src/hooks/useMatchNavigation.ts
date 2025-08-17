
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from './use-mobile';
import { useCallback, useRef } from 'react';

export const useMatchNavigation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const lastNavigateTime = useRef(0);

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
      // Simple and reliable navigation
      navigate(-1);
    } catch (error) {
      console.error('Navigation failed, falling back to home:', error);
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return { handleGoBack, isMobile };
};
