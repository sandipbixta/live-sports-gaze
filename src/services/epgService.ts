
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

interface IPTVOrgEPGProgram {
  start: string;
  stop: string;
  title: string;
  desc?: string;
  category?: string;
}

interface IPTVOrgEPGChannel {
  id: string;
  programmes: IPTVOrgEPGProgram[];
}

class EPGService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 60 * 60 * 1000; // 1 hour
  private baseUrl = 'https://iptv-org.github.io/epg';

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
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  private async fetchEPGData(country: string): Promise<IPTVOrgEPGChannel[]> {
    const countryMapping: Record<string, string> = {
      'UK': 'uk',
      'USA': 'us',
      'France': 'fr',
      'Germany': 'de',
      'Italy': 'it',
      'Spain': 'es',
      'Argentina': 'ar',
      'Australia': 'au',
      'India': 'in',
      'Mexico': 'mx',
      'Netherlands': 'nl',
      'New Zealand': 'nz'
    };

    const countryCode = countryMapping[country];
    if (!countryCode) {
      throw new Error(`No EPG data available for ${country}`);
    }

    const url = `${this.baseUrl}/guides/${countryCode}.json`;
    console.log(`Fetching EPG data from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch EPG data: ${response.status}`);
    }
    
    const data = await response.json();
    return data.channels || [];
  }

  private convertIPTVOrgToOurFormat(iptvChannel: IPTVOrgEPGChannel, channelName: string): EPGChannel {
    const programs: EPGProgram[] = iptvChannel.programmes.map((program, index) => ({
      id: `${iptvChannel.id}-${index}`,
      title: program.title || 'Unknown Program',
      startTime: program.start,
      endTime: program.stop,
      description: program.desc,
      category: program.category
    }));

    return {
      channelId: iptvChannel.id,
      channelName: channelName,
      programs: programs.slice(0, 12) // Limit to 12 programs for performance
    };
  }

  async getEPGForCountry(countryName: string, channels: any[]): Promise<EPGChannel[]> {
    const cacheKey = `epg-${countryName}`;
    
    return this.fetchWithCache(cacheKey, async () => {
      console.log(`Fetching real EPG data for ${countryName} with ${channels.length} channels`);
      
      const iptvEPGChannels = await this.fetchEPGData(countryName);
      
      if (!iptvEPGChannels || iptvEPGChannels.length === 0) {
        console.log(`No EPG data found for ${countryName}`);
        return [];
      }

      const epgData: EPGChannel[] = [];
      
      // Try to match our channels with IPTV-ORG EPG data
      for (const channel of channels) {
        // Try to find matching EPG data by channel name similarity
        const matchingEPGChannel = iptvEPGChannels.find(epgChannel => {
          const channelNameLower = channel.title.toLowerCase();
          const epgIdLower = epgChannel.id.toLowerCase();
          
          // Try various matching strategies
          return epgIdLower.includes(channelNameLower.replace(/\s+/g, '')) ||
                 channelNameLower.includes(epgIdLower.replace(/\./g, ' ')) ||
                 channelNameLower.replace(/\s+/g, '').includes(epgIdLower.replace(/\./g, ''));
        });

        if (matchingEPGChannel && matchingEPGChannel.programmes.length > 0) {
          epgData.push(this.convertIPTVOrgToOurFormat(matchingEPGChannel, channel.title));
        }
      }

      console.log(`EPG for ${countryName}: ${epgData.length} channels with real EPG data found`);
      return epgData;
    });
  }

  async getAllEPGData(channelsByCountry: Record<string, any[]>): Promise<Record<string, EPGChannel[]>> {
    console.log('Fetching real EPG data from IPTV-ORG for all countries');
    
    const allEPGData: Record<string, EPGChannel[]> = {};
    
    // Generate EPG for each country
    for (const [country, channels] of Object.entries(channelsByCountry)) {
      try {
        allEPGData[country] = await this.getEPGForCountry(country, channels);
        console.log(`EPG for ${country} loaded: ${allEPGData[country].length} channels with real data`);
      } catch (error) {
        console.error(`Error loading EPG for ${country}:`, error);
        allEPGData[country] = [];
      }
    }
    
    return allEPGData;
  }
}

export const epgService = new EPGService();
export type { EPGProgram, EPGChannel };
