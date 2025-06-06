
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

class MockEPGService {
  private generateMockPrograms(channelName: string, baseDate: Date): EPGProgram[] {
    const programs: EPGProgram[] = [];
    const currentTime = new Date(baseDate);
    
    const programTemplates = this.getProgramTemplatesForChannel(channelName);
    
    // Generate 12 programs (6 hours worth)
    for (let i = 0; i < 12; i++) {
      const startTime = new Date(currentTime.getTime() + (i * 30 * 60 * 1000)); // 30-minute slots
      const endTime = new Date(startTime.getTime() + (30 * 60 * 1000));
      
      const template = programTemplates[i % programTemplates.length];
      
      programs.push({
        id: `${channelName.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        title: template.title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: template.description,
        category: template.category
      });
    }
    
    return programs;
  }

  private getProgramTemplatesForChannel(channelName: string) {
    const sportsProgramTemplates = [
      { title: 'Live Football Match', description: 'Live coverage of football match', category: 'Sports' },
      { title: 'Sports News Update', description: 'Latest sports news and highlights', category: 'News' },
      { title: 'Match Analysis', description: 'Expert analysis of recent matches', category: 'Sports' },
      { title: 'Live Basketball', description: 'Live basketball coverage', category: 'Sports' },
      { title: 'Sports Tonight', description: 'Daily sports roundup show', category: 'Sports' },
      { title: 'Championship Highlights', description: 'Best moments from recent championships', category: 'Sports' }
    ];

    const newsProgramTemplates = [
      { title: 'Breaking News', description: 'Latest breaking news updates', category: 'News' },
      { title: 'Sports Headlines', description: 'Top sports stories of the day', category: 'News' },
      { title: 'Weather Update', description: 'Current weather conditions and forecast', category: 'News' },
      { title: 'Business News', description: 'Financial markets and business updates', category: 'News' },
      { title: 'World Report', description: 'International news coverage', category: 'News' },
      { title: 'Local News', description: 'Regional news and updates', category: 'News' }
    ];

    const lowerChannelName = channelName.toLowerCase();
    
    if (lowerChannelName.includes('sport') || lowerChannelName.includes('espn') || 
        lowerChannelName.includes('fox sports') || lowerChannelName.includes('tsn') ||
        lowerChannelName.includes('sportsnet')) {
      return sportsProgramTemplates;
    } else if (lowerChannelName.includes('news') || lowerChannelName.includes('cnn') || 
               lowerChannelName.includes('bbc') || lowerChannelName.includes('sky news')) {
      return newsProgramTemplates;
    }
    
    // Default mix for general channels
    return [...sportsProgramTemplates.slice(0, 3), ...newsProgramTemplates.slice(0, 3)];
  }

  async getEPGForCountry(countryName: string, channels: any[]): Promise<EPGChannel[]> {
    console.log(`Generating optimized mock EPG for ${countryName} with ${channels.length} channels`);
    
    // Immediate return without artificial delays
    const epgChannels: EPGChannel[] = channels.slice(0, 20).map(channel => ({
      channelId: channel.id,
      channelName: channel.title,
      programs: this.generateMockPrograms(channel.title, new Date())
    }));
    
    console.log(`Generated mock EPG for ${epgChannels.length} channels in ${countryName}`);
    return epgChannels;
  }

  async getAllEPGData(channelsByCountry: Record<string, any[]>): Promise<Record<string, EPGChannel[]>> {
    console.log('Generating optimized mock EPG data for all countries');
    
    const allEPGData: Record<string, EPGChannel[]> = {};
    
    // Process all countries in parallel for better performance
    const promises = Object.entries(channelsByCountry).map(async ([country, channels]) => {
      try {
        const epgData = await this.getEPGForCountry(country, channels);
        return { country, epgData };
      } catch (error) {
        console.error(`Error generating mock EPG for ${country}:`, error);
        return { country, epgData: [] };
      }
    });
    
    const results = await Promise.all(promises);
    
    results.forEach(({ country, epgData }) => {
      allEPGData[country] = epgData;
    });
    
    console.log('Mock EPG generation completed for all countries');
    return allEPGData;
  }
}

export const mockEpgService = new MockEPGService();
export type { EPGProgram, EPGChannel };
