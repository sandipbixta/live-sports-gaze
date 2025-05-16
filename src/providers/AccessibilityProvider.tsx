import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    _useAlternateServer?: boolean;
  }
}

interface AccessibilityContextType {
  isUsingAlternateServer: boolean;
  toggleServer: () => void;
  connectionQuality: 'good' | 'fair' | 'poor';
  isLoading: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [isUsingAlternateServer, setIsUsingAlternateServer] = useState<boolean>(() => {
    return localStorage.getItem('use_alternate_server') === 'true';
  });
  
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to toggle between primary and alternate server
  const toggleServer = () => {
    const newValue = !isUsingAlternateServer;
    localStorage.setItem('use_alternate_server', newValue ? 'true' : 'false');
    setIsUsingAlternateServer(newValue);
    window.location.reload();
  };

  // Check connection quality
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const startTime = Date.now();
        // Fetch a small resource to check connection
        const response = await fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          setConnectionQuality('poor');
          return;
        }
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (responseTime < 300) {
          setConnectionQuality('good');
        } else if (responseTime < 1000) {
          setConnectionQuality('fair');
        } else {
          setConnectionQuality('poor');
        }
      } catch (error) {
        console.error('Connection check failed:', error);
        setConnectionQuality('poor');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
    
    // Periodically check connection quality
    const intervalId = setInterval(checkConnection, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Configure API base URL based on server selection
  useEffect(() => {
    if (isUsingAlternateServer) {
      // Apply alternate API endpoints or CDN paths
      console.log('Using alternate server configuration');
      
      // Set the property on window after declaring its type
      window._useAlternateServer = true;
    } else {
      window._useAlternateServer = false;
    }
  }, [isUsingAlternateServer]);

  const value = {
    isUsingAlternateServer,
    toggleServer,
    connectionQuality,
    isLoading
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;
