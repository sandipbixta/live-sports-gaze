
import React, { useState, useEffect } from 'react';
import { Match, Stream } from '../../types/sports';
import { fetchStream } from '../../api/sportsApi';
import { useToast } from '../../hooks/use-toast';
import StreamPlayer from '../StreamPlayer';
import StreamSources from './StreamSources';

interface StreamTabProps {
  match: Match;
  sportId: string;
  isManualStream?: boolean;
  manualEmbedUrl?: string;
}

const StreamTab: React.FC<StreamTabProps> = ({ 
  match, 
  sportId, 
  isManualStream = false, 
  manualEmbedUrl 
}) => {
  const { toast } = useToast();
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [availableStreams, setAvailableStreams] = useState<Stream[]>([]);
  const [isLoadingStream, setIsLoadingStream] = useState(false);

  // Handle manual stream
  useEffect(() => {
    if (isManualStream && manualEmbedUrl) {
      const manualStream: Stream = {
        id: match.id,
        streamNo: 1,
        language: 'EN',
        hd: true,
        embedUrl: manualEmbedUrl,
        source: 'manual'
      };
      setSelectedStream(manualStream);
      setAvailableStreams([manualStream]);
      return;
    }
  }, [isManualStream, manualEmbedUrl, match.id]);

  // Load streams for regular matches
  useEffect(() => {
    if (isManualStream) return;

    const loadStreams = async () => {
      if (!match.sources || match.sources.length === 0) {
        return;
      }

      setIsLoadingStream(true);
      
      try {
        // Try to get streams from the first available source
        const firstSource = match.sources[0];
        const streamData = await fetchStream(firstSource.source, firstSource.id);
        
        if (Array.isArray(streamData)) {
          setAvailableStreams(streamData);
          if (streamData.length > 0) {
            setSelectedStream(streamData[0]);
          }
        } else {
          setAvailableStreams([streamData]);
          setSelectedStream(streamData);
        }
      } catch (error) {
        console.error('Error loading streams:', error);
        toast({
          title: "Stream Error",
          description: "Failed to load stream. Please try another source.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStream(false);
      }
    };

    loadStreams();
  }, [match.sources, toast, isManualStream]);

  const handleSourceChange = async (source: string, id: string, streamNo?: number) => {
    if (isManualStream) return;

    setIsLoadingStream(true);
    try {
      const streamData = await fetchStream(source, id);
      
      if (Array.isArray(streamData)) {
        setAvailableStreams(streamData);
        if (streamData.length > 0) {
          setSelectedStream(streamData[0]);
        }
      } else {
        setAvailableStreams([streamData]);
        setSelectedStream(streamData);
      }
    } catch (error) {
      console.error('Error changing source:', error);
      toast({
        title: "Stream Error",
        description: "Failed to load stream from this source.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStream(false);
    }
  };

  const handleStreamChange = (stream: Stream) => {
    setSelectedStream(stream);
  };

  const handleRetry = () => {
    if (match.sources && match.sources.length > 0) {
      handleSourceChange(match.sources[0].source, match.sources[0].id);
    }
  };

  return (
    <div className="space-y-6">
      <StreamPlayer 
        stream={selectedStream}
        isLoading={isLoadingStream}
        onRetry={handleRetry}
      />
      
      {!isManualStream && (
        <StreamSources
          match={match}
          availableStreams={availableStreams}
          selectedStream={selectedStream}
          onSourceChange={handleSourceChange}
          onStreamChange={handleStreamChange}
          isLoading={isLoadingStream}
        />
      )}
    </div>
  );
};

export default StreamTab;
