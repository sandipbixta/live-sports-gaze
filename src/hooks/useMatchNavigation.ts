
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from './use-mobile';

export const useMatchNavigation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleGoBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Back button clicked, navigating...');
    
    try {
      // Simple and reliable navigation
      navigate(-1);
    } catch (error) {
      console.error('Navigation failed, falling back to channels:', error);
      navigate('/channels', { replace: true });
    }
  };

  return { handleGoBack, isMobile };
};
