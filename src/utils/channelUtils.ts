
// Utility functions for channel management and enhancement

export const generateViewerCount = (title: string): number => {
  // Generate realistic viewer counts based on channel popularity
  const hash = title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const baseCount = Math.abs(hash) % 5000 + 100;
  const timeVariation = Math.sin(Date.now() / 60000) * 500; // Varies by minute
  
  return Math.floor(baseCount + timeVariation);
};

export const getChannelCategory = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  
  // Sports keywords
  if (lowerTitle.includes('sport') || lowerTitle.includes('espn') || 
      lowerTitle.includes('fox sports') || lowerTitle.includes('sky sports') ||
      lowerTitle.includes('eurosport') || lowerTitle.includes('beIN')) {
    return 'sports';
  }
  
  // News keywords
  if (lowerTitle.includes('news') || lowerTitle.includes('cnn') || 
      lowerTitle.includes('bbc') || lowerTitle.includes('fox news') ||
      lowerTitle.includes('reuters') || lowerTitle.includes('france 24')) {
    return 'news';
  }
  
  // Music keywords
  if (lowerTitle.includes('music') || lowerTitle.includes('mtv') || 
      lowerTitle.includes('vh1') || lowerTitle.includes('radio')) {
    return 'music';
  }
  
  // Entertainment (default for non-specific channels)
  return 'entertainment';
};

export const getChannelQuality = (title: string): 'HD' | '4K' | 'SD' => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('4k') || lowerTitle.includes('uhd')) {
    return '4K';
  }
  
  if (lowerTitle.includes('hd') || lowerTitle.includes('premium')) {
    return 'HD';
  }
  
  return 'HD'; // Default to HD for better perception
};

export const isChannelLive = (title: string): boolean => {
  // Simulate some channels being offline occasionally
  const hash = title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // 90% of channels are live
  return Math.abs(hash) % 10 < 9;
};

export const getRecommendedChannels = (currentChannel: string, allChannels: any[]): any[] => {
  // Get channels from same category as current channel
  const currentCategory = getChannelCategory(currentChannel);
  
  return allChannels
    .filter(channel => 
      getChannelCategory(channel.title) === currentCategory && 
      channel.title !== currentChannel
    )
    .slice(0, 3);
};

export const filterChannelsBySearch = (channels: any[], searchQuery: string): any[] => {
  if (!searchQuery.trim()) return channels;
  
  const query = searchQuery.toLowerCase();
  return channels.filter(channel => 
    channel.title.toLowerCase().includes(query)
  );
};

export const filterChannelsByCategory = (channels: any[], category: string): any[] => {
  if (category === 'all') return channels;
  
  return channels.filter(channel => 
    getChannelCategory(channel.title) === category
  );
};

export const getCategoryCounts = (channels: any[]): Record<string, number> => {
  const counts = {
    all: channels.length,
    sports: 0,
    news: 0,
    entertainment: 0,
    music: 0
  };
  
  channels.forEach(channel => {
    const category = getChannelCategory(channel.title);
    counts[category]++;
  });
  
  return counts;
};
