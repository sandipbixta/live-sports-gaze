
import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Match, Stream, Source } from '../types/sports';
import { fetchMatches, fetchStream } from '../api/sportsApi';
import MatchesList from '../components/MatchesList';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import StreamPlayer from '../components/StreamPlayer';
import MainNav from '../components/MainNav';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';

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
        const sportIds = ['1', '2', '3', '4']; // Common sport IDs
        let allLiveMatches: Match[] = [];
        
        for (const sportId of sportIds) {
          const matches = await fetchMatches(sportId);
          // Filter for matches with sources (live streams)
          const livesFromSport = matches.filter(match => 
            match.sources && match.sources.length > 0);
          allLiveMatches = [...allLiveMatches, ...livesFromSport];
        }
        
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
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <header className="bg-[#151922] shadow-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <MainNav />
            <div className="hidden md:flex items-center space-x-4">
              <Button className="bg-[#9b87f5] hover:bg-[#8a75e8] text-white">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Live Now</h1>
          
          {loading ? (
            <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5] mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading live streams...</p>
            </div>
          ) : featuredMatch ? (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-white">{featuredMatch.title}</h2>
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
          <h2 className="text-2xl font-bold mb-6 text-white">All Live Matches</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-[#242836] rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveMatches.map((match) => (
                <div 
                  key={match.id} 
                  className="bg-[#242836] border-[#343a4d] rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2f3f] transition-all"
                  onClick={() => {
                    setFeaturedMatch(match);
                    if (match.sources && match.sources.length > 0) {
                      loadStream(match.sources[0]);
                    }
                  }}
                >
                  <div className="p-4">
                    <h3 className="font-bold mb-2 text-white">{match.title}</h3>
                    <p className="text-sm text-gray-300">Live Now</p>
                  </div>
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
      </main>
      
      <footer className="bg-[#151922] text-gray-300 py-10 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-white mb-4">DAMITV</h4>
              <p className="text-sm">Your premium destination for live sports streaming.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Sports</h5>
              <ul className="space-y-2 text-sm">
                <li>Football</li>
                <li>Basketball</li>
                <li>Tennis</li>
                <li>Racing</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Help</h5>
              <ul className="space-y-2 text-sm">
                <li>FAQ</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Follow Us</h5>
              <div className="flex space-x-4">
                {/* Social icons kept the same */}
                <div className="w-8 h-8 rounded-full bg-[#343a4d] flex items-center justify-center">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#343a4d] flex items-center justify-center">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#343a4d] flex items-center justify-center">
                  <span className="sr-only">YouTube</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"></path></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#343a4d] mt-8 pt-8 text-center text-sm">
            <p>© 2025 DAMITV - All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Live;
