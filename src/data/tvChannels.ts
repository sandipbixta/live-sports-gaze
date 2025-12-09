export interface Channel {
  id: string;
  title: string;
  country: string;
  embedUrl: string;
  category: 'sports' | 'news' | 'entertainment';
  logo?: string;
}

const API_BASE = 'https://api.cdn-live.tv/api/v1/vip/damitv';

// Cache for channels
let channelsCache: Channel[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Transform API channel to our Channel format
const transformChannel = (apiChannel: any): Channel => {
  return {
    id: String(apiChannel.id || apiChannel._id || ''),
    title: apiChannel.title || apiChannel.name || '',
    country: apiChannel.country || apiChannel.region || 'International',
    embedUrl: apiChannel.embedUrl || apiChannel.url || apiChannel.stream_url || '',
    category: (apiChannel.category || 'sports') as 'sports' | 'news' | 'entertainment',
    logo: apiChannel.logo || apiChannel.image || apiChannel.thumbnail || undefined
  };
};

// Fetch channels from API
export const fetchChannelsFromAPI = async (): Promise<Channel[]> => {
  // Check cache
  if (channelsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return channelsCache;
  }

  try {
    const response = await fetch(`${API_BASE}/channels/`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle different response formats
    let channels: any[] = [];
    if (Array.isArray(data)) {
      channels = data;
    } else if (data.channels && Array.isArray(data.channels)) {
      channels = data.channels;
    } else if (data.data && Array.isArray(data.data)) {
      channels = data.data;
    }

    const transformedChannels = channels
      .filter((ch: any) => ch && (ch.id || ch._id) && (ch.title || ch.name))
      .map(transformChannel);

    // Update cache
    channelsCache = transformedChannels;
    cacheTimestamp = Date.now();

    console.log(`✅ Fetched ${transformedChannels.length} channels from cdn-live.tv API`);
    return transformedChannels;
  } catch (error) {
    console.error('❌ Error fetching channels:', error);
    // Return cached data if available, otherwise empty array
    return channelsCache || [];
  }
};

// Synchronous getter for channels (returns cached data or empty array)
export const tvChannels: Channel[] = [];

// Initialize channels on module load
fetchChannelsFromAPI().then(channels => {
  tvChannels.length = 0;
  tvChannels.push(...channels);
});

// Group channels by country
export const getChannelsByCountry = (): Record<string, Channel[]> => {
  return tvChannels.reduce((acc, channel) => {
    if (!acc[channel.country]) {
      acc[channel.country] = [];
    }
    acc[channel.country].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);
};

// Get channels by country - async version
export const getChannelsByCountryAsync = async (): Promise<Record<string, Channel[]>> => {
  const channels = await fetchChannelsFromAPI();
  return channels.reduce((acc, channel) => {
    if (!acc[channel.country]) {
      acc[channel.country] = [];
    }
    acc[channel.country].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);
};

// Get list of countries
export const getCountries = (): string[] => {
  const countries = [...new Set(tvChannels.map(channel => channel.country))];
  return countries.sort();
};

// Get countries - async version
export const getCountriesAsync = async (): Promise<string[]> => {
  const channels = await fetchChannelsFromAPI();
  const countries = [...new Set(channels.map(channel => channel.country))];
  return countries.sort();
};

// Get a specific channel by ID
export const getChannelById = (id: string): Channel | undefined => {
  return tvChannels.find(channel => channel.id === id);
};

// Get channel by ID - async version
export const getChannelByIdAsync = async (id: string): Promise<Channel | undefined> => {
  const channels = await fetchChannelsFromAPI();
  return channels.find(channel => channel.id === id);
};
