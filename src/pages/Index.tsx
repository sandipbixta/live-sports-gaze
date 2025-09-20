import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import FeaturedMatches from '../components/FeaturedMatches';

import PromotionBoxes from '../components/PromotionBoxes';
import { Separator } from '../components/ui/separator';
import { Calendar, Tv } from 'lucide-react';
import { Button } from '../components/ui/button';
import PageLayout from '../components/PageLayout';
import CompetitorSEOContent from '../components/CompetitorSEOContent';
import { Helmet } from 'react-helmet-async';
import { manualMatches } from '../data/manualMatches';
import TelegramBanner from '../components/TelegramBanner';

// Lazy load heavy components
const NewsSection = React.lazy(() => import('../components/NewsSection'));
const FeaturedChannels = React.lazy(() => import('../components/FeaturedChannels'));
const TrendingTopics = React.lazy(() => import('../components/TrendingTopics'));

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter visible manual matches
  const visibleManualMatches = useMemo(() => {
    return manualMatches.filter(match => match.visible);
  }, []);


  // Optimized search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <Helmet>
        <title>DamiTV - Free Live Sports Streaming Online | Watch Football & More</title>
        <meta name="description" content="Watch free live sports streaming online at DamiTV. Access football, basketball, tennis matches and TV channels without registration. HD quality streams." />
        <meta name="keywords" content="live sports streaming, watch sports online, free sports streams, sports TV, channels, live matches, free sports tv, totalsportek alternative, streameast alternative" />
        <link rel="canonical" href="https://www.damitv.pro/" />
      </Helmet>
      
      <main className="py-4">

        <FeaturedMatches visibleManualMatches={visibleManualMatches} />

        {/* Telegram Banner */}
        <div className="mb-6">
          <TelegramBanner />
        </div>

        <React.Suspense fallback={<div className="h-32 bg-[#242836] rounded-lg animate-pulse" />}>
          <FeaturedChannels />
        </React.Suspense>
        
        <Separator className="my-8 bg-[#343a4d]" />
        
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
        
        {/* Hero Section */}
        <section className="mb-6 sm:mb-8 mt-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Free Live Sports Streaming Online</h1>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl">
                Watch live sports streaming for free at DamiTV. Access football, basketball, tennis matches and hundreds of TV channels without registration. HD quality streams available on all devices.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/live">
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Tv className="mr-2 h-4 w-4" /> Watch Live Sports
                  </Button>
                </Link>
                <Link to="/channels">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    <Calendar className="mr-2 h-4 w-4" /> Browse Channels
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Content */}
        <section className="mb-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-foreground mb-4">About DamiTV Sports Streaming</h2>
            <p className="text-muted-foreground mb-4">
              DamiTV offers the best free live sports streaming experience online. Our platform provides access to live football matches, basketball games, tennis tournaments, and hundreds of sports TV channels from around the world. Watch your favorite teams and athletes compete in real-time without any subscription fees or registration requirements.
            </p>
            <p className="text-muted-foreground mb-4">
              Whether you're looking for <Link to="/live" className="text-blue-400 hover:underline">live sports matches</Link>, want to browse our extensive <Link to="/channels" className="text-blue-400 hover:underline">TV channels collection</Link>, or check upcoming games in our <Link to="/schedule" className="text-blue-400 hover:underline">sports schedule</Link>, DamiTV has you covered with high-quality streaming that works on desktop, mobile, and tablet devices.
            </p>
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default Index;
