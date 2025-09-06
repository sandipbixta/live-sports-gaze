import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import SEOMetaTags from './SEOMetaTags';
import { matchSEO, leagueSEO, type MatchSEOData } from '@/utils/matchSEO';
import { seoOptimizer } from '@/utils/seoOptimization';

interface AutoSEOOptimizerProps {
  children: React.ReactNode;
  manualSEO?: {
    title?: string;
    description?: string;
    keywords?: string;
    matchInfo?: MatchSEOData;
  };
}

const AutoSEOOptimizer: React.FC<AutoSEOOptimizerProps> = ({ 
  children, 
  manualSEO 
}) => {
  const location = useLocation();
  const params = useParams();

  // Auto-detect page type and generate SEO
  const detectPageType = () => {
    const path = location.pathname;
    
    // Match page pattern: /match/:id or similar
    if (path.includes('/match/') || path.includes('/live/')) {
      return 'match';
    }
    
    // League pages
    if (path.includes('/league/') || path.includes('/premier-league') || 
        path.includes('/champions-league') || path.includes('/la-liga')) {
      return 'league';
    }
    
    // Live sports page
    if (path === '/live' || path.includes('/live-sports')) {
      return 'live';
    }
    
    // Channels page
    if (path.includes('/channels') || path.includes('/tv')) {
      return 'channels';
    }
    
    // Schedule page
    if (path.includes('/schedule') || path.includes('/fixtures')) {
      return 'schedule';
    }
    
    return 'home';
  };

  const generateAutoSEO = () => {
    const pageType = detectPageType();
    
    // If manual SEO is provided, use it
    if (manualSEO) {
      return {
        title: manualSEO.title,
        description: manualSEO.description,
        keywords: manualSEO.keywords,
        matchInfo: manualSEO.matchInfo,
        pageType,
        autoGenerate: false
      };
    }

    // Auto-generate based on URL and page type
    switch (pageType) {
      case 'match': {
        // Try to extract match info from URL params or page content
        const matchId = params.id;
        const urlParts = location.pathname.split('/');
        
        // Look for team names in URL or search params
        const searchParams = new URLSearchParams(location.search);
        const homeTeam = searchParams.get('home') || 'Home Team';
        const awayTeam = searchParams.get('away') || 'Away Team'; 
        const league = searchParams.get('league') || 'Football';
        
        const matchInfo: MatchSEOData = {
          homeTeam,
          awayTeam,
          league,
          date: new Date().toISOString().split('T')[0],
          time: '20:00'
        };

        return {
          title: matchSEO.generateTitle(matchInfo, matchSEO.isBigMatch(matchInfo)),
          description: matchSEO.generateMetaDescription(matchInfo, matchSEO.isBigMatch(matchInfo)),
          keywords: matchSEO.generateKeywords(matchInfo, true),
          matchInfo,
          pageType,
          autoGenerate: true
        };
      }

      case 'league': {
        const leagueFromPath = location.pathname.split('/').pop() || 'football';
        return {
          title: leagueSEO.generateTitle(leagueFromPath),
          description: leagueSEO.generateMetaDescription(leagueFromPath),
          keywords: leagueSEO.generateKeywords(leagueFromPath),
          pageType,
          leagueId: leagueFromPath,
          autoGenerate: true
        };
      }

      case 'live': {
        return {
          title: "Live Sports Streaming Free - Watch All Matches Today | DAMITV",
          description: "Watch live sports streaming free on DAMITV.pro. Football, basketball, tennis and more in HD quality without subscription required!",
          keywords: "live sports streaming, watch live matches today, free sports streams, live football, live basketball, sports streaming free",
          pageType,
          autoGenerate: true
        };
      }

      case 'channels': {
        return {
          title: "Free Live Sports TV Channels - HD Streaming | DAMITV",
          description: "Watch free live sports TV channels on DAMITV.pro. Stream all major sports networks in HD quality without subscription or registration.",
          keywords: "free sports tv channels, live tv streaming, sports channels online, watch sports channels free, live sports tv",
          pageType,
          autoGenerate: true
        };
      }

      case 'schedule': {
        return {
          title: "Football Fixtures & Schedule - Live Streaming | DAMITV", 
          description: "Check today's football fixtures and schedule. Watch all matches live streaming free on DAMITV.pro. Premier League, Champions League and more.",
          keywords: "football fixtures, match schedule, football calendar, live match times, sports schedule",
          pageType,
          autoGenerate: true
        };
      }

      default: {
        return {
          title: "Free Live Sports Streaming - Watch Football, Basketball & More | DAMITV",
          description: "Watch live sports streaming free on DAMITV.pro. Football, basketball, tennis and more in HD quality. No subscription required, mobile-friendly streaming.",
          keywords: "live sports streaming, free football streaming, watch sports online, live matches, sports tv, free streaming",
          pageType,
          autoGenerate: true
        };
      }
    }
  };

  const seoData = generateAutoSEO();

  // Track SEO performance
  useEffect(() => {
    const timer = setTimeout(() => {
      // Analyze page SEO after content loads
      const metrics = seoOptimizer.analyzePage();
      const recommendations = seoOptimizer.getRecommendations(metrics);
      
      // Log SEO recommendations in development
      if (process.env.NODE_ENV === 'development' && recommendations.length > 0) {
        console.group('🔍 SEO Recommendations for', location.pathname);
        recommendations.forEach(rec => console.log('💡', rec));
        console.groupEnd();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <SEOMetaTags
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        matchInfo={seoData.matchInfo}
        includeCompetitorKeywords={true}
        canonicalUrl={`https://damitv.pro${location.pathname}`}
      />
      {children}
    </>
  );
};

export default AutoSEOOptimizer;