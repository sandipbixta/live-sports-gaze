
// Simplified mock EPG service with minimal data
import { EPGChannel, EPGProgram } from './epgService';

// Generate simple programs for a channel
const generatePrograms = (channelName: string): EPGProgram[] => {
  const programs: EPGProgram[] = [];
  const now = new Date();
  
  // Generate only 3 programs instead of 12 to reduce load time
  for (let i = 0; i < 3; i++) {
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
    // Only process first 10 channels to reduce load time
    const limitedChannels = channels.slice(0, 10);
    
    mockEPGData[country] = limitedChannels.map(channel => ({
      channelId: channel.id,
      channelName: channel.title,
      programs: generatePrograms(channel.title)
    }));
  });
  
  return mockEPGData;
};

// Simplified mock EPG service
export class MockEPGService {
  private mockData: Record<string, EPGChannel[]> = {};
  
  async getAllEPGData(channelsByCountry: Record<string, any[]>): Promise<Record<string, EPGChannel[]>> {
    // Reduced loading time from 1000ms to 200ms
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Loading simplified EPG data...');
    
    this.mockData = createMockEPGData(channelsByCountry);
    
    console.log('EPG data loaded:', Object.keys(this.mockData).length, 'countries');
    
    return this.mockData;
  }
  
  async getEPGForCountry(countryName: string, channels: any[]): Promise<EPGChannel[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const mockData = createMockEPGData({ [countryName]: channels });
    return mockData[countryName] || [];
  }
}

export const mockEpgService = new MockEPGService();
