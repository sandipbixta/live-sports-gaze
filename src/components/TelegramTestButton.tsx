import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';

const TelegramTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendTestMessage = async () => {
    setIsLoading(true);
    try {
      console.log('Testing Telegram bot...');
      
      const { data, error } = await supabase.functions.invoke('telegram-daily-matches', {
        body: { test: true }
      });

      if (error) {
        throw error;
      }

      console.log('Telegram test result:', data);
      
      toast({
        title: "Success! 🎉",
        description: "Daily matches sent to your Telegram! Check your chat.",
      });
      
    } catch (error: any) {
      console.error('Telegram test error:', error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
          <MessageCircle className="h-5 w-5" />
          Telegram Bot
        </CardTitle>
        <CardDescription className="text-blue-600 dark:text-blue-400">
          Test your automated daily matches bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Bot configured ✓</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Daily schedule: 8:00 AM UTC ✓</span>
          </div>
        </div>
        
        <Button 
          onClick={sendTestMessage}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Message Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TelegramTestButton;