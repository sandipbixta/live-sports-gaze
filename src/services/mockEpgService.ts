
// Simplified mock EPG service with no artificial delays
import { EPGChannel, EPGProgram } from './epgService';

// Generate simple programs for a channel
const generatePrograms = (channelName: string): EPGProgram[] => {
  const programs: EPGProgram[] = [];
  const now = new Date();
  
  // Generate only 2 programs to reduce processing time
  for (let i = 0; i < 2; i++) {
    const startTime = new Date(now.getTime() + (i * 2 * 60 * 60 * 1000)); // 2 hours each
    const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000));
    
    programs.push({
      id: `${channelName}-prog-${i}`,
      title: i === 0 ? 'Live Sports' : `Sports Program ${i + 1}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      description: `Live sports coverage on ${channelName}`,
      category: 'Sports'
    });
  }
  
  return programs;
};

// Simplified EPG data creation
export const createMockEPGData = (channelsByCountry: Record<string, any[]>): Record<string, EPGChannel[]> => {
  const mockEPGData: Record<string, EPGChannel[]> = {};
  
  Object.entries(channelsByCountry).forEach(([country, channels]) => {
    // Only process first 5 channels to reduce load time even further
    const limitedChannels = channels.slice(0, 5);
    
    mockEPGData[country] = limitedChannels.map(channel => ({
      channelId: channel.id,
      channelName: channel.title,
      programs: generatePrograms(channel.title)
    }));
  });
  
  return mockEPGData;
};

// No-delay mock EPG service
export class MockEPGService {
  private mockData: Record<string, EPGChannel[]> = {};
  
  async getAllEPGData(channelsByCountry: Record<string, any[]>): Promise<Record<string, EPGChannel[]>> {
    // No artificial delay - instant response
    console.log('Loading instant EPG data...');
    
    this.mockData = createMockEPGData(channelsByCountry);
    
    console.log('EPG data loaded instantly:', Object.keys(this.mockData).length, 'countries');
    
    return this.mockData;
  }
  
  async getEPGForCountry(countryName: string, channels: any[]): Promise<EPGChannel[]> {
    // No artificial delay - instant response
    const mockData = createMockEPGData({ [countryName]: channels });
    return mockData[countryName] || [];
  }
}

export const mockEpgService = new MockEPGService();
