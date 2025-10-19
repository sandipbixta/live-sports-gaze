import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Tv } from 'lucide-react';
import { toast } from 'sonner';

interface StreamData {
  id: string;
  title: string;
  stream_link?: string;
  url?: string;
  link?: string;
}

export const StreamsList = () => {
  const [streams, setStreams] = useState<StreamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Domain restriction - only work on damitv.pro
    const currentDomain = window.location.hostname;
    if (currentDomain === 'damitv.pro' || currentDomain === 'www.damitv.pro' || currentDomain.includes('localhost') || currentDomain.includes('lovable.app')) {
      setAuthorized(true);
      fetchStreams();
    } else {
      setAuthorized(false);
      setLoading(false);
      toast.error('This feature is only available on damitv.pro');
    }
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await fetch(
        'https://api.ssssdata.com/v1.1/stream/list?language=en&access-token=SMB9MtuEJTs6FdH_owwf0QXWtqoyJ0'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch streams');
      }

      const data = await response.json();
      // Handle different possible response structures
      const streamsList = Array.isArray(data) ? data : data.streams || data.data || [];
      setStreams(streamsList);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast.error('Failed to load streams');
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = (stream: StreamData) => {
    const streamUrl = stream.stream_link || stream.url || stream.link;
    if (streamUrl) {
      window.open(streamUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Stream link not available');
    }
  };

  if (!authorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              This feature is only available on damitv.pro
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No streams available at the moment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live Streams</h1>
        <p className="text-muted-foreground">Available streams from our network</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {streams.map((stream) => (
          <Card key={stream.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tv className="w-5 h-5 text-primary" />
                <span className="line-clamp-2">{stream.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleWatch(stream)}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Watch
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
