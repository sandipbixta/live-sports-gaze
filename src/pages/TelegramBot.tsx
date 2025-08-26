import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import PageLayout from '../components/PageLayout';
import TelegramBotManager from '../components/TelegramBotManager';
import { fetchLiveMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, filterActiveMatches, isMatchLive } from '../utils/matchUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { MessageCircle, Users, Zap, Globe } from 'lucide-react';

const TelegramBot: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  // Fetch live matches for the bot
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['live-matches-telegram'],
    queryFn: fetchLiveMatches,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  useEffect(() => {
    if (matches.length > 0) {
      // Process matches similar to AllSportsLiveMatches component
      const cleanMatches = filterActiveMatches(filterCleanMatches(matches));
      const filteredMatches = consolidateMatches(cleanMatches);
      const currentLiveMatches = filteredMatches.filter(match => isMatchLive(match));
      
      setLiveMatches(currentLiveMatches);
    }
  }, [matches]);

  return (
    <PageLayout>
      <Helmet>
        <title>Telegram Bot Manager - Auto-Post Live Sports</title>
        <meta 
          name="description" 
          content="Manage your Telegram bot to automatically post live sports matches and updates to your channel or group."
        />
      </Helmet>

      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Telegram Bot Manager
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automatically post live sports matches and updates to your Telegram channel or group
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{liveMatches.length}</p>
                    <p className="text-sm text-muted-foreground">Live Matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{matches.length}</p>
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">Auto</p>
                    <p className="text-sm text-muted-foreground">Posting</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-muted-foreground">Monitoring</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Bot Manager */}
          <TelegramBotManager liveMatches={liveMatches} />

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  Auto-Posting
                </CardTitle>
                <CardDescription>
                  Automatically post live matches every 30 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Smart filtering of quality matches</li>
                  <li>• Professional formatting with emojis</li>
                  <li>• Multiple sports support</li>
                  <li>• Stream count indicators</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Custom Messages
                </CardTitle>
                <CardDescription>
                  Send custom announcements and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Manual message broadcasting</li>
                  <li>• HTML formatting support</li>
                  <li>• Instant delivery</li>
                  <li>• Error handling & notifications</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Channel Management
                </CardTitle>
                <CardDescription>
                  Manage multiple channels and groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Support for channels & groups</li>
                  <li>• Real-time connection status</li>
                  <li>• Bot configuration testing</li>
                  <li>• Activity tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Setup Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Setup Guide</CardTitle>
              <CardDescription>
                Get your Telegram bot up and running in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">1. Create Your Bot</h4>
                  <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Message @BotFather on Telegram</li>
                    <li>Send /newbot command</li>
                    <li>Choose a name and username</li>
                    <li>Copy the bot token (already configured)</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">2. Setup Your Channel</h4>
                  <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Create a new Telegram channel/group</li>
                    <li>Add your bot as administrator</li>
                    <li>Get the chat ID using @userinfobot</li>
                    <li>Enter the chat ID in the form above</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default TelegramBot;