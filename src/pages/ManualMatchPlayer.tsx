import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { manualMatches } from '@/data/manualMatches';
import { ManualMatchLink } from '@/types/manualMatch';
import { Helmet } from 'react-helmet-async';

const ManualMatchPlayer = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  const match = manualMatches.find(m => m.id === matchId);
  const [selectedLink, setSelectedLink] = useState<ManualMatchLink | null>(
    match?.links?.[0] || null
  );

  const handleFullscreen = () => {
    const iframe = document.querySelector('#manual-stream-iframe') as HTMLIFrameElement;
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Match Not Found</h1>
          <p className="text-gray-400 mb-6">The requested match could not be found.</p>
          <Button onClick={() => navigate('/')} className="bg-[#ff5a36] hover:bg-[#e64d2e]">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      <Helmet>
        <title>{match.teams.home} vs {match.teams.away} - Live Stream | DamiTV</title>
        <meta name="description" content={`Watch ${match.teams.home} vs ${match.teams.away} live stream online for free on DamiTV`} />
      </Helmet>
      
      {/* Header */}
      <div className="bg-[#242836] border-b border-[#343a4d] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white hover:bg-[#343a4d]"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {match.teams.home} vs {match.teams.away}
              </h1>
              <p className="text-sm text-gray-400">{match.title}</p>
              {selectedLink && (
                <p className="text-xs text-[#9b87f5]">
                  {selectedLink.name} {selectedLink.quality && `(${selectedLink.quality})`}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-gray-400 hover:text-white hover:bg-[#343a4d]"
              title="Fullscreen"
            >
              <Maximize2 size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="bg-[#242836] rounded-lg overflow-hidden border border-[#343a4d]">
              {/* Match Info Bar */}
              <div className="bg-[#1a1f2e] p-3 border-b border-[#343a4d]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-semibold">{match.teams.home}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-white font-semibold">{match.teams.away}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                    <div className="text-sm text-gray-400">
                      {new Date(match.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Channel Title */}
              {selectedLink && (
                <div className="bg-[#242836] px-4 py-2 border-b border-[#343a4d]">
                  <h2 className="text-lg font-semibold text-white text-center">
                    {selectedLink.name}
                  </h2>
                </div>
              )}
              
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                {selectedLink ? (
                  <iframe
                    id="manual-stream-iframe"
                    src={selectedLink.url}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={`${match.teams.home} vs ${match.teams.away} Stream`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <p>No stream available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stream Sources Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#242836] rounded-lg border border-[#343a4d] p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Stream Sources</h3>
              <div className="space-y-2">
                {match.links.map((link) => (
                  <Button
                    key={link.id}
                    onClick={() => setSelectedLink(link)}
                    variant={selectedLink?.id === link.id ? "default" : "outline"}
                    className={`w-full justify-start text-left ${
                      selectedLink?.id === link.id
                        ? "bg-[#ff5a36] hover:bg-[#e64d2e] text-white"
                        : "bg-transparent border-[#343a4d] text-gray-300 hover:bg-[#343a4d] hover:text-white"
                    }`}
                  >
                    <Play size={14} className="mr-2" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{link.name}</span>
                      {link.quality && (
                        <span className="text-xs opacity-75">{link.quality}</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
              
              {/* Match Details */}
              <div className="mt-6 pt-4 border-t border-[#343a4d]">
                <h4 className="text-md font-semibold text-white mb-2">Match Details</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <p><span className="text-white">Title:</span> {match.title}</p>
                  <p><span className="text-white">Date:</span> {new Date(match.date).toLocaleDateString()}</p>
                  <p><span className="text-white">Time:</span> {new Date(match.date).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualMatchPlayer;
