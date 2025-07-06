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
        <Helmet>
          <title>Match Not Found | DamiTV</title>
          <meta name="description" content="The requested match could not be found on DamiTV." />
        </Helmet>
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

  // Generate dynamic SEO data
  const homeTeam = match.teams.home;
  const awayTeam = match.teams.away;
  const matchDate = new Date(match.date);
  const formattedDate = matchDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = matchDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // SEO Title - Use match title instead of team names
  const seoTitle = `${match.title} Live Stream Free | ${formattedDate} | DamiTV`;
  
  // SEO Description - Use match title
  const seoDescription = match.seo?.description || 
    `Watch ${match.title} live stream online for free on ${formattedDate} at ${formattedTime}. High-quality ${match.seo?.category || 'sports'} streaming on DamiTV with multiple sources available.`;
  
  // SEO Keywords - Use match title
  const seoKeywords = match.seo?.keywords || 
    `${match.title} live stream, ${match.title} watch online, ${match.title} free stream, live ${match.seo?.category || 'sports'} streaming, ${match.title} ${formattedDate}`;

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": match.title,
    "description": seoDescription,
    "startDate": match.date,
    "url": `https://damitv.pro/manual-match/${match.id}`,
    "location": {
      "@type": "VirtualLocation",
      "name": "DamiTV Streaming Platform",
      "url": "https://damitv.pro"
    },
    "organizer": {
      "@type": "Organization",
      "name": "DamiTV",
      "url": "https://damitv.pro"
    },
    "competitor": [
      {
        "@type": "SportsTeam",
        "name": homeTeam
      },
      {
        "@type": "SportsTeam", 
        "name": awayTeam
      }
    ],
    "video": {
      "@type": "VideoObject",
      "name": `${match.title} Live Stream`,
      "description": `Live streaming video for ${match.title}`,
      "uploadDate": match.date,
      "thumbnailUrl": match.image || "https://damitv.pro/logo.png",
      "embedUrl": selectedLink?.url,
      "duration": "PT180M"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href={`https://damitv.pro/manual-match/${match.id}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://damitv.pro/manual-match/${match.id}`} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={match.image || "https://damitv.pro/logo.png"} />
        <meta property="og:site_name" content="DamiTV" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://damitv.pro/manual-match/${match.id}`} />
        <meta property="twitter:title" content={seoTitle} />
        <meta property="twitter:description" content={seoDescription} />
        <meta property="twitter:image" content={match.image || "https://damitv.pro/logo.png"} />
        
        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DamiTV" />
        <meta name="category" content={match.seo?.category || "Sports"} />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
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
                {match.title}
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
                    <span className="text-white font-semibold">{match.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                    <div className="text-sm text-gray-400">
                      {formattedDate} at {formattedTime}
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
                    title={`${match.title} Stream`}
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
                  <p><span className="text-white">Date:</span> {formattedDate}</p>
                  <p><span className="text-white">Time:</span> {formattedTime}</p>
                  {match.seo?.category && (
                    <p><span className="text-white">Category:</span> {match.seo.category}</p>
                  )}
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
