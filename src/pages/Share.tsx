import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SEOMetaTags from '@/components/SEOMetaTags';
import { Loader, Share2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Share = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle different types of shared content
    if (type && id) {
      // Redirect to the appropriate page based on the share type
      switch (type) {
        case 'match':
          // Extract sport and match ID if it's a compound ID
          const parts = id.split('-');
          if (parts.length >= 2) {
            const sportId = parts[0];
            const matchId = parts.slice(1).join('-');
            navigate(`/match/${sportId}/${matchId}`, { replace: true });
          } else {
            navigate(`/match/football/${id}`, { replace: true });
          }
          break;
        case 'manual-match':
          navigate(`/manual-match/${id}`, { replace: true });
          break;
        case 'channel':
          const channelParts = id.split('-');
          if (channelParts.length >= 2) {
            const country = channelParts[0];
            const channelId = channelParts.slice(1).join('-');
            navigate(`/channel/${country}/${channelId}`, { replace: true });
          }
          break;
        default:
          navigate('/', { replace: true });
      }
    } else {
      // If no valid share parameters, redirect to home
      navigate('/', { replace: true });
    }
  }, [type, id, navigate]);

  return (
    <PageLayout>
      <SEOMetaTags 
        title="Shared Content - DamiTV"
        description="Loading shared sports content on DamiTV"
      />
      
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <Card className="bg-[#1A1F2C] border-[#343a4d] p-8 text-center max-w-md mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Share2 className="h-12 w-12 text-[#ff5a36]" />
              <div className="absolute -top-1 -right-1">
                <Loader className="h-6 w-6 text-white animate-spin" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white">Loading Shared Content</h1>
              <p className="text-gray-400">
                Redirecting you to the shared sports content...
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Play className="h-4 w-4" />
              <span>DamiTV - Free Live Sports</span>
            </div>
            
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="mt-4 bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d]"
            >
              Go to Home
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Share;