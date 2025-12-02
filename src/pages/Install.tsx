import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';
import SEOMetaTags from '@/components/SEOMetaTags';
import qrCodeImage from '@/assets/qr-code-download.png';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <PageLayout>
      <SEOMetaTags
        title="Install DamiTV App - Free Sports Streaming App"
        description="Install DamiTV progressive web app for the best sports streaming experience. Watch live football, basketball, and more on any device offline."
        keywords="install damitv app, sports streaming app, pwa install, offline sports streaming"
        canonicalUrl="https://damitv.pro/install"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Smartphone className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Install DamiTV App</h1>
            <p className="text-xl text-muted-foreground">
              Get the best sports streaming experience with our installable app
            </p>
          </div>

          {isInstalled ? (
            <Card className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-8 text-center">
                <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">App Already Installed!</h2>
                <p className="text-muted-foreground mb-6">
                  You're all set to enjoy DamiTV. Open the app from your home screen.
                </p>
                <Button asChild>
                  <a href="/">Go to Homepage</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Horizontal Layout for Android and iOS */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Android APK Download Section */}
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Download className="h-10 w-10 text-green-500" />
                        <span className="text-2xl font-bold">Android</span>
                      </div>
                      <h2 className="text-xl font-bold mb-2">Download APK File</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        For Android phones: Download and install the DamiTV APK file directly
                      </p>
                      
                      <Button 
                        asChild
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                      >
                        <a href="https://drive.google.com/uc?export=download&id=1a0WI10a3sIwFuPzqXm0zWcUfilX4SufQ" target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-5 w-5" />
                          Download Android APK
                        </a>
                      </Button>
                      <p className="text-xs text-muted-foreground mt-3">
                        Enable "Install from Unknown Sources" in settings
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* iOS Installation Section */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Smartphone className="h-10 w-10 text-blue-500" />
                        <span className="text-2xl font-bold">iOS</span>
                      </div>
                      <h2 className="text-xl font-bold mb-2">Install Web App</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        For iPhone/iPad: Add DamiTV to your home screen
                      </p>
                      
                      <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                        <img 
                          src={qrCodeImage} 
                          alt="QR Code to open DamiTV on iOS" 
                          className="w-40 h-40"
                        />
                        <p className="text-center text-xs text-gray-600 mt-2">Scan to open in Safari</p>
                      </div>
                      
                      <Button 
                        asChild
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full mb-4"
                      >
                        <a href="https://damitv-pro.netlify.app" target="_blank" rel="noopener noreferrer">
                          <Smartphone className="mr-2 h-5 w-5" />
                          Open DamiTV.pro
                        </a>
                      </Button>
                      
                      <div className="bg-background/50 p-4 rounded-lg border text-left">
                        <p className="text-xs font-semibold mb-2">Quick Steps:</p>
                        <ol className="space-y-1 text-xs text-muted-foreground">
                          <li>1. Open link in Safari browser</li>
                          <li>2. Tap Share button (↑)</li>
                          <li>3. Select "Add to Home Screen"</li>
                          <li>4. Tap "Add" to install</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">✨ Benefits of Installing</h3>
                  <ul className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Works offline - access content without internet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Faster loading times with caching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Full-screen experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Push notifications for live matches</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Easy access from home screen or apps menu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Less data usage with smart caching</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Install;
