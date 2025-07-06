
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from './use-mobile';

export const useMatchNavigation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleGoBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Header back button clicked on mobile:', isMobile);
    
    // Enhanced navigation with multiple fallbacks
    try {
      // First attempt: use React Router navigation
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/channels', { replace: true });
      }
    } catch (error) {
      console.error('React Router navigation failed:', error);
      // Fallback: use browser history
      try {
        window.history.back();
      } catch (historyError) {
        console.error('Browser history navigation failed:', historyError);
        // Final fallback: direct page navigation
        window.location.href = '/channels';
      }
    }
  };

  return { handleGoBack, isMobile };
};
