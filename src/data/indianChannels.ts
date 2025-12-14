import { Channel } from './tvChannels';

// Indian sports channels from FanCode and other sources
// These channels use HLS streams with custom headers

export interface HLSChannel extends Channel {
  hlsUrl?: string;
  headers?: {
    userAgent?: string;
    referer?: string;
  };
}

// FanCode India channels - parsed from m3u playlist
export const fancodeChannels: HLSChannel[] = [
  {
    id: 'fancode-horse-racing-hk-cup',
    title: 'Longines Hong Kong Cup 2025',
    country: 'India',
    countryCode: 'in',
    embedUrl: '', // Will use HLS player
    hlsUrl: 'https://in-mc-fdlive.fancode.com/mumbai/138690_english_hls_c7cb89587537667_1ta-di_h264/index.m3u8',
    headers: {
      userAgent: 'ReactNativeVideo/8.4.0 (Linux;Android 13) AndroidXMedia3/1.1.1',
      referer: 'https://fancode.com/'
    },
    category: 'sports',
    logo: 'https://www.fancode.com/skillup-uploads/cms-media/Longines-Hong-Kong-Cup-2025_Old_match-card.jpg',
    viewers: 0
  }
];

// Additional India sports channels
export const indiaChannels: HLSChannel[] = [
  ...fancodeChannels,
  // Add more Indian channels here as needed
];

// Get all Indian channels
export const getIndianChannels = (): HLSChannel[] => {
  return indiaChannels;
};

// Parse M3U playlist to extract channels
export const parseM3UPlaylist = (m3uContent: string): HLSChannel[] => {
  const lines = m3uContent.split('\n');
  const channels: HLSChannel[] = [];
  
  let currentChannel: Partial<HLSChannel> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      // Parse channel info
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const idMatch = line.match(/tvg-id="([^"]+)"/);
      
      currentChannel = {
        id: idMatch ? `fancode-${idMatch[1]}` : `fancode-${Date.now()}`,
        title: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
        country: 'India',
        countryCode: 'in',
        category: 'sports',
        logo: logoMatch ? logoMatch[1] : undefined,
        embedUrl: ''
      };
    } else if (line.startsWith('http') && currentChannel) {
      // Parse stream URL with headers
      const [url, params] = line.split('|');
      const headers: HLSChannel['headers'] = {};
      
      if (params) {
        const userAgentMatch = params.match(/User-Agent=([^&]+)/);
        const refererMatch = params.match(/referer=([^&]+)/);
        
        if (userAgentMatch) headers.userAgent = userAgentMatch[1];
        if (refererMatch) headers.referer = refererMatch[1];
      }
      
      currentChannel.hlsUrl = url;
      currentChannel.headers = headers;
      
      channels.push(currentChannel as HLSChannel);
      currentChannel = null;
    }
  }
  
  return channels;
};
