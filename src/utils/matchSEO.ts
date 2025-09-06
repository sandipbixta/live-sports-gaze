import { generateCompetitorKeywords, generateCompetitorTitle, generateCompetitorDescription } from './competitorSEO';

export interface MatchSEOData {
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  time: string;
  venue?: string;
  competition?: string;
}

export interface LeagueSEOConfig {
  name: string;
  displayName: string;
  keywords: string[];
  priority: number;
}

export const LEAGUE_CONFIG: Record<string, LeagueSEOConfig> = {
  'premier-league': {
    name: 'premier-league',
    displayName: 'Premier League',
    keywords: ['epl', 'english premier league', 'premier league live', 'epl streaming'],
    priority: 10
  },
  'champions-league': {
    name: 'champions-league', 
    displayName: 'Champions League',
    keywords: ['ucl', 'champions league', 'european cup', 'ucl live streaming'],
    priority: 10
  },
  'la-liga': {
    name: 'la-liga',
    displayName: 'La Liga',
    keywords: ['spanish league', 'la liga spain', 'primera division'],
    priority: 9
  },
  'serie-a': {
    name: 'serie-a',
    displayName: 'Serie A',
    keywords: ['italian league', 'serie a italy', 'italian football'],
    priority: 8
  },
  'bundesliga': {
    name: 'bundesliga',
    displayName: 'Bundesliga',
    keywords: ['german league', 'bundesliga germany', 'german football'],
    priority: 8
  },
  'ligue-1': {
    name: 'ligue-1',
    displayName: 'Ligue 1',
    keywords: ['french league', 'ligue 1 france', 'french football'],
    priority: 7
  }
};

export const BIG_MATCHES = {
  'el-clasico': ['Real Madrid', 'Barcelona'],
  'manchester-derby': ['Manchester United', 'Manchester City'],
  'merseyside-derby': ['Liverpool', 'Everton'],
  'north-london-derby': ['Arsenal', 'Tottenham'],
  'milan-derby': ['AC Milan', 'Inter Milan'],
  'old-firm': ['Celtic', 'Rangers']
};

export class MatchSEOGenerator {
  static generateTitle(match: MatchSEOData, isBigMatch: boolean = false): string {
    const baseTitle = `${match.homeTeam} vs ${match.awayTeam} Live Streaming Free`;
    const leagueTitle = `${baseTitle} - ${match.league} 2025`;
    
    if (isBigMatch) {
      return generateCompetitorTitle(leagueTitle, 'match');
    }
    
    return `${leagueTitle} | DAMITV`;
  }

  static generateMetaDescription(match: MatchSEOData, isBigMatch: boolean = false): string {
    if (isBigMatch) {
      return generateCompetitorDescription('', 'match');
    }
    
    return `Watch ${match.homeTeam} vs ${match.awayTeam} live streaming free in HD on DAMITV.pro. ${match.league} action without subscription required!`;
  }

  static generateKeywords(match: MatchSEOData, includeCompetitor: boolean = false): string {
    const baseKeywords = [
      `${match.homeTeam.toLowerCase()} vs ${match.awayTeam.toLowerCase()} live stream`,
      `${match.homeTeam.toLowerCase()} ${match.awayTeam.toLowerCase()} free streaming`,
      `watch ${match.homeTeam.toLowerCase()} vs ${match.awayTeam.toLowerCase()} online free`,
      `${match.league.toLowerCase()} live streaming free`,
      `${match.homeTeam.toLowerCase()} live stream free`,
      `${match.awayTeam.toLowerCase()} live stream free`,
      `${match.league.toLowerCase()} online free`,
      `watch ${match.league.toLowerCase()} matches free`,
      `${match.homeTeam.toLowerCase()} ${match.awayTeam.toLowerCase()} damitv`,
      `free football streaming ${match.league.toLowerCase()}`
    ];

    const keywordString = baseKeywords.join(', ');
    
    if (includeCompetitor) {
      return generateCompetitorKeywords(keywordString);
    }
    
    return keywordString;
  }

