// Utility function to identify popular leagues and tournaments
export const isPopularLeague = (title: string): boolean => {
  const result = isTrendingMatch(title);
  return result.isTrending;
};

// Enhanced function to calculate trending score and identify trending matches
export const isTrendingMatch = (title: string): { isTrending: boolean; score: number; reason: string } => {
  // First-division leagues
  const topLeagues = [
    // Top European leagues with high Google trends
    { name: 'premier league', weight: 10 }, 
    { name: 'epl', weight: 9 },
    { name: 'la liga', weight: 9 },
    { name: 'serie a', weight: 8 },
    { name: 'bundesliga', weight: 8 },
    { name: 'ligue 1', weight: 7 },
    
    // UEFA Competitions (high search volume)
    { name: 'champions league', weight: 10 },
    { name: 'ucl', weight: 9 },
    { name: 'europa league', weight: 8 },
    { name: 'conference league', weight: 6 },
    { name: 'uefa', weight: 7 },
    { name: 'euro', weight: 10 }, 
    { name: 'world cup', weight: 10 },
    
    // Other major competitions with high global interest
    { name: 'copa libertadores', weight: 8 },
    { name: 'copa america', weight: 9 },
    { name: 'fa cup', weight: 7 },
    { name: 'super copa', weight: 7 },
    { name: 'fifa world cup', weight: 10 },
    { name: 'club world cup', weight: 8 },
    { name: 'supercup', weight: 7 },
    { name: 'super cup', weight: 7 },
    { name: 'nations league', weight: 7 },
    { name: 'copa del rey', weight: 6 },
    { name: 'dfb pokal', weight: 6 },
    { name: 'coppa italia', weight: 6 },
    { name: 'carabao cup', weight: 6 },
    { name: 'community shield', weight: 7 },
    { name: 'clasico', weight: 10 }, // El Clasico gets massive search volume
    { name: 'derby', weight: 8 }, // Derby matches trend highly
  ];
  
  // Top clubs that typically trend on Google searches
  const topClubs = [
    // Premier League
    { name: 'manchester united', weight: 10 },
    { name: 'liverpool', weight: 10 },
    { name: 'manchester city', weight: 9 },
    { name: 'chelsea', weight: 9 },
    { name: 'arsenal', weight: 9 },
    { name: 'tottenham', weight: 8 },
    { name: 'newcastle', weight: 7 },
    
    // La Liga
    { name: 'barcelona', weight: 10 },
    { name: 'real madrid', weight: 10 },
    { name: 'atletico madrid', weight: 8 },
    
    // Serie A
    { name: 'juventus', weight: 8 },
    { name: 'ac milan', weight: 8 },
    { name: 'inter milan', weight: 8 },
    { name: 'napoli', weight: 7 },
    { name: 'roma', weight: 7 },
    
    // Bundesliga
    { name: 'bayern munich', weight: 9 },
    { name: 'dortmund', weight: 8 },
    { name: 'rb leipzig', weight: 6 },
    
    // Ligue 1
    { name: 'psg', weight: 9 },
    { name: 'paris saint-germain', weight: 9 },
    { name: 'marseille', weight: 6 },
    { name: 'lyon', weight: 6 },
    
    // Additional popular teams
    { name: 'real betis', weight: 5 },
    { name: 'sevilla', weight: 6 },
    { name: 'aston villa', weight: 6 },
    { name: 'west ham', weight: 6 },
    { name: 'everton', weight: 6 },
    { name: 'leeds', weight: 6 }
  ];
  
  // Popular players that drive match trends
  const topPlayers = [
    { name: 'messi', weight: 10 },
    { name: 'ronaldo', weight: 10 },
    { name: 'cristiano', weight: 10 },
    { name: 'mbappe', weight: 9 },
    { name: 'haaland', weight: 9 },
    { name: 'salah', weight: 8 },
    { name: 'neymar', weight: 8 },
    { name: 'kane', weight: 7 },
    { name: 'modric', weight: 7 },
    { name: 'de bruyne', weight: 7 },
    { name: 'lewandowski', weight: 7 },
    { name: 'benzema', weight: 7 }
  ];
  
  const lowerTitle = title.toLowerCase();
  let trendingScore = 0;
  let trendingReason = '';
  
  // Check if any top league keyword is in the title
  for (const league of topLeagues) {
    if (lowerTitle.includes(league.name)) {
      trendingScore += league.weight;
      trendingReason = trendingReason || `Contains popular league: ${league.name}`;
    }
  }
  
  // Check if any top club is in the title
  for (const club of topClubs) {
    if (lowerTitle.includes(club.name)) {
      trendingScore += club.weight;
      trendingReason = trendingReason || `Features popular team: ${club.name}`;
    }
  }
  
  // Check for popular players
  for (const player of topPlayers) {
    if (lowerTitle.includes(player.name)) {
      trendingScore += player.weight;
      trendingReason = trendingReason || `Features star player: ${player.name}`;
    }
  }
  
  // Check for special patterns like derbies or rivalries
  if (lowerTitle.includes(' vs ') || lowerTitle.includes(' v ')) {
    trendingScore += 3; // VS matches tend to get more attention
    
    // Common derby names
    const derbies = ['north london', 'manchester', 'merseyside', 'madrid', 'milan', 'london', 'el clasico'];
    for (const derby of derbies) {
      if (lowerTitle.includes(derby)) {
        trendingScore += 5;
        trendingReason = `Features ${derby} derby`;
        break;
      }
    }
  }
  
  // Add bonus for finals, semifinals, etc.
  if (lowerTitle.includes('final')) trendingScore += 6;
  if (lowerTitle.includes('semi')) trendingScore += 4;
  if (lowerTitle.includes('quarter')) trendingScore += 3;
  
  return { 
    isTrending: trendingScore >= 5, // Consider trending if score is 5 or higher
    score: trendingScore,
    reason: trendingReason || 'Not trending'
  };
};
