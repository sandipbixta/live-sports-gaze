// Utility function to identify popular leagues and tournaments
export const isPopularLeague = (title: string): boolean => {
  const result = isTrendingMatch(title);
  return result.isTrending;
};

// Enhanced function to calculate trending score and identify trending matches
export const isTrendingMatch = (title: string): { isTrending: boolean; score: number; reason: string; seoTerms?: string[] } => {
  // First-division leagues
  const topLeagues = [
    // Top European leagues with high Google trends
    { name: 'premier league', weight: 10, seoTerms: ['epl', 'english premier league', 'premier league stream'] }, 
    { name: 'epl', weight: 9, seoTerms: ['premier league', 'english premier league', 'epl stream'] },
    { name: 'la liga', weight: 9, seoTerms: ['spanish league', 'la liga stream', 'spanish football'] },
    { name: 'serie a', weight: 8, seoTerms: ['italian league', 'serie a stream', 'calcio stream'] },
    { name: 'bundesliga', weight: 8, seoTerms: ['german league', 'bundesliga stream', 'german football'] },
    { name: 'ligue 1', weight: 7, seoTerms: ['french league', 'ligue 1 stream', 'french football'] },
    
    // UEFA Competitions (high search volume)
    { name: 'champions league', weight: 10, seoTerms: ['ucl', 'champions league stream', 'ucl live'] },
    { name: 'ucl', weight: 9, seoTerms: ['champions league', 'uefa champions league', 'ucl stream'] },
    { name: 'europa league', weight: 8, seoTerms: ['uel', 'europa league stream', 'uefa europa'] },
    { name: 'conference league', weight: 6, seoTerms: ['uecl', 'conference league stream', 'uefa conference'] },
    { name: 'uefa', weight: 7, seoTerms: ['uefa stream', 'european football', 'uefa matches'] },
    { name: 'euro', weight: 10, seoTerms: ['euro championship', 'european championship', 'euro qualifiers'] }, 
    { name: 'world cup', weight: 10, seoTerms: ['fifa world cup', 'world cup stream', 'wc qualifiers'] },
    
    // Other major competitions with high global interest
    { name: 'copa libertadores', weight: 8, seoTerms: ['libertadores stream', 'south american football'] },
    { name: 'copa america', weight: 9, seoTerms: ['copa america stream', 'conmebol', 'south american championship'] },
    { name: 'fa cup', weight: 7, seoTerms: ['fa cup stream', 'english cup', 'football association cup'] },
    { name: 'super copa', weight: 7, seoTerms: ['super cup stream', 'supercopa'] },
    { name: 'fifa world cup', weight: 10, seoTerms: ['world cup stream', 'fifa wc', 'world cup qualifiers'] },
    { name: 'club world cup', weight: 8, seoTerms: ['fifa cwc', 'club world cup stream'] },
    { name: 'supercup', weight: 7, seoTerms: ['super cup', 'uefa supercup', 'supercup stream'] },
    { name: 'super cup', weight: 7, seoTerms: ['supercup', 'uefa super cup', 'super cup stream'] },
    { name: 'nations league', weight: 7, seoTerms: ['uefa nations league', 'nations league stream'] },
    { name: 'copa del rey', weight: 6, seoTerms: ['spanish cup', 'copa del rey stream'] },
    { name: 'dfb pokal', weight: 6, seoTerms: ['german cup', 'dfb pokal stream'] },
    { name: 'coppa italia', weight: 6, seoTerms: ['italian cup', 'coppa italia stream'] },
    { name: 'carabao cup', weight: 6, seoTerms: ['league cup', 'efl cup', 'carabao cup stream'] },
    { name: 'community shield', weight: 7, seoTerms: ['fa community shield', 'charity shield', 'english super cup'] },
    { name: 'clasico', weight: 10, seoTerms: ['el clasico stream', 'barcelona vs real madrid', 'madrid barcelona'] }, // El Clasico gets massive search volume
    { name: 'derby', weight: 8, seoTerms: ['football derby', 'derby stream', 'rivalry match'] }, // Derby matches trend highly
  ];
  
  // Top clubs that typically trend on Google searches
  const topClubs = [
    // Premier League
    { name: 'manchester united', weight: 10, seoTerms: ['man utd', 'man united', 'manchester united stream'] },
    { name: 'liverpool', weight: 10, seoTerms: ['lfc', 'liverpool fc', 'liverpool stream'] },
    { name: 'manchester city', weight: 9, seoTerms: ['man city', 'mcfc', 'manchester city stream'] },
    { name: 'chelsea', weight: 9, seoTerms: ['cfc', 'chelsea fc', 'chelsea stream'] },
    { name: 'arsenal', weight: 9, seoTerms: ['afc', 'arsenal fc', 'arsenal stream', 'gunners'] },
    { name: 'tottenham', weight: 8, seoTerms: ['thfc', 'spurs', 'tottenham stream'] },
    { name: 'newcastle', weight: 7, seoTerms: ['nufc', 'newcastle united', 'newcastle stream'] },
    
    // La Liga
    { name: 'barcelona', weight: 10, seoTerms: ['barca', 'fcb', 'barcelona stream', 'fc barcelona'] },
    { name: 'real madrid', weight: 10, seoTerms: ['madrid', 'rm', 'real madrid stream', 'los blancos'] },
    { name: 'atletico madrid', weight: 8, seoTerms: ['atleti', 'atletico', 'atletico madrid stream'] },
    
    // Serie A
    { name: 'juventus', weight: 8, seoTerms: ['juve', 'old lady', 'juventus stream'] },
    { name: 'ac milan', weight: 8, seoTerms: ['milan', 'acm', 'ac milan stream', 'rossoneri'] },
    { name: 'inter milan', weight: 8, seoTerms: ['inter', 'inter stream', 'nerazzurri'] },
    { name: 'napoli', weight: 7, seoTerms: ['ssc napoli', 'napoli stream', 'partenopei'] },
    { name: 'roma', weight: 7, seoTerms: ['as roma', 'roma stream', 'giallorossi'] },
    
    // Bundesliga
    { name: 'bayern munich', weight: 9, seoTerms: ['bayern', 'fcb', 'bayern stream', 'fc bayern'] },
    { name: 'dortmund', weight: 8, seoTerms: ['bvb', 'borussia dortmund', 'dortmund stream'] },
    { name: 'rb leipzig', weight: 6, seoTerms: ['leipzig', 'rbl', 'leipzig stream'] },
    
    // Ligue 1
    { name: 'psg', weight: 9, seoTerms: ['paris saint-germain', 'paris', 'psg stream'] },
    { name: 'paris saint-germain', weight: 9, seoTerms: ['psg', 'paris', 'psg stream'] },
    { name: 'marseille', weight: 6, seoTerms: ['om', 'olympique marseille', 'marseille stream'] },
    { name: 'lyon', weight: 6, seoTerms: ['ol', 'olympique lyonnais', 'lyon stream'] },
    
    // Additional popular teams
    { name: 'real betis', weight: 5, seoTerms: ['betis', 'real betis stream'] },
    { name: 'sevilla', weight: 6, seoTerms: ['sevilla fc', 'sevilla stream'] },
    { name: 'aston villa', weight: 6, seoTerms: ['avfc', 'villa', 'aston villa stream'] },
    { name: 'west ham', weight: 6, seoTerms: ['whufc', 'hammers', 'west ham stream'] },
    { name: 'everton', weight: 6, seoTerms: ['efc', 'toffees', 'everton stream'] },
    { name: 'leeds', weight: 6, seoTerms: ['lufc', 'leeds united', 'leeds stream'] }
  ];
  
  // Popular players that drive match trends
  const topPlayers = [
    { name: 'messi', weight: 10, seoTerms: ['leo messi', 'lionel messi', 'messi game'] },
    { name: 'ronaldo', weight: 10, seoTerms: ['cr7', 'cristiano', 'ronaldo game'] },
    { name: 'cristiano', weight: 10, seoTerms: ['cr7', 'ronaldo', 'cristiano game'] },
    { name: 'mbappe', weight: 9, seoTerms: ['kylian mbappe', 'mbappe game', 'kylian'] },
    { name: 'haaland', weight: 9, seoTerms: ['erling haaland', 'haaland game', 'erling'] },
    { name: 'salah', weight: 8, seoTerms: ['mo salah', 'mohamed salah', 'salah game'] },
    { name: 'neymar', weight: 8, seoTerms: ['neymar jr', 'neymar game', 'njr'] },
    { name: 'kane', weight: 7, seoTerms: ['harry kane', 'kane game', 'harry'] },
    { name: 'modric', weight: 7, seoTerms: ['luka modric', 'modric game', 'luka'] },
    { name: 'de bruyne', weight: 7, seoTerms: ['kevin de bruyne', 'kdb', 'de bruyne game'] },
    { name: 'lewandowski', weight: 7, seoTerms: ['robert lewandowski', 'lewy', 'lewandowski game'] },
    { name: 'benzema', weight: 7, seoTerms: ['karim benzema', 'benz', 'benzema game'] }
  ];
  
  const lowerTitle = title.toLowerCase();
  let trendingScore = 0;
  let trendingReason = '';
  let allSeoTerms: string[] = [];
  
  // Check if any top league keyword is in the title
  for (const league of topLeagues) {
    if (lowerTitle.includes(league.name)) {
      trendingScore += league.weight;
      trendingReason = trendingReason || `Contains popular league: ${league.name}`;
      if (league.seoTerms) allSeoTerms = [...allSeoTerms, ...league.seoTerms];
    }
  }
  
  // Check if any top club is in the title
  for (const club of topClubs) {
    if (lowerTitle.includes(club.name)) {
      trendingScore += club.weight;
      trendingReason = trendingReason || `Features popular team: ${club.name}`;
      if (club.seoTerms) allSeoTerms = [...allSeoTerms, ...club.seoTerms];
    }
  }
  
  // Check for popular players
  for (const player of topPlayers) {
    if (lowerTitle.includes(player.name)) {
      trendingScore += player.weight;
      trendingReason = trendingReason || `Features star player: ${player.name}`;
      if (player.seoTerms) allSeoTerms = [...allSeoTerms, ...player.seoTerms];
    }
  }
  
  // Check for special patterns like derbies or rivalries
  if (lowerTitle.includes(' vs ') || lowerTitle.includes(' v ')) {
    trendingScore += 3; // VS matches tend to get more attention
    allSeoTerms.push('live match', 'watch online', 'stream free');
    
    // Common derby names
    const derbies = ['north london', 'manchester', 'merseyside', 'madrid', 'milan', 'london', 'el clasico'];
    for (const derby of derbies) {
      if (lowerTitle.includes(derby)) {
        trendingScore += 5;
        trendingReason = `Features ${derby} derby`;
        allSeoTerms.push(`${derby} derby stream`, `${derby} derby live`, `watch ${derby} derby`);
        break;
      }
    }
  }
  
  // Add bonus for finals, semifinals, etc.
  if (lowerTitle.includes('final')) {
    trendingScore += 6;
    allSeoTerms.push('final stream', 'final live', 'watch final online');
  }
  if (lowerTitle.includes('semi')) {
    trendingScore += 4;
    allSeoTerms.push('semifinal stream', 'semi final live', 'watch semifinal');
  }
  if (lowerTitle.includes('quarter')) {
    trendingScore += 3;
    allSeoTerms.push('quarterfinal stream', 'quarter final live');
  }
  
  // Add search intent keywords
  allSeoTerms.push(
    'watch online free',
    'live stream',
    'free streaming',
    'today match',
    'hd stream',
    'mobile streaming'
  );
  
  // Format title for SEO
  const seoFormattedTitle = lowerTitle
    .replace(' vs ', ' vs ')
    .replace(' - ', ' ')
    .trim();
  
  allSeoTerms.push(
    `${seoFormattedTitle} stream`,
    `${seoFormattedTitle} live`,
    `watch ${seoFormattedTitle}`
  );
  
  // Generate unique SEO terms
  const uniqueSeoTerms = Array.from(new Set(allSeoTerms));
  
  return { 
    isTrending: trendingScore >= 5, // Consider trending if score is 5 or higher
    score: trendingScore,
    reason: trendingReason || 'Not trending',
    seoTerms: uniqueSeoTerms.slice(0, 20) // Limit to 20 most relevant terms
  };
};
