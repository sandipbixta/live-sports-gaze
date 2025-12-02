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
              <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                      <Download className="h-12 w-12 text-primary mx-auto md:mx-0 mb-4" />
                      <h2 className="text-2xl font-bold mb-2">Download DamiTV App</h2>
                      <p className="text-muted-foreground mb-6">
                        Scan the QR code or click the button to download and install DamiTV
                      </p>
                      <Button 
                        asChild
                        size="lg"
                        className="bg-primary hover:bg-primary/90 mb-4"
                      >
                        <a href="https://damitv-pro.netlify.app" target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-5 w-5" />
                          Download App
                        </a>
                      </Button>
                      {isInstallable && (
                        <Button 
                          onClick={handleInstallClick}
                          size="lg"
                          variant="outline"
                          className="ml-0 md:ml-2"
                        >
                          <Smartphone className="mr-2 h-5 w-5" />
                          Quick Install
                        </Button>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg">
                        <img 
                          src={qrCodeImage} 
                          alt="QR Code to download DamiTV app" 
                          className="w-48 h-48 md:w-56 md:h-56"
                        />
                        <p className="text-center text-sm text-gray-600 mt-2">Scan to download</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">📱 On Mobile (iOS)</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. Open this page in Safari</li>
                      <li>2. Tap the Share button (square with arrow)</li>
                      <li>3. Scroll and tap "Add to Home Screen"</li>
                      <li>4. Tap "Add" to confirm</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">📱 On Mobile (Android)</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. Open this page in Chrome</li>
                      <li>2. Tap the menu (three dots)</li>
                      <li>3. Tap "Install app" or "Add to Home screen"</li>
                      <li>4. Tap "Install" to confirm</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">💻 On Desktop (Chrome)</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. Look for the install icon in the address bar</li>
                      <li>2. Click the install button</li>
                      <li>3. Or use the menu (three dots) → Install DamiTV</li>
                      <li>4. The app will open in its own window</li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">💻 On Desktop (Edge)</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. Click the app icon in the address bar</li>
                      <li>2. Or go to Settings → Apps → Install DamiTV</li>
                      <li>3. Click "Install"</li>
                      <li>4. Access from your apps menu anytime</li>
                    </ol>
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
