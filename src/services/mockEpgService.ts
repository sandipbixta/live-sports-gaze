
import { EPGChannel, EPGProgram } from './epgService';

// Mock program templates for different types of sports content
const programTemplates = {
  football: [
    'Premier League Live', 'Champions League', 'La Liga Match', 'Serie A Football', 
    'Bundesliga Live', 'Football Tonight', 'Match Highlights', 'Football Analysis',
    'Live Football', 'European Football', 'International Football', 'Cup Final'
  ],
  sports: [
    'Sports Center', 'Live Sports', 'Sports News', 'Sports Tonight', 'Game Time',
    'Sports Highlights', 'Sports Talk', 'Sports Update', 'Live Action', 'Sports World'
  ],
  news: [
    'Sports News', 'Breaking News', 'News Update', 'Evening News', 'Live News',
    'News Tonight', 'Sports Report', 'News Analysis', 'Daily Update', 'News Brief'
  ]
};

const categories = ['Football', 'Sports', 'News', 'Entertainment', 'Documentary'];

// Generate realistic program descriptions
const generateDescription = (title: string): string => {
  const descriptions = [
    `Live coverage of ${title} with expert commentary and analysis.`,
    `Join us for ${title} featuring the latest updates and highlights.`,
    `Comprehensive coverage of ${title} with in-depth reporting.`,
    `Watch ${title} live with pre-match and post-match analysis.`,
    `${title} brings you the best action from around the world.`,
    `Experience ${title} with HD quality streaming and commentary.`
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// Generate programs for a channel
const generatePrograms = (channelName: string, channelType: 'football' | 'sports' | 'news' = 'sports'): EPGProgram[] => {
  const programs: EPGProgram[] = [];
  const now = new Date();
  const templates = programTemplates[channelType];
  
  // Generate 12 programs (current + next 11)
  for (let i = 0; i < 12; i++) {
    const startTime = new Date(now.getTime() + (i * 2 * 60 * 60 * 1000)); // 2 hours each
    const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000));
    
    // Pick a template and sometimes add team names for football
    let title = templates[Math.floor(Math.random() * templates.length)];
    
    if (channelType === 'football' && Math.random() > 0.5) {
      const teams = ['Arsenal vs Chelsea', 'Liverpool vs Man City', 'Barcelona vs Real Madrid', 
                    'Bayern vs Dortmund', 'Juventus vs AC Milan', 'PSG vs Lyon'];
      title = teams[Math.floor(Math.random() * teams.length)];
    }
    
    programs.push({
      id: `${channelName}-prog-${i}`,
      title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      description: generateDescription(title),
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  
  return programs;
};

// Map our channels to EPG data
export const createMockEPGData = (channelsByCountry: Record<string, any[]>): Record<string, EPGChannel[]> => {
  const mockEPGData: Record<string, EPGChannel[]> = {};
  
  Object.entries(channelsByCountry).forEach(([country, channels]) => {
    mockEPGData[country] = channels.map(channel => {
      // Determine channel type based on name
      let channelType: 'football' | 'sports' | 'news' = 'sports';
      const channelNameLower = channel.title.toLowerCase();
      
      if (channelNameLower.includes('football') || channelNameLower.includes('premier') || 
          channelNameLower.includes('laliga') || channelNameLower.includes('champions')) {
        channelType = 'football';
      } else if (channelNameLower.includes('news')) {
        channelType = 'news';
      }
      
      return {
        channelId: channel.id,
        channelName: channel.title,
        programs: generatePrograms(channel.title, channelType)
      };
    });
  });
  
  return mockEPGData;
};

// Mock EPG service that mimics the real one
export class MockEPGService {
  private mockData: Record<string, EPGChannel[]> = {};
  
  async getAllEPGData(channelsByCountry: Record<string, any[]>): Promise<Record<string, EPGChannel[]>> {
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Loading mock EPG data for demonstration...');
    
    this.mockData = createMockEPGData(channelsByCountry);
    
    console.log('Mock EPG data loaded:', Object.keys(this.mockData).map(country => 
      `${country}: ${this.mockData[country].length} channels`
    ));
    
    return this.mockData;
  }
  
  async getEPGForCountry(countryName: string, channels: any[]): Promise<EPGChannel[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData = createMockEPGData({ [countryName]: channels });
    return mockData[countryName] || [];
  }
}

export const mockEpgService = new MockEPGService();
