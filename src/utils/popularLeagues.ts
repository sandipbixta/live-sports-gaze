
// Utility function to identify popular leagues and tournaments
export const isPopularLeague = (title: string): boolean => {
  // First-division leagues
  const topLeagues = [
    // Top European leagues
    'premier league', 
    'epl',
    'la liga',
    'serie a',
    'bundesliga',
    'ligue 1',
    
    // UEFA Competitions
    'champions league',
    'ucl',
    'europa league',
    'conference league',
    'uefa',
    'euro', 
    'world cup',
    
    // Other major competitions
    'copa libertadores',
    'copa america',
    'fa cup',
    'super copa',
    'fifa world cup',
    'club world cup',
    'supercup',
    'super cup',
    'nations league',
    'copa del rey',
    'dfb pokal',
    'coppa italia',
    'carabao cup',
    'community shield',
  ];
  
  // Top clubs that typically play in first-division leagues
  const topClubs = [
    // Premier League
    'manchester united',
    'manchester city',
    'chelsea',
    'arsenal',
    'liverpool',
    'tottenham',
    
    // La Liga
    'barcelona',
    'real madrid',
    'atletico madrid',
    
    // Serie A
    'juventus',
    'ac milan',
    'inter milan',
    'napoli',
    'roma',
    
    // Bundesliga
    'bayern munich',
    'dortmund',
    'rb leipzig',
    
    // Ligue 1
    'psg',
    'paris saint-germain',
    'marseille',
    'lyon',
  ];
  
  const lowerTitle = title.toLowerCase();
  
  // Check if any top league keyword is in the title
  const isTopLeague = topLeagues.some(keyword => lowerTitle.includes(keyword));
  
  // Check if any top club is in the title
  const hasTopClub = topClubs.some(club => lowerTitle.includes(club));
  
  return isTopLeague || hasTopClub;
};
