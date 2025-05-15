
import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Match, Stream, Source } from '../types/sports';
import { fetchMatches, fetchStream } from '../api/sportsApi';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import StreamPlayer from '../components/StreamPlayer';
import { Link } from 'react-router-dom';
import { Radio, Tv } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import MatchCard from '../components/MatchCard';

const Live = () => {
  const { toast } = useToast();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);

  useEffect(() => {
    const fetchLiveContent = async () => {
      setLoading(true);
      try {
        // Fetch from multiple sports to find live matches
        const sportIds = ['1', '2', '3', '4']; // Common sport IDs: basketball, football, american-football, hockey
        let allLiveMatches: Match[] = [];
        
        for (const sportId of sportIds) {
          const matches = await fetchMatches(sportId);
          // Filter for matches with sources (live streams)
          const livesFromSport = matches.filter(match => 
            match.sources && match.sources.length > 0);
          allLiveMatches = [...allLiveMatches, ...livesFromSport];
        }
        
        // Filter out advertisement matches (like Sky Sports News)
        allLiveMatches = allLiveMatches.filter(match => 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news')
        );
        
        setLiveMatches(allLiveMatches);
        
        // Set featured match (first one with sources)
        if (allLiveMatches.length > 0) {
          setFeaturedMatch(allLiveMatches[0]);
          
          // Fetch the stream for the featured match
          if (allLiveMatches[0].sources && allLiveMatches[0].sources.length > 0) {
            loadStream(allLiveMatches[0].sources[0]);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load live content.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLiveContent();
  }, [toast]);

  // Function to load stream from a source
  const loadStream = async (source: Source) => {
    setStreamLoading(true);
    try {
      const stream = await fetchStream(source.source, source.id);
      setCurrentStream(stream);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load stream.",
        variant: "destructive",
      });
      setCurrentStream(null);
    } finally {
      setStreamLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Live Now</h1>
          <div className="flex items-center gap-2 bg-[#242836] px-3 py-1.5 rounded-full">
            <Tv size={16} className="text-[#fa2d04] animate-pulse" />
            <span className="text-sm font-medium text-white">{liveMatches.length} Live Broadcasts</span>
          </div>
        </div>
        
        {loading ? (
          <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5] mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading live streams...</p>
          </div>
        ) : featuredMatch ? (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{featuredMatch.title}</h2>
              {streamLoading ? (
                <div className="text-sm text-[#9b87f5] flex items-center gap-1">
                  <span className="inline-block h-2 w-2 bg-[#9b87f5] rounded-full animate-pulse"></span>
                  Loading stream...
                </div>
              ) : currentStream ? (
                <div className="text-sm text-[#fa2d04] flex items-center gap-1">
                  <span className="inline-block h-2 w-2 bg-[#fa2d04] rounded-full animate-pulse"></span>
                  Live now
                </div>
              ) : null}
            </div>
            <StreamPlayer 
              stream={currentStream} 
              isLoading={streamLoading} 
            />
          </div>
        ) : (
          <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
            <p className="text-gray-300">No live streams available at the moment.</p>
          </div>
        )}
      </div>
      
      <Separator className="my-8 bg-[#343a4d]" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          All Live Matches
          <span className="inline-block h-2 w-2 bg-[#fa2d04] rounded-full animate-pulse"></span>
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-36 bg-[#242836] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : liveMatches.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {liveMatches.map((match) => (
              <div 
                key={match.id} 
                className="cursor-pointer"
                onClick={() => {
                  setFeaturedMatch(match);
                  if (match.sources && match.sources.length > 0) {
                    loadStream(match.sources[0]);
                  }
                  // Scroll to top
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }}
              >
                <MatchCard 
                  match={match}
                  sportId={match.category || "1"}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-[#242836] rounded-xl p-6 text-center">
            <p className="text-gray-300">No live matches currently available.</p>
          </div>
        )}
      </div>
      
      <Link to="/channels" className="block w-full">
        <div className="bg-[#242836] hover:bg-[#2a2f3f] border border-[#343a4d] rounded-xl p-6 text-center transition-all">
          <Radio className="h-10 w-10 text-[#9b87f5] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">Live TV Channels</h3>
          <p className="text-gray-300 mt-2">Access 70+ international sports channels from around the world</p>
          <Button className="mt-4 bg-[#9b87f5] hover:bg-[#8a75e8]">Browse Channels</Button>
        </div>
      </Link>
    </PageLayout>
  );
};

export default Live;
