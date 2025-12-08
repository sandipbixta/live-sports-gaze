import channelsData from './channels.json';

interface CDNChannel {
  name: string;
  code: string;
  url: string;
  image: string;
  status: 'online' | 'offline';
  viewers: number;
}

interface CDNChannelsData {
  total_channels: number;
  channels: CDNChannel[];
}

// Country code to full name mapping
const countryCodeMap: Record<string, string> = {
  us: 'USA',
  uk: 'UK',
  gb: 'UK',
  es: 'Spain',
  de: 'Germany',
  fr: 'France',
  it: 'Italy',
  pt: 'Portugal',
  nl: 'Netherlands',
  be: 'Belgium',
  au: 'Australia',
  ca: 'Canada',
  mx: 'Mexico',
  br: 'Brazil',
  ar: 'Argentina',
  in: 'India',
  jp: 'Japan',
  kr: 'South Korea',
  cn: 'China',
  tr: 'Turkey',
  pl: 'Poland',
  ru: 'Russia',
  sa: 'Saudi Arabia',
  ae: 'UAE',
  qa: 'Qatar',
  nz: 'New Zealand',
  ie: 'Ireland',
  za: 'South Africa',
  my: 'Malaysia',
  sg: 'Singapore',
  th: 'Thailand',
  id: 'Indonesia',
  ph: 'Philippines',
  vn: 'Vietnam',
  pk: 'Pakistan',
  bd: 'Bangladesh',
  ng: 'Nigeria',
  eg: 'Egypt',
  ke: 'Kenya',
  gh: 'Ghana',
  at: 'Austria',
  ch: 'Switzerland',
  se: 'Sweden',
  no: 'Norway',
  dk: 'Denmark',
  fi: 'Finland',
  gr: 'Greece',
  cz: 'Czech Republic',
  ro: 'Romania',
  hu: 'Hungary',
  ua: 'Ukraine',
  co: 'Colombia',
  cl: 'Chile',
  pe: 'Peru',
  ve: 'Venezuela'
};

// Generate a unique ID from channel name
const generateChannelId = (name: string, code: string): string => {
  return `cdn-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${code}`;
};

// Get country name from code
const getCountryName = (code: string): string => {
  return countryCodeMap[code.toLowerCase()] || code.toUpperCase();
};

// Convert CDN channels to our format
export const convertCDNChannels = () => {
  const data = channelsData as CDNChannelsData;
  
  return data.channels.map(channel => ({
    id: generateChannelId(channel.name, channel.code),
    title: channel.name,
    country: getCountryName(channel.code),
    embedUrl: channel.url,
    category: 'sports' as const,
    logo: channel.image,
    status: channel.status,
    viewers: channel.viewers,
    source: 'cdn' as const
  }));
};

// Get only online CDN channels
export const getOnlineCDNChannels = () => {
  return convertCDNChannels().filter(channel => channel.status === 'online');
};

// Export the total count
export const getCDNChannelCount = (): number => {
  return (channelsData as CDNChannelsData).total_channels;
};