  static generateContent(match: MatchSEOData, isBigMatch: boolean = false): string {
    const bigMatchContent = this.getBigMatchContent(match);
    if (bigMatchContent) return bigMatchContent;

    const venue = match.venue ? ` at ${match.venue}` : '';
    const competition = match.competition ? ` in ${match.competition}` : '';
    
    return `Experience thrilling ${match.league} action as ${match.homeTeam} faces ${match.awayTeam}${venue}${competition}. Watch every moment of this exciting football clash live in crystal-clear HD quality on DAMITV.pro. Our platform offers seamless streaming on desktop and mobile devices without registration or subscription fees. Don't miss any goals, saves, or tactical brilliance from both teams in this highly anticipated encounter. Stream completely free with no ads interruption and enjoy buffer-free viewing experience. **Watch ${match.homeTeam} vs ${match.awayTeam} live now at DAMITV.pro** - your premium destination for free ${match.league} streaming!`;
  }

  static getBigMatchContent(match: MatchSEOData): string | null {
    // El Clasico
    if ((match.homeTeam === 'Real Madrid' && match.awayTeam === 'Barcelona') ||
        (match.homeTeam === 'Barcelona' && match.awayTeam === 'Real Madrid')) {
      return `Experience the most anticipated match in football as Real Madrid faces Barcelona in El Clasico. This La Liga showdown promises world-class football with superstars battling for supremacy. Watch every goal, save, and tactical masterpiece unfold live in crystal-clear HD quality. Our platform offers seamless streaming on desktop and mobile devices without registration. Don't miss Mbappé, Vinícius Jr. taking on Lewandowski and Yamal in this epic encounter. **Watch El Clasico live now at DAMITV.pro** - completely free, no ads interruption!`;
    }

    // Manchester Derby
    if ((match.homeTeam.includes('Manchester United') && match.awayTeam.includes('Manchester City')) ||
        (match.homeTeam.includes('Manchester City') && match.awayTeam.includes('Manchester United'))) {
      return `The Manchester Derby is here! Watch as Manchester's two football giants clash in one of the Premier League's biggest fixtures. Experience world-class football as City and United battle for local bragging rights and crucial points. Stream every tackle, goal, and celebration live in stunning HD quality without any subscription requirements. **Watch the Manchester Derby live now at DAMITV.pro** - free streaming at its finest!`;
    }

    // North London Derby  
    if ((match.homeTeam === 'Arsenal' && match.awayTeam === 'Tottenham') ||
        (match.homeTeam === 'Tottenham' && match.awayTeam === 'Arsenal')) {
      return `The North London Derby brings together Arsenal and Tottenham in one of football's most passionate rivalries. Watch as these Premier League powerhouses battle for supremacy in this intense local clash. Experience every moment of drama and skill live in crystal-clear HD. **Watch Arsenal vs Tottenham live now at DAMITV.pro** - completely free Premier League streaming!`;
    }

    return null;
  }

  static generateImageAlts(match: MatchSEOData): string[] {
    return [
      `${match.homeTeam} vs ${match.awayTeam} ${match.league} live streaming free on DAMITV`,
      `${match.homeTeam} team logo ${match.league} live stream HD quality`,
      `${match.awayTeam} squad ${match.league} 2025 live streaming preview`,
      `${match.league} live streaming ${match.homeTeam} vs ${match.awayTeam} match preview`
    ];
  }

  static generateSocialContent(match: MatchSEOData): {
    facebook: string[];
    twitter: string[];
    telegram: string[];
  } {
    const isBigMatch = this.isBigMatch(match);
    const matchEmoji = isBigMatch ? '🔥' : '⚽';
    
    return {
      facebook: [
        `${matchEmoji} ${match.homeTeam} vs ${match.awayTeam} LIVE NOW!\nWatch ${match.league} action FREE on DAMITV.pro\nNo signup needed! 📱💻\n#${match.homeTeam.replace(/\s+/g, '')} #${match.awayTeam.replace(/\s+/g, '')} #LiveStreaming #DAMITV`,
        
        `🚨 MATCH DAY! ${match.homeTeam} 🆚 ${match.awayTeam}\n⏰ Kickoff: ${match.time}\n📺 Watch FREE: DAMITV.pro\n${match.league} at its best! 🏆\n#${match.league.replace(/\s+/g, '')} #FreeStreaming`,
        
        `⚽ ${match.league} LIVE!\n${match.homeTeam} vs ${match.awayTeam}\n🎯 HD Quality Stream\n📱 Mobile Friendly\n🔗 DAMITV.pro\nJoin thousands watching! 👥`
      ],
      
      twitter: [
        `🚨 LIVE: ${match.homeTeam} vs ${match.awayTeam}\n${matchEmoji} ${match.league} streaming FREE\n📱 Watch now: DAMITV.pro\n#${match.homeTeam.replace(/\s+/g, '')}vs${match.awayTeam.replace(/\s+/g, '')} #FreeStreaming`,
        
        `⚽ ${match.time} KICKOFF\n${match.homeTeam} 🆚 ${match.awayTeam}\n📺 Free HD Stream\n🔗 DAMITV.pro\n#${match.league.replace(/\s+/g, '')} #LiveFootball`,
        
        `🔥 ${match.homeTeam} vs ${match.awayTeam} LIVE\n📱 No registration required\n🎯 HD quality guaranteed\n🔗 DAMITV.pro\n#FreeStreaming #${match.league.replace(/\s+/g, '')}`
      ],
      
      telegram: [
        `${matchEmoji} ${match.homeTeam} vs ${match.awayTeam} LIVE NOW!\n⚽ ${match.league}\n🔥 FREE HD Streaming\n📲 DAMITV.pro - No ads, no signup!\nJoin 50K+ fans watching! 🏆`,
        
        `🚨 MATCH ALERT! 🚨\n${match.homeTeam} 🆚 ${match.awayTeam}\n⏰ ${match.time} | 📺 ${match.league}\n🎯 Watch FREE: DAMITV.pro\nBest quality streams! 📱💻`,
        
        `⚽ LIVE FOOTBALL!\n${match.homeTeam} vs ${match.awayTeam}\n📱 Mobile & Desktop Ready\n🔥 Zero Buffering\n🔗 DAMITV.pro\n${match.league} at its finest! 🏆`
      ]
    };
  }

