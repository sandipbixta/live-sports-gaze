
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

class EPGService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 60 * 60 * 1000; // 1 hour

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

  // Generate mock EPG data for our channels since real EPG APIs require authentication
  private generateMockEPG(channelName: string): EPGProgram[] {
    const now = new Date();
    const programs: EPGProgram[] = [];
    
    const sportsPrograms = [
      'Premier League Match', 'Champions League', 'Sports News', 'Football Tonight',
      'Live Match', 'Sports Center', 'Match Highlights', 'Transfer News',
      'La Liga', 'Serie A', 'Bundesliga', 'Sports Analysis'
    ];

    for (let i = 0; i < 12; i++) {
      const startTime = new Date(now.getTime() + (i * 2 * 60 * 60 * 1000)); // 2-hour intervals
      const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000));
      
      programs.push({
        id: `${channelName}-${i}`,
        title: sportsPrograms[i % sportsPrograms.length],
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: `Live sports coverage on ${channelName}`,
        category: 'sports'
      });
    }
    
    return programs;
  }

  async getEPGForCountry(countryName: string, channels: any[]): Promise<EPGChannel[]> {
    const cacheKey = `epg-${countryName}`;
    
    return this.fetchWithCache(cacheKey, async () => {
      console.log(`Generating EPG data for ${countryName} with ${channels.length} channels`);
      
      const epgData: EPGChannel[] = channels.map(channel => ({
        channelId: channel.id,
        channelName: channel.title,
        programs: this.generateMockEPG(channel.title)
      }));

      return epgData;
    });
  }

  async getAllEPGData(channelsByCountry: Record<string, any[]>): Promise<Record<string, EPGChannel[]>> {
    console.log('Generating complete EPG data for all countries');
    
    const allEPGData: Record<string, EPGChannel[]> = {};
    
    // Generate EPG for each country
    for (const [country, channels] of Object.entries(channelsByCountry)) {
      try {
        allEPGData[country] = await this.getEPGForCountry(country, channels);
        console.log(`EPG for ${country} generated successfully: ${allEPGData[country].length} channels`);
      } catch (error) {
        console.error(`Error generating EPG for ${country}:`, error);
        allEPGData[country] = [];
      }
    }
    
    return allEPGData;
  }
}

export const epgService = new EPGService();
export type { EPGProgram, EPGChannel };
