import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import ChannelsGrid from '../components/ChannelsGrid';
import FeaturedChannels from '../components/FeaturedChannels';

import PromotionBoxes from '../components/PromotionBoxes';
import { Separator } from '../components/ui/separator';
import { Calendar, Tv, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import PageLayout from '../components/PageLayout';
import { generateCompetitorTitle, generateCompetitorDescription } from '../utils/competitorSEO';
import CompetitorSEOContent from '../components/CompetitorSEOContent';
import { Helmet } from 'react-helmet-async';
import TelegramBanner from '../components/TelegramBanner';
import { getAllChannelSources } from '../data/tvChannels';

// Lazy load heavy components
const NewsSection = React.lazy(() => import('../components/NewsSection'));
const TrendingTopics = React.lazy(() => import('../components/TrendingTopics'));

const Index = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sportsChannels, setSportsChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load IPTV sports channels
  useEffect(() => {
    const loadSportsChannels = async () => {
      try {
        setLoading(true);
        const allChannelsData = await getAllChannelSources();
        
        // Flatten all channels from all providers and filter for sports channels
        const allChannels = Object.values(allChannelsData).flat();
        const sports = allChannels.filter(channel => 
          channel.category === 'sports' || 
          channel.group?.toLowerCase().includes('sport') ||
          channel.title.toLowerCase().includes('sport') ||
          channel.title.toLowerCase().includes('football') ||
          channel.title.toLowerCase().includes('soccer') ||
          channel.title.toLowerCase().includes('cricket') ||
          channel.title.toLowerCase().includes('nfl') ||
          channel.title.toLowerCase().includes('nba') ||
          channel.title.toLowerCase().includes('espn') ||
          channel.title.toLowerCase().includes('sky sports')
        );
        
        setSportsChannels(sports);
        console.log('✅ Sports channels loaded:', sports.length);
      } catch (error) {
        console.error('❌ Error loading sports channels:', error);
        toast({
          title: "Error",
          description: "Failed to load sports channels.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSportsChannels();
  }, []);


  // Optimized search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <Helmet>
        <title>{generateCompetitorTitle('DamiTV - Free Live Sports IPTV Channels', 'home')}</title>
        <meta name="description" content={generateCompetitorDescription('Watch live sports channels free online. Premium IPTV sports streaming with football, cricket, NBA, NFL and more.', 'home')} />
        <meta name="keywords" content="live sports iptv, watch sports online, free sports channels, sports tv, iptv streaming, live football, cricket iptv, nba streams, nfl channels, espn live, sky sports" />
        <link rel="canonical" href="https://damitv.pro/" />
      </Helmet>
      
      <main className="py-4">
        {/* Hero Section */}
        <section className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Live Sports IPTV Channels</h1>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl">
                Watch premium sports channels live for free. Football, Cricket, NBA, NFL and more - all in HD quality.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/channels">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    <Tv className="mr-2 h-4 w-4" />
                    Browse All Channels
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Zap className="mr-2 h-4 w-4" />
                  {sportsChannels.length}+ Sports Channels
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Telegram Banner */}
        <div className="mb-6">
          <TelegramBanner />
        </div>

        {/* Featured Sports Channels */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Featured Sports Channels</h2>
              <p className="text-gray-400 text-sm">Premium IPTV sports channels available now</p>
            </div>
            <div className="flex gap-2">
              <Link to="/channels">
                <Button variant="outline" className="text-foreground border-border hover:bg-muted bg-background">
                  <Tv className="mr-2 h-4 w-4" /> 
                  All Channels
                </Button>
              </Link>
              <Link to="/schedule">
                <Button variant="outline" className="text-foreground border-border hover:bg-muted bg-background">
                  <Calendar className="mr-2 h-4 w-4" /> 
                  Schedule
                </Button>
              </Link>
            </div>
          </div>
          
          {/* IPTV Channels Grid */}
          <ChannelsGrid />
        </div>
        
        <Separator className="my-8 bg-[#343a4d]" />
        
        {/* Featured Channels Section */}
        <React.Suspense fallback={<div className="h-32 bg-[#242836] rounded-lg animate-pulse" />}>
          <FeaturedChannels />
        </React.Suspense>
        
        <Separator className="my-8 bg-[#343a4d]" />
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <React.Suspense fallback={<div className="h-48 bg-[#242836] rounded-lg animate-pulse" />}>
              <NewsSection />
            </React.Suspense>
          </div>
          <div>
            <React.Suspense fallback={<div className="h-48 bg-[#242836] rounded-lg animate-pulse" />}>
              <TrendingTopics />
            </React.Suspense>
          </div>
        </div>
        
        <PromotionBoxes />
        
        {/* Hidden SEO content for competitor targeting */}
        <CompetitorSEOContent showFAQ={true} showCompetitorMentions={true} />
      </main>
    </PageLayout>
  );
};

export default Index;