  static isBigMatch(match: MatchSEOData): boolean {
    return Object.values(BIG_MATCHES).some(teams => 
      teams.includes(match.homeTeam) && teams.includes(match.awayTeam)
    );
  }

  static generateStructuredData(match: MatchSEOData) {
    return {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": `${match.homeTeam} vs ${match.awayTeam}`,
      "description": `Watch ${match.homeTeam} vs ${match.awayTeam} live streaming free on DAMITV.pro`,
      "startDate": `${match.date}T${match.time}:00`,
      "location": {
        "@type": "Place",
        "name": match.venue || "Stadium"
      },
      "competitor": [
        {
          "@type": "SportsTeam",
          "name": match.homeTeam
        },
        {
          "@type": "SportsTeam", 
          "name": match.awayTeam
        }
      ],
      "sport": "Football",
      "organizer": {
        "@type": "Organization",
        "name": match.league
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "description": "Free live streaming"
      }
    };
  }
}

// League-specific SEO generators
export class LeagueSEOGenerator {
  static generateTitle(league: string): string {
    const config = LEAGUE_CONFIG[league];
    if (!config) return `${league} Live Streaming Free | DAMITV`;
    
    return generateCompetitorTitle(`${config.displayName} Live Streaming Free - All Matches`, 'live');
  }

  static generateMetaDescription(league: string): string {
    const config = LEAGUE_CONFIG[league];
    if (!config) return `Watch ${league} live streaming free on DAMITV.pro`;
    
    return generateCompetitorDescription('', 'live');
  }

  static generateKeywords(league: string): string {
    const config = LEAGUE_CONFIG[league];
    if (!config) return `${league} live streaming free`;
    
    const baseKeywords = [
      `${config.displayName.toLowerCase()} live streaming free`,
      `watch ${config.displayName.toLowerCase()} online free`,
      `${config.displayName.toLowerCase()} matches live stream`,
      ...config.keywords.map(k => `${k} live streaming free`),
      ...config.keywords.map(k => `watch ${k} online free`),
      `${config.displayName.toLowerCase()} streaming free online`,
      `free ${config.displayName.toLowerCase()} live stream`,
      `${config.displayName.toLowerCase()} online free streaming`
    ];
    
    return generateCompetitorKeywords(baseKeywords.join(', '));
  }

  static generateContent(league: string): string {
    const config = LEAGUE_CONFIG[league];
    if (!config) return `Watch ${league} live streaming free on DAMITV.pro`;
    
    return `Experience the best of ${config.displayName} with free live streaming on DAMITV.pro. Watch all matches from Europe's premier football league in crystal-clear HD quality without subscription fees. Our platform delivers seamless streaming across all devices - desktop, mobile, and tablet. Never miss your favorite teams and players in action with our reliable, buffer-free streams. From matchday drama to championship celebrations, catch every moment of ${config.displayName} excitement. **Watch ${config.displayName} live now at DAMITV.pro** - your ultimate destination for free football streaming!`;
  }
}

export const matchSEO = MatchSEOGenerator;
export const leagueSEO = LeagueSEOGenerator;