
// Utility function to identify popular leagues and tournaments
export const isPopularLeague = (title: string): boolean => {
  const popularKeywords = [
    // Top 5 leagues
    'premier league', 
    'epl',
    'la liga',
    'laliga',
    'serie a',
    'bundesliga',
    'ligue 1',
    
    // Additional major competitions
    'champions league',
    'ucl',
    'europa league',
    'euro', 
    'world cup',
    'uefa',
    
    // Top clubs often featured in major leagues
    'manchester united',
    'manchester city',
    'chelsea',
    'arsenal',
    'liverpool',
    'barcelona',
    'real madrid',
    'juventus',
    'bayern munich',
    'psg',
    'paris saint-germain',
    'ac milan',
    'inter milan',
    'atletico madrid',
    'dortmund',
    'napoli',
  ];
  
  const lowerTitle = title.toLowerCase();
  return popularKeywords.some(keyword => lowerTitle.includes(keyword));
};
