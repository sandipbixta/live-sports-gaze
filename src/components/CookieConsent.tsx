import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { X } from 'lucide-react';

const CONSENT_KEY = 'user_cookie_consent';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem(CONSENT_KEY);
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setShowBanner(false);
  };

  const handleDecline = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-sm text-foreground">
            <p>
              We use cookies to ensure you get the best experience on our website. 
              By continuing, you agree to our use of cookies.{' '}
              <Link 
                to="/privacy" 
                className="text-primary hover:underline font-medium"
              >
                Learn more
              </Link>
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="text-muted-foreground hover:text-foreground"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Accept Cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
