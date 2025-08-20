import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const PushNotifications: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Show prompt after a delay if permission is default and not dismissed
      const hasBeenDismissed = localStorage.getItem('notification-prompt-dismissed');
      if (Notification.permission === 'default' && !hasBeenDismissed) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 10000); // Show after 10 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        
        if (result === 'granted') {
          toast({
            title: "Notifications enabled!",
            description: "You'll now get alerts for live matches and important updates.",
          });
          
          // Send a welcome notification
          setTimeout(() => {
            new Notification('Welcome to DamiTV!', {
              body: 'You will now receive notifications for live matches and updates.',
              icon: 'https://i.imgur.com/m4nV9S8.png',
              badge: 'https://i.imgur.com/m4nV9S8.png'
            });
          }, 1000);
          
          setShowPrompt(false);
        } else {
          toast({
            title: "Notifications blocked",
            description: "You can enable them later in your browser settings.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // Don't show anything if notifications aren't supported
  if (!('Notification' in window)) {
    return null;
  }

  // Show notification prompt
  if (showPrompt && permission === 'default' && !dismissed) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 w-80 bg-[#1A1F2C] border-[#343a4d] shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#9b87f5]" />
              <h3 className="font-semibold text-white">Stay Updated</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissPrompt}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-300 mb-4">
            Get instant notifications when your favorite matches go live and never miss the action!
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={requestPermission}
              size="sm"
              className="bg-[#9b87f5] hover:bg-[#8a75e8] text-white flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              Enable Alerts
            </Button>
            <Button 
              onClick={dismissPrompt}
              variant="outline"
              size="sm"
              className="border-[#343a4d] text-gray-300"
            >
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show notification status button in header/nav
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={permission === 'granted' ? undefined : requestPermission}
      className="text-white hover:bg-[#343a4d] relative"
      title={
        permission === 'granted' 
          ? 'Notifications enabled' 
          : permission === 'denied'
          ? 'Notifications blocked - enable in browser settings'
          : 'Enable notifications for live match alerts'
      }
    >
      {permission === 'granted' ? (
        <Bell className="h-4 w-4 text-[#9b87f5]" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      
      {permission === 'granted' && (
        <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#9b87f5] rounded-full"></span>
      )}
    </Button>
  );
};

// Utility functions for sending notifications
export const sendMatchNotification = (matchTitle: string, timeUntilStart: string) => {
  if (Notification.permission === 'granted') {
    new Notification(`🔴 Live Now: ${matchTitle}`, {
      body: `The match is starting now! Click to watch on DamiTV.`,
      icon: 'https://i.imgur.com/m4nV9S8.png',
      badge: 'https://i.imgur.com/m4nV9S8.png',
      tag: 'live-match',
      requireInteraction: true
    });
  }
};

export const sendUpcomingMatchNotification = (matchTitle: string, timeUntilStart: string) => {
  if (Notification.permission === 'granted') {
    new Notification(`⏰ Match Starting Soon: ${matchTitle}`, {
      body: `Starting in ${timeUntilStart}. Get ready!`,
      icon: 'https://i.imgur.com/m4nV9S8.png',
      badge: 'https://i.imgur.com/m4nV9S8.png',
      tag: 'upcoming-match'
    });
  }
};

export default PushNotifications;