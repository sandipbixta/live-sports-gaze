
// Utility function to identify popular leagues and tournaments
export const isPopularLeague = (title: string): boolean => {
  const popularKeywords = [
    'champions league',
    'ucl',
    'premier league', 
    'epl',
    'la liga',
    'laliga',
    'serie a',
    'bundesliga',
    'euro', 
    'europa league',
    'world cup',
    'uefa',
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
  ];
  
  const lowerTitle = title.toLowerCase();
  return popularKeywords.some(keyword => lowerTitle.includes(keyword));
};
