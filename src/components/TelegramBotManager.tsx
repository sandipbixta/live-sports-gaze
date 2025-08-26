import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { Loader2, Send, Settings, Users, MessageCircle, Clock } from 'lucide-react';

interface TelegramBotManagerProps {
  liveMatches?: any[];
}

const TelegramBotManager: React.FC<TelegramBotManagerProps> = ({ liveMatches = [] }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [botInfo, setBotInfo] = useState<any>(null);
  const [chatId, setChatId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [lastPostTime, setLastPostTime] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkBotConnection();
    
    // Load settings from localStorage
    const savedChatId = localStorage.getItem('telegram_chat_id');
    const savedAutoPost = localStorage.getItem('telegram_auto_post');
    const savedLastPost = localStorage.getItem('telegram_last_post');
    
    if (savedChatId) setChatId(savedChatId);
    if (savedAutoPost) setAutoPostEnabled(savedAutoPost === 'true');
    if (savedLastPost) setLastPostTime(savedLastPost);
  }, []);

  const checkBotConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot', {
        body: { action: 'test_connection' }
      });

      if (error) throw error;

      if (data.success) {
        setBotInfo(data.bot);
        setIsConnected(true);
        toast({
          title: "Bot Connected",
          description: `Connected to @${data.bot.username}`,
        });
      } else {
        setIsConnected(false);
        toast({
          title: "Bot Connection Failed", 
          description: data.error || "Failed to connect to Telegram bot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking bot connection:', error);
      setIsConnected(false);
    }
  };

  const sendCustomMessage = async () => {
    if (!customMessage.trim() || !chatId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both chat ID and message",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot', {
        body: { 
          action: 'send_message',
          message: customMessage,
          chatId: chatId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Message Sent",
          description: "Your message was sent successfully!",
        });
        setCustomMessage('');
        
        // Save chat ID to localStorage
        localStorage.setItem('telegram_chat_id', chatId);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Check your chat ID.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const postLiveMatches = async () => {
    if (!chatId.trim()) {
      toast({
        title: "Missing Chat ID", 
        description: "Please enter your Telegram chat ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('telegram-bot', {
        body: {
          action: 'post_live_matches',
          matches: liveMatches,
          chatId: chatId
        }
      });

      if (error) throw error;

      if (data.success) {
        const now = new Date().toLocaleString();
        setLastPostTime(now);
        localStorage.setItem('telegram_last_post', now);
        localStorage.setItem('telegram_chat_id', chatId);
        
        toast({
          title: "Live Matches Posted",
          description: `Posted ${liveMatches.length} live matches to Telegram`,
        });
      } else {
        throw new Error('Failed to post matches');
      }
    } catch (error) {
      console.error('Error posting matches:', error);
      toast({
        title: "Post Failed",
        description: "Failed to post live matches. Check your settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoPostToggle = (enabled: boolean) => {
    setAutoPostEnabled(enabled);
    localStorage.setItem('telegram_auto_post', enabled.toString());
    
    if (enabled) {
      toast({
        title: "Auto-Post Enabled",
        description: "Live matches will be posted automatically every 30 minutes",
      });
      
      // Start auto-posting (every 30 minutes)
      setInterval(() => {
        if (liveMatches.length > 0 && chatId) {
          postLiveMatches();
        }
      }, 30 * 60 * 1000);
    } else {
      toast({
        title: "Auto-Post Disabled", 
        description: "Automatic posting has been turned off",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Telegram Bot Manager
            </CardTitle>
            <CardDescription>
              Auto-post live sports matches to your Telegram channel
            </CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bot Information */}
        {botInfo && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Bot Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Name: {botInfo.first_name}</div>
              <div>Username: @{botInfo.username}</div>
            </div>
          </div>
        )}

        {/* Chat ID Configuration */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Telegram Chat ID</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your chat ID (e.g., -1001234567890)"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={checkBotConnection}
              disabled={isLoading}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Add your bot to a channel/group and use the chat ID
          </p>
        </div>

        {/* Live Matches Posting */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Live Matches Auto-Post</h4>
              <p className="text-sm text-muted-foreground">
                Currently {liveMatches.length} live matches available
              </p>
            </div>
            <Switch
              checked={autoPostEnabled}
              onCheckedChange={handleAutoPostToggle}
              disabled={!chatId || !isConnected}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={postLiveMatches}
              disabled={isLoading || !chatId || liveMatches.length === 0}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              Post Live Matches Now
            </Button>
          </div>

          {lastPostTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last posted: {lastPostTime}
            </div>
          )}
        </div>

        {/* Custom Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Send Custom Message</label>
          <div className="space-y-2">
            <Input
              placeholder="Enter your custom message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendCustomMessage()}
            />
            <Button
              onClick={sendCustomMessage}
              disabled={isLoading || !customMessage.trim() || !chatId}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Message
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-medium mb-2">Setup Instructions:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Create a Telegram bot via @BotFather</li>
            <li>Add your bot token to the secrets (already done)</li>
            <li>Create a channel/group and add your bot as admin</li>
            <li>Get the chat ID and enter it above</li>
            <li>Enable auto-posting to broadcast live matches automatically</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelegramBotManager;