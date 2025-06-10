
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useToast } from '../hooks/use-toast';
import { Match as MatchType, Stream } from '../types/sports';
import { fetchMatch, fetchStream } from '../api/sportsApi';
import { fetchManualStreams, ManualStream } from '../services/manualStreamsService';
import PageLayout from '../components/PageLayout';
import MatchHeader from '../components/match/MatchHeader';
import TabsNavigation from '../components/match/TabsNavigation';
import StreamTab from '../components/match/StreamTab';
import HighlightsTab from '../components/match/HighlightsTab';
import LoadingState from '../components/match/LoadingState';
import NotFoundState from '../components/match/NotFoundState';

const Match = () => {
  const { sportId, matchId } = useParams<{ sportId: string; matchId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<MatchType | ManualStream | null>(null);
  const [activeTab, setActiveTab] = useState('stream');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Load match data
  useEffect(() => {
    const loadMatch = async () => {
      if (!sportId || !matchId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // First try to find in manual streams
        const manualStreams = await fetchManualStreams();
        const manualMatch = manualStreams.find(stream => stream.id === matchId);
        
        if (manualMatch) {
          setMatch(manualMatch);
        } else {
          // Fallback to regular API
          const matchData = await fetchMatch(sportId, matchId);
          setMatch(matchData);
        }
      } catch (error) {
        console.error('Error loading match:', error);
        setNotFound(true);
        toast({
          title: "Error",
          description: "Failed to load match data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMatch();
  }, [sportId, matchId, toast]);

  // Check if this is a manual stream
  const isManualStream = (match: MatchType | ManualStream | null): match is ManualStream => {
    return match !== null && 'embedUrl' in match;
  };

  const pageTitle = match 
    ? `${match.title} - Watch Live Stream on DamiTV`
    : 'Live Sports Stream - DamiTV';

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingState />
      </PageLayout>
    );
  }

  if (notFound || !match) {
    return (
      <PageLayout>
        <NotFoundState />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Watch ${match.title} live stream online for free on DamiTV. High quality sports streaming with no registration required.`} />
        <meta name="keywords" content={`${match.title}, live stream, watch online, free sports streaming, DamiTV`} />
      </Helmet>

      <div className="min-h-screen bg-[#0A0F1C]">
        <MatchHeader match={match} />
        <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="container mx-auto px-4 py-6">
          {activeTab === 'stream' ? (
            <StreamTab 
              match={match}
              sportId={sportId || ''}
              isManualStream={isManualStream(match)}
              manualEmbedUrl={isManualStream(match) ? match.embedUrl : undefined}
            />
          ) : (
            <HighlightsTab match={match} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Match;
