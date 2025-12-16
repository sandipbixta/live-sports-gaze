import { indiaChannels, HLSChannel } from './indianChannels';

export interface Channel {
  id: string;
  title: string;
  country: string;
  countryCode: string;
  embedUrl: string;
  category: 'sports' | 'news' | 'entertainment';
  logo?: string;
  viewers?: number;
  hlsUrl?: string;
  headers?: {
    userAgent?: string;
    referer?: string;
  };
}

const API_BASE = 'https://api.cdn-live.tv/api/v1/vip/damitv';

// Country code to name mapping
const countryCodeMap: Record<string, string> = {
  'us': 'United States',
  'gb': 'United Kingdom',
  'ca': 'Canada',
  'au': 'Australia',
  'de': 'Germany',
  'fr': 'France',
  'es': 'Spain',
  'it': 'Italy',
  'pt': 'Portugal',
  'nl': 'Netherlands',
  'be': 'Belgium',
  'at': 'Austria',
  'ch': 'Switzerland',
  'br': 'Brazil',
  'mx': 'Mexico',
  'ar': 'Argentina',
  'in': 'India',
  'pk': 'Pakistan',
  'ae': 'UAE',
  'qa': 'Qatar',
  'sa': 'Saudi Arabia',
  'tr': 'Turkey',
  'pl': 'Poland',
  'ro': 'Romania',
  'gr': 'Greece',
  'se': 'Sweden',
  'no': 'Norway',
  'dk': 'Denmark',
  'fi': 'Finland',
  'ie': 'Ireland',
  'za': 'South Africa',
  'nz': 'New Zealand',
  'jp': 'Japan',
  'kr': 'South Korea',
  'cn': 'China',
  'ru': 'Russia',
  'ua': 'Ukraine',
};

// Cache for channels
let channelsCache: Channel[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Transform API channel to our Channel format
const transformChannel = (apiChannel: any): Channel => {
  const countryCode = apiChannel.code || 'us';
  const countryName = countryCodeMap[countryCode] || countryCode.toUpperCase();
  
  // Ensure embed URL uses HTTPS and decode HTML entities
  let embedUrl = apiChannel.url || apiChannel.embedUrl || '';
  if (embedUrl) {
    // Fix protocol to HTTPS
    embedUrl = embedUrl.replace(/^http:\/\//i, 'https://');
    // Decode HTML entities (API returns &amp; instead of &)
    embedUrl = embedUrl.replace(/&amp;/g, '&');
  }
  
  return {
    id: apiChannel.name?.toLowerCase().replace(/\s+/g, '-') || String(apiChannel.id || ''),
    title: apiChannel.name || apiChannel.title || '',
    country: countryName,
    countryCode: countryCode,
    embedUrl: embedUrl,
    category: 'sports' as const,
    logo: apiChannel.image || apiChannel.logo || undefined,
    viewers: apiChannel.viewers || 0
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

    // Handle different response formats - API returns { total_channels, channels: [] }
    let channels: any[] = [];
    if (data.channels && Array.isArray(data.channels)) {
      channels = data.channels;
    } else if (Array.isArray(data)) {
      channels = data;
    } else if (data.data && Array.isArray(data.data)) {
      channels = data.data;
    }

    const transformedChannels = channels
      .filter((ch: any) => ch && (ch.name || ch.title))
      .map(transformChannel);

    // Add Indian channels from FanCode
    const allChannels = [...transformedChannels, ...indiaChannels];

    // Update cache
    channelsCache = allChannels;
    cacheTimestamp = Date.now();

    console.log(`✅ Fetched ${transformedChannels.length} channels from cdn-live.tv API + ${indiaChannels.length} Indian channels`);
    return allChannels;
  } catch (error) {
    console.error('❌ Error fetching channels:', error);
    // Return cached data if available, otherwise just Indian channels
    return channelsCache || indiaChannels;
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
