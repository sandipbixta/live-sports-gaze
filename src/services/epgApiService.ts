
interface EPGProgram {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  category?: string;
}

interface EPGChannel {
  channelId: string;
  channelName: string;
  programs: EPGProgram[];
}

interface EPGApiProgram {
  id: number;
  start: string;
  stop: string;
  title: string;
  desc?: string;
  category?: string;
}

interface EPGApiResponse {
  channel: {
    id: string;
    name: string;
  };
  programmes: EPGApiProgram[];
}

class EPGApiService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 60 * 60 * 1000; // 1 hour
  private baseUrl = 'https://epg.pw/api';

  private async fetchWithCache<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const data = await fetchFn();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  private getChannelIdMapping(): Record<string, string> {
    // Map our channel names to EPG channel IDs
    return {
      'TSN 1': '404784',
      'TSN 2': '404785',
      'TSN 3': '404786',
      'TSN 4': '404787',
      'TSN 5': '404788',
      'Sportsnet One': '404789',
      'Sportsnet Pacific': '404790',
      'Sportsnet East': '404791',
      'Sportsnet West': '404792',
      'Sportsnet World': '404793',
      'Sportsnet 360': '404794',
      'Sportsnet Ontario': '404795'
    };
  }

  private async fetchEPGForChannel(channelId: string): Promise<EPGApiResponse | null> {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${this.baseUrl}/epg.json?channel_id=${channelId}`)}`;
      console.log(`Fetching EPG data for channel ID: ${channelId}`);
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch EPG data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`EPG data received for channel ${channelId}:`, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching EPG for channel ${channelId}:`, error);
      return null;
    }
  }

  private convertToOurFormat(apiData: EPGApiResponse): EPGChannel {
    const programs = apiData.programmes.slice(0, 12).map((program, index) => ({
      id: `${apiData.channel.id}-${program.id || index}`,
      title: program.title || 'Unknown Program',
      startTime: new Date(program.start).toISOString(),
      endTime: new Date(program.stop).toISOString(),
      description: program.desc,
      category: program.category
    }));

    return {
      channelId: apiData.channel.id,
      channelName: apiData.channel.name,
      programs
    };
  }

  async getEPGForCountry(countryName: string, channels: any[]): Promise<EPGChannel[]> {
    if (countryName !== 'Canada') {
      return [];
    }

    const cacheKey = `epg-api-${countryName}`;
    
    return this.fetchWithCache(cacheKey, async () => {
      console.log(`Fetching EPG data from API for ${countryName} channels`);
      
      const channelIdMapping = this.getChannelIdMapping();
      const epgChannels: EPGChannel[] = [];
      
      for (const channel of channels) {
        const channelId = channelIdMapping[channel.title];
        if (channelId) {
          try {
            const epgData = await this.fetchEPGForChannel(channelId);
            if (epgData) {
              const convertedChannel = this.convertToOurFormat(epgData);
              // Use our channel name instead of API name
              convertedChannel.channelName = channel.title;
              epgChannels.push(convertedChannel);
            }
          } catch (error) {
            console.error(`Failed to get EPG for ${channel.title}:`, error);
          }
        } else {
          console.log(`No channel ID mapping found for: ${channel.title}`);
        }
      }
      
      console.log(`EPG API for ${countryName}: ${epgChannels.length} channels loaded`);
      return epgChannels;
    });
  }

  async getAllEPGData(channelsByCountry: Record<string, any[]>): Promise<Record<string, EPGChannel[]>> {
    console.log('Fetching EPG data from API for all countries');
    
    const allEPGData: Record<string, EPGChannel[]> = {};
    
    for (const [country, channels] of Object.entries(channelsByCountry)) {
      try {
        allEPGData[country] = await this.getEPGForCountry(country, channels);
        console.log(`EPG API for ${country} loaded: ${allEPGData[country].length} channels`);
      } catch (error) {
        console.error(`Error loading EPG API for ${country}:`, error);
        allEPGData[country] = [];
      }
    }
    
    return allEPGData;
  }
}

export const epgApiService = new EPGApiService();
export type { EPGProgram, EPGChannel };
