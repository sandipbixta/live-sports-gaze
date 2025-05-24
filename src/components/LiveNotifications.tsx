
import React, { useState, useEffect } from 'react';
import { Bell, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'goal' | 'trending' | 'starting';
  timestamp: Date;
}

const LiveNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const sampleNotifications = [
    { title: "⚽ GOAL!", message: "Real Madrid scores against Barcelona!", type: 'goal' as const },
    { title: "🔥 Trending", message: "Manchester United vs Liverpool is heating up!", type: 'trending' as const },
    { title: "🚀 Starting Soon", message: "NBA Finals Game 7 starts in 5 minutes!", type: 'starting' as const },
    { title: "⚽ GOAL!", message: "PSG equalizes in the 89th minute!", type: 'goal' as const },
    { title: "🏀 Buzzer Beater!", message: "Lakers win with a last-second three!", type: 'goal' as const },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...randomNotification,
          timestamp: new Date()
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
        setIsVisible(true);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 5000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className="bg-[#151922] border-[#ff5a36] p-3 animate-slide-in-right shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="mt-1">
                {notification.type === 'goal' && <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />}
                {notification.type === 'trending' && <Bell className="h-4 w-4 text-orange-500 animate-bounce" />}
                {notification.type === 'starting' && <Bell className="h-4 w-4 text-green-500" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{notification.title}</h4>
                <p className="text-xs text-gray-300">{notification.message}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissNotification(notification.id)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LiveNotifications;
