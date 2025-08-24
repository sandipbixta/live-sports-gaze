import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { MessageCircle, Send, CheckCircle2, Clock, Users } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';

interface MatchData {
  title: string;
  time: string;
  teams?: {
    home?: { name: string; };
    away?: { name: string; };
  };
}

interface TelegramResponse {
  success: boolean;
  matchesFound: number;
  matchesBySport: Record<string, MatchData[]>;
  message: string;
  sentAt: string;
  telegramMessage: string;
}

const TelegramTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<TelegramResponse | null>(null);
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
      setLastResult(data);
      
      toast({
        title: "Success! 🎉",
        description: `Sent ${data.matchesFound} matches to your Telegram group!`,
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
    <div className="space-y-4">
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
            <MessageCircle className="h-5 w-5" />
            Telegram Bot Test
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Send today's matches to your DAMITV.pro group
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
              <span>Group: DAMITV.pro ✓</span>
            </div>
          </div>
          
          <Button 
            onClick={sendTestMessage}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending matches...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Today's Matches Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {lastResult && (
        <Card className="w-full max-w-2xl mx-auto border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              Last Send Results
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {lastResult.matchesFound} matches
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(lastResult.sentAt).toLocaleString()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(lastResult.matchesBySport).map(([sport, matches]) => (
              <div key={sport} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {sport.toUpperCase()} ({matches.length} matches)
                </h4>
                <div className="space-y-1">
                  {matches.slice(0, 3).map((match, idx) => (
                    <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-mono">{match.time}</span>
                      <span>
                        {match.teams?.home && match.teams?.away 
                          ? `${match.teams.home.name} vs ${match.teams.away.name}`
                          : match.title
                        }
                      </span>
                    </div>
                  ))}
                  {matches.length > 3 && (
                    <div className="text-xs text-gray-500 italic">
                      ...and {matches.length - 3} more matches
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <strong>Message Preview:</strong> {lastResult.telegramMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TelegramTestButton;