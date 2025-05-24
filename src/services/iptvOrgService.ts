
interface IPTVChannel {
  id: string;
  name: string;
  alt_names: string[];
  network: string | null;
  owners: string[];
  country: string;
  subdivision: string | null;
  city: string | null;
  categories: string[];
  is_nsfw: boolean;
  launched: string | null;
  closed: string | null;
  replaced_by: string | null;
  website: string | null;
  logo: string;
}

interface IPTVCountry {
  name: string;
  code: string;
  languages: string[];
  flag: string;
}

interface IPTVStream {
  channel: string;
  feed: string | null;
  url: string;
  referrer: string | null;
  user_agent: string | null;
  quality: string | null;
}

// Map our country names to IPTV-ORG country codes
const COUNTRY_CODE_MAP: Record<string, string> = {
  'UK': 'GB',
  'Argentina': 'AR',
  'Australia': 'AU',
  'France': 'FR',
  'Germany': 'DE',
  'India': 'IN',
  'Italy': 'IT',
  'Mexico': 'MX',
  'Netherlands': 'NL',
  'New Zealand': 'NZ',
  'USA': 'US'
};

class IPTVOrgService {
  private baseUrl = 'https://iptv-org.github.io/api';
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  async getChannels(): Promise<IPTVChannel[]> {
    return this.fetchWithCache<IPTVChannel[]>('channels.json');
  }

  async getCountries(): Promise<IPTVCountry[]> {
    return this.fetchWithCache<IPTVCountry[]>('countries.json');
  }

  async getStreams(): Promise<IPTVStream[]> {
    return this.fetchWithCache<IPTVStream[]>('streams.json');
  }

  async getChannelsForOurCountries(): Promise<Record<string, IPTVChannel[]>> {
    try {
      const [channels, countries] = await Promise.all([
        this.getChannels(),
        this.getCountries()
      ]);

      const relevantCountryCodes = Object.values(COUNTRY_CODE_MAP);
      const countryNameMap = countries.reduce((map, country) => {
        map[country.code] = country.name;
        return map;
      }, {} as Record<string, string>);

      // Filter channels for our countries and group them
      const channelsByCountry: Record<string, IPTVChannel[]> = {};

      // Initialize with our country names
      Object.keys(COUNTRY_CODE_MAP).forEach(countryName => {
        channelsByCountry[countryName] = [];
      });

      channels
        .filter(channel => 
          relevantCountryCodes.includes(channel.country) && 
          !channel.is_nsfw && 
          !channel.closed &&
          channel.categories.some(cat => 
            ['sports', 'general', 'news'].includes(cat.toLowerCase())
          )
        )
        .forEach(channel => {
          // Find our country name from the country code
          const ourCountryName = Object.keys(COUNTRY_CODE_MAP).find(
            name => COUNTRY_CODE_MAP[name] === channel.country
          );
          
          if (ourCountryName) {
            channelsByCountry[ourCountryName].push(channel);
          }
        });

      return channelsByCountry;
    } catch (error) {
      console.error('Error fetching IPTV-ORG channels:', error);
      return {};
    }
  }

  async getSportsChannelsForCountry(countryName: string): Promise<IPTVChannel[]> {
    const countryCode = COUNTRY_CODE_MAP[countryName];
    if (!countryCode) return [];

    try {
      const channels = await this.getChannels();
      return channels.filter(channel => 
        channel.country === countryCode &&
        !channel.is_nsfw &&
        !channel.closed &&
        channel.categories.some(cat => 
          cat.toLowerCase().includes('sport') || 
          cat.toLowerCase().includes('general')
        )
      );
    } catch (error) {
      console.error(`Error fetching sports channels for ${countryName}:`, error);
      return [];
    }
  }

  // Convert IPTV-ORG channel to our channel format
  convertToOurFormat(iptvChannel: IPTVChannel, countryName: string): any {
    return {
      id: iptvChannel.id.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: iptvChannel.name,
      country: countryName,
      embedUrl: `https://topembed.pw/channel/${encodeURIComponent(iptvChannel.name)}`, // Fallback URL
      category: 'sports' as const,
      logo: iptvChannel.logo,
      website: iptvChannel.website,
      network: iptvChannel.network,
      categories: iptvChannel.categories
    };
  }
}

export const iptvOrgService = new IPTVOrgService();
export type { IPTVChannel, IPTVCountry, IPTVStream };
