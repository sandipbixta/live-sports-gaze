import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '../components/ui/separator';
import { Calendar, Tv } from 'lucide-react';
import { Button } from '../components/ui/button';
import PageLayout from '../components/PageLayout';
import CompetitorSEOContent from '../components/CompetitorSEOContent';
import { Helmet } from 'react-helmet-async';
import { manualMatches } from '../data/manualMatches';
import TelegramBanner from '../components/TelegramBanner';
import { HeroCarousel } from '../components/HeroCarousel';
import FeaturedMatches from '../components/FeaturedMatches';
import CDNMatchesSection from '../components/CDNMatchesSection';
import { useCDNMatches } from '../hooks/useCDNMatches';
import EmailSubscription from '../components/EmailSubscription';
import HomepageContent from '../components/HomepageContent';

// Lazy load heavy components
const PromotionBoxes = React.lazy(() => import('../components/PromotionBoxes'));
const NewsSection = React.lazy(() => import('../components/NewsSection'));
const FeaturedChannels = React.lazy(() => import('../components/FeaturedChannels'));
const TrendingTopics = React.lazy(() => import('../components/TrendingTopics'));

const Index = () => {
  // CDN Matches data
  const { liveMatches: cdnLiveMatches, upcomingMatches: cdnUpcomingMatches, matchesBySport, loading: cdnLoading } = useCDNMatches();

  // Filter visible manual matches
  const visibleManualMatches = useMemo(() => {
    return manualMatches.filter(match => match.visible);
  }, []);

  // Get soccer matches from CDN
  const soccerMatches = matchesBySport['Soccer'] || [];

  return (
    <PageLayout>
      <Helmet>
        <title>Best Sports Streaming Site Alternatives | DamiTV</title>
        <meta name="description" content="Discover the best sports streaming site alternatives. Free HD streams for football, basketball & more. Top vipleague & totalsportek alternative." />
        <meta name="keywords" content="best sports streaming site alternatives, vipleague alternative, totalsportek similar sites, stream2watch alternative, hesgoal alternative, free sports streaming, live sports online, streameast alternative" />
        <link rel="canonical" href="https://www.damitv.pro/" />
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DamiTV",
            "url": "https://damitv.pro",
            "logo": "https://damitv.pro/favicon.png",
            "description": "Leading sports streaming site alternative offering free HD streams for all major sports",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "reviewCount": "15847",
              "bestRating": "5",
              "worstRating": "1"
            },
            "sameAs": [
              "https://t.me/damitv_official"
            ]
          })}
        </script>
        
        {/* WebSite Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DamiTV - Best Sports Streaming Alternative",
            "url": "https://damitv.pro",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://damitv.pro/live?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <main className="py-4">
        {/* SEO H1 - Hidden but present for SEO */}
        <h1 className="sr-only">Top 10 Sports Streaming Site Alternatives - Free HD Streams</h1>
        
        {/* Promotion Links */}
        <div className="mb-4">
          <TelegramBanner />
        </div>

        {/* Hero Carousel with Match Posters */}
        <HeroCarousel />

        {/* CDN Live Matches Section */}
        {soccerMatches.length > 0 && (
          <CDNMatchesSection 
            matches={soccerMatches} 
            sport="Soccer" 
            title="Live & Upcoming Soccer Matches"
            maxItems={12}
          />
        )}

        <FeaturedMatches visibleManualMatches={visibleManualMatches} />

        <React.Suspense fallback={<div className="h-32 bg-muted rounded-lg animate-pulse" />}>
          <FeaturedChannels />
        </React.Suspense>
            
        <Separator className="my-8 bg-border" />
            
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
            
            <React.Suspense fallback={<div className="h-24 bg-[#242836] rounded-lg animate-pulse" />}>
              <PromotionBoxes />
            </React.Suspense>
            
            {/* Hidden SEO content for competitor targeting */}
            <CompetitorSEOContent showFAQ={true} showCompetitorMentions={true} />
            
            {/* Call to Action Section */}
            <section className="mb-6 sm:mb-8 mt-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
                <div className="relative">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Start Watching Sports Now</h2>
                  <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl">
                    Join thousands of sports fans who trust DamiTV for free live streaming. Access all major leagues and tournaments with crystal clear HD quality on any device.
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

            {/* SEO Content Section - Compact and organized */}
            <section className="mb-8">
              <div className="prose prose-invert max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Popular Sports Available</h2>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Live Football Streaming (Premier League, Champions League, La Liga)</li>
                      <li>• Basketball Games (NBA, EuroLeague)</li>
                      <li>• Tennis Tournaments (ATP, WTA, Grand Slams)</li>
                      <li>• Boxing and MMA Events</li>
                      <li>• Motor Sports (Formula 1, MotoGP)</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Why Choose DamiTV?</h2>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• No registration or subscription required</li>
                      <li>• HD quality streaming on all devices</li>
                      <li>• Multiple streaming sources for reliability</li>
                      <li>• Live chat and match discussions</li>
                      <li>• Regular updates and new channels</li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">How DamiTV Works</h3>
                    <p className="text-muted-foreground mb-3 text-sm">
                      DamiTV provides free access to live sports streaming through our user-friendly platform. Simply browse our sports categories, select your preferred match or channel, and start watching instantly. No downloads, no registration, and no hidden fees.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Our streaming technology ensures reliable connections with multiple backup sources for each event. If one stream experiences issues, our system automatically switches to an alternative source to maintain uninterrupted viewing.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Comprehensive Sports Coverage</h3>
                    <p className="text-muted-foreground mb-3 text-sm">
                      We cover major sports leagues worldwide including Premier League football, Champions League, NBA basketball, ATP tennis, Formula 1 racing, and boxing events. Our coverage spans European football leagues, American sports, and international tournaments.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      DamiTV provides comprehensive sports entertainment with live matches, extensive TV channels, and complete schedules for all major sports. Looking for reliable streaming platforms? Check out our detailed guide on <Link to="/daddylivehd-alternatives" className="text-primary hover:text-primary/80 font-semibold underline">DaddyliveHD streaming site alternatives</Link>, our safety-focused review of <Link to="/batmanstream-alternatives" className="text-primary hover:text-primary/80 font-semibold underline">Batmanstream alternatives and safe links</Link>, and our comprehensive comparison of <Link to="/hesgoal-alternatives" className="text-primary hover:text-primary/80 font-semibold underline">Hesgoal live stream alternatives and legal links</Link> to discover the best secure options available today.
                    </p>
                  </div>
            </div>
          </div>
        </section>

        {/* SEO Content - Competitor keywords */}
        <CompetitorSEOContent />
        
        {/* Email Subscription Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <EmailSubscription />
          </div>
        </section>
        
        {/* Rich Homepage Content for AdSense Approval */}
        <HomepageContent />
      </main>
    </PageLayout>
  );
};

export default Index;
