import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PageLayout from '@/components/PageLayout';

// New FanCode-style components
import HeroBanner from '@/components/home/HeroBanner';
import LiveNowBanner from '@/components/home/LiveNowBanner';
import SportsTabs from '@/components/home/SportsTabs';
import MatchesGrid from '@/components/home/MatchesGrid';
import { CombinedMatch, getMatchesBySport } from '@/services/combinedSportsService';

// Existing components
import CompetitorSEOContent from '@/components/CompetitorSEOContent';
import EmailSubscription from '@/components/EmailSubscription';

// Lazy load heavy components
const NewsSection = React.lazy(() => import('@/components/NewsSection'));
const TrendingTopics = React.lazy(() => import('@/components/TrendingTopics'));

const Index = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [matches, setMatches] = useState<CombinedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch matches when tab changes
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const data = await getMatchesBySport(activeTab);
        // Filter out matches with empty/TBD team names
        const validMatches = data.filter(m => 
          m.homeTeam && m.awayTeam && 
          m.homeTeam !== 'TBD' && m.awayTeam !== 'TBD' &&
          m.homeTeam.length > 1 && m.awayTeam.length > 1
        );
        setMatches(validMatches);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [activeTab]);

  // Filter matches by search term
  const filteredMatches = useMemo(() => {
    if (!searchTerm.trim()) return matches;
    
    const term = searchTerm.toLowerCase();
    return matches.filter(match => 
      match.title.toLowerCase().includes(term) ||
      match.homeTeam.toLowerCase().includes(term) ||
      match.awayTeam.toLowerCase().includes(term) ||
      match.competition.toLowerCase().includes(term)
    );
  }, [matches, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <Helmet>
        <title>DamiTV - Free Live Sports Streaming | Watch Football, NBA, NFL & More</title>
        <meta name="description" content="Watch free live sports streaming on DamiTV. HD quality streams for football, basketball, cricket, tennis & more. No registration required." />
        <meta name="keywords" content="live sports streaming, free sports, watch football online, NBA live stream, NFL streaming, sports streaming site" />
        <link rel="canonical" href="https://www.damitv.pro/" />
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DamiTV",
            "url": "https://damitv.pro",
            "logo": "https://damitv.pro/favicon.png",
            "description": "Leading sports streaming platform offering free HD streams for all major sports",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "reviewCount": "15847",
              "bestRating": "5",
              "worstRating": "1"
            }
          })}
        </script>
      </Helmet>
      
      <main className="py-6 space-y-8">
        {/* SEO H1 - Hidden but present for SEO */}
        <h1 className="sr-only">Free Live Sports Streaming - Watch Football, NBA, NFL & More</h1>

        {/* Hero Banner - Main promotional banner */}
        <HeroBanner />

        {/* Live Now Banner - Featured live matches */}
        <LiveNowBanner />

        {/* Sports Category Tabs */}
        <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4">
          <SportsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Matches Grid */}
        <MatchesGrid matches={filteredMatches} loading={loading} />
        
        <Separator className="my-8 bg-border" />

        {/* News and Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <React.Suspense fallback={<div className="h-48 bg-card rounded-2xl animate-pulse" />}>
              <NewsSection />
            </React.Suspense>
          </div>
          <div>
            <React.Suspense fallback={<div className="h-48 bg-card rounded-2xl animate-pulse" />}>
              <TrendingTopics />
            </React.Suspense>
          </div>
        </div>
            
        {/* Call to Action Section */}
        <section className="mt-8">
          <div className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }} />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
                Start Watching Sports Now
              </h2>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl opacity-90">
                Join thousands of sports fans who trust DamiTV for free live streaming. 
                Access all major leagues and tournaments with crystal clear HD quality.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/live">
                  <Button className="bg-background text-foreground hover:bg-background/90">
                    <Tv className="mr-2 h-4 w-4" /> Watch Live Sports
                  </Button>
                </Link>
                <Link to="/channels">
                  <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    <Calendar className="mr-2 h-4 w-4" /> Browse Channels
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="mt-8">
          <div className="prose prose-invert max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-card rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-3">Popular Sports Available</h2>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Live Football Streaming (Premier League, Champions League, La Liga)</li>
                  <li>• Basketball Games (NBA, EuroLeague)</li>
                  <li>• Tennis Tournaments (ATP, WTA, Grand Slams)</li>
                  <li>• Boxing and MMA Events</li>
                  <li>• Motor Sports (Formula 1, MotoGP)</li>
                </ul>
              </div>
              <div className="bg-card rounded-2xl p-6">
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
          </div>
        </section>

        {/* Competitor SEO Content */}
        <CompetitorSEOContent showFAQ={true} showCompetitorMentions={true} />
        
        {/* Email Subscription Section */}
        <section className="py-8">
          <div className="max-w-2xl mx-auto">
            <EmailSubscription />
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default Index;
